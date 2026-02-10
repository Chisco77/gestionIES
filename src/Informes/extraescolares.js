import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { getLocalDateKey } from "@/utils/dateHelpers";
import { drawHeader, drawFooter, addPageWithHeader } from "./utils";

function getInfoFiltros({ fechaDesde, fechaHasta, otrosFiltros = {} }) {
  let info = "";

  if (fechaDesde && fechaHasta) {
    info += `Rango de fechas: ${new Date(fechaDesde).toLocaleDateString("es-ES")} - ${new Date(
      fechaHasta
    ).toLocaleDateString("es-ES")}\n`;
  }

  for (const key in otrosFiltros) {
    if (otrosFiltros[key]) {
      info += `${key}: ${otrosFiltros[key]}\n`;
    }
  }

  return info.trim(); // elimina salto de línea final
}

/*
Genera listado extraescolares en ODS con columnas:
Departamento, Fecha, Actividad, Profesor, Cursos, Estado
*/
export function generateListadoExtraescolaresPorDepartamentoXLS(
  actividades = [],
  rangoFechas,
  otrosFiltros = {}
) {
  if (!actividades.length) {
    alert("No hay actividades para generar el listado.");
    return;
  }

  const estadosMap = {
    0: "Pendiente",
    1: "Aceptada",
    2: "Rechazada",
  };

  // --- Fila con rango de fechas / filtros aplicados ---
  const infoFiltros = getInfoFiltros({
    fechaDesde: rangoFechas?.desde,
    fechaHasta: rangoFechas?.hasta,
  });

  const wsData = [];

  if (infoFiltros) {
    // Insertamos la info de filtros en la primera fila
    wsData.push([infoFiltros]);
    // Añadimos dos filas vacías
    wsData.push([]);
    wsData.push([]);
  }

  // --- Fila de encabezado ---
  wsData.push([
    "Departamento",
    "Fecha",
    "Actividad",
    "Profesor",
    "Cursos",
    "Estado",
  ]);

  // --- Ordenar primero por departamento, luego por fecha y profesor ---
  const actividadesOrdenadas = [...actividades].sort((a, b) => {
    const deptA = a.departamento?.nombre || "";
    const deptB = b.departamento?.nombre || "";
    const deptComp = deptA.localeCompare(deptB, "es", { sensitivity: "base" });
    if (deptComp !== 0) return deptComp;

    const fechaDiff = new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
    if (fechaDiff !== 0) return fechaDiff;

    return (a.nombreProfesor || "").localeCompare(
      b.nombreProfesor || "",
      "es",
      { sensitivity: "base" }
    );
  });

  // --- Rellenar filas con actividades ---
  actividadesOrdenadas.forEach((act) => {
    const depto = act.departamento?.nombre || "Departamento desconocido";
    const fechaTxt = act.fecha_inicio
      ? new Date(act.fecha_inicio).toLocaleDateString("es-ES")
      : "—";
    const titulo = act.titulo || "-";
    const profesor = act.nombreProfesor || "-";
    const cursosTxt =
      Array.isArray(act.cursos) && act.cursos.length
        ? act.cursos.map((c) => c.nombre).join(", ")
        : "-";
    const estadoTxt = estadosMap[act.estado] ?? "—";

    wsData.push([depto, fechaTxt, titulo, profesor, cursosTxt, estadoTxt]);
  });

  // --- Crear workbook y sheet ---
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Anchos de columnas aproximados
  ws["!cols"] = [
    { wch: 20 }, // Departamento
    { wch: 15 }, // Fecha
    { wch: 35 }, // Actividad
    { wch: 25 }, // Profesor
    { wch: 30 }, // Cursos
    { wch: 12 }, // Estado
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Extraescolares");

  // Generar ODS
  const oidata = XLSX.write(wb, { bookType: "ods", type: "array" });
  const blob = new Blob([oidata], {
    type: "application/vnd.oasis.opendocument.spreadsheet",
  });

  // Descargar
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Agenda_extraescolares.ods";
  a.click();
  URL.revokeObjectURL(url);
}

/*
Genera listado extraescolares agrupadas por departamento
*/

export function generateListadoExtraescolaresPorDepartamento(
  actividades = [],
  rangoFechas
) {
  if (!actividades.length) {
    alert("No hay actividades para generar el listado.");
    return;
  }

  // --- Mapas auxiliares ---
  const estadosMap = {
    0: "Pendiente",
    1: "Aceptada",
    2: "Rechazada",
  };

  // --- Agrupar por departamento ---
  const actividadesPorDepartamento = actividades.reduce((acc, act) => {
    const depto = act.departamento?.nombre || "Departamento desconocido";
    if (!acc[depto]) acc[depto] = [];
    acc[depto].push(act);
    return acc;
  }, {});

  // --- Ordenar departamentos alfabéticamente ---
  const departamentos = Object.keys(actividadesPorDepartamento).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );

  // --- PDF base ---
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 15;
  const marginBottom = 15;
  let y = 0;

  // 🔹 Función para restablecer estilo del contenido
  const resetContentStyle = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
  };

  // --- Cabecera inicial ---
  y = drawHeader(doc, "Agenda de Actividades Extraescolares por Departamento");
  resetContentStyle();

  // --- Información de filtros aplicada ---
  const infoFiltros = getInfoFiltros({
    fechaDesde: rangoFechas.desde,
    fechaHasta: rangoFechas.hasta,
  });

  if (infoFiltros) {
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(infoFiltros.split("\n"), 15, y);
    y += 8;
  }
  doc.text(`Total actividades: ${actividades.length}`, marginLeft, y);
  y += 10;

  // --- Columnas ajustadas ---
  const colFechaX = marginLeft;
  const colProfesorX = marginLeft + 25;
  const colTituloX = marginLeft + 75; // +5 mm más ancho
  const colCursosX = marginLeft + 130; // -5 mm más estrecho
  const colEstadoX = marginLeft + 165; // mover 5 mm a la izquierda

  const colProfesorWidth = 45;
  const colTituloWidth = 55; // +5 mm
  const colCursosWidth = 35; // -5 mm
  const lineHeight = 5;

  // --- Contenido ---
  departamentos.forEach((depto) => {
    const lista = [...actividadesPorDepartamento[depto]];

    // --- Orden interno: fecha - profesor ---
    lista.sort((a, b) => {
      const fDiff = new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
      if (fDiff !== 0) return fDiff;
      return (a.nombreProfesor || "").localeCompare(
        b.nombreProfesor || "",
        "es",
        { sensitivity: "base" }
      );
    });

    if (y > pageHeight - marginBottom - 40) {
      y = addPageWithHeader(
        doc,
        "Agenda de Actividades Extraescolares por Departamento"
      );
      resetContentStyle();
    }

    // --- Cabecera departamento ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(depto, marginLeft, y);
    y += 4;

    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 6;

    // --- Encabezado tabla ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Fecha", colFechaX, y);
    doc.text("Profesor", colProfesorX, y);
    doc.text("Actividad", colTituloX, y);
    doc.text("Cursos", colCursosX, y);
    doc.text("Estado", colEstadoX, y);
    y += 4;

    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 5;

    resetContentStyle();

    // --- Filas ---
    lista.forEach((act) => {
      const fechaTxt = act.fecha_inicio
        ? new Date(act.fecha_inicio).toLocaleDateString("es-ES")
        : "—";

      const profesorLines = doc.splitTextToSize(
        act.nombreProfesor || "",
        colProfesorWidth
      );
      const tituloLines = doc.splitTextToSize(act.titulo || "", colTituloWidth);

      const cursosTxt = Array.isArray(act.cursos)
        ? act.cursos.map((c) => c.nombre).join(", ")
        : "-";
      const cursosLines = doc.splitTextToSize(cursosTxt, colCursosWidth);

      const estadoTxt = estadosMap[act.estado] ?? "—";

      const rowLines = Math.max(
        profesorLines.length,
        tituloLines.length,
        cursosLines.length,
        1
      );
      const rowHeight = rowLines * lineHeight;

      if (y + rowHeight > pageHeight - marginBottom - 10) {
        y = addPageWithHeader(
          doc,
          "Agenda de Actividades Extraescolares por Departamento"
        );
        resetContentStyle();

        // Reescribir encabezado tabla
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Fecha", colFechaX, y);
        doc.text("Profesor", colProfesorX, y);
        doc.text("Actividad", colTituloX, y);
        doc.text("Cursos", colCursosX, y);
        doc.text("Estado", colEstadoX, y);
        y += 4;

        doc.setLineWidth(0.3);
        doc.line(marginLeft, y, pageWidth - marginLeft, y);
        y += 4;

        resetContentStyle();
      }

      doc.setTextColor(0, 0, 0);
      doc.text(fechaTxt, colFechaX, y);
      doc.text(profesorLines, colProfesorX, y);
      doc.text(tituloLines, colTituloX, y);
      doc.text(cursosLines, colCursosX, y);
      doc.text(estadoTxt, colEstadoX, y);

      y += rowHeight + 2;
    });

    y += 10;
  });

  // --- Pie ---
  drawFooter(doc);

  doc.save("Agenda_Extraescolares_por_Departamento.pdf");
}

