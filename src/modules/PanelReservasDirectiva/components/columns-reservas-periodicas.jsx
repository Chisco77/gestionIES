// src/components/reservas/columns-reservas-periodicas.jsx
const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];

export const columnsReservasPeriodicas = () => [
  {
    accessorKey: "nombreCreador",
    header: "Creada por",
    filterFn: (row, col, value) =>
      !value || row.getValue(col)?.toLowerCase().includes(value.toLowerCase()),
  },
  {
    accessorKey: "nombreProfesor",
    header: "Creada para",
    filterFn: (row, col, value) =>
      !value || row.getValue(col)?.toLowerCase().includes(value.toLowerCase()),
  },
  {
    accessorKey: "fecha_desde",
    header: "Desde",
    cell: ({ row }) => new Date(row.original.fecha_desde).toLocaleDateString(),
  },
  {
    accessorKey: "fecha_hasta",
    header: "Hasta",
    cell: ({ row }) => new Date(row.original.fecha_hasta).toLocaleDateString(),
  },
  {
    accessorKey: "frecuencia",
    header: "Frecuencia",
  },
  {
    accessorKey: "dias_semana",
    header: "Días",
    cell: ({ row }) => {
      const dias = row.original.dias_semana;
      if (!Array.isArray(dias) || dias.length === 0) return "—";

      return dias.map((d) => DIAS_SEMANA[d] ?? "?").join(", ");
    },
  },

  {
    accessorKey: "descripcion_reserva",
    header: "Reserva",
  },
  {
    accessorKey: "descripcion_estancia",
    header: "Estancia",
  },

  {
    id: "num_reservas",
    header: "Reservas generadas",
    cell: ({ row }) => row.original.reservas?.length ?? 0,
  },
];
