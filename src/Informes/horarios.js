// src/modules/horarios.js
import jsPDF from "jspdf";
import { getCursoActual } from "@/utils/fechasHoras";
import { drawHeader } from "./utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function generarPdfHorariosProfesores(
  horarios,
  periodos,
  nombrePdf = "horarios_profesores"
) {
  if (!horarios || !horarios.length) {
    alert("No hay horarios para generar el informe.");
    return;
  }

  if (!periodos || !periodos.length) {
    alert("No se han obtenido los periodos horarios.");
    return;
  }

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const colWidth = (pageWidth - margin * 2) / 6;
  const rowHeight = 15;

  const diasNombres = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  const configuracionColores = {
    lectiva: [173, 216, 230],
    reunion: [198, 239, 206],
    guardia: [220, 220, 220],
  };

  const truncarTexto = (texto, maxWidth) => {
    if (!texto) return "";
    let width = doc.getTextWidth(texto);
    if (width <= maxWidth) return texto;
    let tempTexto = texto;
    while (
      doc.getTextWidth(tempTexto + "...") > maxWidth &&
      tempTexto.length > 0
    ) {
      tempTexto = tempTexto.substring(0, tempTexto.length - 1);
    }
    return tempTexto + "...";
  };

  const horariosPorProfesor = horarios.reduce((acc, h) => {
    if (!acc[h.uid]) acc[h.uid] = [];
    acc[h.uid].push(h);
    return acc;
  }, {});

  const uidsOrdenados = [];
  horarios.forEach((h) => {
    if (!uidsOrdenados.includes(h.uid)) uidsOrdenados.push(h.uid);
  });

  uidsOrdenados.forEach((uid, indexProfesor) => {
    if (indexProfesor > 0) doc.addPage();

    const datosProfesor = horariosPorProfesor[uid][0];
    let y = 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Horario de: ${datosProfesor.nombreProfesor || uid}`, margin, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `Curso Académico: ${datosProfesor.curso_academico || "---"}`,
      margin,
      y
    );

    y += 10;

    // Cabecera de tabla
    doc.setFillColor(230, 230, 230);
    doc.setDrawColor(150, 150, 150);
    doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "F");
    doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Periodo", margin + 2, y + rowHeight / 2 + 2);

    diasNombres.forEach((dia, i) => {
      doc.text(dia, margin + colWidth * (i + 1) + 2, y + rowHeight / 2 + 2);
    });

    y += rowHeight;

    periodos.forEach((p) => {
      // Columna Periodo
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, colWidth, rowHeight, "FD");
      doc.text(p.nombre, margin + 2, y + 6);
      doc.setFont("helvetica", "normal");
      doc.text(`${p.inicio} - ${p.fin}`, margin + 2, y + 11);

      for (let d = 1; d <= 5; d++) {
        const posX = margin + colWidth * d;
        doc.rect(posX, y, colWidth, rowHeight, "S");

        const h = horariosPorProfesor[uid].find(
          (hh) =>
            Number(hh.dia_semana) === d && String(hh.idperiodo) === String(p.id)
        );

        if (h) {
          const color = configuracionColores[h.tipo] || [255, 255, 255];
          doc.setFillColor(...color);
          doc.rect(posX + 0.5, y + 0.5, colWidth - 1, rowHeight - 1, "F");

          const textMaxWidth = colWidth - 4;

          // --- LÓGICA DE CONTENIDO SEGÚN TIPO ---
          if (h.tipo === "guardia") {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            // Centrar el texto "GUARDIA" horizontalmente en la celda
            const txt = "GUARDIA";
            const txtWidth = doc.getTextWidth(txt);
            doc.text(
              txt,
              posX + (colWidth - txtWidth) / 2,
              y + rowHeight / 2 + 1
            );
          } else {
            // Comportamiento normal para Lectivas, Reuniones, etc.
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            const materiaTexto = h.materia_nombre || h.materia || "";
            doc.text(truncarTexto(materiaTexto, textMaxWidth), posX + 2, y + 4);

            doc.setFont("helvetica", "normal");
            doc.text(h.grupo || "", posX + 2, y + 8);

            if (h.estancia) {
              doc.setFont("helvetica", "italic");
              doc.setFontSize(6.5);
              doc.text(`(${h.estancia})`, posX + 2, y + 12);
            }
          }
        }
      }
      y += rowHeight;
    });

    // Leyenda
    y += 8;
    let xLeyenda = margin;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("LEYENDA:", xLeyenda, y + 3);
    xLeyenda += 18;

    Object.entries(configuracionColores).forEach(([tipo, color]) => {
      doc.setFillColor(...color);
      doc.rect(xLeyenda, y, 4, 4, "F");
      doc.rect(xLeyenda, y, 4, 4, "S");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(tipo.toUpperCase(), xLeyenda + 6, y + 3);
      xLeyenda += 40;
    });
  });

  doc.save(`${nombrePdf}.pdf`);
}

function calcularLineasCelda(profes, doc, colWidth) {
  if (!profes || profes.length === 0) return 1;

  const maxWidth = colWidth - 2;
  let lineas = 0;

  profes.forEach((prof) => {
    let texto = "";

    if (prof.estancia) {
      texto += `${prof.estancia.descripcion} - `;
    }

    texto += `${prof.sn || ""}, ${prof.givenName || ""}`;

    // simulamos corte
    let temp = texto;
    let lineasProf = 1;

    while (doc.getTextWidth(temp) > maxWidth) {
      temp = temp.slice(0, -1);
    }

    lineas += lineasProf;
  });

  return lineas;
}

export function generarPdfCuadrante(guardias, periodos) {
  if (!guardias || !periodos) {
    alert("Faltan datos para generar el PDF");
    return;
  }

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "landscape",
  });

  const rowHeight = 18;

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const colWidth = (pageWidth - margin * 2) / 6;

  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  let y = 15;

  // 🧾 CABECERA
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Cuadrante de Guardias", margin, y);

  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Curso académico: ${getCursoActual().label}`, margin, y);

  y += 10;

  // 🧱 CABECERA TABLA
  doc.setFillColor(230, 230, 230);
  doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "F");
  doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.text("Periodo", margin + 2, y + rowHeight / 2 + 2);

  dias.forEach((d, i) => {
    doc.text(d, margin + colWidth * (i + 1) + 2, y + rowHeight / 2 + 2);
  });

  y += rowHeight;

  // 🧱 CUERPO
  periodos.forEach((p) => {
    let maxLineas = 1;

    for (let d = 0; d < 5; d++) {
      const clave = `${p.id}-${d}`;
      const profes = [...(guardias[clave] || [])].sort((a, b) => {
        const aTieneEstancia = !!a.estancia;
        const bTieneEstancia = !!b.estancia;

        // 1. Con estancia primero
        if (aTieneEstancia && !bTieneEstancia) return -1;
        if (!aTieneEstancia && bTieneEstancia) return 1;

        // 2. Si ambos tienen estancia → ordenar por estancia
        if (aTieneEstancia && bTieneEstancia) {
          const estA = a.estancia.descripcion.toLowerCase();
          const estB = b.estancia.descripcion.toLowerCase();

          if (estA < estB) return -1;
          if (estA > estB) return 1;
        }

        // 3. Orden por apellidos
        const snA = (a.sn || "").toLowerCase();
        const snB = (b.sn || "").toLowerCase();

        if (snA < snB) return -1;
        if (snA > snB) return 1;

        // 4. Desempate por nombre
        const gnA = (a.givenName || "").toLowerCase();
        const gnB = (b.givenName || "").toLowerCase();

        if (gnA < gnB) return -1;
        if (gnA > gnB) return 1;

        return 0;
      });
      const lineas = calcularLineasCelda(profes, doc, colWidth);
      if (lineas > maxLineas) maxLineas = lineas;
    }

    const rowHeight = Math.max(12, maxLineas * 4 + 4);
    // Columna periodo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setFillColor(245, 245, 245);

    doc.rect(margin, y, colWidth, rowHeight, "FD");
    doc.text(p.nombre, margin + 2, y + 6);

    doc.setFont("helvetica", "normal");
    doc.text(`${p.inicio} - ${p.fin}`, margin + 2, y + 11);

    // Días
    for (let d = 0; d < 5; d++) {
      const clave = `${p.id}-${d}`;
      const profes = [...(guardias[clave] || [])].sort((a, b) => {
        const aTieneEstancia = !!a.estancia;
        const bTieneEstancia = !!b.estancia;

        // 1. Con estancia primero
        if (aTieneEstancia && !bTieneEstancia) return -1;
        if (!aTieneEstancia && bTieneEstancia) return 1;

        // 2. Si ambos tienen estancia → ordenar por estancia
        if (aTieneEstancia && bTieneEstancia) {
          const estA = a.estancia.descripcion.toLowerCase();
          const estB = b.estancia.descripcion.toLowerCase();

          if (estA < estB) return -1;
          if (estA > estB) return 1;
        }

        // 3. Orden por apellidos
        const snA = (a.sn || "").toLowerCase();
        const snB = (b.sn || "").toLowerCase();

        if (snA < snB) return -1;
        if (snA > snB) return 1;

        // 4. Desempate por nombre
        const gnA = (a.givenName || "").toLowerCase();
        const gnB = (b.givenName || "").toLowerCase();

        if (gnA < gnB) return -1;
        if (gnA > gnB) return 1;

        return 0;
      });
      const posX = margin + colWidth * (d + 1);

      doc.rect(posX, y, colWidth, rowHeight, "S");

      if (profes.length > 0) {
        let yTexto = y + 4;

        doc.setFontSize(7);

        profes.forEach((prof) => {
          const nombre = `${prof.sn || ""}, ${prof.givenName || ""}`;
          const maxWidth = colWidth - 2;

          let xTexto = posX + 1;

          // 🔥 1. ESTANCIA EN NEGRITA
          if (prof.estancia) {
            doc.setFont("helvetica", "bold");

            const MAX_ESTANCIA = 16;

            let estanciaTexto = prof.estancia.descripcion || "";

            if (estanciaTexto.length > MAX_ESTANCIA) {
              estanciaTexto = estanciaTexto.slice(0, MAX_ESTANCIA - 1) + "…";
            }

            // solo añadimos separador si hay estancia
            if (estanciaTexto.length > 0) {
              estanciaTexto += " - ";
            }

            doc.text(estanciaTexto, xTexto, yTexto);

            xTexto += doc.getTextWidth(estanciaTexto);
          }

          // 🔥 2. NOMBRE EN NORMAL
          doc.setFont("helvetica", "normal");

          let nombreTexto = nombre;

          // recorte final si aún se pasa
          while (
            doc.getTextWidth(nombreTexto) + (xTexto - (posX + 1)) > maxWidth &&
            nombreTexto.length > 0
          ) {
            nombreTexto = nombreTexto.slice(0, -1);
          }

          doc.text(nombreTexto, xTexto, yTexto);
          yTexto += 4;

          // Evitar overflow vertical
          if (yTexto > y + rowHeight - 2) return;
        });
      }
    }

    y += rowHeight;
  });

  doc.save("cuadrante_guardias.pdf");
}

