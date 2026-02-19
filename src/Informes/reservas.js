/**
 * reservasPeriodicas.js
 *
 * Funciones para generar informes PDF de reservas periódicas de aulas y recursos.
 * Permite generar informes tanto por aula como por profesor, mostrando columnas
 * de información detallada: creador de la reserva, destinatario, fechas, días,
 * periodo y descripción de la reserva.
 *
 * Funciones exportadas:
 *
 * 1. generateInformeReservasPeriodicas(reservas, periodosDB)
 *    - Genera un PDF en orientación horizontal (landscape) agrupando reservas por aula.
 *    - Columnas: Creado por, Para, Desde, Hasta, Días, Periodo, Descripción.
 *    - Orden interno de reservas: profesor creador → destinatario → fecha desde → periodo.
 *    - Cada aula comienza en nueva página (excepto la primera).
 *    - Gestiona paginación automática y evita huérfanos.
 *
 * 2. generateInformeReservasPeriodicasProfesor(reservas, periodosDB)
 *    - Genera un PDF en orientación vertical (portrait) agrupando reservas por profesor.
 *    - Columnas: Aula, Días, Periodo, Desde, Hasta.
 *    - Orden interno: aula → fecha desde → periodo.
 *    - Cada profesor comienza en nueva página (excepto el primero).
 *    - Gestiona paginación automática y evita huérfanos.
 *
 * Utilidades internas:
 * - drawHeader(doc, title), drawFooter(doc), addPageWithHeader(doc, title): funciones auxiliares
 *   para cabecera, pie de página y paginación automática.
 * - resetContentStyle(): restaura fuente, tamaño y color de texto base.
 * - truncate(text, max): recorta texto largo para cabecera de tabla o celdas.
 *
 * Características generales:
 * - Maneja saltos de página automáticos si no hay espacio suficiente.
 * - Ajusta tamaño de columnas y filas según contenido.
 * - Compatible con jsPDF para generación de PDFs.
 * - Resalta títulos y encabezados mediante fuente bold.
 *
 * Uso:
 * generateInformeReservasPeriodicas(listaReservas, periodosDB);
 * generateInformeReservasPeriodicasProfesor(listaReservas, periodosDB);
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 */

import jsPDF from "jspdf";
import { drawHeader, drawFooter, addPageWithHeader } from "./utils";
import { addMonths } from "date-fns";

