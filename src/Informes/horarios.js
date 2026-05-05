// src/modules/horarios.js
import jsPDF from "jspdf";
import { getCursoActual } from "@/utils/fechasHoras";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MAPEO_TIPOS_PERMISOS } from "@/utils/mapeoTiposPermisos";
import { drawHeader, drawFooter, addPageWithHeader } from "./utils"; // Importamos tus funciones estándar

/**
 * Genera el PDF de Horarios de Profesores
 * @param {Array} horarios - Datos de los horarios
 * @param {Array} periodos - Periodos horarios
 * @param {string} nombrePdf - Nombre del archivo
 * @param {string} logoUrl - URL del logo del centro
 */
export async function generarPdfHorariosProfesores(
  horarios,
  periodos,
  nombrePdf = "horarios_profesores",
  logoUrl // Nuevo parámetro[cite: 2]
) {
  if (!horarios || !horarios.length) {
    alert("No hay horarios para generar el informe.");
    return;
  }

  if (!periodos || !periodos.length) {
    alert("No se han obtenido los periodos horarios.");
    return;
  }

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const colWidth = (pageWidth - margin * 2) / 6;
  const rowHeight = 15;

  const diasNombres = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  const configuracionColores = {
    lectiva: [173, 216, 230],
    reunion: [198, 239, 206],
    guardia: [220, 220, 220],
  };

  const truncarTexto = (texto, maxWidth) => {
    if (!texto) return "";
    let width = doc.getTextWidth(texto);
    if (width <= maxWidth) return texto;
    let tempTexto = texto;
    while (
      doc.getTextWidth(tempTexto + "...") > maxWidth &&
      tempTexto.length > 0
    ) {
      tempTexto = tempTexto.substring(0, tempTexto.length - 1);
    }
    return tempTexto + "...";
  };

  const horariosPorProfesor = horarios.reduce((acc, h) => {
    if (!acc[h.uid]) acc[h.uid] = [];
    acc[h.uid].push(h);
    return acc;
  }, {});

  const uidsOrdenados = [];
  horarios.forEach((h) => {
    if (!uidsOrdenados.includes(h.uid)) uidsOrdenados.push(h.uid);
  });

  uidsOrdenados.forEach((uid, indexProfesor) => {
    if (indexProfesor > 0) doc.addPage();

    const datosProfesor = horariosPorProfesor[uid][0];
    const tituloInforme = `HORARIO: ${datosProfesor.nombreProfesor || uid}`;

    // --- CABECERA ESTÁNDAR ---
    // Usamos drawHeader para consistencia
    let y = drawHeader(doc, tituloInforme, logoUrl);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Curso Académico: ${datosProfesor.curso_academico || "---"}`,
      margin,
      y
    );

    y += 8;

    // Cabecera de tabla
    doc.setFillColor(230, 230, 230);
    doc.setDrawColor(150, 150, 150);
    doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "F");
    doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Forzar negro para el texto de cabecera[cite: 2]
    doc.text("Periodo", margin + 2, y + rowHeight / 2 + 2);

    diasNombres.forEach((dia, i) => {
      doc.text(dia, margin + colWidth * (i + 1) + 2, y + rowHeight / 2 + 2);
    });

    y += rowHeight;

    periodos.forEach((p) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, colWidth, rowHeight, "FD");
      doc.setTextColor(0, 0, 0);
      doc.text(p.nombre, margin + 2, y + 6);
      doc.setFont("helvetica", "normal");
      doc.text(`${p.inicio} - ${p.fin}`, margin + 2, y + 11);

      for (let d = 1; d <= 5; d++) {
        const posX = margin + colWidth * d;
        doc.rect(posX, y, colWidth, rowHeight, "S");

        const h = horariosPorProfesor[uid].find(
          (hh) =>
            Number(hh.dia_semana) === d && String(hh.idperiodo) === String(p.id)
        );

        if (h) {
          const color = configuracionColores[h.tipo] || [255, 255, 255];
          doc.setFillColor(...color);
          doc.rect(posX + 0.5, y + 0.5, colWidth - 1, rowHeight - 1, "F");
          doc.setTextColor(0, 0, 0);

          const textMaxWidth = colWidth - 4;

          if (h.tipo === "guardia") {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            const txt = "GUARDIA";
            const txtWidth = doc.getTextWidth(txt);
            doc.text(
              txt,
              posX + (colWidth - txtWidth) / 2,
              y + rowHeight / 2 + 1
            );
          } else {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            const materiaTexto = h.materia_nombre || h.materia || "";
            doc.text(truncarTexto(materiaTexto, textMaxWidth), posX + 2, y + 4);

            doc.setFont("helvetica", "normal");
            doc.text(h.grupo || "", posX + 2, y + 8);

            if (h.estancia) {
              doc.setFont("helvetica", "italic");
              doc.setFontSize(6.5);
              doc.text(`(${h.estancia})`, posX + 2, y + 12);
            }
          }
        }
      }
      y += rowHeight;
    });

    // Leyenda
    y += 8;
    let xLeyenda = margin;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text("LEYENDA:", xLeyenda, y + 3);
    xLeyenda += 18;

    Object.entries(configuracionColores).forEach(([tipo, color]) => {
      doc.setFillColor(...color);
      doc.rect(xLeyenda, y, 4, 4, "F");
      doc.rect(xLeyenda, y, 4, 4, "S");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(tipo.toUpperCase(), xLeyenda + 6, y + 3);
      xLeyenda += 40;
    });
  });

  doc.save(`${nombrePdf}.pdf`);
}

function calcularLineasCelda(profes, doc, colWidth) {
  if (!profes || profes.length === 0) return 1;

  const maxWidth = colWidth - 2;
  let lineas = 0;

  profes.forEach((prof) => {
    let texto = "";

    if (prof.estancia) {
      texto += `${prof.estancia.descripcion} - `;
    }

    texto += `${prof.sn || ""}, ${prof.givenName || ""}`;

    // simulamos corte
    let temp = texto;
    let lineasProf = 1;

    while (doc.getTextWidth(temp) > maxWidth) {
      temp = temp.slice(0, -1);
    }

    lineas += lineasProf;
  });

  return lineas;
}

export function generarPdfCuadrante(guardias, periodos) {
  if (!guardias || !periodos) {
    alert("Faltan datos para generar el PDF");
    return;
  }

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "landscape",
  });

  const rowHeight = 18;

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const colWidth = (pageWidth - margin * 2) / 6;

  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  let y = 15;

  // 🧾 CABECERA
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Cuadrante de Guardias", margin, y);

  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Curso académico: ${getCursoActual().label}`, margin, y);

  y += 10;

  // 🧱 CABECERA TABLA
  doc.setFillColor(230, 230, 230);
  doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "F");
  doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.text("Periodo", margin + 2, y + rowHeight / 2 + 2);

  dias.forEach((d, i) => {
    doc.text(d, margin + colWidth * (i + 1) + 2, y + rowHeight / 2 + 2);
  });

  y += rowHeight;

  // 🧱 CUERPO
  periodos.forEach((p) => {
    let maxLineas = 1;

    for (let d = 0; d < 5; d++) {
      const clave = `${p.id}-${d}`;
      const profes = [...(guardias[clave] || [])].sort((a, b) => {
        const aTieneEstancia = !!a.estancia;
        const bTieneEstancia = !!b.estancia;

        // 1. Con estancia primero
        if (aTieneEstancia && !bTieneEstancia) return -1;
        if (!aTieneEstancia && bTieneEstancia) return 1;

        // 2. Si ambos tienen estancia → ordenar por estancia
        if (aTieneEstancia && bTieneEstancia) {
          const estA = a.estancia.descripcion.toLowerCase();
          const estB = b.estancia.descripcion.toLowerCase();

          if (estA < estB) return -1;
          if (estA > estB) return 1;
        }

        // 3. Orden por apellidos
        const snA = (a.sn || "").toLowerCase();
        const snB = (b.sn || "").toLowerCase();

        if (snA < snB) return -1;
        if (snA > snB) return 1;

        // 4. Desempate por nombre
        const gnA = (a.givenName || "").toLowerCase();
        const gnB = (b.givenName || "").toLowerCase();

        if (gnA < gnB) return -1;
        if (gnA > gnB) return 1;

        return 0;
      });
      const lineas = calcularLineasCelda(profes, doc, colWidth);
      if (lineas > maxLineas) maxLineas = lineas;
    }

    const rowHeight = Math.max(12, maxLineas * 4 + 4);
    // Columna periodo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setFillColor(245, 245, 245);

    doc.rect(margin, y, colWidth, rowHeight, "FD");
    doc.text(p.nombre, margin + 2, y + 6);

    doc.setFont("helvetica", "normal");
    doc.text(`${p.inicio} - ${p.fin}`, margin + 2, y + 11);

    // Días
    for (let d = 0; d < 5; d++) {
      const clave = `${p.id}-${d}`;
      const profes = [...(guardias[clave] || [])].sort((a, b) => {
        const aTieneEstancia = !!a.estancia;
        const bTieneEstancia = !!b.estancia;

        // 1. Con estancia primero
        if (aTieneEstancia && !bTieneEstancia) return -1;
        if (!aTieneEstancia && bTieneEstancia) return 1;

        // 2. Si ambos tienen estancia → ordenar por estancia
        if (aTieneEstancia && bTieneEstancia) {
          const estA = a.estancia.descripcion.toLowerCase();
          const estB = b.estancia.descripcion.toLowerCase();

          if (estA < estB) return -1;
          if (estA > estB) return 1;
        }

        // 3. Orden por apellidos
        const snA = (a.sn || "").toLowerCase();
        const snB = (b.sn || "").toLowerCase();

        if (snA < snB) return -1;
        if (snA > snB) return 1;

        // 4. Desempate por nombre
        const gnA = (a.givenName || "").toLowerCase();
        const gnB = (b.givenName || "").toLowerCase();

        if (gnA < gnB) return -1;
        if (gnA > gnB) return 1;

        return 0;
      });
      const posX = margin + colWidth * (d + 1);

      doc.rect(posX, y, colWidth, rowHeight, "S");

      if (profes.length > 0) {
        let yTexto = y + 4;

        doc.setFontSize(7);

        profes.forEach((prof) => {
          const nombre = `${prof.sn || ""}, ${prof.givenName || ""}`;
          const maxWidth = colWidth - 2;

          let xTexto = posX + 1;

          // 🔥 1. ESTANCIA EN NEGRITA
          if (prof.estancia) {
            doc.setFont("helvetica", "bold");

            const MAX_ESTANCIA = 16;

            let estanciaTexto = prof.estancia.descripcion || "";

            if (estanciaTexto.length > MAX_ESTANCIA) {
              estanciaTexto = estanciaTexto.slice(0, MAX_ESTANCIA - 1) + "…";
            }

            // solo añadimos separador si hay estancia
            if (estanciaTexto.length > 0) {
              estanciaTexto += " - ";
            }

            doc.text(estanciaTexto, xTexto, yTexto);

            xTexto += doc.getTextWidth(estanciaTexto);
          }

          // 🔥 2. NOMBRE EN NORMAL
          doc.setFont("helvetica", "normal");

          let nombreTexto = nombre;

          // recorte final si aún se pasa
          while (
            doc.getTextWidth(nombreTexto) + (xTexto - (posX + 1)) > maxWidth &&
            nombreTexto.length > 0
          ) {
            nombreTexto = nombreTexto.slice(0, -1);
          }

          doc.text(nombreTexto, xTexto, yTexto);
          yTexto += 4;

          // Evitar overflow vertical
          if (yTexto > y + rowHeight - 2) return;
        });
      }
    }

    y += rowHeight;
  });

  doc.save("cuadrante_guardias.pdf");
}

