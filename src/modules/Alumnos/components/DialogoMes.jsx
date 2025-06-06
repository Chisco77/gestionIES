import { useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function DialogoMes() {
  const [open, setOpen] = useState(false)
  const [mes, setMes] = useState("Enero")
  const [nombreArchivo, setNombreArchivo] = useState("nombre de archivo")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Abrir formulario de mes</Button>
      </DialogTrigger>

<DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Seleccionar mes y nombre de archivo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Mes</label>
            <Select value={mes} onValueChange={setMes}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ].map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nombre del archivo</label>
            <Input
              type="text"
              value={nombreArchivo}
              onChange={(e) => setNombreArchivo(e.target.value)}
              placeholder="nombre de archivo"
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={() => setOpen(false)}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
