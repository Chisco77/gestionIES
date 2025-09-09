/*import {
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

export function TablaPrestamos({
  columns,
  data,
  onFilteredChange,
  informes,
  acciones,
}) {
  const [sorting, setSorting] = useState([{ id: "nombreUsuario", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [textoFiltro, setTextoFiltro] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");

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

  useEffect(() => {
    table.getColumn("nombreUsuario")?.setFilterValue(textoFiltro);
  }, [textoFiltro]);

  useEffect(() => {
    table.getColumn("curso")?.setFilterValue(filtroCurso || undefined);
  }, [filtroCurso]);

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

  const cursosUnicos = Array.from(
    new Set(data.map((p) => p.curso).filter(Boolean))
  ).sort();

  return (
    <div>
      <div className="flex flex-wrap gap-4 py-2 text-sm text-muted-foreground items-end">
        <div className="space-y-1">
          <label className="block font-medium text-xs">Curso</label>
          <select
            className="border p-2 rounded text-sm"
            value={filtroCurso}
            onChange={(e) => setFiltroCurso(e.target.value)}
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
            value={textoFiltro}
            onChange={(e) => setTextoFiltro(e.target.value)}
          />
        </div>
        {informes && <div className="ml-auto">{informes}</div>}
      </div>
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
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => row.toggleSelected()}
                  className="cursor-pointer"
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
*/

import { useState, Fragment } from "react";
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
import { ChevronDown, ChevronRight } from "lucide-react";

export function TablaPrestamos({
  columns,
  data,
  onFilteredChange,
  informes,
  acciones,
}) {
  const [sorting, setSorting] = useState([
    { id: "nombreUsuario", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [textoFiltro, setTextoFiltro] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");
  const [expandedRows, setExpandedRows] = useState({}); // { [id_prestamo]: true/false }
  const [selectedId, setSelectedId] = useState(null);


  // Para avisar al padre del usuario que se selecciona
  const handleRowClick = (usuario) => {
    // Toggle selección
    setSelectedId(usuario.id_prestamo);
    onSelectUsuario?.(usuario); // Avisamos al padre
    toggleRow(usuario.id_prestamo); // expand/collapse
  };
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    enableRowSelection: true,
    enableMultiRowSelection: false,
  });

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
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
            value={filtroCurso}
            onChange={(e) => setFiltroCurso(e.target.value)}
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
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Nombre Usuario</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Nº Libros</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const usuario = row.original;
                const isExpanded = expandedRows[usuario.id_prestamo] || false;

                return (
                  <Fragment key={usuario.id_prestamo}>
                    <TableRow
                      className={`cursor-pointer ${selectedId === usuario.id_prestamo ? "bg-blue-100" : "bg-gray-100"} hover:bg-gray-200`}
                      onClick={() => handleRowClick(usuario)}
                    >
                      <TableCell className="w-10 text-center">
                        <Button variant="ghost" size="icon">
                          {isExpanded ? <ChevronDown /> : <ChevronRight />}
                        </Button>
                      </TableCell>
                      <TableCell>{usuario.nombreUsuario}</TableCell>
                      <TableCell>{usuario.curso}</TableCell>
                      <TableCell>{usuario.prestamos.length}</TableCell>
                    </TableRow>

                    {isExpanded &&
                      usuario.prestamos.map((item) => (
                        <TableRow key={item.id_item} className="bg-gray-50">
                          <TableCell></TableCell>
                          <TableCell className="pl-10">{item.libro}</TableCell>
                          <TableCell>{item.devuelto ? "Sí" : "No"}</TableCell>
                          <TableCell>
                            {item.fechaentrega || "-"} /{" "}
                            {item.fechadevolucion || "-"}
                          </TableCell>
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

      {/* Acciones + paginación */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-center py-6 space-y-4 sm:space-y-0">
        <div className="flex gap-2">
          {acciones && acciones(table.getSelectedRowModel().rows[0]?.original)}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronRight className="w-4 h-4" />
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
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Total de registros: {table.getFilteredRowModel().rows.length}
        </div>
      </div>
    </div>
  );
}
