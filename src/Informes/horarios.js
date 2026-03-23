// src/modules/horarios.js
import jsPDF from "jspdf";
import { drawHeader, drawFooter } from "./utils";
import { getCursoActual } from "@/utils/fechasHoras";

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
      const profes = guardias[clave] || [];

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
      const profes = guardias[clave] || [];

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

            let estanciaTexto = `${prof.estancia.descripcion} - `;

            // recorte si se pasa
            while (
              doc.getTextWidth(estanciaTexto + nombre) > maxWidth &&
              estanciaTexto.length > 0
            ) {
              estanciaTexto = estanciaTexto.slice(0, -1);
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
