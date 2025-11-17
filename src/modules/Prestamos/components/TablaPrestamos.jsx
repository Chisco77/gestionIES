/**
 * Componente: TablaPrestamos
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Este componente renderiza una tabla interactiva de préstamos de libros,
 * con funcionalidades de:
 *   - Filtrado por curso y nombre de alumno
 *   - Ordenamiento por columnas
 *   - Paginación
 *   - Filas expandibles para ver detalle de préstamos
 *   - Selección de fila
 *   - Acciones dinámicas basadas en la fila seleccionada
 *
 * Props:
 *   - columns: array → definición de columnas (para React Table)
 *   - data: array → lista de préstamos, cada objeto debe incluir:
 *       - id_prestamo: identificador único
 *       - nombreUsuario: nombre del alumno
 *       - curso: curso del alumno
 *       - doc_compromiso: estado del documento de compromiso (1=Entregado, 2=Recibido)
 *       - prestamos: array de objetos con detalle de libros:
 *           - id_item: identificador del préstamo del libro
 *           - libro: nombre del libro
 *           - entregado: boolean
 *           - devuelto: boolean
 *   - informes: JSX opcional que se muestra en la cabecera (por ejemplo, botones de export)
 *   - acciones: función que recibe el usuario seleccionado y devuelve botones/acciones
 *   - onSelectUsuario: función callback al seleccionar una fila (usuario)
 *   - onFilteredChange: función callback que recibe el array de usuarios filtrados
 *
 * Estados internos:
 *   - sorting: array → columnas por las que se ordena
 *   - columnFilters: array → filtros aplicados a columnas
 *   - expandedRows: objeto → mapea id_prestamo a booleano para saber si la fila está expandida
 *   - selectedId: id del usuario seleccionado
 *
 * Funciones principales:
 *   - toggleRow(id): expande o colapsa la fila de detalle
 *   - handleRowClick(usuario): selecciona la fila y llama a onSelectUsuario
 *   - toggleExpandClick(id, e): evita propagación del click y expande/colapsa fila
 *
 * React Table:
 *   - Se usa useReactTable con:
 *       - getCoreRowModel
 *       - getPaginationRowModel
 *       - getSortedRowModel
 *       - getFilteredRowModel
 *   - Se sincroniza sorting y columnFilters en el estado
 *   - Se habilita selección de fila (single row)
 *
 * Filtrado:
 *   - Select para curso → filtra columna "curso"
 *   - Input para nombre → filtra columna "nombreUsuario"
 *   - Se notifica a onFilteredChange con los resultados filtrados
 *
 * Render:
 *   - Cabecera con filtros
 *   - Tabla con:
 *       - Fila principal: nombre alumno, documento compromiso, curso
 *       - Fila expandida: detalle de libros con columnas "Entregado" y "Devuelto"
 *         usando iconos Check (verde) o X (rojo)
 *   - Paginación con botones (primera, anterior, siguiente, última)
 *   - Total de registros filtrados
 *   - Acciones dinámicas según usuario seleccionado
 *
 */

import { useState, Fragment, useEffect } from "react";
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
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
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Check,
  X,
} from "lucide-react";