/**
 * Genera el PDF del "Parte de Faltas Diario"
 * @param {Array} datosProcesados - Lista de objetos { periodo, filas: [{profesor, asignatura, curso, observaciones}] }
 * @param {Date} fecha - La fecha del parte
 * @param {string} logoUrl - URL del logo del centro
 */
export async function generarParteDiarioAusencias(
  datosProcesados,
  fecha,
  logoUrl
) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const tableWidth = pageWidth - margin * 2;

  // Configuración de columnas
  const colHorasW = 16;
  const colProfW = 45;
  const colAsigW = 35;
  const colCursoW = 18;
  const colObsW = 48;
  const colFirmaW = 18;

  const opcionesFecha = { day: "numeric", month: "long", year: "numeric" };
  const tituloCompleto = `Parte diario de Ausencias del ${fecha.toLocaleDateString("es-ES", opcionesFecha)}`;

  // --- CABECERA ---
  // Pasamos logoUrl a drawHeader[cite: 2]
  let y = drawHeader(doc, tituloCompleto, logoUrl);

  // Subimos el contenido para eliminar el aire innecesario
  y -= 8;

  // --- POSIBLES AUSENCIAS (Compacto) ---
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("POSIBLES AUSENCIAS:", margin, y);
  y += 1.5;
  doc.setDrawColor(180);
  for (let i = 0; i < 3; i++) {
    y += 5.5;
    doc.line(margin, y, margin + tableWidth, y);
  }
  y += 7;

  // --- CABECERA TABLA ---
  doc.setDrawColor(0);
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, tableWidth, 9, "F");
  doc.rect(margin, y, tableWidth, 9, "S");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0); // Aseguramos texto negro[cite: 2]
  doc.text("HORAS", margin + 2, y + 6);
  doc.text("PROFESORES\nAUSENTES", margin + colHorasW + 2, y + 4.5);
  doc.text("ASIGNATURA", margin + colHorasW + colProfW + 2, y + 6);
  doc.text("CURSO", margin + colHorasW + colProfW + colAsigW + 2, y + 6);
  doc.text(
    "OBSERVACIONES",
    margin + colHorasW + colProfW + colAsigW + colCursoW + 5,
    y + 6
  );
  doc.text("FIRMA", margin + tableWidth - colFirmaW + 5, y + 6);
  y += 9;

  // --- CUERPO DINÁMICO ---
  datosProcesados.forEach((p) => {
    const subfilasConAltura = p.filas.map((f) => {
      const textoAsignatura =
        f.tipo === "guardia" ? "GUARDIA" : f.asignatura || "";
      let textoObs = "";
      const estanciaValida =
        f.estancia &&
        f.estancia.toLowerCase().trim() !== "estancia desconocida";

      if (f.tipo === "guardia" && estanciaValida) {
        textoObs = `${f.estancia}`.trim();
      }

      const lineasAsig = doc.splitTextToSize(
        textoAsignatura,
        colAsigW - 4
      ).length;
      const lineasProf = doc.splitTextToSize(
        f.profesor || "",
        colProfW - 4
      ).length;
      const lineasCurso = doc.splitTextToSize(
        String(f.curso || ""),
        colCursoW - 2
      ).length;
      const lineasObs = doc.splitTextToSize(textoObs, colObsW - 4).length;

      const maxLineas = Math.max(
        lineasAsig,
        lineasProf,
        lineasCurso,
        lineasObs,
        1
      );

      return {
        ...f,
        textoAsignatura,
        textoObs,
        altura: Math.max(7, maxLineas * 4 + 1),
      };
    });

    const alturaTotalBloque =
      subfilasConAltura.length > 0
        ? subfilasConAltura.reduce((acc, curr) => acc + curr.altura, 0)
        : 7;

    if (y + alturaTotalBloque > 280) {
      doc.addPage();
      y = drawHeader(doc, tituloCompleto, logoUrl); // Repetir cabecera con logo[cite: 2]
      y += 10;
    }

    doc.setFont("helvetica", "bold");
    doc.rect(margin, y, colHorasW, alturaTotalBloque, "S");
    doc.text(
      p.horaLabel,
      margin + colHorasW / 2,
      y + alturaTotalBloque / 2 + 1,
      { align: "center" }
    );

    const xObs = margin + colHorasW + colProfW + colAsigW + colCursoW;
    doc.rect(xObs, y, colObsW, alturaTotalBloque, "S");
    doc.rect(
      margin + tableWidth - colFirmaW,
      y,
      colFirmaW,
      alturaTotalBloque,
      "S"
    );

    let currentSubY = y;
    if (subfilasConAltura.length > 0) {
      subfilasConAltura.forEach((f) => {
        const sX = margin + colHorasW;
        doc.rect(sX, currentSubY, colProfW, f.altura, "S");
        doc.rect(sX + colProfW, currentSubY, colAsigW, f.altura, "S");
        doc.rect(
          sX + colProfW + colAsigW,
          currentSubY,
          colCursoW,
          f.altura,
          "S"
        );

        const xObs = sX + colProfW + colAsigW + colCursoW;
        doc.rect(xObs, currentSubY, colObsW, f.altura, "S");
        doc.rect(
          margin + tableWidth - colFirmaW,
          currentSubY,
          colFirmaW,
          f.altura,
          "S"
        );

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");

        const limitLines = Math.floor(f.altura / 4);

        const profLines = doc
          .splitTextToSize(f.profesor, colProfW - 4)
          .slice(0, limitLines);
        doc.text(profLines, sX + 2, currentSubY + 4);

        const asigLines = doc
          .splitTextToSize(f.textoAsignatura, colAsigW - 4)
          .slice(0, limitLines);
        doc.text(asigLines, sX + colProfW + 2, currentSubY + 4);

        const cursoLines = doc
          .splitTextToSize(String(f.curso || ""), colCursoW - 2)
          .slice(0, limitLines);
        doc.text(cursoLines, sX + colProfW + colAsigW + 2, currentSubY + 4);

        const obsLines = doc
          .splitTextToSize(f.textoObs, colObsW - 4)
          .slice(0, limitLines);
        doc.text(obsLines, xObs + 2, currentSubY + 4);

        currentSubY += f.altura;
      });
    } else {
      const sX = margin + colHorasW;
      const alturaVacia = 7;
      doc.rect(sX, currentSubY, colProfW, alturaVacia, "S");
      doc.rect(sX + colProfW, currentSubY, colAsigW, alturaVacia, "S");
      doc.rect(
        sX + colProfW + colAsigW,
        currentSubY,
        colCursoW,
        alturaVacia,
        "S"
      );
      currentSubY += alturaVacia;
    }
    y = currentSubY;
  });

  // --- PIE DE PÁGINA ---
  drawFooter(doc); // Añadimos el pie de página antes de guardar[cite: 2]

  doc.save(`Parte_Ausencias_${format(fecha, "yyyy-MM-dd")}.pdf`);
}

