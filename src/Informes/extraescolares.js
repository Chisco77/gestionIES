import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { getLocalDateKey } from "@/utils/dateHelpers";

/*
Genera listado extraescolares en ODS con columnas:
Departamento, Fecha, Actividad, Profesor, Cursos, Estado
*/
export function generateListadoExtraescolaresPorDepartamentoXLS(
  actividades = [],
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

  // Construir datos para la hoja
  const wsData = [];

  // --- Fila de encabezado ---
  wsData.push([
    "Departamento",
    "Fecha",
    "Actividad",
    "Profesor",
    "Cursos",
    "Estado",
  ]);

  // --- Ordenar primero por departamento alfabéticamente, luego por fecha y profesor ---
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
      { sensitivity: "base" },
    );
  });

  // --- Rellenar filas ---
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
  a.download = "Listado_Extraescolares.ods";
  a.click();
  URL.revokeObjectURL(url);
}

/*
Genera listado extraescolares agrupadas por departamento
*/

export function generateListadoExtraescolaresPorDepartamento(actividades = []) {
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
    a.localeCompare(b, "es", { sensitivity: "base" }),
  );

  // --- PDF base ---
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const marginLeft = 15;
  const marginTop = 20;
  const marginBottom = 20;
  let y = marginTop;

  // --- Cabecera ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(
    "Listado de Actividades Extraescolares por Departamento",
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 12;

  doc.setFontSize(11);
  doc.text(`Total actividades: ${actividades.length}`, marginLeft, y);
  y += 10;

  // --- Columnas
  const colFechaX = marginLeft;
  const colProfesorX = marginLeft + 25;
  const colTituloX = marginLeft + 75;
  const colCursosX = marginLeft + 125;
  const colEstadoX = marginLeft + 170;

  const colProfesorWidth = 45;
  const colTituloWidth = 45;
  const colCursosWidth = 40;

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
        { sensitivity: "base" },
      );
    });

    if (y > 260) {
      doc.addPage();
      y = marginTop;
    }

    // --- Cabecera departamento ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(depto, marginLeft, y);
    y += 4;

    doc.setLineWidth(0.6);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 6;

    // --- Encabezado tabla ---
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

    doc.setFont("helvetica", "normal");

    // --- Filas ---
    lista.forEach((act) => {
      const fechaTxt = act.fecha_inicio
        ? new Date(act.fecha_inicio).toLocaleDateString("es-ES")
        : "—";

      const profesorLines = doc.splitTextToSize(
        act.nombreProfesor || "",
        colProfesorWidth,
      );

      const tituloLines = doc.splitTextToSize(act.titulo || "", colTituloWidth);

      const cursosTxt = Array.isArray(act.cursos)
        ? act.cursos.map((c) => c.nombre).join(", ")
        : "";

      const cursosLines = doc.splitTextToSize(cursosTxt, colCursosWidth);

      const estadoTxt = estadosMap[act.estado] ?? "—";

      const rowLines = Math.max(
        profesorLines.length,
        tituloLines.length,
        cursosLines.length,
        1,
      );
      const rowHeight = rowLines * lineHeight;

      if (y + rowHeight > 297 - marginBottom) {
        doc.addPage();
        y = marginTop;
      }

      doc.text(fechaTxt, colFechaX, y);
      doc.text(profesorLines, colProfesorX, y);
      doc.text(tituloLines, colTituloX, y);
      doc.text(cursosLines, colCursosX, y);
      doc.text(estadoTxt, colEstadoX, y);

      y += rowHeight + 2;
    });

    y += 10;
  });

  doc.save("Listado_Extraescolares_por_Departamento.pdf");
}

