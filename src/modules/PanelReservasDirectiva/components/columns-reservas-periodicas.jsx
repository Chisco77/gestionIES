const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];

export const columnsReservasPeriodicas = (periodos = []) => {
  // Map de id → periodo
  const mapPeriodos = Object.fromEntries(periodos.map((p) => [p.id, p]));

  return [
    {
      accessorKey: "nombreCreador",
      header: "Creada por",
      filterFn: (row, col, value) =>
        !value ||
        row.getValue(col)?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      accessorKey: "nombreProfesor",
      header: "Creada para",
      filterFn: (row, col, value) =>
        !value ||
        row.getValue(col)?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      accessorKey: "fecha_desde",
      header: "Desde",
      cell: ({ row }) =>
        new Date(row.original.fecha_desde).toLocaleDateString(),
    },
    {
      accessorKey: "fecha_hasta",
      header: "Hasta",
      cell: ({ row }) =>
        new Date(row.original.fecha_hasta).toLocaleDateString(),
    },
    {
      accessorKey: "idperiodo_inicio",
      header: "Periodo Inicio",
      cell: ({ row }) => {
        const id = row.original.idperiodo_inicio;
        const periodo = mapPeriodos[id];
        return periodo ? `${periodo.nombre}` : (id ?? "—");
      },
    },
    {
      accessorKey: "idperiodo_fin",
      header: "Periodo Fin",
      cell: ({ row }) => {
        const id = row.original.idperiodo_fin;
        const periodo = mapPeriodos[id];
        return periodo ? `${periodo.nombre}` : (id ?? "—");
      },
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
  ];
};