/**
 * Genera el PDF del Parte Mensual de Ausencias
 * @param {Array} datos - Lista de ausencias
 * @param {Object} meta - Metadatos (mes, curso, etc.)
 * @param {String} logoUrl - URL del logo resuelta
 */
export async function generarParteMensualAusencias(
  datos,
  meta,
  logoUrl,
  periodosHorarios = []
) {
  // 1. Identificar IDs de periodos que son recreos
  const idsRecreos = periodosHorarios
    .filter((p) => p.nombre.toLowerCase().includes("recreo"))
    .map((p) => p.id);

  const datosOrdenados = [...datos].sort((a, b) => {
    const nombreA = a.nombre.toLowerCase();
    const nombreB = b.nombre.toLowerCase();
    if (nombreA !== nombreB) return nombreA.localeCompare(nombreB);
    return new Date(a.fechaInicio) - new Date(b.fechaInicio);
  });

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();

  const col = {
    nombre: 60,
    dni: 25,
    fecha: 22,
    periodos: 33,
    motivo: 105,
  };

  const drawHeadersTabla = (yPos) => {
    let x = margin;
    const headers = [
      { w: col.nombre, t: "Nombre y Apellidos" },
      { w: col.dni, t: "DNI" },
      { w: col.fecha, t: "F. Inicio" },
      { w: col.fecha, t: "F. Fin" },
      { w: col.periodos, t: "Periodos / Jornada" },
      { w: col.motivo, t: "Motivo (Art. Permiso o Descripción)" },
    ];

    headers.forEach((h) => {
      // 1. FORZAR COLOR DE FONDO (Gris claro)
      doc.setDrawColor(0);
      doc.setFillColor(240, 240, 240);
      doc.rect(x, yPos, h.w, 8, "FD");

      // 2. FORZAR COLOR DE TEXTO (Negro absoluto)
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold"); // Negrita para el encabezado[cite: 2]
      doc.setFontSize(8);

      // 3. DIBUJAR EL TEXTO
      doc.text(h.t, x + 2, yPos + 5.5);

      x += h.w;
    });

    // --- CORRECCIÓN AQUÍ ---
    // Reseteamos a estilo 'normal' para que el resto de la tabla NO salga en negrita[cite: 2]
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    return yPos + 8;
  };

  const tituloHeader = `PARTE MENSUAL DE AUSENCIAS - ${meta.mesNombre.toUpperCase()} (Curso ${meta.cursoAcademico})`;
  let currentY = drawHeader(doc, tituloHeader, logoUrl);

  currentY = drawHeadersTabla(currentY);

  datosOrdenados.forEach((item) => {
    const rowH = 8;

    if (currentY + rowH > 180) {
      currentY = addPageWithHeader(doc, tituloHeader, logoUrl, "l");
      currentY = drawHeadersTabla(currentY);
      doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(0);
    }

    // --- LÓGICA DE CONTEO DE PERIODOS (EXCLUYENDO RECREOS) ---
    let textoPeriodos = "Jornada completa";
    if (item.idperiodo_inicio) {
      const pInicio = Number(item.idperiodo_inicio);
      const pFin = Number(item.idperiodo_fin) || pInicio;

      // Contamos cuántos IDs en el rango NO son recreos
      let contadorReal = 0;
      for (let i = pInicio; i <= pFin; i++) {
        if (!idsRecreos.includes(i)) {
          contadorReal++;
        }
      }
      textoPeriodos = `${contadorReal} per. (${pInicio}º a ${pFin}º)`;
    }

    const textoMotivo = item.esPermiso
      ? MAPEO_TIPOS_PERMISOS[item.tipoPermiso] || "Permiso"
      : item.descripcionAusencia || "Aviso";

    let cx = margin;
    const rowData = [
      { w: col.nombre, t: item.nombre },
      { w: col.dni, t: item.documento },
      { w: col.fecha, t: format(new Date(item.fechaInicio), "dd/MM/yyyy") },
      { w: col.fecha, t: format(new Date(item.fechaFin), "dd/MM/yyyy") },
      { w: col.periodos, t: textoPeriodos },
      { w: col.motivo, t: textoMotivo },
    ];

    rowData.forEach((cell) => {
      doc.setDrawColor(0);
      doc.rect(cx, currentY, cell.w, rowH, "S");
      doc.setTextColor(0, 0, 0); // Texto siempre negro[cite: 2]
      const safeText = doc.splitTextToSize(String(cell.t), cell.w - 2);
      doc.text(safeText[0], cx + 2, currentY + 5);
      cx += cell.w;
    });

    currentY += rowH;
  });

  // Resumen final
  if (currentY + 30 > 185) {
    currentY = addPageWithHeader(doc, tituloHeader, logoUrl, "l");
    currentY += 15;
  }

  currentY += 10;
  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(0);
  doc.text("Resumen del mes:", margin, currentY);
  doc.setFont("helvetica", "normal").setFontSize(8);
  doc.text(
    `Total de incidencias registradas: ${datosOrdenados.length}`,
    margin,
    currentY + 6
  );
  doc.text(
    `Número de profesores afectados: ${new Set(datosOrdenados.map((d) => d.documento)).size}`,
    margin,
    currentY + 11
  );

  drawFooter(doc);
  doc.save(
    `Parte_Mensual_Ausencias_${meta.mesNombre}_${meta.cursoAcademico.replace("/", "-")}.pdf`
  );
}