/*
Genera listado extraescolares agrupadas por fecha inicio
con columnas: Actividad, Profesor, Departamento, Cursos y Estado
*/
export function generateListadoExtraescolaresPorFecha(actividades = []) {
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
    (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio),
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
  const marginLeft = 15;
  const marginTop = 20;
  const marginBottom = 20;
  let y = marginTop;

  // --- Cabecera ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(
    "Listado de Actividades Extraescolares por Fecha",
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 12;

  doc.setFontSize(11);
  doc.text(`Total actividades: ${ordenadas.length}`, marginLeft, y);
  y += 10;

  // --- Columnas (ancho ajustado según petición) ---
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

    if (y > 260) {
      doc.addPage();
      y = marginTop;
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

    doc.setFont("helvetica", "normal");

    // --- Filas ---
    lista.forEach((act) => {
      const tituloLines = doc.splitTextToSize(act.titulo || "", colTituloWidth);
      const profesorLines = doc.splitTextToSize(
        act.nombreProfesor || "",
        colProfesorWidth,
      );
      const departamentoLines = doc.splitTextToSize(
        act.departamento?.nombre || "-",
        colDepartamentoWidth,
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
        1,
      );
      const rowHeight = rowLines * lineHeight;

      if (y + rowHeight > 297 - marginBottom) {
        doc.addPage();
        y = marginTop;
      }

      doc.text(tituloLines, colTituloX, y);
      doc.text(profesorLines, colProfesorX, y);
      doc.text(departamentoLines, colDepartamentoX, y);
      doc.text(cursosLines, colCursosX, y);
      doc.text(estadoLines, colEstadoX, y);

      y += rowHeight + 2;
    });

    y += 8;
  });

  doc.save("Listado_Extraescolares_por_Fecha.pdf");
}

/*
Listado de actividades extraescolares, agrupadas por profesor.
*/
export function generateListadoExtraescolaresPorProfesor(actividades = []) {
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

  // --- Ordenar por fecha de celebración ---
  const actividadesOrdenadas = [...actividades].sort(
    (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio),
  );

  // --- Agrupar por profesor ---
  const actividadesPorProfesor = actividadesOrdenadas.reduce((acc, act) => {
    const nombre = act.nombreProfesor || "Sin profesor";
    if (!acc[nombre]) acc[nombre] = [];
    acc[nombre].push(act);
    return acc;
  }, {});

  const profesores = Object.keys(actividadesPorProfesor).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" }),
  );

  // --- PDF base ---
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const marginLeft = 15;
  const marginTop = 20;
  const marginBottom = 20;
  let y = marginTop;

  // --- Cabecera ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(
    "Listado de Actividades Extraescolares por Profesor",
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 12;

  doc.setFontSize(11);
  doc.text(`Total profesores: ${profesores.length}`, marginLeft, y);
  y += 10;

  // --- Columnas ---
  const colFechaX = marginLeft;
  const colTituloX = marginLeft + 28;
  const colCursosX = marginLeft + 110;
  const colEstadoX = marginLeft + 170;

  const colTituloWidth = 80;
  const colCursosWidth = 55;
  const lineHeight = 5;

  // --- Contenido ---
  profesores.forEach((profesor) => {
    const lista = actividadesPorProfesor[profesor];

    if (y > 260) {
      doc.addPage();
      y = marginTop;
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
    doc.setFontSize(10);
    doc.text("Fecha", colFechaX, y);
    doc.text("Actividad", colTituloX, y);
    doc.text("Cursos", colCursosX, y);
    doc.text("Estado", colEstadoX, y);
    y += 4;

    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 4;

    doc.setFont("helvetica", "normal");

    // --- Filas ---
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

      if (y + rowHeight > 297 - marginBottom) {
        doc.addPage();
        y = marginTop;
      }

      doc.text(fechaTxt, colFechaX, y);
      doc.text(tituloLines, colTituloX, y);
      doc.text(cursosLines, colCursosX, y);
      doc.text(estadoTxt, colEstadoX, y);

      y += rowHeight + 2;
    });

    y += 8;
  });

  doc.save("Listado_Extraescolares_por_Profesor.pdf");
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
  const cellW = 25;
  const cellH = 18;
  const diasSemana = ["L", "M", "X", "J", "V", "S", "D"];

  const { firstWeekDay, daysInMonth } = getMonthInfo(year, month);

  const diasConActividad = new Set(
    actividadesMes.map((a) => new Date(a.fecha_inicio).getDate()),
  );

  const today = new Date();
  const esMesActual =
    today.getFullYear() === year && today.getMonth() === month;

  // --- Cabecera días sin fondo ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  diasSemana.forEach((d, i) => {
    doc.setTextColor(50);
    doc.text(d, startX + i * cellW + cellW / 2, startY, { align: "center" });
  });

  let x = startX;
  let y = startY + 6;
  let day = 1;

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col;

      if (cellIndex >= firstWeekDay && day <= daysInMonth) {
        // --- Fondo de días con actividad ---
        if (diasConActividad.has(day)) {
          doc.setFillColor(237, 233, 254); // violeta suave
          doc.roundedRect(x, y, cellW, cellH, 2, 2, "F");
        }

        // --- Día actual ---
        if (esMesActual && day === today.getDate()) {
          doc.setFillColor(255, 235, 205); // beige claro
          doc.roundedRect(x, y, cellW, cellH, 2, 2, "F");
        }

        // --- Borde de celda ---
        doc.setDrawColor(200);
        doc.roundedRect(x, y, cellW, cellH, 2, 2);

        // --- Número de día ---
        doc.setFont("helvetica", "normal");
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
    x = startX;
    y += cellH;
  }

  return y + 10; // devuelve el Y donde continuar
}

