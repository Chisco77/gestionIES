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
  nombrePdf = "listado_alumnos_curso"
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
        ? drawHeader(doc, `Listado de alumnos por curso: ${curso}`)
        : addPageWithHeader(doc, `Listado de alumnos por curso: ${curso}`);

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
        y = addPageWithHeader(doc, `Listado de alumnos por curso: ${curso}`);

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
