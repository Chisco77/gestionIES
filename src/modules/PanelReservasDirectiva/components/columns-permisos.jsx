// src/components/asuntos/columns-asuntos.jsx

// src/components/asuntos/columns-permisos.jsx
import { textoTipoPermiso } from "@/utils/mapeoTiposPermisos";

export const columnsPermisos = (onAceptar, onRechazar) => [
  {
    accessorKey: "fecha",
    header: "Día Solicitado",
    cell: ({ row }) => {
      const fInicio = new Date(row.original.fecha);
      const fFin = row.original.fecha_fin
        ? new Date(row.original.fecha_fin)
        : null;

      const opciones = { day: "2-digit", month: "2-digit", year: "numeric" };
      const inicioStr = fInicio.toLocaleDateString("es-ES", opciones);

      // Si no hay fecha_fin o es el mismo día, solo mostramos la fecha de inicio
      if (!fFin || fInicio.toDateString() === fFin.toDateString()) {
        return <span className="font-medium text-gray-700">{inicioStr}</span>;
      }

      // Si es un rango, mostramos "fecha al fecha" en la misma línea
      const finStr = fFin.toLocaleDateString("es-ES", opciones);
      return (
        <span className="font-medium text-gray-700 whitespace-nowrap">
          {inicioStr} al {finStr}
        </span>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      // Si no hay filtro, mostrar todo
      if (!filterValue || (!filterValue.desde && !filterValue.hasta))
        return true;

      // 1. Fechas del Permiso (La fila)
      const inicioPermisoStr = row.original.fecha?.split("T")[0];
      const finPermisoStr = (
        row.original.fecha_fin || row.original.fecha
      )?.split("T")[0];

      if (!inicioPermisoStr) return false;

      const inicioPermiso = new Date(inicioPermisoStr);
      const finPermiso = new Date(finPermisoStr);

      inicioPermiso.setHours(0, 0, 0, 0);
      finPermiso.setHours(0, 0, 0, 0);

      // 2. Fechas del Filtro (Lo que viene del componente)
      const desde = filterValue.desde ? new Date(filterValue.desde) : null;
      const hasta = filterValue.hasta ? new Date(filterValue.hasta) : null;

      if (desde) desde.setHours(0, 0, 0, 0);
      if (hasta) hasta.setHours(0, 0, 0, 0);

      // 3. Lógica de Solapamiento
      if (desde && finPermiso < desde) return false;
      if (hasta && inicioPermiso > hasta) return false;

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
    header: "APs Aceptados",
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
