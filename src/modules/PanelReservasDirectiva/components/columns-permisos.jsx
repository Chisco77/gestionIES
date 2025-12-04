// src/components/asuntos/columns-asuntos.jsx
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

      const tiposMap = {
        2: "(Art. 2) Fallecimiento, accidente o enfermedad grave, hospitalización o intervención quirúrgica",
        3: "(Art. 3) Enfermedad propia",
        4: "(Art. 4) Traslado de domicilio",
        7: "(Art. 7) Exámenes prenatales y técnicas de preparación al parto de un familiar",
        11: "(Art. 11) Cumplimiento de un deber inexcusable de carácter público o personal",
        13: "(Art. 13) Asuntos particulares",
        14: "(Art. 14) Realización de funciones sindicales o de representación del personal",
        15: "(Art. 15) Exámenes finales o pruebas selectivas en el empleo público",
        32: "(Art. 32) Reducción de jornada para mayores de 55 años",
        0: "Otros",
      };

      const texto = tiposMap[tipo] ?? "Otros";

      // truncado a 30 caracteres
      const truncado = texto.length > 30 ? texto.substring(0, 30) + "…" : texto;

      return (
        <span title={texto} className="text-sm">
          {truncado}
        </span>
      );
    },

    // Filtro por texto (opcional)
    filterFn: (row, col, value) => {
      if (!value) return true;
      const tipo = row.original.tipo;
      const tiposMap = {
        2: "(Art. 2) Fallecimiento, accidente o enfermedad grave, hospitalización o intervención quirúrgica",
        3: "(Art. 3) Enfermedad propia",
        4: "(Art. 4) Traslado de domicilio",
        7: "(Art. 7) Exámenes prenatales y técnicas de preparación al parto de un familiar",
        11: "(Art. 11) Cumplimiento de un deber inexcusable de carácter público o personal",
        13: "(Art. 13) Asuntos particulares",
        14: "(Art. 14) Realización de funciones sindicales o de representación del personal",
        15: "(Art. 15) Exámenes finales o pruebas selectivas en el empleo público",
        32: "(Art. 32) Reducción de jornada para mayores de 55 años",
        0: "Otros",
      };

      return tiposMap[tipo]?.toLowerCase().includes(value.toLowerCase());
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