/*
Genera listado extraescolares agrupadas por fecha inicio
con columnas: Actividad, Profesor, Departamento, Cursos y Estado
*/
export function generateListadoExtraescolaresPorFecha(
  actividades = [],
  rangoFechas
) {
  if (!actividades.length) {
    alert("No hay actividades para generar el listado.");
    return;
  }

  // --- Mapas auxiliares ---
  const estadosMap = {
    0: "Pendiente",
    1: "Aceptada",
    2: "Rechazada",
  };

  // --- Ordenar por fecha_inicio ---
  const ordenadas = [...actividades].sort(
    (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio)
  );

  // --- Agrupar por fecha_inicio (YYYY-MM-DD) ---
  const actividadesPorFecha = ordenadas.reduce((acc, act) => {
    const fechaKey = getLocalDateKey(act.fecha_inicio);
    if (!acc[fechaKey]) acc[fechaKey] = [];
    acc[fechaKey].push(act);
    return acc;
  }, {});

  const fechas = Object.keys(actividadesPorFecha).sort();

  // --- PDF base ---
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 15;
  const marginBottom = 15;
  let y = 0;

  // 🔹 Función para restablecer estilo del contenido
  const resetContentStyle = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
  };

  // --- Cabecera inicial ---
  y = drawHeader(doc, "Agenda de Actividades Extraescolares por Fecha");
  resetContentStyle();

  doc.text(`Total actividades: ${ordenadas.length}`, marginLeft, y);
  y += 10;

  // --- Columnas ---
  const colTituloX = marginLeft; // Actividad
  const colProfesorX = colTituloX + 55; // Profesor
  const colDepartamentoX = colProfesorX + 47; // Departamento
  const colCursosX = colDepartamentoX + 30; // Cursos
  const colEstadoX = colCursosX + 40; // Estado

  const colTituloWidth = 55;
  const colProfesorWidth = 47;
  const colDepartamentoWidth = 30;
  const colCursosWidth = 40;
  const colEstadoWidth = 18;

  const lineHeight = 5;

  // --- Contenido ---
  fechas.forEach((fechaKey) => {
    const lista = actividadesPorFecha[fechaKey];
    const fechaLegible = new Date(fechaKey).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // --- Si no hay espacio suficiente, nueva página ---
    if (y > pageHeight - marginBottom - 40) {
      y = addPageWithHeader(
        doc,
        "Agenda de Actividades Extraescolares por Fecha"
      );
      resetContentStyle();
    }

    // --- Cabecera fecha ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(fechaLegible, marginLeft, y);
    y += 4;

    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 6;

    // --- Encabezado tabla ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Actividad", colTituloX, y);
    doc.text("Profesor", colProfesorX, y);
    doc.text("Departamento", colDepartamentoX, y);
    doc.text("Cursos", colCursosX, y);
    doc.text("Estado", colEstadoX, y);
    y += 4;

    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 4;

    resetContentStyle();

    // --- Filas ---
    lista.forEach((act) => {
      const tituloLines = doc.splitTextToSize(act.titulo || "", colTituloWidth);
      const profesorLines = doc.splitTextToSize(
        act.nombreProfesor || "",
        colProfesorWidth
      );
      const departamentoLines = doc.splitTextToSize(
        act.departamento?.nombre || "-",
        colDepartamentoWidth
      );

      const cursosTxt =
        Array.isArray(act.cursos) && act.cursos.length
          ? act.cursos.map((c) => c.nombre).join(", ")
          : "-";
      const cursosLines = doc.splitTextToSize(cursosTxt, colCursosWidth);

      const estadoTxt = estadosMap[act.estado] ?? "—";
      const estadoLines = doc.splitTextToSize(estadoTxt, colEstadoWidth);

      const rowLines = Math.max(
        tituloLines.length,
        profesorLines.length,
        departamentoLines.length,
        cursosLines.length,
        estadoLines.length,
        1
      );
      const rowHeight = rowLines * lineHeight;

      // --- Salto de página si falta espacio ---
      if (y + rowHeight > pageHeight - marginBottom - 10) {
        y = addPageWithHeader(
          doc,
          "Agenda de Actividades Extraescolares por Fecha"
        );
        resetContentStyle();

        // Reescribir encabezado tabla
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Actividad", colTituloX, y);
        doc.text("Profesor", colProfesorX, y);
        doc.text("Departamento", colDepartamentoX, y);
        doc.text("Cursos", colCursosX, y);
        doc.text("Estado", colEstadoX, y);
        y += 4;

        doc.setLineWidth(0.3);
        doc.line(marginLeft, y, pageWidth - marginLeft, y);
        y += 4;

        resetContentStyle();
      }

      // --- Texto ---
      doc.setTextColor(0, 0, 0);
      doc.text(tituloLines, colTituloX, y);
      doc.text(profesorLines, colProfesorX, y);
      doc.text(departamentoLines, colDepartamentoX, y);
      doc.text(cursosLines, colCursosX, y);
      doc.text(estadoLines, colEstadoX, y);

      y += rowHeight + 2;
    });

    y += 8;
  });

  // --- Pie ---
  drawFooter(doc);

  doc.save("Agenda_Extraescolares_por_Fecha.pdf");
}