export const generateInformeReservasPeriodicas = (reservas, periodosDB) => {
  if (!reservas?.length) {
    alert("No hay reservas periódicas.");
    return;
  }

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const pageWidth = 297;
  const pageHeight = 210;
  const marginLeft = 14;
  const marginBottom = 15;

  const baseLineHeight = 5;
  let y = 0;

  const resetContentStyle = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
  };

  // 🔹 Cabecera corporativa inicial
  y = drawHeader(doc, "Informe de Reservas Periódicas");
  resetContentStyle();

  // 🔹 Configuración columnas
  const colWidth = {
    creadoPor: 50,
    para: 50,
    fecha: 26,
    dias: 18,
    periodo: 40,
    descripcion: 67,
  };

  const columns = {
    creadoPor: marginLeft,
    para: marginLeft + colWidth.creadoPor,
    desde: marginLeft + colWidth.creadoPor + colWidth.para,
    hasta: marginLeft + colWidth.creadoPor + colWidth.para + colWidth.fecha,
    dias: marginLeft + colWidth.creadoPor + colWidth.para + colWidth.fecha * 2,
    periodo:
      marginLeft +
      colWidth.creadoPor +
      colWidth.para +
      colWidth.fecha * 2 +
      colWidth.dias,
    descripcion:
      marginLeft +
      colWidth.creadoPor +
      colWidth.para +
      colWidth.fecha * 2 +
      colWidth.dias +
      colWidth.periodo,
  };

  const truncate = (text, max = 30) =>
    text?.length > max ? text.substring(0, max) + "..." : text || "";

  const drawTableHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    doc.text("Creado por", columns.creadoPor, y);
    doc.text("Para", columns.para, y);
    doc.text("Desde", columns.desde, y);
    doc.text("Hasta", columns.hasta, y);
    doc.text("Días", columns.dias, y);
    doc.text("Periodo", columns.periodo, y);
    doc.text("Descripción", columns.descripcion, y);

    y += 4;
    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 6;

    resetContentStyle();
  };

  const diasSemanaTexto = ["L", "M", "X", "J", "V", "S", "D"];

  // 🔹 Agrupar reservas por aula
  const reservasAgrupadas = reservas.reduce((acc, reserva) => {
    const aula = reserva.descripcion_estancia || "Sin aula";
    if (!acc[aula]) acc[aula] = [];
    acc[aula].push(reserva);
    return acc;
  }, {});

  // 🔹 Ordenar aulas alfabéticamente
  const aulasOrdenadas = Object.keys(reservasAgrupadas).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );

  aulasOrdenadas.forEach((aula, index) => {
    const reservasAula = reservasAgrupadas[aula];

    // 🔹 Cada aula en una página nueva (excepto la primera)
    if (index > 0) {
      doc.addPage();
      y = drawHeader(doc, "Informe de Reservas Periódicas");
      resetContentStyle();
    }

    // 🔹 Ordenar reservas dentro del aula por múltiples criterios
    reservasAula.sort((r1, r2) => {
      // 1️⃣ Profesor que crea la reserva
      const creadorCompare = (r1.nombreCreador || "").localeCompare(
        r2.nombreCreador || "",
        "es",
        { sensitivity: "base" }
      );
      if (creadorCompare !== 0) return creadorCompare;

      // 2️⃣ Destinatario
      const profesorCompare = (r1.nombreProfesor || "").localeCompare(
        r2.nombreProfesor || "",
        "es",
        { sensitivity: "base" }
      );
      if (profesorCompare !== 0) return profesorCompare;

      // 3️⃣ Fecha desde
      const fechaCompare = new Date(r1.fecha_desde) - new Date(r2.fecha_desde);
      if (fechaCompare !== 0) return fechaCompare;

      // 4️⃣ Periodo inicio
      return (r1.idperiodo_inicio || 0) - (r2.idperiodo_inicio || 0);
    });

    // 🔹 Título aula
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Aula: ${aula}`, marginLeft, y);
    y += 5;

    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 8;

    resetContentStyle();

    drawTableHeader();

    reservasAula.forEach((r) => {
      let periodosTexto = `${r.idperiodo_inicio} - ${r.idperiodo_fin}`;
      if (periodosDB?.length) {
        const inicio = periodosDB.find((p) => p.id === r.idperiodo_inicio);
        const fin = periodosDB.find((p) => p.id === r.idperiodo_fin);
        if (inicio && fin) periodosTexto = `${inicio.nombre} - ${fin.nombre}`;
      }

      const diasTexto =
        r.dias_semana?.map((d) => diasSemanaTexto[d]).join(", ") || "";

      const fechaDesde = new Date(r.fecha_desde).toLocaleDateString("es-ES");
      const fechaHasta = new Date(r.fecha_hasta).toLocaleDateString("es-ES");

      const descripcionLines = doc.splitTextToSize(
        r.descripcion_reserva || "",
        colWidth.descripcion
      );

      const rowHeight = Math.max(descripcionLines.length, 1) * baseLineHeight;

      if (y + rowHeight > pageHeight - marginBottom - 5) {
        doc.addPage();
        y = drawHeader(doc, "Informe de Reservas Periódicas");
        resetContentStyle();
        drawTableHeader();
      }

      doc.text(truncate(r.nombreCreador), columns.creadoPor, y);
      doc.text(truncate(r.nombreProfesor), columns.para, y);
      doc.text(fechaDesde, columns.desde, y);
      doc.text(fechaHasta, columns.hasta, y);
      doc.text(diasTexto, columns.dias, y);
      doc.text(periodosTexto, columns.periodo, y);
      doc.text(descripcionLines, columns.descripcion, y);

      y += rowHeight + 2;
    });

    y += 6;
  });

  // 🔹 Footer corporativo
  drawFooter(doc);

  doc.save("Informe_Reservas_Periodicas.pdf");
};

export const generateInformeReservasPeriodicasProfesor = (
  reservas,
  periodosDB
) => {
  if (!reservas?.length) {
    alert("No hay reservas periódicas.");
    return;
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 14;
  const marginBottom = 15;

  const baseLineHeight = 5;
  let y = 0;

  const resetContentStyle = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
  };

  // 🔹 Cabecera inicial
  y = drawHeader(doc, "Informe de Reservas Periódicas por Profesor");
  resetContentStyle();

  // 🔹 Columnas: Aula → Días → Periodo → Fecha desde → Fecha hasta
  const colWidth = {
    descripcion: 60,
    dias: 20,
    periodo: 40,
    fechaDesde: 25,
    fechaHasta: 25,
  };

  const columns = {
    descripcion: marginLeft,
    dias: marginLeft + colWidth.descripcion,
    periodo: marginLeft + colWidth.descripcion + colWidth.dias,
    fechaDesde:
      marginLeft + colWidth.descripcion + colWidth.dias + colWidth.periodo,
    fechaHasta:
      marginLeft +
      colWidth.descripcion +
      colWidth.dias +
      colWidth.periodo +
      colWidth.fechaDesde,
  };

  const diasSemanaTexto = ["L", "M", "X", "J", "V", "S", "D"];

  const drawTableHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    doc.text("Aula", columns.descripcion, y);
    doc.text("Días", columns.dias, y);
    doc.text("Periodo", columns.periodo, y);
    doc.text("Desde", columns.fechaDesde, y);
    doc.text("Hasta", columns.fechaHasta, y);

    y += 4;
    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 6;

    resetContentStyle();
  };

  // 🔹 Agrupar reservas periódicas por profesor destinatario
  const reservasAgrupadas = reservas.reduce((acc, reserva) => {
    const profesor = reserva.nombreProfesor || "Sin profesor";
    if (!acc[profesor]) acc[profesor] = [];
    acc[profesor].push(reserva);
    return acc;
  }, {});

  // 🔹 Ordenar profesores alfabéticamente
  const profesoresOrdenados = Object.keys(reservasAgrupadas).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );

  profesoresOrdenados.forEach((profesor, index) => {
    const reservasProfesor = reservasAgrupadas[profesor];

    // Cada profesor en página nueva
    if (index > 0) {
      doc.addPage();
      y = drawHeader(doc, "Informe de Reservas Periódicas por Profesor");
      resetContentStyle();
    }

    // 🔹 Título profesor
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Profesor: ${profesor}`, marginLeft, y);
    y += 5;

    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 8;

    resetContentStyle();
    drawTableHeader();

    // 🔹 Ordenar reservas por: descripción del aula → fecha desde → periodo
    reservasProfesor.sort((r1, r2) => {
      const aulaCompare = (r1.descripcion_estancia || "").localeCompare(
        r2.descripcion_estancia || "",
        "es",
        { sensitivity: "base" }
      );
      if (aulaCompare !== 0) return aulaCompare;

      const fechaCompare = new Date(r1.fecha_desde) - new Date(r2.fecha_desde);
      if (fechaCompare !== 0) return fechaCompare;

      return (r1.idperiodo_inicio || 0) - (r2.idperiodo_inicio || 0);
    });

    reservasProfesor.forEach((r) => {
      const diasTexto =
        r.dias_semana?.map((d) => diasSemanaTexto[d]).join(", ") || "";

      const inicio =
        periodosDB?.find((p) => p.id === r.idperiodo_inicio)?.nombre ||
        r.idperiodo_inicio;
      const fin =
        periodosDB?.find((p) => p.id === r.idperiodo_fin)?.nombre ||
        r.idperiodo_fin;
      const periodoTexto = `${inicio} - ${fin}`;

      const fechaDesde = new Date(r.fecha_desde).toLocaleDateString("es-ES");
      const fechaHasta = new Date(r.fecha_hasta).toLocaleDateString("es-ES");

      const descripcionLines = doc.splitTextToSize(
        r.descripcion_estancia || "",
        colWidth.descripcion
      );

      const rowHeight = Math.max(descripcionLines.length, 1) * baseLineHeight;

      if (y + rowHeight > pageHeight - marginBottom - 5) {
        doc.addPage();
        y = drawHeader(doc, "Informe de Reservas Periódicas por Profesor");
        resetContentStyle();
        drawTableHeader();
      }

      doc.text(descripcionLines, columns.descripcion, y);
      doc.text(diasTexto, columns.dias, y);
      doc.text(periodoTexto, columns.periodo, y);
      doc.text(fechaDesde, columns.fechaDesde, y);
      doc.text(fechaHasta, columns.fechaHasta, y);

      y += rowHeight + 2;
    });

    y += 6;
  });

  drawFooter(doc);
  doc.save("Informe_Reservas_Periodicas_Por_Profesor.pdf");
};

