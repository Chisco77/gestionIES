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


/**
 * Añade una nueva página y dibuja la cabecera reseteando dimensiones internas
 * @param {jsPDF} doc - Instancia del documento
 * @param {string} titulo - Título de la cabecera
 * @param {string} orientacion - 'p' para vertical, 'l' para horizontal
 *
 *
 */

/**
 * Función auxiliar para resolver la ruta del logo
 */
export function resolverRutaLogo(urlDb) {
  if (!urlDb) return DEFAULT_LOGO;
  if (urlDb.startsWith("http")) return urlDb;

  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
  let cleanPath = urlDb;

  if (cleanPath.startsWith(baseUrl) && baseUrl !== "") {
    cleanPath = cleanPath.substring(baseUrl.length);
  }

  return `${baseUrl}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
}

/**
 * Añade una nueva página y dibuja la cabecera
 * @param {jsPDF} doc
 * @param {string} titulo
 * @param {string} logoUrl - URL resuelta del logo
 * @param {string} orientacion
 */
export function addPageWithHeader(doc, titulo, logoUrl, orientacion = "l") {
  doc.addPage(orientacion, "a4");

  if (orientacion === "p") {
    doc.internal.pageSize.width = 210;
    doc.internal.pageSize.height = 297;
  } else {
    doc.internal.pageSize.width = 297;
    doc.internal.pageSize.height = 210;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  return drawHeader(doc, titulo, logoUrl);
}

/**
 * Dibuja la cabecera con el logo pasado por parámetro
 */
export function drawHeader(doc, titulo, logoUrl) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 15;
  const marginRight = 15;
  const logoWidth = 25;
  const logoHeight = 18;
  const headerTop = 10;
  const headerBottomY = headerTop + logoHeight + 1;

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  // --- Uso del logo dinámico ---
  // Nota: logoUrl debe ser una imagen ya cargada o una URL accesible
  try {
    const imgType = logoUrl.toLowerCase().includes(".png") ? "PNG" : "JPEG";
    doc.addImage(
      logoUrl,
      imgType,
      marginLeft,
      headerTop,
      logoWidth,
      logoHeight
    );
  } catch (error) {
    console.error("Error al añadir logo al PDF, usando default", error);
    // Fallback silencioso si la imagen falla
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  const titleX = marginLeft + logoWidth + 8;
  const titleY = headerTop + logoHeight / 2 + 2;
  const maxTitleWidth = pageWidth - titleX - marginRight;

  doc.text(titulo, titleX, titleY, {
    align: "left",
    baseline: "middle",
    maxWidth: maxTitleWidth,
  });

  doc.setLineWidth(0.3);
  doc.line(marginLeft, headerBottomY, pageWidth - marginRight, headerBottomY);

  return headerBottomY + 14;
}

/**
 * Dibuja el pie de página (Se mantiene igual)
 */
export function drawFooter(doc) {
  const pageCount = doc.getNumberOfPages();
  const now = new Date();
  const fecha = now.toLocaleDateString("es-ES");
  const hora = now.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const currentWidth = doc.internal.pageSize.getWidth();
    const currentHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 15;
    const marginRight = 15;
    const footerY = currentHeight - 15;

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.setLineWidth(0.3);
    doc.line(marginLeft, footerY - 5, currentWidth - marginRight, footerY - 5);

    doc.text(`Informe generado el ${fecha} a las ${hora}`, marginLeft, footerY);
    doc.text(
      `Página ${i} de ${pageCount}`,
      currentWidth - marginRight,
      footerY,
      { align: "right" }
    );
  }
}