/*
 * Listado de actividades extraescolares, por mes, con calendario del mes al inicio de cada página, días de
 * extraescolares resaltados. Al pie de cada mes, listado por fecha de actividades que se celebran en ese mes.
 */
export function generateListadoExtraescolaresMensual(actividades = []) {
  if (!actividades.length) {
    alert("No hay actividades para generar el informe.");
    return;
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 15;
  const marginBottom = 15;
  let firstPage = true;

  // --- Estados ---
  const estadosMap = {
    0: "Pendiente",
    1: "Aceptada",
    2: "Rechazada",
  };

  const estadoColorMap = {
    0: [255, 192, 128], // amarillo pastel
    1: [128, 200, 128], // verde suave
    2: [255, 128, 128], // rojo
  };

  const porMes = actividades.reduce((acc, act) => {
    const d = new Date(act.fecha_inicio);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(act);
    return acc;
  }, {});

  Object.entries(porMes).forEach(([mesKey, actividadesMes]) => {
    if (!firstPage) doc.addPage();
    firstPage = false;

    const [year, month] = mesKey.split("-").map(Number);
    const monthIndex = month - 1;
    let y = 20;

    // ===== TÍTULO DEL MES =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(
      new Date(year, monthIndex)
        .toLocaleDateString("es-ES", { month: "long", year: "numeric" })
        .toUpperCase(),
      pageWidth / 2,
      y,
      { align: "center" },
    );

    y += 12;

    // ===== CALENDARIO =====
    y = drawCalendar(doc, year, monthIndex, actividadesMes, marginLeft, y);
    y += 8;

    const ordenadas = [...actividadesMes].sort(
      (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio),
    );

    // --- Columnas ---
    const colFechaX = marginLeft;
    const colFechaWidth = 25;
    const colTituloX = colFechaX + colFechaWidth;
    const colTituloWidth = 60; // máximo 30 mm, multiline
    const colProfesorX = colTituloX + colTituloWidth;
    const colProfesorWidth = 45; // truncar si excede
    const colCursosX = colProfesorX + colProfesorWidth;
    const colCursosWidth = 35; // ahora multiline
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

    // --- Encabezado tabla ---
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

    ordenadas.forEach((act) => {
      const fechaStr = new Date(act.fecha_inicio).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const actividadStr = `${act.titulo || ""}${act.descripcion ? " - " + act.descripcion : ""}`;
      const tituloLines = doc.splitTextToSize(actividadStr, colTituloWidth);

      // --- Profesor truncando a 25 mm ---
      let profesorStr = act.nombreProfesor || "";
      const maxCharsProfesor = Math.floor(colProfesorWidth / 1.8); // aprox caracteres que caben
      if (profesorStr.length > maxCharsProfesor) {
        profesorStr = profesorStr.substring(0, maxCharsProfesor - 3) + "...";
      }

      // --- Cursos en multiline máximo colCursosWidth ---
      const cursosTxt =
        Array.isArray(act.cursos) && act.cursos.length
          ? act.cursos.map((c) => c.nombre).join(", ")
          : "-";
      const cursosLines = doc.splitTextToSize(cursosTxt, colCursosWidth);

      const estadoTxt = estadosMap[act.estado] ?? "—";
      const estadoLines = doc.splitTextToSize(estadoTxt, colEstadoWidth);

      const rowLines = Math.max(
        tituloLines.length,
        1, // profesor truncado
        cursosLines.length, // ahora multiline
        estadoLines.length,
      );

      const rowHeight = rowLines * lineHeight;

      if (y + rowHeight > pageHeight - marginBottom) {
        doc.addPage();
        y = 20;

        // Reescribir encabezado
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
      }

      // --- Color del texto según estado ---
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

  doc.save("Informe_Extraescolares_Mensual.pdf");
}
