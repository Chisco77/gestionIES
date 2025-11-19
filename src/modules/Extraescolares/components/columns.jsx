// src/components/extraescolares/columns.jsx

export const columnsExtraescolares = () => [
  {
    accessorKey: "fecha_inicio",
    header: "Inicio",
    cell: ({ row }) => {
      const f = new Date(row.original.fecha_inicio);
      return f.toLocaleDateString();
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const rowDate = new Date(row.original.fecha_inicio);
      const desde = filterValue.desde ? new Date(filterValue.desde) : null;
      const hasta = filterValue.hasta ? new Date(filterValue.hasta) : null;
      if (desde && rowDate < desde) return false;
      if (hasta && rowDate > hasta) return false;
      return true;
    },
  },

  {
    accessorKey: "fecha_fin",
    header: "Fin",
    cell: ({ row }) => {
      const f = new Date(row.original.fecha_fin);
      return f.toLocaleDateString();
    },
  },

  {
    accessorKey: "nombreProfesor",
    header: "Profesor",
    filterFn: (row, col, value) =>
      !value ||
      row.getValue(col).toLowerCase().includes(value.toLowerCase()),
  },

  {
    accessorKey: "titulo",
    header: "Título",
    filterFn: (row, col, value) =>
      !value ||
      row.getValue(col).toLowerCase().includes(value.toLowerCase()),
  },

  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => row.original.tipo,
  },

  {
    accessorKey: "cursos_gids",
    header: "Cursos",
    cell: ({ row }) => row.original.cursos_gids.join(", "),
  },

  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const e = row.original.estado;

      const map = {
        0: { text: "Pendiente", color: "text-yellow-600 bg-yellow-100" },
        1: { text: "Aceptado", color: "text-green-600 bg-green-100" },
        2: { text: "Rechazado", color: "text-red-600 bg-red-100" },
      };

      return (
        <span
          className={`px-2 py-1 rounded-lg text-xs font-medium ${
            map[e]?.color ?? ""
          }`}
        >
          {map[e]?.text ?? "—"}
        </span>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      return row.original.estado === 0;
    },
  },
];