export function TablaPrestamos({
  columns,
  data,
  informes,
  acciones,
  onSelectUsuario,
  onFilteredChange, // <-- agregamos prop
}) {
  const [sorting, setSorting] = useState([
    { id: "nombreUsuario", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
    enableRowSelection: true,
    enableMultiRowSelection: false,
    initialState: { pagination: { pageIndex: 0, pageSize: 15 } },
  });

  // --- efecto para enviar filas filtradas ---
  useEffect(() => {
    const filtered = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    onFilteredChange?.(filtered);
  }, [table.getFilteredRowModel().rows]);

  const toggleRow = (id) =>
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  const handleRowClick = (usuario) => {
    setSelectedId(usuario.id_prestamo);
    onSelectUsuario?.(usuario);
  };
  const toggleExpandClick = (id, e) => {
    e.stopPropagation();
    toggleRow(id);
  };

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const cursosUnicos = Array.from(
    new Set(data.map((p) => p.curso).filter(Boolean))
  ).sort();

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 py-2 text-sm text-muted-foreground items-end">
        <div className="space-y-1">
          <label className="block font-medium text-xs">Curso</label>
          <select
            className="border p-2 rounded text-sm"
            onChange={(e) =>
              table
                .getColumn("curso")
                ?.setFilterValue(e.target.value || undefined)
            }
          >
            <option value="">Todos</option>
            {cursosUnicos.map((curso) => (
              <option key={curso} value={curso}>
                {curso}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block font-medium text-xs">Alumno</label>
          <input
            type="text"
            className="border p-2 rounded text-sm"
            placeholder="Buscar por nombre"
            onChange={(e) =>
              table.getColumn("nombreUsuario")?.setFilterValue(e.target.value)
            }
          />
        </div>

        {informes && <div className="ml-auto">{informes}</div>}
      </div>

      {/* Tabla */}
      <div className="rounded-md border mt-4">
        <Table>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="h-6">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="py-1 px-2">
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

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const usuario = row.original;
                const isExpanded = expandedRows[usuario.id_prestamo] || false;

                return (
                  <Fragment key={usuario.id_prestamo}>
                    <TableRow
                      className={`h-6 cursor-pointer ${
                        selectedId === usuario.id_prestamo ? "bg-blue-100" : ""
                      } hover:bg-gray-200`}
                      onClick={() => handleRowClick(usuario)}
                    >
                      {/* 1ª columna: expandir/colapsar */}
                      <TableCell className="w-10 text-center py-1 px-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-0 w-5 h-5"
                          onClick={(e) =>
                            toggleExpandClick(usuario.id_prestamo, e)
                          }
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </Button>
                      </TableCell>

                      {/* 2ª columna: Alumno*/}
                      <TableCell className="py-1 px-2">
                        {usuario.nombreUsuario}
                      </TableCell>

                      {/* 3ª columna: Doc compromiso */}
                      <TableCell className="py-1 px-2">
                        {usuario.doc_compromiso === 1
                          ? "Entregado"
                          : usuario.doc_compromiso === 2
                            ? "Recibido"
                            : ""}
                      </TableCell>

                      {/* 4ª columna: Curso */}
                      <TableCell className="py-1 px-2">
                        {usuario.curso}
                      </TableCell>
                    </TableRow>

                    {/* Filas expandidas */}
                    {isExpanded && (
                      <Fragment>
                        <TableRow className="bg-gray-100 font-semibold h-5">
                          <TableCell className="py-1 px-2"></TableCell>
                          <TableCell className="pl-10 py-1 px-2">
                            Libro
                          </TableCell>
                          <TableCell className="text-center py-1 px-2">
                            Entregado
                          </TableCell>
                          <TableCell className="text-center py-1 px-2">
                            Devuelto
                          </TableCell>
                          <TableCell className="py-1 px-2"></TableCell>
                        </TableRow>
                        {usuario.prestamos.map((item) => (
                          <TableRow
                            key={item.id_item}
                            className="bg-gray-50 h-5"
                          >
                            <TableCell className="py-1 px-2"></TableCell>
                            <TableCell className="pl-10 py-1 px-2">
                              {item.libro}
                            </TableCell>

                            {/* Columna ENTREGADO */}
                            <TableCell className="text-center py-1 px-2">
                              {item.entregado ? (
                                <Check className="text-green-600 w-3 h-3 mx-auto" />
                              ) : (
                                <X className="text-red-600 w-3 h-3 mx-auto" />
                              )}
                            </TableCell>

                            {/* Columna DEVUELTO */}
                            <TableCell className="text-center py-1 px-2">
                              {item.devuelto ? (
                                <Check className="text-green-600 w-3 h-3 mx-auto" />
                              ) : (
                                <X className="text-red-600 w-3 h-3 mx-auto" />
                              )}
                            </TableCell>

                            <TableCell className="py-1 px-2"></TableCell>
                          </TableRow>
                        ))}
                      </Fragment>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-12 text-center"
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
        <div className="flex gap-2">
          {acciones &&
            acciones(
              selectedId ? data.find((u) => u.id_prestamo === selectedId) : null
            )}
        </div>
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