export function generateCalendarioOcupacionPorEstancia(
  resultados = [],
  periodosDB = [],
  { tipoEstancia, desde, hasta }
) {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "landscape",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Mapeo idPeriodo → nombrePeriodo ---
  const periodoMap = {};
  periodosDB.forEach((p) => {
    periodoMap[p.id] = p.nombre;
  });

  let current = new Date(desde);
  const end = new Date(hasta);

  while (current <= end) {
    // --- Filtrar y ordenar estancias ---
    const estanciasFiltradas = (
      tipoEstancia
        ? resultados.filter((r) => r.estancia.tipoestancia === tipoEstancia)
        : resultados
    ).sort((a, b) =>
      a.estancia.descripcion.localeCompare(b.estancia.descripcion)
    );

    const year = current.getFullYear();
    const month = current.getMonth();

    for (const [index, res] of estanciasFiltradas.entries()) {
      const estancia = res.estancia;

      // 🔹 Filtrar reservas del mes
      const reservasMes = (res.reservas || []).filter((r) => {
        if (!r.fecha) return false;
        const f = new Date(r.fecha);
        return f.getFullYear() === year && f.getMonth() === month;
      });

      // 🔹 Agrupar reservas por día y ordenar por idperiodo_inicio
      const reservasPorDia = {};
      reservasMes.forEach((r) => {
        const dia = new Date(r.fecha).getDate();
        if (!reservasPorDia[dia]) reservasPorDia[dia] = [];

        const nombreInicio =
          periodoMap[r.idperiodo_inicio] || r.idperiodo_inicio;
        const nombreFin = periodoMap[r.idperiodo_fin] || r.idperiodo_fin;

        r.descripcionPeriodo =
          r.idperiodo_inicio === r.idperiodo_fin
            ? nombreInicio
            : `${nombreInicio} - ${nombreFin}`;

        reservasPorDia[dia].push(r);
      });

      // Ordenar reservas por periodo de inicio
      Object.keys(reservasPorDia).forEach((dia) => {
        reservasPorDia[dia].sort(
          (a, b) => a.idperiodo_inicio - b.idperiodo_inicio
        );
      });

      // 🔹 Encabezado con drawHeader
      const mesTexto = new Date(year, month)
        .toLocaleDateString("es-ES", { month: "long", year: "numeric" })
        .toUpperCase();
      const yInicio = drawHeader(
        doc,
        `Calendario de ocupación - ${estancia.descripcion} ${mesTexto}`
      );

      // 🔹 Dibujar calendario
      drawCalendarReservas(doc, year, month, reservasPorDia, 20, yInicio);

      // 🔹 Footer
      drawFooter(doc);

      // 🔹 Nueva página si hay más estancias
      if (index !== estanciasFiltradas.length - 1) {
        doc.addPage("a4", "landscape");
      }
    }

    // Pasamos al siguiente mes
    current = addMonths(current, 1);
    if (current <= end) doc.addPage("a4", "landscape");
  }

  doc.save(`Calendario_Ocupacion_${tipoEstancia || "Todas"}.pdf`);
}

