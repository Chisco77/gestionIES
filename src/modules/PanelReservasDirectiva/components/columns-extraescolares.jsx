// src/components/extraescolares/columns.jsx
import { parseISO, format } from "date-fns";
export const columnsExtraescolares = (cursos, periodos) => [
  {
    accessorKey: "fecha_inicio",
    header: "Inicio",
    cell: ({ row }) => {
      const fechaStr = row.original.fecha_inicio?.split(" ")[0]; // "YYYY-MM-DD"
      return fechaStr ? format(parseISO(fechaStr), "dd/MM/yyyy") : "-";
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;

      const inicioActStr = row.original.fecha_inicio?.split(" ")[0];
      const finActStr = row.original.fecha_fin?.split(" ")[0];

      if (!inicioActStr || !finActStr) return false;

      const inicioAct = new Date(inicioActStr);
      const finAct = new Date(finActStr);

      inicioAct.setHours(0, 0, 0, 0);
      finAct.setHours(0, 0, 0, 0);

      const desde = filterValue.desde ? new Date(filterValue.desde) : null;
      const hasta = filterValue.hasta ? new Date(filterValue.hasta) : null;

      if (desde) desde.setHours(0, 0, 0, 0);
      if (hasta) hasta.setHours(0, 0, 0, 0);

      if (desde && finAct < desde) return false;
      if (hasta && inicioAct > hasta) return false;

      return true;
    },
  },

  {
    accessorKey: "fecha_fin",
    header: "Fin",
    cell: ({ row }) => {
      const fechaStr = row.original.fecha_fin?.split(" ")[0];
      return fechaStr ? format(parseISO(fechaStr), "dd/MM/yyyy") : "-";
    },
  },

  {
    id: "periodo",
    header: "Periodo",
    cell: ({ row }) => {
      const idInicio = row.original.idperiodo_inicio;
      const idFin = row.original.idperiodo_fin;

      const periodoInicio = periodos.find(
        (p) => String(p.id) === String(idInicio)
      );

      const periodoFin = periodos.find((p) => String(p.id) === String(idFin));

      const nombreInicio = periodoInicio?.nombre ?? idInicio ?? "-";
      const nombreFin = periodoFin?.nombre ?? idFin ?? "-";

      // Si los IDs son iguales, solo mostramos el nombre del inicio
      if (String(idInicio) === String(idFin)) {
        return nombreInicio;
      }

      return `${nombreInicio} - ${nombreFin}`;
    },
  },
  {
    accessorKey: "actualizadaPor",
    header: "Última Modificación",
    filterFn: (row, col, value) =>
      !value || row.getValue(col).toLowerCase().includes(value.toLowerCase()),
  },
  {
    id: "responsables",
    header: "Responsables",
    cell: ({ row }) => {
      const responsables = row.original.responsables;

      if (!Array.isArray(responsables) || !responsables.length) return "-";

      return responsables.map((r) => r.nombre).join(", ");
    },
    filterFn: (row, columnId, value) => {
      if (!value) return true;

      const responsables = row.original.responsables || [];

      const texto = responsables.map((r) => r.nombre.toLowerCase()).join(" ");

      return texto.includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "titulo",
    header: "Título",
    filterFn: (row, col, value) =>
      !value || row.getValue(col).toLowerCase().includes(value.toLowerCase()),
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => row.original.tipo,
  },
  {
    accessorKey: "cursos_gids",
    header: "Cursos",
    cell: ({ row }) => {
      const gids = row.original.cursos_gids || [];

      if (!Array.isArray(gids) || !gids.length) return "-";

      // Convertir gids → nombre del curso
      const nombres = gids
        .map((gid) => {
          const curso = cursos.find((c) => c.gid == gid);
          return curso ? curso.nombre : gid;
        })
        .join(", ");

      return nombres;
    },
  },

  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const e = row.original.estado;
      const map = {
        0: { text: "Pendiente", color: "text-yellow-600 bg-yellow-100" },
        1: { text: "Aceptada", color: "text-green-600 bg-green-100" },
        2: { text: "Rechazada", color: "text-red-600 bg-red-100" },
      };
      return (
        <span
          className={`px-2 py-1 rounded-lg text-xs font-medium ${map[e]?.color ?? ""}`}
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
