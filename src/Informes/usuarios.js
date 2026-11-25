// src/modules/usuarios.js

/**
 * Módulo de informes de usuarios/alumnos
 */

import jsPDF from "jspdf";
import { drawHeader, drawFooter, addPageWithHeader } from "./utils";

/**
 * Genera un PDF con listado de alumnos agrupados por curso
 * @param {Array} alumnos - Lista de alumnos con {sn, givenName, uid, groups}
 * @param {string} nombrePdf - Nombre del archivo PDF a generar
 */
export async function generarPdfListadoPorCurso(
  alumnos,
  nombrePdf = "listado_alumnos_curso",
  logoUrl
) {
  if (!alumnos || !alumnos.length) {
    alert("No hay alumnos para generar el listado.");
    return;
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 20;
  const marginBottom = 15;
  const lineHeight = 8;

  // Agrupar y ordenar alumnos por curso
  const grupos = alumnos.reduce((acc, alumno) => {
    const curso = alumno.groups?.[0] ?? "Sin curso";
    if (!acc[curso]) acc[curso] = [];
    acc[curso].push(alumno);
    return acc;
  }, {});

  const cursosOrdenados = Object.keys(grupos).sort();

  cursosOrdenados.forEach((curso, cursoIndex) => {
    const alumnosCurso = grupos[curso].sort((a, b) =>
      (a.sn || "").localeCompare(b.sn || "")
    );

    // Añadir página nueva si no es la primera
    let y =
      cursoIndex === 0
        ? drawHeader(doc, `Listado de alumnos por curso: ${curso}`, logoUrl)
        : addPageWithHeader(
            doc,
            `Listado de alumnos por curso: ${curso}`,
            logoUrl
          );

    // Encabezado de columnas
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Apellidos", marginLeft, y);
    doc.text("Nombre", marginLeft + 60, y);
    doc.text("Usuario", marginLeft + 120, y);
    y += 8;

    // Filas de alumnos
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    alumnosCurso.forEach((alumno) => {
      if (y + lineHeight > pageHeight - marginBottom) {
        // Nueva página con cabecera
        y = addPageWithHeader(
          doc,
          `Listado de alumnos por curso: ${curso}`,
          logoUrl
        );

        // Repetir encabezado de columnas
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Apellidos", marginLeft, y);
        doc.text("Nombre", marginLeft + 60, y);
        doc.text("Usuario", marginLeft + 120, y);
        y += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
      }

      doc.text(alumno.sn ?? "", marginLeft, y);
      doc.text(alumno.givenName ?? "", marginLeft + 60, y);
      doc.text(alumno.uid ?? "", marginLeft + 120, y);
      y += lineHeight;
    });
  });

  // Pie de página
  drawFooter(doc);

  doc.save(nombrePdf.endsWith(".pdf") ? nombrePdf : `${nombrePdf}.pdf`);
}

/**
 * Genera un PDF con documentos individuales de compromiso
 * de retirada de portátil, uno por alumno.
 *
 * @param {Array} alumnos - Lista de alumnos {sn, givenName, uid, groups}
 * @param {string} nombrePdf - Nombre del archivo PDF
 * @param {string} logoUrl - URL del logo del centro
 */
export async function generarPdfCompromisosPortatil(
  alumnos,
  nombrePdf = "compromisos_retirada_portatil",
  logoUrl
) {
  if (!alumnos || !alumnos.length) {
    alert("No hay alumnos para generar los documentos.");
    return;
  }

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginRight = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // Orden alfabético por apellidos
  const alumnosOrdenados = [...alumnos].sort((a, b) =>
    (a.sn || "").localeCompare(b.sn || "", "es")
  );

  alumnosOrdenados.forEach((alumno, index) => {
    if (index > 0) {
      doc.addPage();
    }

    let y = drawHeader(
      doc,
      "Documento de compromiso de retirada de portátil",
      logoUrl
    );

    // Título del documento
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);

    doc.text(
      "DOCUMENTO DE COMPROMISO DE RETIRADA DE PORTÁTIL",
      pageWidth / 2,
      y,
      {
        align: "center",
        maxWidth: contentWidth,
      }
    );

    y += 15;

    // Datos del alumno
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const nombreAlumno = `${alumno.givenName || ""} ${alumno.sn || ""}`.trim();

    const curso = alumno.groups?.[0] || "________________";

    const textoDeclaracion =
      `Yo, ${nombreAlumno}, del curso ${curso}, ` +
      "declaro haber recibido en préstamo un portátil " +
      "propiedad del centro educativo para su uso " +
      "exclusivamente académico.";

    const lineasDeclaracion = doc.splitTextToSize(
      textoDeclaracion,
      contentWidth
    );

    doc.text(lineasDeclaracion, marginLeft, y);

    y += lineasDeclaracion.length * 6 + 10;

    // Datos identificativos del portátil
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    doc.text("Marca / Modelo:", marginLeft, y);
    doc.setFont("helvetica", "normal");

    doc.line(marginLeft + 35, y + 1, marginLeft + 110, y + 1);

    y += 12;

    doc.setFont("helvetica", "bold");
    doc.text("Número de serie:", marginLeft, y);
    doc.setFont("helvetica", "normal");

    doc.line(marginLeft + 35, y + 1, marginLeft + 110, y + 1);

    y += 12;

    // Fecha del préstamo
    doc.setFont("helvetica", "bold");
    doc.text("Fecha del préstamo:", marginLeft, y);

    doc.setFont("helvetica", "normal");

    const fechaHoy = new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    doc.text(fechaHoy, marginLeft + 40, y);

    y += 14;

    // Compromisos
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Me comprometo a:", marginLeft, y);

    y += 9;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const compromisos = [
      "1. Utilizar el portátil de manera responsable y cuidadosa.",
      "2. No instalar software no autorizado ni modificar la configuración del equipo sin permiso del centro.",
      "3. Conservar el portátil en buen estado y protegerlo frente a daños, pérdidas o robos.",
    ];

    compromisos.forEach((compromiso) => {
      const lineas = doc.splitTextToSize(compromiso, contentWidth - 5);

      doc.text(lineas, marginLeft + 3, y);

      y += lineas.length * 6 + 4;
    });

    y += 5;

    // Advertencia
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("ADVERTENCIA:", marginLeft, y);

    y += 9;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const textoAdvertencia =
      "Cualquier desperfecto, pérdida, mal uso o daño que " +
      "sufra el portátil será total responsabilidad del " +
      "alumno/a, pudiendo el centro educativo exigir la " +
      "reparación o reposición del equipo según corresponda. " +
      "En caso de daño al portátil, se pedirá una compensación " +
      "de 50 €. En caso de pérdida del cargador, de 10 €.";

    const lineasAdvertencia = doc.splitTextToSize(
      textoAdvertencia,
      contentWidth
    );

    doc.text(lineasAdvertencia, marginLeft, y);

    y += lineasAdvertencia.length * 6 + 15;

    // Firma del alumno
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    doc.text("Firma del alumno/a:", marginLeft, y);

    y += 18;

    doc.setFont("helvetica", "normal");

    doc.line(marginLeft, y, marginLeft + 75, y);

    y += 15;

    // Firma del padre/madre/tutor
    doc.setFont("helvetica", "bold");

    doc.text(
      "Firma del padre/madre/tutor/tutora (menores de edad):",
      marginLeft,
      y,
      {
        maxWidth: contentWidth,
      }
    );

    y += 18;

    doc.setFont("helvetica", "normal");

    doc.line(marginLeft, y, marginLeft + 75, y);

    // Pie de página
    //drawFooter(doc);
  });

  const nombreFinal = nombrePdf.endsWith(".pdf")
    ? nombrePdf
    : `${nombrePdf}.pdf`;

  doc.save(nombreFinal);
}

