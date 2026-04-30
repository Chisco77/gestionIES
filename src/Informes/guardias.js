import { getCursoActual } from "@/utils/fechasHoras";
import jsPDF from "jspdf";
import { drawHeader, drawFooter, addPageWithHeader } from "./utils";

export async function generarPdfControlGuardias(
  horarios,
  guardiasRealizadas,
  periodos,
  cursoLabel
) {
  const yearInicio = parseInt(cursoLabel.split("-")[0]);

  // 1. Filtros y Preparación de Datos
  const periodosSinRecreo = periodos.filter(
    (p) => !p.nombre.toLowerCase().includes("recreo")
  );

  const horariosSinRecreo = horarios.filter((h) => {
    const nombrePeriodo = h.periodo_nombre || h.periodo || "";
    return !nombrePeriodo.toLowerCase().includes("recreo");
  });

  // 2. Cálculo de estadísticas
  const statsProfes = {};
  guardiasRealizadas.forEach((g) => {
    if (g.confirmada) {
      statsProfes[g.uid_profesor_cubridor] =
        (statsProfes[g.uid_profesor_cubridor] || 0) + 1;
    }
  });

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();

  const getDiasMesPorDiaSemana = (diaSemanaIndex) => {
    const meses = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
    const resultado = {};
    meses.forEach((mes) => {
      const año = mes >= 8 ? yearInicio : yearInicio + 1;
      const dias = [];
      const fecha = new Date(año, mes, 1);
      while (fecha.getMonth() === mes) {
        if (fecha.getDay() === diaSemanaIndex) dias.push(fecha.getDate());
        fecha.setDate(fecha.getDate() + 1);
      }
      resultado[mes] = dias;
    });
    return resultado;
  };

  const diasNombres = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const mesesNombres = [
    "SEP",
    "OCT",
    "NOV",
    "DIC",
    "ENE",
    "FEB",
    "MAR",
    "ABR",
    "MAY",
    "JUN",
  ];
  const mesesIndices = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5];

  // --- GENERACIÓN DE PÁGINAS POR DÍA (LANDSCAPE) ---
  diasNombres.forEach((nombreDia, indexDia) => {
    if (indexDia > 0) doc.addPage("landscape");

    let currentY = drawHeader(
      doc,
      `CONTROL DE GUARDIAS - ${nombreDia.toUpperCase()} (Curso ${cursoLabel})`
    );

    const diaSemanaLdap = indexDia + 1;
    const calendario = getDiasMesPorDiaSemana(diaSemanaLdap);

    const colHoraWidth = 15;
    const colProfeWidth = 45;
    const areaCalendarioWidth =
      pageWidth - margin * 2 - colHoraWidth - colProfeWidth;
    const totalDiasEnAño = Object.values(calendario).flat().length;
    const subColWidth = areaCalendarioWidth / totalDiasEnAño;
    const headerHeight = 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    // Cabecera de tabla
    doc.rect(margin, currentY, colHoraWidth, headerHeight);
    doc.text("Hora", margin + 2, currentY + 7);
    doc.rect(margin + colHoraWidth, currentY, colProfeWidth, headerHeight);
    doc.text("Profesores (Total)", margin + colHoraWidth + 2, currentY + 7);

    let xMes = margin + colHoraWidth + colProfeWidth;
    mesesIndices.forEach((mesIdx, i) => {
      const diasMes = calendario[mesIdx];
      const anchoMes = diasMes.length * subColWidth;
      doc.rect(xMes, currentY, anchoMes, headerHeight / 2);
      doc.setFontSize(7);
      doc.text(mesesNombres[i], xMes + anchoMes / 2, currentY + 4, {
        align: "center",
      });

      diasMes.forEach((dia, j) => {
        const xDia = xMes + j * subColWidth;
        doc.rect(
          xDia,
          currentY + headerHeight / 2,
          subColWidth,
          headerHeight / 2
        );
        doc.setFontSize(5);
        doc.text(
          dia.toString(),
          xDia + subColWidth / 2,
          currentY + headerHeight - 2,
          { align: "center" }
        );
      });
      xMes += anchoMes;
    });

    currentY += headerHeight;

    periodosSinRecreo.forEach((p) => {
      const profes = horariosSinRecreo.filter(
        (h) =>
          Number(h.dia_semana) === diaSemanaLdap &&
          String(h.idperiodo) === String(p.id) &&
          h.tipo === "guardia"
      );

      if (profes.length === 0) return;
      const rowHeight = profes.length * 6;

      if (currentY + rowHeight > 185) {
        currentY = addPageWithHeader(
          doc,
          `CONTROL DE GUARDIAS - ${nombreDia.toUpperCase()} (Cont.)`,
          "l"
        );
      }

      doc.rect(margin, currentY, colHoraWidth, rowHeight);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(p.nombre, margin + 2, currentY + rowHeight / 2 + 1);

      profes.forEach((profe, pIdx) => {
        const yFila = currentY + pIdx * 6;
        doc.rect(margin + colHoraWidth, yFila, colProfeWidth, 6);
        const totalGuardias = statsProfes[profe.uid] || 0;
        doc.setFont("helvetica", "normal");
        doc.text(
          `${profe.nombreProfesor.substring(0, 30)} (${totalGuardias})`,
          margin + colHoraWidth + 2,
          yFila + 4
        );

        let xAsis = margin + colHoraWidth + colProfeWidth;
        mesesIndices.forEach((mesIdx) => {
          const año = mesIdx >= 8 ? yearInicio : yearInicio + 1;
          calendario[mesIdx].forEach((dia) => {
            doc.rect(xAsis, yFila, subColWidth, 6);
            const fStr = `${año}-${String(mesIdx + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
            const gEfectiva = guardiasRealizadas.find(
              (g) =>
                g.uid_profesor_cubridor === profe.uid &&
                g.fecha === fStr &&
                Number(g.idperiodo) === Number(p.id) &&
                g.confirmada
            );
            if (gEfectiva) {
              doc.setFont("zapfdingbats");
              doc.text("4", xAsis + subColWidth / 2, yFila + 4, {
                align: "center",
              });
              doc.setFont("helvetica");
            }
            xAsis += subColWidth;
          });
        });
      });
      currentY += rowHeight;
    });
  });

  // --- PÁGINA FINAL: LISTADO RESUMEN (CAMBIO A VERTICAL) ---
  doc.addPage("p", "a4");

  // Sincronizar dimensiones y resetear fuente ANTES de llamar al Header
  doc.internal.pageSize.width = 210;
  doc.internal.pageSize.height = 297;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  let yFinal = drawHeader(doc, "RESUMEN TOTAL DE GUARDIAS POR PROFESOR");

  const listaRanking = [];
  const uidsProcesados = new Set();
  horariosSinRecreo.forEach((h) => {
    if (h.tipo === "guardia" && !uidsProcesados.has(h.uid)) {
      listaRanking.push({
        nombre: h.nombreProfesor,
        total: statsProfes[h.uid] || 0,
      });
      uidsProcesados.add(h.uid);
    }
  });

  listaRanking.sort((a, b) => b.total - a.total);

  let yTable = yFinal + 10;

  listaRanking.forEach((item, index) => {
    // Control de límite para página A4 vertical
    if (yTable > 265) {
      yTable = addPageWithHeader(doc, "RESUMEN TOTAL DE GUARDIAS (Cont.)", "p");

      // Aseguramos fuente tras el header de la nueva página
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      yTable += 10;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${index + 1}. ${item.nombre}`, 15, yTable);
    doc.text(`${item.total}`, 185, yTable, { align: "right" });
    yTable += 7;
  });

  drawFooter(doc);
  doc.save(`Control_Guardias_${cursoLabel}.pdf`);
}
