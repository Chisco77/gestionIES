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

export const generarListadoPrestamosLibrosAlumnosPdf = ({
  alumnos = [],
  nombrePdf = "listado_prestamos_libros_alumnos",
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  console.log("prestamos alumnos: ", alumnos);

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

      const idCursoGrupo = alumnosCurso
        .flatMap((a) => a.prestamos ?? [])
        .find((p) => p.idcurso)?.idcurso;

      if (!idCursoGrupo) return;

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

      // --- INICIALIZAR CONTADORES PARA EL PIE DEL CURSO ---
      const totalesLibros = {};
      librosCurso.forEach((libro) => {
        totalesLibros[libro.idlibro] = {
          existente: 0,
          entregados: 0,
          devueltos: 0,
          pendientesRecoger: 0,
        };
      });

      /* ----------------------------------------------
       * Cabecera
       * ---------------------------------------------- */
      const dibujarCabecera = (y) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);

        const librosPartes = librosCurso.map((libro) =>
          doc.splitTextToSize(libro.nombre, 25)
        );

        const maxLineas = Math.max(...librosPartes.map((p) => p.length));
        const lineSpacing = 3;

        const dynamicHeaderHeight = Math.max(
          headerHeight,
          10 + maxLineas * lineSpacing
        );

        doc.setFillColor(230, 230, 230);
        doc.rect(marginLeft, y, usableWidth, dynamicHeaderHeight, "F");

        doc.text("Alumno", marginLeft + 2, y + dynamicHeaderHeight / 2, {
          baseline: "middle",
        });

        librosCurso.forEach((libro, i) => {
          const partes = librosPartes[i];
          const centerX =
            marginLeft + colWidthAlumno + i * colWidthLibro + colWidthLibro / 2;

          const totalWidthBlock = (partes.length - 1) * lineSpacing;
          const startX = centerX - totalWidthBlock / 2;

          partes.forEach((parte, idx) => {
            const currentX = startX + idx * lineSpacing;
            const textY = y + dynamicHeaderHeight - 5;

            doc.text(parte, currentX, textY, {
              angle: 90,
              align: "left",
            });
          });
        });

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
            totalesLibros[libro.idlibro].existente += 1;

            if (estado.entregado) {
              texto += "E";
              totalesLibros[libro.idlibro].entregados += 1;
            }

            if (estado.devuelto) {
              texto += "D";
              totalesLibros[libro.idlibro].devueltos += 1;
            }

            // --- CORRECCIÓN DE LA LÓGICA DE PENDIENTES ---
            // Pendiente de recoger por el centro = entregado (true) y NO devuelto (false)
            if (estado.entregado && !estado.devuelto) {
              totalesLibros[libro.idlibro].pendientesRecoger += 1;
            }
          }

          if (texto) {
            doc.text(texto, x, y + 5, { align: "center" });
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

      /* ----------------------------------------------
       * PIE DEL INFORME (Resumen por libro en el curso)
       * ---------------------------------------------- */
      const filasResumen = [
        { clave: "existente", etiqueta: "Total Asignados" },
        { clave: "entregados", etiqueta: "Total Entregados (E)" },
        { clave: "devueltos", etiqueta: "Total Devueltos (D)" },
        { clave: "pendientesRecoger", etiqueta: "Pendientes Recogida" },
      ];

      const alturaResumenTotal = 6 + filasResumen.length * rowHeight;

      if (y + alturaResumenTotal > pageHeight - marginBottom) {
        doc.addPage();
        y = marginTop;
      }

      y += 9;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Resumen de Estadísticas del Curso:", marginLeft, y);
      y += 4;

      filasResumen.forEach((fila) => {
        doc.setFillColor(245, 245, 245);
        doc.rect(marginLeft, y, usableWidth, rowHeight, "F");

        doc.setFont("helvetica", "bold");
        doc.text(fila.etiqueta, marginLeft + 2, y + 5);

        doc.setFont("helvetica", "normal");
        librosCurso.forEach((libro, i) => {
          const x =
            marginLeft + colWidthAlumno + i * colWidthLibro + colWidthLibro / 2;
          const valor = totalesLibros[libro.idlibro][fila.clave];

          doc.text(valor.toString(), x, y + 5, { align: "center" });
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


export const generarListadoResumenLibrosAlumnosPdf = ({
  alumnos = [],
  cursos = [],
  nombrePdf = "listado_resumen_libros_alumnos",
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  console.log("prestamos alumnos: ", alumnos);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  /* --------------------------------------------------
   * Layout y Configuración de Márgenes
   * -------------------------------------------------- */
  const marginLeft = 15;
  const marginRight = 15;
  const marginTop = 25;
  const marginBottom = 15;
  const usableWidth = pageWidth - marginLeft - marginRight; // 180mm en A4

  const rowHeight = 8;
  const headerHeight = 10;

  /* --------------------------------------------------
   * Definición y Ancho de Columnas
   * -------------------------------------------------- */
  const colWidthLibro = 110;
  const colWidthDato = (usableWidth - colWidthLibro) / 4;

  /* --------------------------------------------------
   * Diccionario auxiliar para buscar nombres de curso rápidos
   * -------------------------------------------------- */
  const mapaCursos = new Map(cursos.map((c) => [String(c.id), c.curso]));

  /* --------------------------------------------------
   * 1. Procesar y Acumular Datos Globales por Libro
   * -------------------------------------------------- */
  const resumenLibros = {};

  alumnos.forEach((alumno) => {
    (alumno.prestamos ?? []).forEach((p) => {
      const cursoLibro =
        mapaCursos.get(String(p.idcurso)) || `Curso ID: ${p.idcurso}`;

      if (!resumenLibros[p.idlibro]) {
        resumenLibros[p.idlibro] = {
          nombre: p.libro || "Sin nombre",
          idcurso: p.idcurso,
          nombreCurso: cursoLibro,
          existente: 0,
          entregados: 0,
          devueltos: 0,
          pendientesRecoger: 0,
        };
      }

      resumenLibros[p.idlibro].existente += 1;

      if (p.entregado) {
        resumenLibros[p.idlibro].entregados += 1;
      }

      if (p.devuelto) {
        resumenLibros[p.idlibro].devueltos += 1;
      }

      // --- CORRECCIÓN DE LA LÓGICA DE PENDIENTES ---
      // Pendiente de recoger por el centro = entregado (true) y NO devuelto (false)
      if (p.entregado && !p.devuelto) {
        resumenLibros[p.idlibro].pendientesRecoger += 1;
      }
    });
  });

  const listaResumen = Object.values(resumenLibros);

  // Ordenar por el nombre del curso académico y luego por nombre de libro
  listaResumen.sort((a, b) => {
    const compararCurso = a.nombreCurso.localeCompare(
      b.nombreCurso,
      undefined,
      { numeric: true, sensitivity: "base" }
    );
    if (compararCurso === 0) {
      return a.nombre.localeCompare(b.nombre, undefined, {
        sensitivity: "base",
      });
    }
    return compararCurso;
  });

  /* --------------------------------------------------
   * Título General del Informe
   * -------------------------------------------------- */
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Listado resumen global de estado por libro", pageWidth / 2, 12, {
    align: "center",
  });

  let y = marginTop;

  const dibujarCabeceraTabla = (currentY) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    doc.setFillColor(230, 230, 230);
    doc.rect(marginLeft, currentY, usableWidth, headerHeight, "F");

    doc.text("Libro / Manual (Curso)", marginLeft + 2, currentY + 6);

    let xOffset = marginLeft + colWidthLibro;

    doc.text("Asignados", xOffset + colWidthDato / 2, currentY + 6, {
      align: "center",
    });
    xOffset += colWidthDato;
    doc.text("Entregados", xOffset + colWidthDato / 2, currentY + 6, {
      align: "center",
    });
    xOffset += colWidthDato;
    doc.text("Devueltos", xOffset + colWidthDato / 2, currentY + 6, {
      align: "center",
    });
    xOffset += colWidthDato;
    doc.text("Pendientes", xOffset + colWidthDato / 2, currentY + 6, {
      align: "center",
    });

    doc.setLineWidth(0.3);
    doc.line(
      marginLeft,
      currentY + headerHeight,
      marginLeft + usableWidth,
      currentY + headerHeight
    );

    return currentY + headerHeight;
  };

  y = dibujarCabeceraTabla(y);

  /* --------------------------------------------------
   * 2. Renderizar las Filas de Libros
   * -------------------------------------------------- */
  doc.setFontSize(9);

  listaResumen.forEach((libro, index) => {
    if (y + rowHeight > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
      y = dibujarCabeceraTabla(y);
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(marginLeft, y, usableWidth, rowHeight, "F");
    }

    const nombreCompleto = `${libro.nombre} (${libro.nombreCurso})`;

    doc.setFont("helvetica", "bold");
    const nombreTruncado = doc.splitTextToSize(
      nombreCompleto,
      colWidthLibro - 4
    )[0];
    doc.text(nombreTruncado, marginLeft + 2, y + 5);

    let xOffset = marginLeft + colWidthLibro;

    doc.setFont("helvetica", "normal");
    doc.text(libro.existente.toString(), xOffset + colWidthDato / 2, y + 5, {
      align: "center",
    });
    xOffset += colWidthDato;

    doc.text(libro.entregados.toString(), xOffset + colWidthDato / 2, y + 5, {
      align: "center",
    });
    xOffset += colWidthDato;

    doc.text(libro.devueltos.toString(), xOffset + colWidthDato / 2, y + 5, {
      align: "center",
    });
    xOffset += colWidthDato;

    doc.text(
      libro.pendientesRecoger.toString(),
      xOffset + colWidthDato / 2,
      y + 5,
      { align: "center" }
    );

    doc.setLineWidth(0.1);
    doc.line(
      marginLeft,
      y + rowHeight,
      marginLeft + usableWidth,
      y + rowHeight
    );

    y += rowHeight;
  });

  /* --------------------------------------------------
   * 3. Fila de Totales Absolutos
   * -------------------------------------------------- */
  const totalesGlobales = listaResumen.reduce(
    (acc, item) => {
      acc.existente += item.existente;
      acc.entregados += item.entregados;
      acc.devueltos += item.devueltos;
      acc.pendientesRecoger += item.pendientesRecoger;
      return acc;
    },
    { existente: 0, entregados: 0, devueltos: 0, pendientesRecoger: 0 }
  );

  if (y + rowHeight > pageHeight - marginBottom) {
    doc.addPage();
    y = marginTop;
    y = dibujarCabeceraTabla(y);
  }

  doc.setFillColor(220, 220, 220);
  doc.rect(marginLeft, y, usableWidth, rowHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.text("TOTALES GENERALES", marginLeft + 2, y + 5);

  let xOffsetTotales = marginLeft + colWidthLibro;
  doc.text(
    totalesGlobales.existente.toString(),
    xOffsetTotales + colWidthDato / 2,
    y + 5,
    { align: "center" }
  );
  xOffsetTotales += colWidthDato;
  doc.text(
    totalesGlobales.entregados.toString(),
    xOffsetTotales + colWidthDato / 2,
    y + 5,
    { align: "center" }
  );
  xOffsetTotales += colWidthDato;
  doc.text(
    totalesGlobales.devueltos.toString(),
    xOffsetTotales + colWidthDato / 2,
    y + 5,
    { align: "center" }
  );
  xOffsetTotales += colWidthDato;
  doc.text(
    totalesGlobales.pendientesRecoger.toString(),
    xOffsetTotales + colWidthDato / 2,
    y + 5,
    { align: "center" }
  );

  doc.setLineWidth(0.4);
  doc.line(marginLeft, y + rowHeight, marginLeft + usableWidth, y + rowHeight);

  doc.save(nombrePdf.endsWith(".pdf") ? nombrePdf : `${nombrePdf}.pdf`);
};
