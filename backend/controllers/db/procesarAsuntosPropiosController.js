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
  const fechaStr = new Date(fechaInicio).toISOString().split("T")[0];
  const fecha = new Date(`${fechaStr}T00:00:00`);
  let cont = 0;
  while (cont < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);
    if (!esDiaInhabil(fecha)) {
      cont++;
    }
  }
  return fecha;
}

function obtenerFechaInicioHabilesAtras(fechaBase, diasHabiles = 3) {
  const fecha = new Date(fechaBase);
  fecha.setHours(0, 0, 0, 0);
  let cont = 0;
  while (cont < diasHabiles) {
    fecha.setDate(fecha.getDate() - 1);
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

  const fechaProcesoStr = ahora.toLocaleString("es-ES", {
    timeZone: "Europe/Madrid",
    dateStyle: "short",
    timeStyle: "medium",
  });

  console.log(`\n====================================================`);
  console.log(`🚀 [${fechaProcesoStr}] PROCESO AUTOMATIZADO: ASUNTOS PROPIOS`);
  console.log(`====================================================\n`);

  try {
    const ldapSession = req?.session?.ldap || null;

    const fechaInicioFiltro = obtenerFechaInicioHabilesAtras(ahora, 3);

    console.log(
      `🔍 [DB] Consultando en public.permisos solicitudes de tipo 13 desde ${fechaInicioFiltro.toISOString()}...`
    );
    const { rows: pendientes } = await client.query(
      `
      SELECT 
        id,
        uid,
        fecha AS fecha_disfrute,
        COALESCE(created_at, NOW()) AS fecha_registro,
        descripcion,
        estado,
        tipo
      FROM public.permisos
      WHERE tipo = 13 
        AND COALESCE(created_at, NOW()) >= $1
      ORDER BY fecha ASC, created_at ASC
    `,
      [fechaInicioFiltro.toISOString()]
    );

    console.log(
      `📊 [DB] Resultado: Se han encontrado ${pendientes.length} registros en el rango.`
    );

    if (pendientes.length === 0) {
      console.log(
        "ℹ️ No hay solicitudes de asuntos propios para evaluar en este rango."
      );
      if (res)
        return res.json({
          ok: true,
          message: "Conexión a BD OK. No hay solicitudes en el rango.",
        });
      return;
    }

    const pendientesConNombre = [];
    for (const sol of pendientes) {
      const nombreDocente = await new Promise((resolve) => {
        buscarPorUidAnonimo(sol.uid, (err, datos) => {
          resolve(!err && datos ? `${datos.sn}, ${datos.givenName}` : sol.uid);
        });
      });
      pendientesConNombre.push({ ...sol, nombreDocente });
    }

    const listasParaResolver = [];
    const enEspera = [];

    for (const sol of pendientesConNombre) {
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
      FROM restricciones
      WHERE restriccion = 'asuntos' and descripcion = 'concurrentes'
      LIMIT 1
    `);
    const cupoMaximoDiario = Number(configCupo[0]?.valor_num) || 3;

    // Agrupamos por fecha de disfrute
    const solicitudesPorDia = {};
    for (const sol of listasParaResolver) {
      const fechaKey = new Date(sol.fecha_disfrute).toISOString().split("T")[0];
      if (!solicitudesPorDia[fechaKey]) solicitudesPorDia[fechaKey] = [];
      solicitudesPorDia[fechaKey].push(sol);
    }

    const decisionesSimuladas = [];
    // Memoria en tiempo de ejecución para acumular los días aprobados en cascada
    const consumoExtraEnMemoria = {};

    // Ordenamos cronológicamente las fechas de disfrute a procesar
    const fechasOrdenadas = Object.keys(solicitudesPorDia).sort();

    for (const fechaDia of fechasOrdenadas) {
      const listaSolicitudes = solicitudesPorDia[fechaDia];
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

      const solicitudesConHistorial = [];
      for (const sol of listaSolicitudes) {
        const { rows: concedidosCurso } = await client.query(
          `
          SELECT COUNT(*)::int AS total
          FROM public.permisos
          WHERE uid = $1 AND tipo = 13 AND estado = 1
            AND fecha >= $2 AND fecha <= $3
        `,
          [sol.uid, rangoCurso.inicio, rangoCurso.fin]
        );

        const diasDb = concedidosCurso[0]?.total || 0;
        const diasExtra = consumoExtraEnMemoria[sol.uid] || 0;
        const diasDisfrutados = diasDb + diasExtra;

        solicitudesConHistorial.push({
          ...sol,
          diasDisfrutados,
          cursoAcademico: rangoCurso.label,
        });
      }

      solicitudesConHistorial.sort((a, b) => {
        if (a.diasDisfrutados !== b.diasDisfrutados) {
          return a.diasDisfrutados - b.diasDisfrutados;
        }
        return new Date(a.fecha_registro) - new Date(b.fecha_registro);
      });
      solicitudesConHistorial.forEach((item, index) => {
        const esAceptado = index < plazasDisponibles;

        if (esAceptado) {
          consumoExtraEnMemoria[item.uid] =
            (consumoExtraEnMemoria[item.uid] || 0) + 1;
        }

        let explicacionCriterio = "";
        const puesto = index + 1;

        if (esAceptado) {
          explicacionCriterio =
            `Plaza concedida (${concedidosPreviamente + puesto}/${cupoMaximoDiario}). ` +
            `1º Criterio (menor consumo en el curso): ${item.diasDisfrutados} días. ` +
            `2º Criterio (orden de llegada): ${puesto}ª posición de ${solicitudesConHistorial.length} peticiones para este día.`;
        } else {
          explicacionCriterio =
            `Denegada por concurrencia: se han cubierto las ${cupoMaximoDiario} plazas máximas del día con solicitudes prioritarias o de hora anterior. ` +
            `Criterio aplicado (Art. 13.2 DOE): Posición ${puesto}ª de ${solicitudesConHistorial.length} ` +
            `(Consumo acumulado: ${item.diasDisfrutados} días | Registrada a las ${new Date(item.fecha_registro).toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid" })}).`;
        }

        decisionesSimuladas.push({
          ...item,
          decision: esAceptado ? "ACEPTAR" : "RECHAZAR",
          motivo: explicacionCriterio,
        });
      });
    }

    await enviarInformeDirectiva(
      decisionesSimuladas,
      enEspera,
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

      const fechaRegStr = new Date(d.fecha_registro).toLocaleString("es-ES", {
        timeZone: "Europe/Madrid",
        dateStyle: "short",
        timeStyle: "medium",
      });

      htmlResueltas += `
        <div style="background: #f8fafc; border-left: 4px solid ${colorBadge}; padding: 12px; margin-bottom: 10px; border-radius: 4px;">
          <span style="background: ${colorBadge}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: bold;">${d.decision}</span>
          <b style="margin-left: 8px;">👤 ${d.nombreDocente}</b><br>
          <div style="margin-top: 6px; font-size: 0.9rem; color: #475569;">
            📅 <b>Fecha solicitada:</b> ${fechaStr}<br>
            ⏱️ <b>Registrada:</b> ${fechaRegStr}<br>
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
      const fechaRegStr = new Date(e.fecha_registro).toLocaleString("es-ES", {
        timeZone: "Europe/Madrid",
        dateStyle: "short",
        timeStyle: "medium",
      });
      const fechaLimiteStr = new Date(e.fechaLimite).toLocaleString("es-ES", {
        timeZone: "Europe/Madrid",
        dateStyle: "short",
        timeStyle: "medium",
      });

      htmlEnEspera += `
        <li style="margin-bottom: 8px; font-size: 0.9rem; color: #475569;">
          ⏳ <b>${e.nombreDocente}</b> | <b>Fecha disfrute:</b> ${new Date(e.fecha_disfrute).toLocaleDateString("es-ES")} <br>
          <span style="font-size: 0.8rem; color: #64748b;">⏱️ <b>Registrada:</b> ${fechaRegStr}</span><br>
          <span style="font-size: 0.8rem; color: #94a3b8;">Resoluble a partir de: ${fechaLimiteStr}</span>
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

    const { rows: avisos } = await client.query(
      `SELECT emails FROM avisos WHERE modulo = $1 LIMIT 1`,
      ["asuntos-propios"]
    );

    const configAviso = avisos[0] || {};
    const destinatarios = (configAviso.emails || [])
      .map((e) => e.trim())
      .filter(Boolean);

    if (destinatarios.length === 0) {
      console.warn(
        "⚠️ [Email Asuntos Propios Autónomo] No hay destinatarios configurados en la tabla 'avisos' para el módulo 'asuntos-propios'."
      );
      return;
    }

    await mailer.sendMail({
      from: `"Gestión IES"`,
      to: destinatarios.join(", "),
      subject: `[gestionIES] Propuesta Autónoma de Asuntos Propios - ${fechaProceso}`,
      html: htmlContent,
    });

    console.log(
      `✅ Informe autónomo de asuntos propios enviado con éxito a: ${destinatarios.join(", ")}`
    );
  } catch (err) {
    console.error("[Email Asuntos Propios Autónomo] Error:", err);
  }
}