/**
 * Genera un PDF con el listado de profesores
 *
 * @param {Array} profesores - Array de objetos profesor
 */
export function generateListadoAPs(
  profesores = [],
  logoUrl,
  nombrePdf = "Listado_Profesores"
) {
  if (!profesores || profesores.length === 0) {
    alert("No hay profesores para generar el listado.");
    return;
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageHeight = doc.internal.pageSize.getHeight();

  const marginLeft = 15;
  const marginBottom = 15;
  const lineHeight = 7;

  const col1X = marginLeft; // Apellidos
  const col2X = marginLeft + 50; // Nombre
  const col3X = marginLeft + 100; // DNI
  const col4X = marginLeft + 140; // Asuntos propios

  // --- Primera página con cabecera ---
  let y = drawHeader(doc, "Listado de Profesores", logoUrl);

  // Función para pintar encabezado de tabla
  const drawTableHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    doc.text("Apellidos", col1X, y);
    doc.text("Nombre", col2X, y);
    doc.text("DNI", col3X, y);
    doc.text("Asuntos Propios", col4X, y);

    y += 4;

    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, 195, y);

    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  };

  drawTableHeader();

  // --- Datos ---
  profesores.forEach((profesor) => {
    // Salto de página
    if (y + lineHeight > pageHeight - marginBottom) {
      y = addPageWithHeader(doc, "Listado de Profesores", logoUrl);

      drawTableHeader();
    }

    doc.text(profesor.sn || "", col1X, y);
    doc.text(profesor.givenName || "", col2X, y);
    doc.text(profesor.dni || "", col3X, y);
    doc.text(String(profesor.asuntos_propios || 0), col4X, y);

    y += lineHeight;
  });

  // --- Pie de página ---
  drawFooter(doc);

  doc.save(nombrePdf.endsWith(".pdf") ? nombrePdf : `${nombrePdf}.pdf`);
}
