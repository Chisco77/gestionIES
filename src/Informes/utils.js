import logo from "/src/images/logo.png";

/**
 * Añade una nueva página y dibuja la cabecera
 */
export function addPageWithHeader(doc, titulo) {
  doc.addPage();
  return drawHeader(doc, titulo);
}

/**
 * Dibuja la cabecera común del informe
 * Devuelve la Y inicial del contenido
 */
export function drawHeader(doc, titulo) {
  const pageWidth = doc.internal.pageSize.getWidth();

  const marginLeft = 15;
  const marginRight = 15;

  const logoWidth = 25;
  const logoHeight = 18;
  const headerTop = 10;
  const headerBottomY = headerTop + logoHeight + 1;

  // --- Forzar color y fuente base ---
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  // --- Logo ---
  doc.addImage(logo, "PNG", marginLeft, headerTop, logoWidth, logoHeight);

  // --- Título ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14); // un poco más pequeño

  // Texto a la derecha del logo, con margen de 8 mm
  const titleX = marginLeft + logoWidth + 8;
  const titleY = headerTop + logoHeight / 2 + 2; // centrado verticalmente respecto al logo

  doc.text(titulo, titleX, titleY, {
    align: "left",
    baseline: "middle",
  });

  // --- Línea inferior ---
  doc.setLineWidth(0.3); // más fina
  doc.line(marginLeft, headerBottomY, pageWidth - marginRight, headerBottomY);

  // Retornamos el Y inicial del contenido con un poco de aire debajo de la cabecera
  return headerBottomY + 14;
}

/**
 * Dibuja el pie de página en todas las páginas
 */
export function drawFooter(doc) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginLeft = 15;
  const marginRight = 15;
  const footerY = pageHeight - 15;

  const fecha = new Date().toLocaleDateString("es-ES");

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // --- Forzar estilo del footer ---
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    // Línea superior del pie (fina y elegante)
    doc.setLineWidth(0.3);
    doc.line(marginLeft, footerY - 5, pageWidth - marginRight, footerY - 5);

    // Izquierda: fecha
    doc.text(`Informe generado el ${fecha}`, marginLeft, footerY);

    // Derecha: página X de Y
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - marginRight, footerY, {
      align: "right",
    });
  }
}
