/**
 * TablaLibros.jsx - Componente de tabla interactiva para la gestión de libros
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
 * Componente de tabla reutilizable para mostrar libros.
 * - Permite ordenar, filtrar por texto y por curso.
 * - Permite seleccionar una única fila para habilitar acciones.
 * - Soporta paginación integrada de @tanstack/react-table.
 * - Permite mostrar elementos de acción (informes o botones) adicionales.
 *
 * Props:
 * - columns: array de definiciones de columnas para la tabla.
 * - data: array de libros a mostrar.
 * - cursos: array de cursos disponibles para el filtro.
 * - onFilteredChange: callback que recibe los libros filtrados actualmente visibles.
 * - informes: JSX opcional para mostrar elementos de informes o estadísticas.
 * - acciones: función que recibe el libro seleccionado y devuelve los botones de acción.
 *
 * Estado interno:
 * - sorting: array que almacena la columna por la que se está ordenando y el sentido.
 * - columnFilters: array con los filtros activos de cada columna.
 * - textoFiltro: string para filtrar por nombre del libro.
 * - filtroCurso: string con el id del curso seleccionado para filtrar.
 * - selectedId: id del libro seleccionado actualmente.
 *
 * Funcionalidad:
 * - Integración completa con @tanstack/react-table para ordenación, filtros y paginación.
 * - Aplicación de filtros manuales para curso y texto.
 * - Selección de fila única, resaltando la fila activa en azul.
 * - Notificación al padre de los libros filtrados mediante `onFilteredChange`.
 * - Renderizado de la tabla con cabecera, cuerpo y paginación.
 *
 * Dependencias:
 * - React (useState, useEffect)
 * - @tanstack/react-table
 * - @/components/ui/table
 * - @/components/ui/button
 * - lucide-react (iconos de navegación de paginación)
 *
 */


import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

import { useEffect, useState } from "react";

export function TablaLibros({
  columns,
  data,
  cursos,
  onFilteredChange,
  informes,
  acciones,
}) {
  const [sorting, setSorting] = useState([{ id: "libro", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [textoFiltro, setTextoFiltro] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: false,
    state: {
      sorting,
      columnFilters,
    },
  });

  // Filtros manuales
  useEffect(() => {
    table.getColumn("libro")?.setFilterValue(textoFiltro);
  }, [textoFiltro]);

  useEffect(() => {
    table.getColumn("idcurso")?.setFilterValue(filtroCurso || undefined);
  }, [filtroCurso]);

  // Callback al padre
  useEffect(() => {
    const filtered = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    onFilteredChange?.(filtered);
  }, [columnFilters, data]);

  const selectedRow = table.getSelectedRowModel().rows[0];
  const selectedItem = selectedRow?.original;

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 py-2 text-sm text-muted-foreground items-end">
        <div className="space-y-1">
          <label className="block font-medium text-xs">Curso</label>
          <select
            className="border p-2 rounded text-sm"
            value={filtroCurso}
            onChange={(e) => setFiltroCurso(e.target.value)}
          >
            <option value="">Todos</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.curso}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block font-medium text-xs">Libro</label>
          <input
            type="text"
            className="border p-2 rounded text-sm"
            placeholder="Buscar por nombre"
            value={textoFiltro}
            onChange={(e) => setTextoFiltro(e.target.value)}
          />
        </div>
        {informes && <div className="ml-auto">{informes}</div>}
      </div>

      {/* Tabla */}
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`cursor-pointer ${
                    row.getIsSelected() ? "bg-blue-100" : ""
                  } hover:bg-gray-100 transition-colors`}
                  onClick={() => {
                    row.toggleSelected(); // para notificar al padre y habilitar/desabilitar editar y eliminar
                    setSelectedId(row.original.id); 
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Acciones + Paginación */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-center py-6 space-y-4 sm:space-y-0">
        <div className="flex gap-2">{acciones(selectedItem)}</div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-xs text-muted-foreground px-2">
            Página {currentPage} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Total de registros: {table.getFilteredRowModel().rows.length}
        </div>
      </div>
    </div>
  );
}
