// src/Informes/reservasPeriodicas.js
import jsPDF from "jspdf";
import { drawHeader, drawFooter, addPageWithHeader } from "./utils";

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

  // 🔹 Agrupar por aula
  const reservasAgrupadas = reservas.reduce((acc, reserva) => {
    const aula = reserva.descripcion_estancia || "Sin aula";
    if (!acc[aula]) acc[aula] = [];
    acc[aula].push(reserva);
    return acc;
  }, {});

  const diasSemanaTexto = ["L", "M", "X", "J", "V", "S", "D"];

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
    hasta:
      marginLeft + colWidth.creadoPor + colWidth.para + colWidth.fecha,
    dias:
      marginLeft +
      colWidth.creadoPor +
      colWidth.para +
      colWidth.fecha * 2,
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

  Object.entries(reservasAgrupadas).forEach(([aula, reservasAula]) => {
    if (y > pageHeight - marginBottom - 20) {
      doc.addPage();
      y = drawHeader(doc, "Informe de Reservas Periódicas");
      resetContentStyle();
    }

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
        if (inicio && fin) {
          periodosTexto = `${inicio.nombre} - ${fin.nombre}`;
        }
      }

      const diasTexto =
        r.dias_semana?.map((d) => diasSemanaTexto[d]).join(", ") || "";

      const fechaDesde = new Date(r.fecha_desde).toLocaleDateString("es-ES");
      const fechaHasta = new Date(r.fecha_hasta).toLocaleDateString("es-ES");

      const descripcionLines = doc.splitTextToSize(
        r.descripcion_reserva || "",
        colWidth.descripcion
      );

      const rowHeight =
        Math.max(descripcionLines.length, 1) * baseLineHeight;

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