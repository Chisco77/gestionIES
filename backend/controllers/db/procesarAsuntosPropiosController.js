/**
 * ================================================================
 *  Controller: procesarAsuntosPropiosController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador autónomo para la simulación y emisión de propuestas
 *    de resolución de permisos de asuntos propios (tipo 13)
 *    basado en el Art. 13.2 del DOE, resolviendo los nombres
 *    de los docentes mediante LDAP (buscarPorUid).
 *
 *  Autor: Francisco Damian Mendez Palma
 * ================================================================
 */

const db = require("../../db");
const mailer = require("../../mailer");
const { buscarPorUidAnonimo } = require("../ldap/usuariosController");

// Festivos nacionales, autonómicos (Extremadura) y locales (Trujillo)
const FESTIVOS = [
  "2026-01-01", // Año Nuevo
  "2026-01-06", // Epifanía del Señor
  "2026-04-02", // Jueves Santo
  "2026-04-03", // Viernes Santo
  "2026-04-06", // Lunes de Pascua / Chíviri (Trujillo)
  "2026-05-01", // Fiesta del Trabajo
  "2026-09-08", // Día de Extremadura
  "2026-10-12", // Fiesta Nacional de España
  "2026-11-01", // Todos los Santos
  "2026-12-06", // Día de la Constitución
  "2026-12-08", // Inmaculada Concepción
  "2026-12-25", // Natividad del Señor
];

function esDiaInhabil(fecha) {
  const diaSemana = fecha.getDay();
  if (diaSemana === 0 || diaSemana === 6) return true;
  const fechaIso = fecha.toISOString().split("T")[0];
  return FESTIVOS.includes(fechaIso);
}

function calcularLimiteDiasHabiles(fechaInicio, diasHabiles = 3) {
  const fecha = new Date(fechaInicio);
  let cont = 0;
  while (cont < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);
    if (!esDiaInhabil(fecha)) {
      cont++;
    }
  }
  return fecha;
}

function getRangoCursoAcademico(fechaPermiso) {
  const d = new Date(fechaPermiso);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const cursoInicio = month >= 9 && month <= 12 ? year : year - 1;
  return {
    inicio: `${cursoInicio}-09-01`,
    fin: `${cursoInicio + 1}-06-30`,
    label: `${cursoInicio}-${cursoInicio + 1}`,
  };
}

