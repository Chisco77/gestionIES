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
  });

  // --- NUEVO: efecto para enviar filas filtradas ---
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
  console.log(data);
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

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const usuario = row.original;
                const isExpanded = expandedRows[usuario.id_prestamo] || false;

                return (
                  <Fragment key={usuario.id_prestamo}>
                    <TableRow
                      className={`cursor-pointer ${
                        selectedId === usuario.id_prestamo ? "bg-blue-100" : ""
                      } hover:bg-gray-200`}
                      onClick={() => handleRowClick(usuario)}
                    >
                      {/* 1ª columna: expandir/colapsar */}
                      <TableCell className="w-10 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) =>
                            toggleExpandClick(usuario.id_prestamo, e)
                          }
                        >
                          {isExpanded ? <ChevronDown /> : <ChevronRight />}
                        </Button>
                      </TableCell>

                      {/* 2ª columna: Alumno */}
                      <TableCell>{usuario.nombreUsuario}</TableCell>

                      {/* 3ª columna: Doc compromiso */}
                      <TableCell>
                        {usuario.doc_compromiso === 1
                          ? "Entregado"
                          : usuario.doc_compromiso === 2
                            ? "Recibido"
                            : ""}
                      </TableCell>

                      {/* 4ª columna: Curso */}
                      <TableCell>{usuario.curso}</TableCell>
                    </TableRow>

                    {/* Filas expandidas */}
                    {isExpanded &&
                      usuario.prestamos.map((item) => (
                        <TableRow key={item.id_item} className="bg-gray-50">
                          <TableCell></TableCell>
                          <TableCell className="pl-10">{item.libro}</TableCell>

                          {/* Nueva columna ENTREGADO */}
                          <TableCell className="text-center">
                            {item.entregado ? (
                              <Check className="text-green-600 w-4 h-4 mx-auto" />
                            ) : (
                              <X className="text-red-600 w-4 h-4 mx-auto" />
                            )}
                          </TableCell>

                          {/* Columna DEVUELTO */}
                          <TableCell className="text-center">
                            {item.devuelto ? (
                              <Check className="text-green-600 w-4 h-4 mx-auto" />
                            ) : (
                              <X className="text-red-600 w-4 h-4 mx-auto" />
                            )}
                          </TableCell>

                          <TableCell></TableCell>
                        </TableRow>
                      ))}
                  </Fragment>
                );
              })
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
