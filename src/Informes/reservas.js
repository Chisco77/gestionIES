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
