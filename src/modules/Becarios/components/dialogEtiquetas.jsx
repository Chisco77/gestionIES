"use client"

import { useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

export function EtiquetaDialog({ loading, onConfirm }) {
  const [open, setOpen] = useState(false)
  const [etiquetasPorAlumno, setEtiquetasPorAlumno] = useState("1")
  const [cursoSeleccionado, setCursoSeleccionado] = useState("2024-25")
  const [nombrePdf, setNombrePdf] = useState("etiquetasbecarios")

  const handleConfirm = async () => {
    setOpen(false)
    await onConfirm({
      etiquetasPorAlumno: Number(etiquetasPorAlumno),
      cursoSeleccionado,
      nombrePdf: nombrePdf.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogTrigger asChild>
        <Button>Generar etiquetas PDF</Button>
      </DialogTrigger>

      <DialogContent className="bg-white text-black p-6 max-w-md sm:rounded-lg">
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
                  const yearStart = 2020 + i
                  const value = `${yearStart}-${(yearStart + 1).toString().slice(2)}`
                  return (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  )
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
              No es necesario añadir extensión .pdf.
            </p>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button
            disabled={loading || nombrePdf.trim() === ""}
            onClick={handleConfirm}
          >
            {loading ? "Generando..." : "Confirmar y generar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
