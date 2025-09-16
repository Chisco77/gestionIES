/**
 * columns.jsx - Definición de columnas para la tabla de cursos
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Fecha de creación: 2025
 *
 * Descripción:
 * Configuración de columnas utilizada por la tabla de cursos.
 * - Define el campo "curso" como columna principal.
 * - Añade botón en el encabezado que permite alternar el orden ascendente/descendente.
 * - Incluye una función de filtrado personalizada que permite filtrar por
 *   un conjunto de valores seleccionados.
 *
 * Columnas:
 * - curso:
 *   - accessorKey: "curso"
 *   - header: renderiza un botón (`Button`) con icono `ArrowUpDown` para ordenar.
 *   - filterFn: acepta un array de valores y filtra filas cuyo valor coincida.
 *
 * Dependencias:
 * - lucide-react (ArrowUpDown)
 * - @/components/ui/button
 *
 * Notas:
 * - El filtro es inclusivo: si `filterValue` está vacío, se muestran todos los cursos.
 * - Diseñado para integrarse en tablas con capacidad de ordenación y filtrado.
 */


import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns = [
  {
    accessorKey: "curso",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, columnId, filterValue) => {
      // filterValue será un array de valores seleccionados
      if (!filterValue || filterValue.length === 0) return true;
      return filterValue.includes(row.getValue(columnId));
    },
  },
];
