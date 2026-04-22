import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eraser, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function TablaGuardias({ columns, data }) {
  const [sorting, setSorting] = useState([{ id: "fecha", desc: true }]);
  const [columnFilters, setColumnFilters] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <Card className="p-4 shadow-none">
        <div className="flex flex-wrap gap-4 items-center">
          <Input
            placeholder="Filtrar por profesor ausente..."
            value={table.getColumn("nombre_ausente")?.getFilterValue() ?? ""}
            onChange={(e) => table.getColumn("nombre_ausente")?.setFilterValue(e.target.value)}
            className="max-w-xs h-9"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.resetColumnFilters()}
          >
            <Eraser className="w-4 h-4 mr-2" /> Limpiar
          </Button>
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se han encontrado registros de guardias.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginación simple */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}