exports.simularYEnviarAsuntosPropios = async (req, res) => {
  const client = await db.connect();
  const ahora = new Date();
  const fechaProcesoStr = ahora.toLocaleString("es-ES");

  console.log(`\n====================================================`);
  console.log(`🚀 [${fechaProcesoStr}] PROCESO AUTOMATIZADO: ASUNTOS PROPIOS`);
  console.log(`====================================================\n`);

  try {
    const ldapSession = req?.session?.ldap || null;

    console.log(
      "🔍 [DB] Consultando en public.permisos solicitudes de tipo 13 con estado pendiente..."
    );
    const { rows: pendientes } = await client.query(`
      SELECT 
        id,
        uid,
        fecha AS fecha_disfrute,
        COALESCE(created_at, NOW()) AS fecha_registro,
        descripcion
      FROM public.permisos
      WHERE tipo = 13 
        AND created_at <= NOW() - INTERVAL '4 days'
      ORDER BY fecha ASC, created_at ASC
    `);

    console.log(
      `📊 [DB] Resultado: Se han encontrado ${pendientes.length} registros pendientes.`
    );

    if (pendientes.length === 0) {
      console.log(
        "ℹ️ No hay solicitudes pendientes de asuntos propios para evaluar."
      );
      if (res)
        return res.json({
          ok: true,
          message: "Conexión a BD OK. No hay solicitudes pendientes.",
        });
      return;
    }

    const listasParaResolver = [];
    const enEspera = [];

    for (const sol of pendientes) {
      const fechaLimite = calcularLimiteDiasHabiles(sol.fecha_registro, 3);
      if (ahora >= fechaLimite) {
        listasParaResolver.push({ ...sol, fechaLimite });
      } else {
        enEspera.push({ ...sol, fechaLimite });
      }
    }

    if (listasParaResolver.length === 0) {
      console.log(
        "ℹ️ Ninguna solicitud cumple aún el plazo de 3 días hábiles."
      );
      await enviarInformeDirectiva([], enEspera, fechaProcesoStr, client);
      if (res)
        return res.json({
          ok: true,
          message:
            "Solicitudes en periodo de carencia (ninguna madura todavía).",
        });
      return;
    }

    const { rows: configCupo } = await client.query(`
      SELECT valor_num 
      FROM restricciones_asuntos 
      WHERE descripcion = 'max_profesores_dia' 
      LIMIT 1
    `);
    const cupoMaximoDiario = Number(configCupo[0]?.valor_num) || 3;

    const solicitudesPorDia = {};
    for (const sol of listasParaResolver) {
      const fechaKey = new Date(sol.fecha_disfrute).toISOString().split("T")[0];
      if (!solicitudesPorDia[fechaKey]) solicitudesPorDia[fechaKey] = [];
      solicitudesPorDia[fechaKey].push(sol);
    }

    const decisionesSimuladas = [];

    for (const [fechaDia, listaSolicitudes] of Object.entries(
      solicitudesPorDia
    )) {
      const rangoCurso = getRangoCursoAcademico(fechaDia);

      const { rows: yaConcedidosDia } = await client.query(
        `
        SELECT COUNT(*)::int AS total
        FROM public.permisos
        WHERE tipo = 13 AND estado = 1 AND fecha = $1
      `,
        [fechaDia]
      );

      const concedidosPreviamente = yaConcedidosDia[0]?.total || 0;
      const plazasDisponibles = Math.max(
        0,
        cupoMaximoDiario - concedidosPreviamente
      );

      const solicitudesConHistorial = await Promise.all(
        listaSolicitudes.map(async (sol) => {
          const { rows: concedidosCurso } = await client.query(
            `
            SELECT COUNT(*)::int AS total
            FROM public.permisos
            WHERE uid = $1 AND tipo = 13 AND estado = 1
              AND fecha >= $2 AND fecha <= $3
          `,
            [sol.uid, rangoCurso.inicio, rangoCurso.fin]
          );

          const nombreDocente = await new Promise((resolve) => {
            buscarPorUidAnonimo(sol.uid, (err, datos) => {
              resolve(
                !err && datos ? `${datos.sn}, ${datos.givenName}` : sol.uid
              );
            });
          });

          return {
            ...sol,
            nombreDocente,
            diasDisfrutados: concedidosCurso[0]?.total || 0,
            cursoAcademico: rangoCurso.label,
          };
        })
      );

      solicitudesConHistorial.sort((a, b) => {
        if (a.diasDisfrutados !== b.diasDisfrutados) {
          return a.diasDisfrutados - b.diasDisfrutados;
        }
        return new Date(a.fecha_registro) - new Date(b.fecha_registro);
      });

      solicitudesConHistorial.forEach((item, index) => {
        const esAceptado = index < plazasDisponibles;
        decisionesSimuladas.push({
          ...item,
          decision: esAceptado ? "ACEPTAR" : "RECHAZAR",
          motivo: esAceptado
            ? `Criterio DOE cumplido. Plaza concedida (${concedidosPreviamente + index + 1}/${cupoMaximoDiario}). Consumo en el curso: ${item.diasDisfrutados} días.`
            : `Excede cupo diario (${cupoMaximoDiario} máx, ${concedidosPreviamente} concedidos previamente). Desempate DOE: posición ${index + 1}.`,
        });
      });
    }

    const enEsperaConNombre = await Promise.all(
      enEspera.map(async (sol) => {
        const nombreDocente = await new Promise((resolve) => {
          buscarPorUidAnonimo(sol.uid, (err, datos) => {
            resolve(
              !err && datos ? `${datos.sn}, ${datos.givenName}` : sol.uid
            );
          });
        });
        return { ...sol, nombreDocente };
      })
    );

    await enviarInformeDirectiva(
      decisionesSimuladas,
      enEsperaConNombre,
      fechaProcesoStr,
      client
    );

    if (res) {
      return res.json({
        ok: true,
        message:
          "Evaluación autónoma de asuntos propios ejecutada correctamente.",
        resueltas: decisionesSimuladas.length,
        enEspera: enEspera.length,
      });
    }
  } catch (err) {
    console.error("❌ Error en la evaluación de asuntos propios:", err);
    if (res) return res.status(500).json({ ok: false, error: err.message });
  } finally {
    client.release();
  }
};