/**
 * Genera el PDF del "Parte de Faltas Diario"
 * @param {Array} datosProcesados - Lista de objetos { periodo, filas: [{profesor, asignatura, curso, observaciones}] }
 * @param {Date} fecha - La fecha del parte
 */
export async function generarParteDiarioAusencias(datosProcesados, fecha) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const tableWidth = pageWidth - margin * 2;

  // Configuración de columnas
  const colHorasW = 16;
  const colProfW = 45;
  const colAsigW = 35;
  const colCursoW = 18;
  const colObsW = 48;
  const colFirmaW = 18;

  const opcionesFecha = { day: "numeric", month: "long", year: "numeric" };
  const tituloCompleto = `Parte diario de Ausencias del ${fecha.toLocaleDateString("es-ES", opcionesFecha)}`;
  // --- CABECERA ---
  let y = drawHeader(doc, tituloCompleto);

  // Subimos el contenido para eliminar el aire innecesario
  y -= 8;

  // --- POSIBLES AUSENCIAS (Compacto) ---
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("POSIBLES AUSENCIAS:", margin, y);
  y += 1.5;
  doc.setDrawColor(180);
  for (let i = 0; i < 3; i++) {
    y += 5.5;
    doc.line(margin, y, margin + tableWidth, y);
  }
  y += 7;

  // --- CABECERA TABLA ---
  doc.setDrawColor(0);
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, tableWidth, 9, "F");
  doc.rect(margin, y, tableWidth, 9, "S");
  doc.setFontSize(8);
  doc.text("HORAS", margin + 2, y + 6);
  doc.text("PROFESORES\nAUSENTES", margin + colHorasW + 2, y + 4.5);
  doc.text("ASIGNATURA", margin + colHorasW + colProfW + 2, y + 6);
  doc.text("CURSO", margin + colHorasW + colProfW + colAsigW + 2, y + 6);
  doc.text(
    "OBSERVACIONES",
    margin + colHorasW + colProfW + colAsigW + colCursoW + 5,
    y + 6
  );
  doc.text("FIRMA", margin + tableWidth - colFirmaW + 5, y + 6);
  y += 9;

  // --- CUERPO DINÁMICO ---
  datosProcesados.forEach((p) => {
    // Calculamos altura con control de desbordamiento de texto
    const subfilasConAltura = p.filas.map((f) => {
      // Determinamos qué texto mostrar en la columna Asignatura
      const textoAsignatura =
        f.tipo === "guardia" ? "GUARDIA" : f.asignatura || "";

      // Si es guardia y hay estancia, la añadimos a las observaciones de esa fila
      let textoObs = "";
      const estanciaValida =
        f.estancia &&
        f.estancia.toLowerCase().trim() !== "estancia desconocida";

      if (f.tipo === "guardia" && estanciaValida) {
        textoObs = `${f.estancia}`.trim();
      }

      const lineasAsig = doc.splitTextToSize(
        textoAsignatura,
        colAsigW - 4
      ).length;
      const lineasProf = doc.splitTextToSize(
        f.profesor || "",
        colProfW - 4
      ).length;
      const lineasCurso = doc.splitTextToSize(
        String(f.curso || ""),
        colCursoW - 2
      ).length;
      const lineasObs = doc.splitTextToSize(textoObs, colObsW - 4).length; // Calculamos líneas de obs

      const maxLineas = Math.max(
        lineasAsig,
        lineasProf,
        lineasCurso,
        lineasObs,
        1
      );

      return {
        ...f,
        textoAsignatura,
        textoObs, // Guardamos el texto procesado
        altura: Math.max(7, maxLineas * 4 + 1),
      };
    });

    const alturaTotalBloque =
      subfilasConAltura.length > 0
        ? subfilasConAltura.reduce((acc, curr) => acc + curr.altura, 0)
        : 7;

    // Salto de página preventivo (ajustado a 280mm para máxima seguridad)
    if (y + alturaTotalBloque > 280) {
      doc.addPage();
      y = drawHeader(doc, tituloCompleto);
      y += 10;
    }

    // 1. Celdas Estáticas del bloque (Hora, Observaciones, Firma)
    doc.setFont("helvetica", "bold");
    doc.rect(margin, y, colHorasW, alturaTotalBloque, "S");
    doc.text(
      p.horaLabel,
      margin + colHorasW / 2,
      y + alturaTotalBloque / 2 + 1,
      { align: "center" }
    );

    const xObs = margin + colHorasW + colProfW + colAsigW + colCursoW;
    doc.rect(xObs, y, colObsW, alturaTotalBloque, "S");
    doc.rect(
      margin + tableWidth - colFirmaW,
      y,
      colFirmaW,
      alturaTotalBloque,
      "S"
    );

    // 2. Celdas de Contenido
    let currentSubY = y;
    if (subfilasConAltura.length > 0) {
      subfilasConAltura.forEach((f) => {
        const sX = margin + colHorasW;
        doc.rect(sX, currentSubY, colProfW, f.altura, "S");
        doc.rect(sX + colProfW, currentSubY, colAsigW, f.altura, "S");
        doc.rect(
          sX + colProfW + colAsigW,
          currentSubY,
          colCursoW,
          f.altura,
          "S"
        );

        // IMPORTANTE: Dibujamos el rectángulo de observaciones por CADA fila interna
        // para que el texto de la estancia quede alineado con su profesor
        const xObs = sX + colProfW + colAsigW + colCursoW;
        doc.rect(xObs, currentSubY, colObsW, f.altura, "S");
        doc.rect(
          margin + tableWidth - colFirmaW,
          currentSubY,
          colFirmaW,
          f.altura,
          "S"
        );

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");

        // Dibujamos el texto limitando líneas para evitar que pisen el borde inferior
        const limitLines = Math.floor(f.altura / 4);

        const profLines = doc
          .splitTextToSize(f.profesor, colProfW - 4)
          .slice(0, limitLines);
        doc.text(profLines, sX + 2, currentSubY + 4);

        const asigLines = doc
          .splitTextToSize(f.textoAsignatura, colAsigW - 4)
          .slice(0, limitLines);
        doc.text(asigLines, sX + colProfW + 2, currentSubY + 4);

        // Curso
        const cursoLines = doc
          .splitTextToSize(String(f.curso || ""), colCursoW - 2)
          .slice(0, limitLines);
        doc.text(cursoLines, sX + colProfW + colAsigW + 2, currentSubY + 4);

        // Imprimir OBSERVACIONES (con la estancia incluida)
        const obsLines = doc
          .splitTextToSize(f.textoObs, colObsW - 4)
          .slice(0, limitLines);
        doc.text(obsLines, xObs + 2, currentSubY + 4);

        currentSubY += f.altura;
      });
    } else {
      const sX = margin + colHorasW;
      const alturaVacia = 7;
      doc.rect(sX, currentSubY, colProfW, alturaVacia, "S");
      doc.rect(sX + colProfW, currentSubY, colAsigW, alturaVacia, "S");
      doc.rect(
        sX + colProfW + colAsigW,
        currentSubY,
        colCursoW,
        alturaVacia,
        "S"
      );
      currentSubY += alturaVacia;
    }
    y = currentSubY;
  });

  doc.save(`Parte_Ausencias_${format(fecha, "yyyy-MM-dd")}.pdf`);
}

