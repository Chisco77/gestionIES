// src/modules/AsuntosPropios/components/AsuntosRestricciones.jsx
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export function AsuntosRestricciones() {
  const location = useLocation()
  const [open, setOpen] = useState(true)

  // Cada vez que llego a esta ruta, reabrir el modal
  useEffect(() => {
    setOpen(true)
  }, [location.key]) // location.key cambia en cada navegación aunque sea la misma ruta

  const [restricciones, setRestricciones] = useState({
    asuntosDisponibles: 0,
    maxPorDia: 0,
    antelacionMinima: 0,
    maxConsecutivos: 0,
    ofuscar: false,
  })

  const handleChange = (field, value) => {
    setRestricciones((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleGuardar = () => {
    console.log("Restricciones guardadas:", restricciones)
    setOpen(false) // cierro modal
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Configurar Restricciones</DialogTitle>
        </DialogHeader>
        <Card className="border-none shadow-none">
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="asuntosDisponibles">
                Asuntos propios disponibles
              </Label>
              <Input
                id="asuntosDisponibles"
                type="number"
                value={restricciones.asuntosDisponibles}
                onChange={(e) =>
                  handleChange("asuntosDisponibles", Number(e.target.value))
                }
                className="w-24"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="maxPorDia">Máximo de peticiones por día</Label>
              <Input
                id="maxPorDia"
                type="number"
                value={restricciones.maxPorDia}
                onChange={(e) =>
                  handleChange("maxPorDia", Number(e.target.value))
                }
                className="w-24"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="antelacionMinima">
                Antelación mínima (días)
              </Label>
              <Input
                id="antelacionMinima"
                type="number"
                value={restricciones.antelacionMinima}
                onChange={(e) =>
                  handleChange("antelacionMinima", Number(e.target.value))
                }
                className="w-24"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="maxConsecutivos">
                Máximo de días consecutivos
              </Label>
              <Input
                id="maxConsecutivos"
                type="number"
                value={restricciones.maxConsecutivos}
                onChange={(e) =>
                  handleChange("maxConsecutivos", Number(e.target.value))
                }
                className="w-24"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="ofuscar">Ofuscar</Label>
              <Switch
                id="ofuscar"
                checked={restricciones.ofuscar}
                onCheckedChange={(checked) =>
                  handleChange("ofuscar", checked)
                }
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleGuardar}>Guardar</Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