async function enviarInformeDirectiva(
  decisiones,
  enEspera,
  fechaProceso,
  client
) {
  try {
    let htmlResueltas = "";
    decisiones.forEach((d) => {
      const fechaStr = new Date(d.fecha_disfrute).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const colorBadge = d.decision === "ACEPTAR" ? "#16a34a" : "#dc2626";

      htmlResueltas += `
        <div style="background: #f8fafc; border-left: 4px solid ${colorBadge}; padding: 12px; margin-bottom: 10px; border-radius: 4px;">
          <span style="background: ${colorBadge}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: bold;">${d.decision}</span>
          <b style="margin-left: 8px;">👤 ${d.nombreDocente}</b><br>
          <div style="margin-top: 6px; font-size: 0.9rem; color: #475569;">
            📅 <b>Fecha solicitada:</b> ${fechaStr}<br>
            ⏱️ <b>Registrada:</b> ${new Date(d.fecha_registro).toLocaleString("es-ES")}<br>
            📊 <b>Días disfrutados este curso:</b> ${d.diasDisfrutados}<br>
            📝 <b>Criterio DOE:</b> ${d.motivo}
          </div>
        </div>`;
    });

    if (!htmlResueltas) {
      htmlResueltas = `<p style="color: #64748b; font-style: italic;">No hay solicitudes maduras para resolver en esta ejecución.</p>`;
    }

    let htmlEnEspera = "";
    enEspera.forEach((e) => {
      htmlEnEspera += `
        <li style="margin-bottom: 6px; font-size: 0.9rem; color: #475569;">
          ⏳ <b>${e.nombreDocente}</b> | <b>Fecha disfrute:</b> ${new Date(e.fecha_disfrute).toLocaleDateString("es-ES")} <br>
          <span style="font-size: 0.8rem; color: #94a3b8;">Resoluble a partir de: ${new Date(e.fechaLimite).toLocaleString("es-ES")}</span>
        </li>`;
    });

    const htmlContent = `
      <div style="font-family: sans-serif; color: #334155; max-width: 650px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin: 0 auto;">
        <div style="background-color: #1e293b; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 1.2rem;">Propuesta Autónoma de Asuntos Propios</h2>
          <p style="margin: 5px 0 0 0; font-size: 0.85rem; opacity: 0.8;">IES Francisco de Orellana (Trujillo) — ${fechaProceso}</p>
        </div>
        <div style="padding: 25px;">
          <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 0;">1. Propuestas de Resolución (Art. 13.2 DOE)</h3>
          ${htmlResueltas}

          ${
            htmlEnEspera
              ? `
            <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px;">2. Solicitudes en Periodo de Carencia (< 3 días hábiles)</h3>
            <ul style="padding-left: 20px; margin-top: 10px;">${htmlEnEspera}</ul>
          `
              : ""
          }

          <div style="margin-top: 30px; text-align: center;">
            <a href="https://172.16.218.200/gestionIES/" style="background-color: #334155; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Gestionar en la plataforma</a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 0.8rem; color: #64748b;">
          Informe simulado generado automáticamente por el motor autónomo de gestionIES (Sin modificaciones en BD).
        </div>
      </div>`;

    const emailPruebas = "fmendezpalma@gmail.com";

    await mailer.sendMail({
      to: emailPruebas,
      subject: `[gestionIES - PRUEBAS] Propuesta Autónoma de Asuntos Propios - ${fechaProceso}`,
      html: htmlContent,
    });

    console.log(
      `✅ Informe de pruebas con nombres LDAP enviado con éxito a: ${emailPruebas}`
    );
  } catch (err) {
    console.error("[Email Asuntos Propios Autónomo] Error:", err);
  }
}
