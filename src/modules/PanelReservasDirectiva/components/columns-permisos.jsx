// src/components/asuntos/columns-asuntos.jsx

/*import { textoTipoPermiso } from "@/utils/mapeoTiposPermisos";

export const columnsPermisos = (onAceptar, onRechazar) => [
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
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.original.tipo;

      const texto = textoTipoPermiso(tipo);
      const truncado = texto.length > 30 ? texto.substring(0, 30) + "…" : texto;

      return (
        <span title={texto} className="text-sm">
          {truncado}
        </span>
      );
    },

    // ✅ filtro NUMÉRICO correcto
    filterFn: (row, col, value) => {
      if (value === "" || value === null || value === undefined) return true;
      return row.original.tipo === value;
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
*/

// src/components/asuntos/columns-permisos.jsx
import { textoTipoPermiso } from "@/utils/mapeoTiposPermisos";

export const columnsPermisos = (onAceptar, onRechazar) => [
  {
    accessorKey: "fecha",
    header: "Día Solicitado", // renombrada
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
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.original.tipo;
      const texto = textoTipoPermiso(tipo);
      const truncado = texto.length > 30 ? texto.substring(0, 30) + "…" : texto;

      return (
        <span title={texto} className="text-sm">
          {truncado}
        </span>
      );
    },
    filterFn: (row, col, value) => {
      if (value === "" || value === null || value === undefined) return true;
      return row.original.tipo === value;
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
    accessorKey: "ap_total",
    header: "APs Total",
    cell: ({ row }) => row.original.ap_total ?? 0,
    filterFn: (row, col, value) => {
      if (!value) return true;
      return row.original.ap_total === Number(value);
    },
  },

  {
    accessorKey: "dias_disfrutados",
    header: "APs Concedidos",
    cell: ({ row }) => row.original.dias_disfrutados ?? 0,
    filterFn: (row, col, value) => {
      if (!value) return true;
      return row.original.dias_disfrutados === Number(value);
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
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      return row.original.estado === 0;
    },
  },
];
