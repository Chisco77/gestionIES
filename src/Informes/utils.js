/**
 * utils.js
 *
 * Funciones auxiliares para generación de informes PDF con jsPDF.
 * Incluye cabecera, pie de página y paginación automática con título.
 * Permite mantener un estilo corporativo uniforme en todos los informes.
 *
 * Funciones exportadas:
 *
 * 1. addPageWithHeader(doc, titulo)
 *    - Añade una nueva página al documento PDF.
 *    - Llama a drawHeader para dibujar la cabecera de cada página.
 *    - Devuelve la posición Y inicial para empezar a escribir el contenido.
 *
 * 2. drawHeader(doc, titulo)
 *    - Dibuja la cabecera estándar del informe:
 *       • Logo del centro en la esquina superior izquierda.
 *       • Título del informe a la derecha del logo.
 *       • Línea horizontal inferior separando cabecera del contenido.
 *    - Forza fuente y color base antes de dibujar.
 *    - Devuelve la posición Y inicial del contenido con un margen de separación.
 *
 * 3. drawFooter(doc)
 *    - Dibuja el pie de página en todas las páginas del documento:
 *       • Línea horizontal superior del pie de página.
 *       • Fecha y hora de generación a la izquierda.
 *       • Número de página "Página X de Y" a la derecha.
 *    - Ajusta estilo, fuente y color automáticamente.
 *
 * Características generales:
 * - Compatible con jsPDF para informes PDF.
 * - Cabecera y pie de página uniformes para todos los módulos de informes.
 * - Maneja múltiples páginas automáticamente.
 * - Fácil de integrar en otros módulos de generación de PDFs.
 *
 * Uso:
 * addPageWithHeader(doc, "Título del Informe");
 * drawHeader(doc, "Título del Informe");
 * drawFooter(doc);
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 */

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

  const now = new Date();
  const fecha = now.toLocaleDateString("es-ES");
  const hora = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // --- Forzar estilo del footer ---
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    // Línea superior del pie 
    doc.setLineWidth(0.3);
    doc.line(marginLeft, footerY - 5, pageWidth - marginRight, footerY - 5);

    // Izquierda: fecha + hora
    doc.text(`Informe generado el ${fecha} a las ${hora}`, marginLeft, footerY);

    // Derecha: página X de Y
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - marginRight, footerY, {
      align: "right",
    });
  }
}
