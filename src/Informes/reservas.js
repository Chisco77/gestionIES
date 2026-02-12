// src/Informes/reservasPeriodicas.js
import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateInformeReservasPeriodicas = (
  reservas,
  periodosDB
) => {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.text("Informe de Reservas Periódicas", 14, 15);

  if (!reservas || reservas.length === 0) {
    doc.setFontSize(12);
    doc.text("No hay reservas periódicas.", 14, 30);
    doc.save("informe_reservas_periodicas.pdf");
    return;
  }

  // 🔹 Agrupar por aula (descripcion_estancia)
  const reservasAgrupadas = reservas.reduce((acc, reserva) => {
    const aula = reserva.descripcion_estancia || "Sin aula";
    if (!acc[aula]) acc[aula] = [];
    acc[aula].push(reserva);
    return acc;
  }, {});

  const diasSemanaTexto = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  Object.entries(reservasAgrupadas).forEach(([aula, reservasAula], index) => {
    if (index > 0) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.text(`Aula: ${aula}`, 14, y);
    y += 8;

    const body = reservasAula.map((r) => {
      // 🔹 Construir texto de periodos
      let periodosTexto = `${r.idperiodo_inicio} - ${r.idperiodo_fin}`;

      if (periodosDB && periodosDB.length > 0) {
        const inicio = periodosDB.find(
          (p) => p.id === r.idperiodo_inicio
        );
        const fin = periodosDB.find(
          (p) => p.id === r.idperiodo_fin
        );

        if (inicio && fin) {
          periodosTexto = `${inicio.descripcion} - ${fin.descripcion}`;
        }
      }

      // 🔹 Días de semana
      const diasTexto = r.dias_semana
        ?.map((d) => diasSemanaTexto[d])
        .join(", ");

      return [
        r.nombreCreador || "",
        r.nombreProfesor || "",
        new Date(r.fecha_desde).toLocaleDateString(),
        new Date(r.fecha_hasta).toLocaleDateString(),
        diasTexto || "",
        periodosTexto,
        r.descripcion_reserva || "",
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [
        [
          "Creado por",
          "Para",
          "Desde",
          "Hasta",
          "Días",
          "Periodo horario",
          "Descripción",
        ],
      ],
      body,
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fillColor: [41, 128, 185],
      },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 10;
  });

  doc.save("informe_reservas_periodicas.pdf");
};