// src/components/asuntos/columns-asuntos.jsx
export const columnsAsuntos = (onAceptar, onRechazar) => [
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      const fecha = new Date(row.original.fecha);
      return fecha.toLocaleDateString();
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;

      const rowDate = new Date(row.original.fecha);
      const desde = filterValue.desde ? new Date(filterValue.desde) : null;
      const hasta = filterValue.hasta ? new Date(filterValue.hasta) : null;

      if (desde && rowDate < desde) return false;
      if (hasta && rowDate > hasta) return false;
      return true;
    },
  },

  {
    accessorKey: "nombreProfesor",
    header: "Profesor",
    filterFn: (row, col, value) => {
      if (!value) return true;
      return row.getValue(col).toLowerCase().includes(value.toLowerCase());
    },
  },

  {
    accessorKey: "descripcion",
    header: "Descripción",
    filterFn: (row, col, value) => {
      if (!value) return true;
      return row.getValue(col).toLowerCase().includes(value.toLowerCase());
    },
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
          className={
            "px-2 py-1 rounded-lg text-xs font-medium " + (map[e]?.color ?? "")
          }
        >
          {map[e]?.text ?? "—"}
        </span>
      );
    },

    // Filtro solo pendientes si el switch está activo
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      return row.original.estado === 0;
    },
  },
 

];