// --- Modificación de drawCalendarReservas ---
function drawCalendarReservas(doc, year, month, reservasPorDia, startX, startY) {
  const totalWidth = doc.internal.pageSize.getWidth() - 30; // margen 15 mm cada lado
  const diasSemana = ["L", "M", "X", "J", "V", "S", "D"];

  // --- Definir anchos: sáb y dom = 0.5, resto repartido ---
  const numDiasLaborables = 5;
  const factorFinSemana = 0.5; // sáb y dom mitad
  const anchoDiaLaborable = totalWidth / (numDiasLaborables + 2 * factorFinSemana);
  const anchoFinSemana = anchoDiaLaborable * factorFinSemana;

  const cellHeights = 22;
  const cellWArr = [
    anchoDiaLaborable, // L
    anchoDiaLaborable, // M
    anchoDiaLaborable, // X
    anchoDiaLaborable, // J
    anchoDiaLaborable, // V
    anchoFinSemana,    // S
    anchoFinSemana,    // D
  ];

  // --- Posición inicial centrada ---
  const startXCentered = (doc.internal.pageSize.getWidth() - totalWidth) / 2;

  // --- Cabecera días ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  let x = startXCentered;
  diasSemana.forEach((d, i) => {
    doc.text(d, x + cellWArr[i] / 2, startY, { align: "center" });
    x += cellWArr[i];
  });

  const { firstWeekDay, daysInMonth } = getMonthInfo(year, month);

  // --- Dibujar celdas ---
  let day = 1;
  let y = startY + 6;

  for (let row = 0; row < 6; row++) {
    x = startXCentered;
    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col;
      const cellW = cellWArr[col];

      if (cellIndex >= firstWeekDay && day <= daysInMonth) {
        doc.setDrawColor(200);
        doc.roundedRect(x, y, cellW, cellHeights, 2, 2);

        // Número día
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(String(day), x + 2, y + 4);

        // 🔹 Reservas del día
        const reservasDia = reservasPorDia[day] || [];
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        let textY = y + 8;

        reservasDia.forEach((r) => {
          const linea = `${r.descripcionPeriodo} ${r.descripcion}`;
          const lines = doc.splitTextToSize(linea, cellW - 4);

          lines.forEach((l) => {
            if (textY < y + cellHeights - 2) {
              doc.text(l, x + 2, textY);
              textY += 3.5;
            }
          });
        });

        day++;
      } else {
        doc.setDrawColor(230);
        doc.roundedRect(x, y, cellW, cellHeights, 2, 2);
      }

      x += cellW;
    }
    y += cellHeights;
  }
}

// --- Funciones auxiliares
function drawHeaderReservas(doc, nombreEstancia) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Calendario de ocupación - ${nombreEstancia}`, 15, 12);
}

function getMonthInfo(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let firstWeekDay = firstDay.getDay();
  firstWeekDay = (firstWeekDay + 6) % 7; // lunes = 0
  return { firstWeekDay, daysInMonth: lastDay.getDate() };
}