/*
 * Listado de actividades extraescolares, agrupadas por profesor.
 *
 */
export function generateListadoExtraescolaresPorProfesor(
  actividades = [],
  rangoFechas
) {
  if (!actividades.length) {
    alert("No hay actividades para generar el listado.");
    return;
  }

  const estadosMap = {
    0: "Pendiente",
    1: "Aceptada",
    2: "Rechazada",
  };

  const actividadesOrdenadas = [...actividades].sort(
    (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio)
  );

  const actividadesPorProfesor = actividadesOrdenadas.reduce((acc, act) => {
    const nombre = act.nombreProfesor || "Sin profesor";
    if (!acc[nombre]) acc[nombre] = [];
    acc[nombre].push(act);
    return acc;
  }, {});

  const profesores = Object.keys(actividadesPorProfesor).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 15;
  const marginBottom = 15;
  let y = 0;

  const resetContentStyle = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
  };

  // --- Cabecera inicial ---
  y = drawHeader(doc, "Agenda de Actividades Extraescolares por Profesor");
  resetContentStyle();

  // --- Información de filtros aplicada ---
  const infoFiltros = getInfoFiltros({
    fechaDesde: rangoFechas.desde,
    fechaHasta: rangoFechas.hasta,
  });

  if (infoFiltros) {
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(infoFiltros.split("\n"), 15, y);
    y += 8;
  }
  // Ahora total profesores
  doc.text(`Total profesores: ${profesores.length}`, marginLeft, y);

  y += 10;

  // --- Columnas ajustadas ---
  const colFechaX = marginLeft;
  const colTituloX = marginLeft + 28;
  const colCursosX = colTituloX + 85; // antes 80 + 5 mm
  const colEstadoX = colCursosX + 50; // antes 55, ahora a la izquierda

  const colTituloWidth = 85; // antes 80
  const colCursosWidth = 50; // antes 55
  const lineHeight = 5;

  // --- Contenido ---
  profesores.forEach((profesor) => {
    const lista = actividadesPorProfesor[profesor];

    if (y > pageHeight - marginBottom - 40) {
      y = addPageWithHeader(
        doc,
        "Agenda de Actividades Extraescolares por Profesor"
      );
      resetContentStyle();
    }

    // --- Nombre profesor ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(profesor, marginLeft, y);
    y += 4;

    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 6;

    // --- Encabezado tabla ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Fecha", colFechaX, y);
    doc.text("Actividad", colTituloX, y);
    doc.text("Cursos", colCursosX, y);
    doc.text("Estado", colEstadoX, y);
    y += 4;

    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 6;

    resetContentStyle();

    lista.forEach((act) => {
      const fechaTxt = new Date(act.fecha_inicio).toLocaleDateString("es-ES");
      const tituloLines = doc.splitTextToSize(act.titulo || "", colTituloWidth);

      const cursosTxt =
        Array.isArray(act.cursos) && act.cursos.length
          ? act.cursos.map((c) => c.nombre).join(", ")
          : "-";
      const cursosLines = doc.splitTextToSize(cursosTxt, colCursosWidth);

      const estadoTxt = estadosMap[act.estado] ?? "—";

      const rowLines = Math.max(tituloLines.length, cursosLines.length, 1);
      const rowHeight = rowLines * lineHeight;

      if (y + rowHeight > pageHeight - marginBottom - 10) {
        y = addPageWithHeader(
          doc,
          "Agenda de Actividades Extraescolares por Profesor"
        );
        resetContentStyle();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Fecha", colFechaX, y);
        doc.text("Actividad", colTituloX, y);
        doc.text("Cursos", colCursosX, y);
        doc.text("Estado", colEstadoX, y);
        y += 4;

        doc.setLineWidth(0.3);
        doc.line(marginLeft, y, pageWidth - marginLeft, y);
        y += 4;

        resetContentStyle();
      }

      doc.setTextColor(0, 0, 0);
      doc.text(fechaTxt, colFechaX, y);
      doc.text(tituloLines, colTituloX, y);
      doc.text(cursosLines, colCursosX, y);
      doc.text(estadoTxt, colEstadoX, y);

      y += rowHeight + 2;
    });

    y += 8;
  });

  drawFooter(doc);

  doc.save("Agenda_Extraescolares_por_Profesor.pdf");
}

