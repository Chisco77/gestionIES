/**
 * DialogoAsuntosRestricciones.jsx - Diálogo para las restricciones aplicables a asuntos propios
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
 * Componente que muestra un cuadro de diálogo para establecer restricciones
 * para la petición de días de asuntos propios.
 *
 */


import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export function DialogoAsuntosRestricciones() {
  const location = useLocation()
  const API_URL = import.meta.env.VITE_API_URL

  const [open, setOpen] = useState(true)
  const [restricciones, setRestricciones] = useState({
    asuntosDisponibles: 0,
    maxPorDia: 0,
    antelacionMinima: 0,
    maxConsecutivos: 0,
    ofuscar: false,
  })

  // Reabrir modal al llegar a esta ruta
  useEffect(() => {
    setOpen(true)
    if (open) fetchRestricciones()
  }, [location.key])

  // Cargar valores del backend
  const fetchRestricciones = async () => {
    try {
      const res = await fetch(`${API_URL}/db/restricciones`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Error al obtener restricciones de asuntos propios")
      const data = await res.json()

      const map = {
        dias: "asuntosDisponibles",
        concurrentes: "maxPorDia",
        antelacion: "antelacionMinima",
        consecutivos: "maxConsecutivos",
        ofuscar: "ofuscar",
      }

      const newState = { ...restricciones }
      data.forEach((r) => {
        if (r.restriccion === "asuntos" && map[r.descripcion]) {
          if (r.descripcion === "ofuscar") {
            newState[map[r.descripcion]] = r.valor_bool
          } else {
            newState[map[r.descripcion]] = r.valor_num
          }
        }
      })
      setRestricciones(newState)
    } catch (err) {
      console.error(err)
      toast.error("No se pudieron cargar las restricciones de asuntos propios")
    }
  }

  const handleChange = (field, value) => {
    setRestricciones((prev) => ({ ...prev, [field]: value }))
  }

  const handleGuardar = async () => {
    try {
      const res = await fetch(`${API_URL}/db/restricciones/asuntos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(restricciones),
      })
      if (!res.ok) throw new Error("Error al guardar restricciones")

      toast.success("Restricciones de asuntos propios guardadas correctamente")
      setOpen(false)
    } catch (err) {
      console.error(err)
      toast.error("Error al guardar restricciones de asuntos propios")
    }
  }

  const handleCancelar = () => setOpen(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-lg rounded-2xl border border-border shadow-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Configurar Restricciones
          </DialogTitle>
          <DialogDescription>
            Define los límites y reglas aplicables a las solicitudes de días de asuntos propios.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="space-y-5 pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="asuntosDisponibles" className="text-sm font-medium">
                Asuntos propios disponibles
              </Label>
              <Input
                id="asuntosDisponibles"
                type="number"
                value={restricciones.asuntosDisponibles}
                onChange={(e) =>
                  handleChange("asuntosDisponibles", Number(e.target.value))
                }
                className="w-28 text-right"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="maxPorDia" className="text-sm font-medium">
                Máximo de peticiones por día
              </Label>
              <Input
                id="maxPorDia"
                type="number"
                value={restricciones.maxPorDia}
                onChange={(e) =>
                  handleChange("maxPorDia", Number(e.target.value))
                }
                className="w-28 text-right"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="antelacionMinima" className="text-sm font-medium">
                Antelación mínima (días)
              </Label>
              <Input
                id="antelacionMinima"
                type="number"
                value={restricciones.antelacionMinima}
                onChange={(e) =>
                  handleChange("antelacionMinima", Number(e.target.value))
                }
                className="w-28 text-right"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="maxConsecutivos" className="text-sm font-medium">
                Máximo de días consecutivos
              </Label>
              <Input
                id="maxConsecutivos"
                type="number"
                value={restricciones.maxConsecutivos}
                onChange={(e) =>
                  handleChange("maxConsecutivos", Number(e.target.value))
                }
                className="w-28 text-right"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="ofuscar" className="text-sm font-medium">
                Ofuscar nombres en el calendario
              </Label>
              <Switch
                id="ofuscar"
                checked={restricciones.ofuscar}
                onCheckedChange={(checked) => handleChange("ofuscar", checked)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" onClick={handleCancelar}>
                Cancelar
              </Button>
              <Button onClick={handleGuardar}>Guardar</Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