/**
 * Genera el PDF del "Parte Mensual de Ausencias" (Formato Oficial Junta de Extremadura)
 * @param {Array} datos - Lista de ausencias enriquecidas del mes
 * @param {Object} meta - Datos del encabezado { centro, cursoAcademico, mesNombre, fechaRemision }
 */

export async function generarParteMensualAusencias(datos, meta) {
  // 1. ORDENACIÓN: Apellidos (Nombre) y luego Fecha Inicio
  const datosOrdenados = [...datos].sort((a, b) => {
    // Comparar por nombre/apellidos
    const nombreA = a.nombre.toLowerCase();
    const nombreB = b.nombre.toLowerCase();

    if (nombreA < nombreB) return -1;
    if (nombreA > nombreB) return 1;

    // Si el nombre es el mismo, comparamos por fecha
    return new Date(a.fechaInicio) - new Date(b.fechaInicio);
  });

  // 2. Configuración Landscape
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const margin = 10;
  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
  const tableWidth = pageWidth - margin * 2;

  // --- CONFIGURACIÓN DE COLUMNAS ---
  const col = {
    nombre: 65,
    dni: 25,
    fecha: 22,
    tipo: 12,
    periodos: 15,
    total: 12,
    motivo: 15,
    justificada: 28,
    acumuladas: 22,
  };

  const drawHeadersTabla = (yPos) => {
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);

    // FILA 1: AGRUPADORES
    doc.rect(margin, yPos, col.nombre + col.dni, 12, "FD");
    doc.text(
      "DATOS PERSONALES",
      margin + (col.nombre + col.dni) / 2,
      yPos + 7,
      { align: "center" }
    );

    let x = margin + col.nombre + col.dni;
    const anchoAusencia =
      col.fecha * 2 + col.tipo + col.periodos + col.total + col.motivo;
    doc.rect(x, yPos, anchoAusencia, 6, "FD");
    doc.text("DATOS DE LA AUSENCIA", x + anchoAusencia / 2, yPos + 4.5, {
      align: "center",
    });

    x += anchoAusencia;
    doc.rect(x, yPos, col.justificada, 12, "FD");
    doc.text("Sólo no\njustificadas", x + col.justificada / 2, yPos + 5, {
      align: "center",
    });

    x += col.justificada;
    doc.rect(x, yPos, col.acumuladas, 12, "FD");
    doc.text("Total\nPeriodos\nacumuladas", x + col.acumuladas / 2, yPos + 4, {
      align: "center",
    });

    // FILA 2: SUBTÍTULOS
    doc.setFontSize(6);
    const y2 = yPos + 6;
    let x2 = margin + col.nombre + col.dni;

    doc.rect(x2, y2, col.fecha, 6, "S");
    doc.text("Fecha\ncomienzo", x2 + 2, y2 + 2.5);
    x2 += col.fecha;
    doc.rect(x2, y2, col.fecha, 6, "S");
    doc.text("Fecha\nfin", x2 + 2, y2 + 2.5);
    x2 += col.fecha;
    doc.rect(x2, y2, col.tipo, 6, "S");
    doc.text("Tipo", x2 + 2, y2 + 4);
    x2 += col.tipo;
    doc.rect(x2, y2, col.periodos, 6, "S");
    doc.text("Periodos", x2 + 2, y2 + 4);
    x2 += col.periodos;
    doc.rect(x2, y2, col.total, 6, "S");
    doc.text("Total", x2 + 2, y2 + 4);
    x2 += col.total;
    doc.rect(x2, y2, col.motivo, 6, "S");
    doc.text("Motivo", x2 + 2, y2 + 4);

    doc.text("Nombre", margin + 2, yPos + 10);
    doc.text("Documento", margin + col.nombre + 2, yPos + 10);

    return yPos + 12;
  };

  // --- INICIO RENDERIZADO ---
  let y = 15;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(meta.centro, margin, y);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Año académico: ${meta.cursoAcademico}    Mes: ${meta.mesNombre}`,
    margin,
    y + 7
  );
  doc.text(
    `Fecha de remisión: ${meta.fechaRemision}`,
    pageWidth - margin - 40,
    y + 7
  );

  y += 15;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PARTE MENSUAL DE AUSENCIAS DEL PROFESORADO", pageWidth / 2, y, {
    align: "center",
  });

  y += 6;
  y = drawHeadersTabla(y);

  // --- CUERPO (Usando datosOrdenados) ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  datosOrdenados.forEach((item) => {
    const rowH = 8;
    // Si vamos a saltar de página, forzamos "landscape" en addPage para evitar errores
    if (y + rowH > pageHeight - 20) {
      doc.addPage("landscape");
      y = 20;
      y = drawHeadersTabla(y);
    }

    let cx = margin;
    const drawCell = (width, text) => {
      doc.rect(cx, y, width, rowH, "S");
      doc.text(String(text || ""), cx + 2, y + 5);
      cx += width;
    };

    drawCell(col.nombre, item.nombre.substring(0, 40));
    drawCell(col.dni, item.documento);
    drawCell(col.fecha, format(new Date(item.fechaInicio), "dd/MM/yyyy"));
    drawCell(col.fecha, format(new Date(item.fechaFin), "dd/MM/yyyy"));
    drawCell(col.tipo, "01");
    drawCell(
      col.periodos,
      `${item.periodosLectivos || 0} | ${item.periodosNoLectivos || 0} | 00`
    );
    drawCell(col.total, item.totalPeriodos || 0);
    drawCell(col.motivo, item.motivoCodigo || "");
    drawCell(col.justificada, "");
    drawCell(col.acumuladas, item.totalAcumulado || "");

    y += rowH;
  });

  // --- RESUMEN FINAL ---
  if (y + 40 > pageHeight) {
    doc.addPage("landscape");
    y = 20;
  }
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, y, tableWidth, 18, "FD");
  doc.text("Resumen estadístico del mes", margin + 2, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(
    `Número total de profesores/as del Centro pertenecientes al Claustro: ____`,
    margin + 2,
    y + 10
  );
  doc.text(
    `Número total de ausencias registradas: ${datosOrdenados.length}`,
    margin + 2,
    y + 14
  );

  doc.save(`Parte_Mensual_${meta.mesNombre}.pdf`);
}