function getMonthInfo(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    // Lunes = 0, Domingo = 6
    firstWeekDay: (firstDay.getDay() + 6) % 7,
    daysInMonth: lastDay.getDate(),
  };
}

function drawCalendar(doc, year, month, actividadesMes, startX, startY) {
  const cellW = 20;
  const cellH = 14;

  const diasSemana = ["L", "M", "X", "J", "V", "S", "D"];

  const pageWidth = doc.internal.pageSize.getWidth();
  const calendarWidth = cellW * 7;
  const startXCentered = (pageWidth - calendarWidth) / 2;

  const { firstWeekDay, daysInMonth } = getMonthInfo(year, month);

  const diasConActividad = new Set(
    actividadesMes.map((a) => new Date(a.fecha_inicio).getDate())
  );

  const today = new Date();
  const esMesActual =
    today.getFullYear() === year && today.getMonth() === month;

  // --- Cabecera días ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  diasSemana.forEach((d, i) => {
    doc.setTextColor(60);
    doc.text(d, startXCentered + i * cellW + cellW / 2, startY, {
      align: "center",
    });
  });

  let x = startXCentered;
  let y = startY + 5;
  let day = 1;

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col;

      if (cellIndex >= firstWeekDay && day <= daysInMonth) {
        // --- Fondo días con actividad ---
        if (diasConActividad.has(day)) {
          doc.setFillColor(237, 233, 254);
          doc.roundedRect(x, y, cellW, cellH, 2, 2, "F");
        }

        // --- Borde ---
        doc.setDrawColor(200);
        doc.roundedRect(x, y, cellW, cellH, 2, 2);

        // --- Número ---
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(0);
        doc.text(String(day), x + cellW / 2, y + cellH / 2 + 2, {
          align: "center",
          baseline: "middle",
        });

        day++;
      } else {
        // Celdas vacías
        doc.setDrawColor(220);
        doc.roundedRect(x, y, cellW, cellH, 2, 2);
      }

      x += cellW;
    }
    x = startXCentered;
    y += cellH;
  }

  return y + 12;
}
/*
 * Listado de actividades extraescolares, por mes, con calendario del mes al inicio de cada página, días de
 * extraescolares resaltados. Al pie de cada mes, listado por fecha de actividades que se celebran en ese mes.
 */

