import { parseISO, format } from "date-fns";

const truncateText = (text, limit) => {
  if (!text) return "-";
  return text.length > limit ? text.substring(0, limit) + "..." : text;
};

export const columnsExtraescolares = (cursos, periodos) => [
  {
    accessorKey: "fecha_inicio",
    header: "Inicio",
    filterFn: "dateRange",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-[11px]">
        {row.original.fecha_inicio
          ? format(
              parseISO(row.original.fecha_inicio.split(" ")[0]),
              "dd/MM/yyyy"
            )
          : "-"}
      </span>
    ),
  },
  {
    accessorKey: "fecha_fin",
    header: "Fin",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-[11px]">
        {row.original.fecha_fin
          ? format(parseISO(row.original.fecha_fin.split(" ")[0]), "dd/MM/yyyy")
          : "-"}
      </span>
    ),
  },
  {
    id: "periodo",
    header: "Periodo",
    cell: ({ row }) => {
      const pI = periodos.find(
        (p) => String(p.id) === String(row.original.idperiodo_inicio)
      );
      const pF = periodos.find(
        (p) => String(p.id) === String(row.original.idperiodo_fin)
      );
      const texto =
        String(row.original.idperiodo_inicio) ===
        String(row.original.idperiodo_fin)
          ? (pI?.nombre ?? "-")
          : `${pI?.nombre ?? "?"}-${pF?.nombre ?? "?"}`;
      return (
        <div className="max-w-[75px] truncate text-[11px]" title={texto}>
          {texto}
        </div>
      );
    },
  },
  {
    accessorKey: "actualizadaPor",
    header: "Modificada por",
    cell: ({ row }) => {
      const valor = row.getValue("actualizadaPor") || "-";
      return (
        <div
          className="max-w-[150px] truncate text-slate-500 text-[10px] font-semibold"
          title={valor}
        >
          {truncateText(valor, 35)}
        </div>
      );
    },
    filterFn: (row, col, value) =>
      !value || row.getValue(col).toLowerCase().includes(value.toLowerCase()),
  },
  {
    accessorKey: "titulo",
    header: "Título",
    cell: ({ row }) => {
      const valor = row.getValue("titulo") || "-";
      return (
        <div
          className="max-w-[140px] truncate font-medium text-slate-900 text-[11px]"
          title={valor}
        >
          {truncateText(valor, 20)}
        </div>
      );
    },
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const valor = row.original.tipo || "-";
      return (
        <div
          className="max-w-[80px] truncate text-slate-400 italic text-[10px]"
          title={valor}
        >
          {valor}
        </div>
      );
    },
  },
  {
    accessorKey: "cursos_gids",
    header: "Cursos",
    cell: ({ row }) => {
      const gids = row.original.cursos_gids || [];
      const nombres = gids
        .map((gid) => cursos.find((c) => c.gid == gid)?.nombre || gid)
        .join(", ");
      return (
        <div
          className="max-w-[100px] truncate text-slate-500 text-[11px]"
          title={nombres}
        >
          {truncateText(nombres, 25)}
        </div>
      );
    },
  },
  {
    id: "responsables",
    header: "Responsables",
    cell: ({ row }) => {
      const texto =
        (row.original.responsables || []).map((r) => r.nombre).join(", ") ||
        "-";
      return (
        <div className="max-w-[150px] truncate text-[11px]" title={texto}>
          {truncateText(texto, 35)}
        </div>
      );
    },
    filterFn: (row, columnId, value) => {
      if (!value) return true;
      const term = value.toLowerCase();

      // 1. Buscar en los nombres de los responsables
      const nombresResponsables = (row.original.responsables || []).some((r) =>
        r.nombre.toLowerCase().includes(term)
      );

      // 2. También buscamos en quién la actualizó para que el filtro sea total
      const modificadoPor = (row.original.actualizadaPor || "")
        .toLowerCase()
        .includes(term);

      return nombresResponsables || modificadoPor;
    },
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
          text: "Aceptada",
          color: "text-green-600 bg-green-50 border-green-200",
        },
        2: {
          text: "Rechazada",
          color: "text-red-600 bg-red-50 border-red-200",
        },
      };
      const config = map[e] || { text: "—", color: "bg-slate-50" };
      return (
        <span
          className={`px-1 py-0.5 rounded border text-[8px] font-extrabold uppercase ${config.color}`}
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
