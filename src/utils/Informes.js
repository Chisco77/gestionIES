import { jsPDF } from "jspdf";

import { MAPEO_TIPOS_PERMISOS } from "./mapeoTiposPermisos";


const getDescripcionTipoPermiso = (tipo) =>
  MAPEO_TIPOS_PERMISOS[tipo] ?? "Otros";




/**
 * Genera un PDF de etiquetas genéricas
 *
 * @param {Object} params
 * @param {string} params.prefijo
 * @param {number} params.cantidad
 * @param {number} params.totalEtiquetas
 * @param {number} params.posicionInicial
 * @param {number} params.numeroInicial
 * @param {string} params.nombrePdf
 * @param {function} [params.onProgress]
 */
export async function generateEtiquetasGenericasPdf({
  prefijo,
  cantidad,
  totalEtiquetas,
  posicionInicial,
  numeroInicial,
  nombrePdf,
  onProgress = () => {},
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const layout = {
    40: {
      cols: 4,
      rows: 10,
      width: 52.5,
      height: 29.7,
      marginX: 0,
      marginY: 0,
      spacingX: 0,
      spacingY: 0,
    },
    24: {
      cols: 3,
      rows: 8,
      width: 70,
      height: 33.8,
      marginX: 7,
      marginY: 12.7,
      spacingX: 2.5,
      spacingY: 0,
    },
  }[cantidad];

  const labelsPerPage = layout.cols * layout.rows;

  const etiquetas = Array.from(
    { length: totalEtiquetas },
    (_, i) => `${prefijo}${i + numeroInicial}`
  );

  for (let i = 0; i < etiquetas.length; i++) {
    const globalIndex = i + (posicionInicial - 1);
    if (i > 0 && globalIndex % labelsPerPage === 0) doc.addPage();

    const indexInPage = globalIndex % labelsPerPage;
    const col = indexInPage % layout.cols;
    const row = Math.floor(indexInPage / layout.cols);

    let x = layout.marginX + col * (layout.width + layout.spacingX);

    // Corrección de columnas para 24 etiquetas
    if (cantidad === 24) {
      if (col === 1) x -= 1.5;
      if (col === 2) x -= 3;
    }

    const y = layout.marginY + row * (layout.height + layout.spacingY);

    const centerX = x + layout.width / 2;
    const centerY = y + layout.height / 2;

    const numero = i + numeroInicial;

    // ---- CÁLCULO DE ANCHOS ----
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    const prefijoWidth = doc.getTextWidth(prefijo);

    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    const numeroText = `${numero}`;
    const numeroWidth = doc.getTextWidth(numeroText);

    // ---- CENTRADO HORIZONTAL REAL ----
    const totalWidth = prefijoWidth + numeroWidth;
    let startX = centerX - totalWidth / 2;

    // Ajuste óptico SOLO para 24 etiquetas
    if (cantidad === 24) {
      startX -= 1.2;
    }

    // ---- DIBUJO DEL TEXTO ----
    // Prefijo
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(prefijo, startX, centerY, { baseline: "middle" });

    // Número
    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    doc.text(numeroText, startX + prefijoWidth, centerY, {
      baseline: "middle",
    });

    if (i % 10 === 0) await new Promise((r) => setTimeout(r, 0));

    onProgress(Math.round(((i + 1) / etiquetas.length) * 100));
  }

  doc.save(nombrePdf.endsWith(".pdf") ? nombrePdf : `${nombrePdf}.pdf`);
}

/**
 * Genera un PDF con el listado de profesores
 *
 * @param {Array} profesores - Array de objetos profesor con propiedades `sn` y `givenName`
 */
export function generateListadoAPs(profesores = []) {
  if (!profesores || profesores.length === 0) {
    alert("No hay profesores para generar el listado.");
    return;
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const marginLeft = 15;
  const marginTop = 20;
  let y = marginTop;

  // --- Cabecera ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Listado de Profesores", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(12);
  doc.text(`Total profesores: ${profesores.length}`, marginLeft, y);
  y += 10;

  // --- Encabezado de columnas ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const col1X = marginLeft; // Apellidos
  const col2X = marginLeft + 50; // Nombre
  const col3X = marginLeft + 100; // DNI
  const col4X = marginLeft + 140; // Asuntos propios

  doc.text("Apellidos", col1X, y);
  doc.text("Nombre", col2X, y);
  doc.text("DNI", col3X, y);
  doc.text("Asuntos Propios", col4X, y);
  y += 4;
  doc.setLineWidth(0.5);
  doc.line(marginLeft, y, pageWidth - marginLeft, y);
  y += 6;

  // --- Datos ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lineHeight = 7;

  profesores.forEach((profesor) => {
    if (y > 285) {
      // salto de página
      doc.addPage();
      y = marginTop;
    }

    doc.text(profesor.sn || "", col1X, y);
    doc.text(profesor.givenName || "", col2X, y);
    doc.text(profesor.dni || "", col3X, y);
    doc.text(String(profesor.asuntos_propios || 0), col4X, y);

    y += lineHeight;
  });

  doc.save("Listado_Profesores.pdf");
}

export const generarListadoPrestamosLibrosAlumnosPdf = ({
  alumnos = [],
  nombrePdf = "listado_prestamos_libros_alumnos",
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  console.log ("Alumnos: ", alumnos);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  /* --------------------------------------------------
   * Layout
   * -------------------------------------------------- */
  const marginLeft = 15;
  const marginRight = 15;
  const marginTop = 25;
  const marginBottom = 15;

  const usableWidth = pageWidth - marginLeft - marginRight;

  const rowHeight = 8;
  const headerHeight = 34;
  const colWidthAlumno = 60;

  /* --------------------------------------------------
   * Utilidad: partir texto en bloques
   * -------------------------------------------------- */
  const partirTexto = (texto, maxChars) => {
    const partes = [];
    for (let i = 0; i < texto.length; i += maxChars) {
      partes.push(texto.substring(i, i + maxChars));
    }
    return partes;
  };

  /* --------------------------------------------------
   * Agrupar alumnos por curso
   * -------------------------------------------------- */
  const alumnosPorCurso = alumnos.reduce((acc, alumno) => {
    const curso = alumno.curso || "Sin curso";
    if (!acc[curso]) acc[curso] = [];
    acc[curso].push(alumno);
    return acc;
  }, {});

  /* --------------------------------------------------
   * Título general
   * -------------------------------------------------- */
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Listado resumen de préstamos de libros por alumno",
    pageWidth / 2,
    12,
    { align: "center" }
  );

  let y = marginTop;

  /* ==================================================
   * RECORRER CURSOS
   * ================================================== */
  Object.entries(alumnosPorCurso).forEach(
    ([curso, alumnosCurso], indexCurso) => {
      if (indexCurso > 0) {
        doc.addPage();
        y = marginTop;
      }

      /* ----------------------------------------------
       * idcurso del grupo
       * ---------------------------------------------- */
      const idCursoGrupo = alumnosCurso
        .flatMap((a) => a.prestamos ?? [])
        .find((p) => p.idcurso)?.idcurso;

      if (!idCursoGrupo) return;

      /* ----------------------------------------------
       * Libros del curso
       * ---------------------------------------------- */
      const librosCurso = [
        ...new Map(
          alumnosCurso
            .flatMap((a) => a.prestamos ?? [])
            .filter((p) => p.idcurso === idCursoGrupo)
            .map((p) => [p.idlibro, { idlibro: p.idlibro, nombre: p.libro }])
        ).values(),
      ];

      if (!librosCurso.length) return;

      const colWidthLibro = (usableWidth - colWidthAlumno) / librosCurso.length;

      /* ----------------------------------------------
       * Cabecera
       * ---------------------------------------------- */
      /* ----------------------------------------------
       * Cabecera (Corregida)
       * ---------------------------------------------- */
      const dibujarCabecera = (y) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8); // Un pelín más pequeño ayuda al espacio

        const librosPartes = librosCurso.map(
          (libro) =>
            // Usamos splitTextToSize para que jsPDF calcule los cortes por nosotros
            doc.splitTextToSize(libro.nombre, 25) // 25mm es el "alto" máximo del texto vertical
        );

        const maxLineas = Math.max(...librosPartes.map((p) => p.length));
        const lineSpacing = 3; // Espacio entre líneas del mismo título

        // Altura dinámica: margen + (líneas * espacio)
        const dynamicHeaderHeight = Math.max(
          headerHeight,
          10 + maxLineas * lineSpacing
        );

        // Dibujar fondo
        doc.setFillColor(230, 230, 230);
        doc.rect(marginLeft, y, usableWidth, dynamicHeaderHeight, "F");

        // Texto "Alumno"
        doc.text("Alumno", marginLeft + 2, y + dynamicHeaderHeight / 2, {
          baseline: "middle",
        });

        librosCurso.forEach((libro, i) => {
          const partes = librosPartes[i];
          // Centro de la columna del libro
          const centerX =
            marginLeft + colWidthAlumno + i * colWidthLibro + colWidthLibro / 2;

          // Calculamos el inicio en X para que el bloque de líneas esté centrado en su columna
          // Si hay 2 líneas, la primera se mueve a la izquierda y la segunda a la derecha
          const totalWidthBlock = (partes.length - 1) * lineSpacing;
          const startX = centerX - totalWidthBlock / 2;

          partes.forEach((parte, idx) => {
            const currentX = startX + idx * lineSpacing;
            // El texto empieza cerca del borde inferior de la cabecera
            const textY = y + dynamicHeaderHeight - 5;

            doc.text(parte, currentX, textY, {
              angle: 90,
              align: "left",
            });
          });
        });

        // Línea de cierre
        doc.line(
          marginLeft,
          y + dynamicHeaderHeight,
          marginLeft + usableWidth,
          y + dynamicHeaderHeight
        );
        return y + dynamicHeaderHeight;
      };

      /* ----------------------------------------------
       * Título curso
       * ---------------------------------------------- */
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Curso: ${curso}`, marginLeft, y);
      y += 6;

      y = dibujarCabecera(y);

      /* ----------------------------------------------
       * Alumnos
       * ---------------------------------------------- */
      alumnosCurso.forEach((alumno) => {
        if (y + rowHeight > pageHeight - marginBottom) {
          doc.addPage();
          y = marginTop;
          y = dibujarCabecera(y);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(alumno.nombreUsuario ?? "", marginLeft + 2, y + 5);

        const prestamosMap = {};
        (alumno.prestamos ?? []).forEach((p) => {
          if (p.idcurso === idCursoGrupo) {
            prestamosMap[p.idlibro] = {
              entregado: p.entregado,
              devuelto: p.devuelto,
            };
          }
        });

        doc.setFont("helvetica", "normal");

        librosCurso.forEach((libro, i) => {
          const x =
            marginLeft + colWidthAlumno + i * colWidthLibro + colWidthLibro / 2;

          const estado = prestamosMap[libro.idlibro];
          let texto = "";

          if (estado) {
            if (estado.entregado) texto += "E";
            if (estado.devuelto) texto += "D";
          }

          if (texto) {
            doc.text(texto, x - 2, y + 5);
          }
        });

        doc.setLineWidth(0.2);
        doc.line(
          marginLeft,
          y + rowHeight,
          marginLeft + usableWidth,
          y + rowHeight
        );

        y += rowHeight;
      });
    }
  );

  doc.save(nombrePdf.endsWith(".pdf") ? nombrePdf : `${nombrePdf}.pdf`);
};