export function generateListadoExtraescolaresMensual(
  actividades = [],
  rangoFechas
) {
  if (!actividades.length) {
    alert("No hay actividades para generar el informe.");
    return;
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 15;
  const marginBottom = 20;

  let firstPage = true;
  let y = 0;

  // --- Estados ---
  const estadosMap = {
    0: "Pendiente",
    1: "Aceptada",
    2: "Rechazada",
  };

  const estadoColorMap = {
    0: [255, 192, 128],
    1: [128, 200, 128],
    2: [255, 128, 128],
  };

  // --- Agrupar por mes ---
  const porMes = actividades.reduce((acc, act) => {
    const d = new Date(act.fecha_inicio);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(act);
    return acc;
  }, {});

  Object.entries(porMes).forEach(([mesKey, actividadesMes]) => {
    if (!firstPage) {
      y = addPageWithHeader(
        doc,
        "Agenda mensual de actividades extraescolares"
      );
    } else {
      y = drawHeader(doc, "Agenda mensual de actividades extraescolares");
      firstPage = false;
      y = y - 5;
      // --- Información de filtros aplicada ---
      const infoFiltros = getInfoFiltros({
        fechaDesde: rangoFechas.desde,
        fechaHasta: rangoFechas.hasta,
      });

      if (infoFiltros) {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(infoFiltros.split("\n"), 15, y);
        y += 15;
      }
    }

    const [year, month] = mesKey.split("-").map(Number);
    const monthIndex = month - 1;

    // ===== TÍTULO DEL MES =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(
      new Date(year, monthIndex)
        .toLocaleDateString("es-ES", { month: "long", year: "numeric" })
        .toUpperCase(),
      pageWidth / 2,
      y,
      { align: "center" }
    );

    y += 8;

    // ===== CALENDARIO =====
    y = drawCalendar(doc, year, monthIndex, actividadesMes, marginLeft, y);
    y += 8;

    const ordenadas = [...actividadesMes].sort(
      (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio)
    );

    // --- Columnas ---
    const colFechaX = marginLeft;
    const colFechaWidth = 25;
    const colTituloX = colFechaX + colFechaWidth;
    const colTituloWidth = 60;
    const colProfesorX = colTituloX + colTituloWidth;
    const colProfesorWidth = 45;
    const colCursosX = colProfesorX + colProfesorWidth;
    const colCursosWidth = 35;
    const colEstadoX = colCursosX + colCursosWidth;
    const colEstadoWidth = 25;

    const lineHeight = 5;

    // --- Título del bloque ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Actividades del mes", marginLeft, y);
    y += 4;

    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 6;

    const drawTableHeader = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("Fecha", colFechaX, y);
      doc.text("Actividad", colTituloX, y);
      doc.text("Profesor", colProfesorX, y);
      doc.text("Cursos", colCursosX, y);
      doc.text("Estado", colEstadoX, y);
      y += 4;

      doc.setLineWidth(0.2);
      doc.line(marginLeft, y, pageWidth - marginLeft, y);
      y += 4;

      doc.setFont("helvetica", "normal");
    };

    drawTableHeader();

    ordenadas.forEach((act) => {
      const fechaStr = new Date(act.fecha_inicio).toLocaleDateString("es-ES");

      const actividadStr = `${act.titulo || ""}${
        act.descripcion ? " - " + act.descripcion : ""
      }`;
      const tituloLines = doc.splitTextToSize(actividadStr, colTituloWidth);

      let profesorStr = act.nombreProfesor || "";
      const maxCharsProfesor = Math.floor(colProfesorWidth / 1.8);
      if (profesorStr.length > maxCharsProfesor) {
        profesorStr = profesorStr.substring(0, maxCharsProfesor - 3) + "...";
      }

      const cursosTxt =
        Array.isArray(act.cursos) && act.cursos.length
          ? act.cursos.map((c) => c.nombre).join(", ")
          : "-";
      const cursosLines = doc.splitTextToSize(cursosTxt, colCursosWidth);

      const estadoTxt = estadosMap[act.estado] ?? "—";
      const estadoLines = doc.splitTextToSize(estadoTxt, colEstadoWidth);

      const rowLines = Math.max(
        tituloLines.length,
        cursosLines.length,
        estadoLines.length,
        1
      );

      const rowHeight = rowLines * lineHeight;

      if (y + rowHeight > pageHeight - marginBottom) {
        y = addPageWithHeader(
          doc,
          "Agenda mensual de actividades extraescolares"
        );
        drawTableHeader();
      }

      const color = estadoColorMap[act.estado] || [0, 0, 0];
      doc.setTextColor(...color);

      doc.text(fechaStr, colFechaX, y);
      doc.text(tituloLines, colTituloX, y);
      doc.text(profesorStr, colProfesorX, y);
      doc.text(cursosLines, colCursosX, y);
      doc.text(estadoLines, colEstadoX, y);

      y += rowHeight + 2;
    });
  });

  // --- Footer global ---
  drawFooter(doc);

  doc.save("Informe_Extraescolares_Mensual.pdf");
}
