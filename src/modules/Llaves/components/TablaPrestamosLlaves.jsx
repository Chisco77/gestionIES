/**
 * TablaPrestamosLlaves.jsx - Componente de tabla interactiva para préstamos de llaves
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Fecha de creación: 2025
 *
 * Descripción:
 * Tabla reutilizable para mostrar préstamos de llaves.
 * - Filtrado por planta y texto (nombre del profesor o llave)
 * - Selección única de fila
 * - Paginación
 */
/**
 * TablaPrestamosLlaves.jsx - Componente de tabla interactiva para préstamos de llaves
 */
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect, useRef } from "react";
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
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils"; // opcional, si usas cn; si no, elimina

/**
 * TablaPrestamosLlaves.jsx
 * Tabla reutilizable para mostrar préstamos de llaves con filtro por estancia texto
 */

export function TablaPrestamosLlaves({
  columns,
  data,
  onFilteredChange,
  informes,
  acciones,
}) {
  const [columnFilters, setColumnFilters] = useState([]);
  const [textoFiltro, setTextoFiltro] = useState("");
  const [filtroPlanta, setFiltroPlanta] = useState("");
  const [filtroDevuelta, setFiltroDevuelta] = useState("");
  const [filtroEstancia, setFiltroEstancia] = useState(""); // valor seleccionado (exacto) aplicado como filtro
  const [queryEstancia, setQueryEstancia] = useState(""); // texto que escribe el usuario
  const [selectedId, setSelectedId] = useState(null);
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  const [sorting, setSorting] = useState([
    { id: "devuelta", desc: false },
    { id: "fechaEntrega", desc: false },
  ]);

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

  // Aplicar filtros a columnas
  useEffect(() => {
    table.getColumn("profesor")?.setFilterValue(textoFiltro || undefined);
  }, [textoFiltro]);

  useEffect(() => {
    table.getColumn("planta")?.setFilterValue(filtroPlanta || undefined);
  }, [filtroPlanta]);

  useEffect(() => {
    const valor = filtroDevuelta === "" ? undefined : filtroDevuelta === "true";
    table.getColumn("devuelta")?.setFilterValue(valor);
  }, [filtroDevuelta]);

  // Aplicar filtro por estancia (campo nombreEstancia)
  useEffect(() => {
    table.getColumn("nombreEstancia")?.setFilterValue(
      filtroEstancia || undefined
    );
  }, [filtroEstancia]);

  // Comunicar filas filtradas al padre
  useEffect(() => {
    const filtered = table.getFilteredRowModel().rows.map((r) => r.original);
    onFilteredChange?.(filtered);
  }, [columnFilters, data]);

  // Valores únicos para selects
  const plantas = Array.from(new Set(data.map((p) => p.planta).filter(Boolean))).sort();
  const estanciasUnicas = Array.from(
    new Set(data.map((p) => p.nombreEstancia).filter(Boolean))
  ).sort();

  // Sugerencias (filtrado por query, case-insensitive, contains)
  const filteredEstancias = (queryEstancia || "").trim() === ""
    ? estanciasUnicas
    : estanciasUnicas.filter((e) =>
        e.toLowerCase().includes(queryEstancia.trim().toLowerCase())
      );

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (ev) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(ev.target)) {
        setOpenSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const selectedRow = table.getSelectedRowModel().rows[0];
  const selectedItem = selectedRow?.original;

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 py-2 text-sm text-muted-foreground items-end">
        <div className="space-y-1">
          <label className="block font-medium text-xs">Planta</label>
          <select
            className="border p-2 rounded text-sm"
            value={filtroPlanta}
            onChange={(e) => setFiltroPlanta(e.target.value)}
          >
            <option value="">Todas</option>
            {plantas.map((planta, idx) => (
              <option key={idx} value={planta}>
                {planta}
              </option>
            ))}
          </select>
        </div>

        {/* Buscador de Estancia con autocompletado */}
        <div className="space-y-1 relative" ref={suggestionsRef}>
          <label className="block font-medium text-xs">Estancia</label>

          <div className="flex">
            <input
              type="text"
              className="border p-2 rounded text-sm w-[220px]"
              placeholder="Escribe parte del nombre..."
              value={queryEstancia}
              onChange={(e) => {
                setQueryEstancia(e.target.value);
                setOpenSuggestions(true);
              }}
              onFocus={() => setOpenSuggestions(true)}
            />
            <button
              type="button"
              className="ml-2 inline-flex items-center px-3 rounded border text-sm"
              onClick={() => {
                // Si ya hay un filtro seleccionado, limpiarlo; si no, aplicar primer suggestion si existe
                if (filtroEstancia) {
                  setFiltroEstancia("");
                  setQueryEstancia("");
                } else {
                  if (filteredEstancias.length > 0) {
                    setFiltroEstancia(filteredEstancias[0]);
                    setQueryEstancia(filteredEstancias[0]);
                    setOpenSuggestions(false);
                  }
                }
              }}
              title={filtroEstancia ? "Limpiar filtro" : "Seleccionar la primera opción"}
            >
              {filtroEstancia ? "Limpiar" : "OK"}
            </button>
          </div>

          {/* Lista de sugerencias */}
          {openSuggestions && filteredEstancias.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-48 w-[220px] overflow-auto rounded border bg-white shadow-sm">
              {filteredEstancias.map((e) => (
                <li
                  key={e}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center",
                    filtroEstancia === e ? "bg-gray-100" : ""
                  )}
                  onClick={() => {
                    setFiltroEstancia(e);
                    setQueryEstancia(e);
                    setOpenSuggestions(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", filtroEstancia === e ? "opacity-100" : "opacity-0")} />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Mensaje si no hay coincidencias */}
          {openSuggestions && filteredEstancias.length === 0 && (
            <div className="absolute z-20 mt-1 w-[220px] rounded border bg-white p-2 text-sm text-muted-foreground">
              No se encontraron estancias.
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="block font-medium text-xs">Buscar</label>
          <input
            type="text"
            className="border p-2 rounded text-sm"
            placeholder="Profesor"
            value={textoFiltro}
            onChange={(e) => setTextoFiltro(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block font-medium text-xs">Devuelta</label>
          <select
            className="border p-2 rounded text-sm"
            value={filtroDevuelta}
            onChange={(e) => setFiltroDevuelta(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
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
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const rowClass = `${!row.original.devuelta ? "bg-red-100 border border-red-300" : ""} cursor-pointer hover:bg-gray-100 transition-colors ${row.getIsSelected() ? "bg-blue-100" : ""}`;

                return (
                  <TableRow
                    key={row.id}
                    className={rowClass}
                    onClick={() => {
                      row.toggleSelected();
                      setSelectedId(row.original.id);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Acciones + paginación */}
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
