import { getCursoActual } from "@/utils/fechasHoras";

import jsPDF from "jspdf";

export async function generarPdfControlGuardias(
  horarios,
  guardiasRealizadas,
  periodos,
  cursoLabel
) {
  const yearInicio = parseInt(cursoLabel.split("-")[0]);

  // --- FILTRO CRÍTICO: Excluimos el recreo de los periodos y de los horarios ---
  const periodosSinRecreo = periodos.filter(
    (p) => !p.nombre.toLowerCase().includes("recreo")
  );

  const horariosSinRecreo = horarios.filter((h) => {
    const nombrePeriodo = h.periodo_nombre || h.periodo || "";
    return !nombrePeriodo.toLowerCase().includes("recreo");
  });

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const margin = 10;
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

  const profesGuardiaPorHoraYDia = (dia) => {
    // Usamos los periodos filtrados
    return periodosSinRecreo.map((p) => {
      const profes = horariosSinRecreo.filter(
        (h) =>
          Number(h.dia_semana) === dia &&
          String(h.idperiodo) === String(p.id) &&
          h.tipo === "guardia"
      );
      return { periodo: p, profes };
    });
  };

  diasNombres.forEach((nombreDia, indexDia) => {
    if (indexDia > 0) doc.addPage();

    const diaSemanaLdap = indexDia + 1;
    const calendario = getDiasMesPorDiaSemana(diaSemanaLdap);
    const estructuraGuardias = profesGuardiaPorHoraYDia(diaSemanaLdap);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`CONTROL DE GUARDIAS - ${nombreDia.toUpperCase()}`, margin, 15);
    doc.setFontSize(10);
    doc.text(`Curso ${cursoLabel}`, pageWidth - margin - 30, 15);

    const colHoraWidth = 15;
    const colProfeWidth = 35;
    const areaCalendarioWidth =
      pageWidth - margin * 2 - colHoraWidth - colProfeWidth;
    const totalDiasEnAño = Object.values(calendario).flat().length;
    const subColWidth = areaCalendarioWidth / totalDiasEnAño;

    let y = 25;
    const headerHeight = 15;

    // Cabecera
    doc.setFontSize(8);
    doc.rect(margin, y, colHoraWidth, headerHeight);
    doc.text("Hora", margin + 2, y + 8);
    doc.rect(margin + colHoraWidth, y, colProfeWidth, headerHeight);
    doc.text("Profesores", margin + colHoraWidth + 2, y + 8);

    let xMes = margin + colHoraWidth + colProfeWidth;
    mesesIndices.forEach((mesIdx, i) => {
      const diasMes = calendario[mesIdx];
      const anchoMes = diasMes.length * subColWidth;
      doc.rect(xMes, y, anchoMes, headerHeight / 2);
      doc.setFont("helvetica", "bold");
      doc.text(mesesNombres[i], xMes + anchoMes / 2 - 3, y + 5);

      diasMes.forEach((dia, j) => {
        const xDia = xMes + j * subColWidth;
        doc.rect(xDia, y + headerHeight / 2, subColWidth, headerHeight / 2);
        doc.setFontSize(6);
        doc.text(dia.toString(), xDia + 1, y + headerHeight - 2);
      });
      xMes += anchoMes;
    });

    y += headerHeight;

    // Filas de la tabla
    estructuraGuardias.forEach((item) => {
      // Si la fila es un recreo o no tiene profes, no la dibujamos
      if (item.profes.length === 0) return;

      const rowHeight = item.profes.length * 6;
      doc.rect(margin, y, colHoraWidth, rowHeight);
      doc.setFont("helvetica", "bold");
      doc.text(item.periodo.nombre, margin + 2, y + rowHeight / 2 + 2);

      item.profes.forEach((profe, pIdx) => {
        const currentY = y + pIdx * 6;
        const cellHeight = 6;

        doc.rect(margin + colHoraWidth, currentY, colProfeWidth, cellHeight);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(
          profe.nombreProfesor.substring(0, 20),
          margin + colHoraWidth + 1,
          currentY + 4
        );

        let xAsistencia = margin + colHoraWidth + colProfeWidth;
        mesesIndices.forEach((mesIdx) => {
          const diasMes = calendario[mesIdx];
          const añoReal = mesIdx >= 8 ? yearInicio : yearInicio + 1;

          diasMes.forEach((dia) => {
            doc.rect(xAsistencia, currentY, subColWidth, cellHeight);
            const fechaStr = `${añoReal}-${String(mesIdx + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

            const guardiaEfectiva = guardiasRealizadas.find(
              (g) =>
                g.uid_profesor_cubridor === profe.uid &&
                g.fecha === fechaStr &&
                Number(g.idperiodo) === Number(item.periodo.id) &&
                g.confirmada === true
            );

            if (guardiaEfectiva) {
              doc.setFont("zapfdingbats");
              doc.text("4", xAsistencia + subColWidth / 2 - 1, currentY + 4);
              doc.setFont("helvetica");
            }
            xAsistencia += subColWidth;
          });
        });
      });
      y += rowHeight;
      if (y > 180) {
        doc.addPage();
        y = 20;
      }
    });
  });

  doc.save(`Control_Guardias_${cursoLabel}.pdf`);
}
