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
        : addPageWithHeader(doc, `Listado de alumnos por curso: ${curso}`, logoUrl);

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
        y = addPageWithHeader(doc, `Listado de alumnos por curso: ${curso}`, logoUrl);

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