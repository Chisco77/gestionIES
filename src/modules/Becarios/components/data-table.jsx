import logo from '/src/images/logo.jpg';
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

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from "lucide-react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multiselect";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import jsPDF from "jspdf";

export function DataTable({ columns, data }) {
  const [showMesDialog, setShowMesDialog] = useState(false);
  const [mesSeleccionado, setMesSeleccionado] = useState("Enero");
  const [nombreArchivoMes, setNombreArchivoMes] = useState("nombre de archivo");

  const [sorting, setSorting] = useState([
    { id: "grupo", desc: false }
  ]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [columnFilters, setColumnFilters] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [etiquetasPorAlumno, setEtiquetasPorAlumno] = useState("1");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("2024-25");
  const [nombrePdf, setNombrePdf] = useState("etiquetasbecarios");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const getUniqueValues = (columnId) =>
    Array.from(new Set(data.map((row) => row[columnId])))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

  const generatePdfLabels = async (cantidad, cursoTexto, setProgress, fileName) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const labelWidth = 52.5;
    const labelHeight = 29.7;
    const cols = 4;
    const rows = 10;
    const labelsPerPage = cols * rows;

    const alumnos = table.getFilteredRowModel().rows.map((row) => row.original);
    const logoWidth = 18;
    const logoHeight = 8;

    const image = await new Promise((resolve) => {
      const img = new Image();
      img.src = logo;
      img.onload = () => resolve(img);
    });

    let etiquetas = [];
    alumnos.forEach((alumno) => {
      for (let i = 0; i < cantidad; i++) {
        etiquetas.push(alumno);
      }
    });

    const total = etiquetas.length;

    for (let i = 0; i < total; i++) {
      const alumno = etiquetas[i];
    
      if (i > 0 && i % labelsPerPage === 0) {
        doc.addPage();
      }
    
      const indexInPage = i % labelsPerPage;
      const col = indexInPage % cols;
      const row = Math.floor(indexInPage / cols);
    
      const x = col * labelWidth;
      const y = row * labelHeight;
      const centerX = x + labelWidth / 2;
      const logoX = centerX - logoWidth / 2;
      const logoY = y + 3;
    
      doc.addImage(image, "JPEG", logoX, logoY, logoWidth, logoHeight);
    
      let nombreCompleto = `${alumno.nombre} ${alumno.apellido1} ${alumno.apellido2}`;
      if (nombreCompleto.length > 25) {
        nombreCompleto = nombreCompleto.slice(0, 22) + '…';
      }
    
      doc.setFontSize(9);
      doc.text(nombreCompleto, centerX, y + 15, { align: "center" });
    
      doc.setFontSize(8);
      doc.text(`Curso: ${alumno.grupo} - ${cursoTexto}`, centerX, y + 21, { align: "center" });
    
      // Forzar renderizado de la barra de progreso
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    
      setProgress(Math.round(((i + 1) / total) * 100));
    }
    

    doc.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
  };

  // Efecto para ocultar el toast automáticamente tras 3 segundos
  useEffect(() => {
    if (showSuccessToast) {
      const timeout = setTimeout(() => setShowSuccessToast(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showSuccessToast]);


// dentro del componente DataTable, antes del return:
useEffect(() => {
  console.log("showMesDialog cambiado a", showMesDialog);
}, [showMesDialog]);


  return (
    <div>
      <div className="mb-4">
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>Generar etiquetas PDF</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configuración de etiquetas</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Número de etiquetas por alumno
                </label>
                <Select value={etiquetasPorAlumno} onValueChange={setEtiquetasPorAlumno}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(12)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Curso académico</label>
                <Select value={cursoSeleccionado} onValueChange={setCursoSeleccionado}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 11 }).map((_, i) => {
                      const yearStart = 2020 + i;
                      const value = `${yearStart}-${(yearStart + 1).toString().slice(2)}`;
                      return (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre del archivo PDF</label>
                <Input
                  type="text"
                  value={nombrePdf}
                  onChange={(e) => setNombrePdf(e.target.value)}
                  placeholder="Ejemplo: etiquetas_2025"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  No es necesario añadir extensión .pdf, se añadirá automáticamente.
                </p>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                disabled={loading || nombrePdf.trim() === ""}
                onClick={async () => {
                  setShowDialog(false);
                  setLoading(true);
                  setProgress(0);
                  setShowSuccessToast(false);
                  try {
                    await generatePdfLabels(Number(etiquetasPorAlumno), cursoSeleccionado, setProgress, nombrePdf.trim());
                    setShowSuccessToast(true);
                  } finally {
                    setLoading(false);
                    setProgress(0);
                  }
                }}
              >
                {loading ? "Generando..." : "Confirmar y generar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

<Dialog open={showMesDialog} onOpenChange={setShowMesDialog}>
  <DialogTrigger asChild>
    <Button variant="secondary">Abrir formulario de mes</Button>
  </DialogTrigger>

   <DialogContent
    className="opacity-100 duration-200 transition-opacity bg-white"
    onInteractOutside={(e) => e.preventDefault()}
  >
    <DialogHeader>
      <DialogTitle>Seleccionar mes y nombre de archivo</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Mes</label>
        <Select value={mesSeleccionado} onValueChange={setMesSeleccionado}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar mes" />
          </SelectTrigger>
          <SelectContent>
            {[
              "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
              "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ].map((mes) => (
              <SelectItem key={mes} value={mes}>
                {mes}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nombre del archivo</label>
        <Input
          type="text"
          value={nombreArchivoMes}
          onChange={(e) => setNombreArchivoMes(e.target.value)}
          placeholder="nombre de archivo"
        />
      </div>
    </div>

    <DialogFooter className="pt-4">
      <Button onClick={() => setShowMesDialog(false)}>
        Confirmar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


        {loading && (
          <div className="my-4 w-full">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue-600 h-4 transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-center text-sm mt-2 text-gray-700">
              Generando etiquetas... {progress}%
            </div>
          </div>
        )}

        {showSuccessToast && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out">
            PDF generado con éxito
          </div>
        )}

      </div>

      <div className="flex flex-wrap items-center gap-4 py-4">
        {/* Grupo con selección múltiple */}
        <div>
          <label className="text-sm font-medium block mb-1">Grupo</label>
          <MultiSelect
            values={table.getColumn("grupo")?.getFilterValue() ?? []}
            onChange={(value) => table.getColumn("grupo")?.setFilterValue(value)}
            options={getUniqueValues("grupo").map((g) => ({ value: g, label: g }))}
            placeholder="Seleccionar grupos"
          />
        </div>

        {/* Apellidos (texto libre) */}
        <div>
          <label className="text-sm font-medium block mb-1">Apellidos</label>
          <Input
            placeholder="Buscar apellidos..."
            value={table.getColumn("apellidos")?.getFilterValue() ?? ""}
            onChange={(e) =>
              table.getColumn("apellidos")?.setFilterValue(e.target.value)
            }
            className="w-[200px]"
          />
        </div>

        {/* Becario (sí/no) */}
        <div>
          <label className="text-sm font-medium block mb-1">Becario</label>
          <MultiSelect
            values={[String(table.getColumn("becario")?.getFilterValue() ?? "")].filter(Boolean)}
            onChange={(value) =>
              table.getColumn("becario")?.setFilterValue(
                value.length === 0 ? undefined : value.includes("true")
              )
            }
            options={[
              { value: "true", label: "Sí" },
              { value: "false", label: "No" },
            ]}
            placeholder="Seleccionar"
          />
        </div>
      </div>

      <div className="rounded-md border">
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
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-sm">
          Total de registros: {table.getFilteredRowModel().rows.length} | Página {currentPage} de {totalPages}
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-4 h-4" />
            <span className="sr-only">Primera página</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="sr-only">Anterior</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
            <span className="sr-only">Siguiente</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-4 h-4" />
            <span className="sr-only">Última página</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
