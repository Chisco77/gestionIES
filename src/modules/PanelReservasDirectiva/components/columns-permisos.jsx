import { textoTipoPermiso } from "@/utils/mapeoTiposPermisos";

const truncateText = (text, limit) => {
  if (!text) return "-";
  return text.length > limit ? text.substring(0, limit) + "..." : text;
};

export const columnsPermisos = () => [
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

      if (!fFin || fInicio.toDateString() === fFin.toDateString()) {
        return (
          <span className="text-[11px] font-medium text-slate-700 whitespace-nowrap">
            {inicioStr}
          </span>
        );
      }
      const finStr = fFin.toLocaleDateString("es-ES", opciones);
      return (
        <span className="text-[11px] font-medium text-slate-700 whitespace-nowrap">
          {inicioStr} - {finStr}
        </span>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || (!filterValue.desde && !filterValue.hasta))
        return true;
      const inicioPermiso = new Date(row.original.fecha?.split("T")[0]);
      const finPermiso = new Date(
        (row.original.fecha_fin || row.original.fecha)?.split("T")[0]
      );
      inicioPermiso.setHours(0, 0, 0, 0);
      finPermiso.setHours(0, 0, 0, 0);
      const desde = filterValue.desde ? new Date(filterValue.desde) : null;
      const hasta = filterValue.hasta ? new Date(filterValue.hasta) : null;
      if (desde) {
        desde.setHours(0, 0, 0, 0);
        if (finPermiso < desde) return false;
      }
      if (hasta) {
        hasta.setHours(0, 0, 0, 0);
        if (inicioPermiso > hasta) return false;
      }
      return true;
    },
  },
  {
    accessorKey: "nombreProfesor",
    header: "Profesor",
    cell: ({ row }) => {
      const valor = row.getValue("nombreProfesor") || "-";
      return (
        <div
          className="max-w-[200px] truncate text-[11px] font-semibold text-slate-900"
          title={valor}
        >
          {truncateText(valor, 45)}
        </div>
      );
    },
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const texto = textoTipoPermiso(row.original.tipo);
      return (
        <div
          className="max-w-[140px] truncate text-[11px] text-slate-500 italic"
          title={texto}
        >
          {truncateText(texto, 25)}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      // Si el filtro es "ALL", vacío o nulo, mostramos todo
      if (
        filterValue === "" ||
        filterValue === null ||
        filterValue === undefined ||
        filterValue === "ALL"
      ) {
        return true;
      }

      // Convertimos ambos a String por seguridad para asegurar la comparación
      // o comparamos como números si estás seguro de que siempre vienen así.
      return String(row.getValue(columnId)) === String(filterValue);
    },
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => {
      const valor = row.getValue("descripcion") || "-";
      return (
        <div
          className="max-w-[180px] truncate text-[11px] text-slate-500"
          title={valor}
        >
          {truncateText(valor, 30)}
        </div>
      );
    },
  },
  {
    accessorKey: "ap_total",
    header: () => <div className="text-center w-full">APs Total</div>, // Centra el texto de la cabecera
    cell: ({ row }) => (
      <div className="text-center w-full">
        {" "}
        {/* Centra el contenido de la celda */}
        <span className="text-[11px] font-bold text-slate-400">
          {row.original.ap_total ?? 0}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "dias_disfrutados",
    header: () => <div className="text-center w-full">APs Disfrutados</div>, // Centra el texto de la cabecera
    cell: ({ row }) => (
      <div className="text-center w-full">
        {" "}
        {/* Centra el contenido de la celda */}
        <span className="text-[11px] font-bold text-blue-600">
          {row.original.dias_disfrutados ?? 0}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const e = row.original.estado;
      const map = {
        0: {
          text: "Pendiente",
          color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        },
        1: {
          text: "Aceptado",
          color: "text-green-600 bg-green-50 border-green-200",
        },
        2: {
          text: "Rechazado",
          color: "text-red-600 bg-red-50 border-red-200",
        },
      };
      const config = map[e] || { text: "—", color: "bg-slate-50" };
      return (
        <span
          className={`px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase ${config.color}`}
        >
          {config.text}
        </span>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      if (filterValue === true) return row.getValue(columnId) === 0;
      return true;
    },
  },
];
