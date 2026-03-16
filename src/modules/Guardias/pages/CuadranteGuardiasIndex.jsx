import { useState, useMemo } from "react";
import { useProfesoresLdap } from "@/hooks/useProfesoresLdap";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, X, Wand2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { Button } from "@/components/ui/button";

const dias = ["L", "M", "X", "J", "V"];

export function CuadranteGuardiasIndex() {
  const { data: profesores = [], isLoading } = useProfesoresLdap();
  const { data: periodos = [], isLoading: loadingPeriodos } =
    usePeriodosHorarios();

  const [busqueda, setBusqueda] = useState("");
  const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);
  const [celdaHover, setCeldaHover] = useState(null);
  const [guardias, setGuardias] = useState({});
  const [numPorHora, setNumPorHora] = useState(3);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const profesoresFiltrados = useMemo(() => {
    return profesores.filter((p) =>
      `${p.givenName ?? ""} ${p.sn ?? ""}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [busqueda, profesores]);

  function nombreProfesor(p) {
    return `${p.givenName ?? ""} ${p.sn ?? ""}`.trim();
  }

  function claveCelda(hIndex, dIndex) {
    return `${hIndex}-${dIndex}`;
  }

  function handleDrop(e, hIndex, dIndex) {
    e.preventDefault();
    const profesor = JSON.parse(e.dataTransfer.getData("profesor"));
    const clave = claveCelda(hIndex, dIndex);

    setGuardias((prev) => {
      const lista = prev[clave] || [];
      if (lista.find((p) => p.uid === profesor.uid)) return prev;
      return { ...prev, [clave]: [...lista, profesor] };
    });

    setCeldaHover(null); // Limpiar resaltado al soltar
  }

  function eliminarProfesor(clave, uid) {
    setGuardias((prev) => ({
      ...prev,
      [clave]: prev[clave].filter((p) => p.uid !== uid),
    }));
  }

  function limpiarCuadrante() {
    setGuardias({});
  }

  function asignacionAutomaticaCustom(cantidad) {
    const nuevo = {};

    // Copia y mezcla aleatoria de profesores
    const profesoresAleatorios = [...profesores];
    for (let i = profesoresAleatorios.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [profesoresAleatorios[i], profesoresAleatorios[j]] = [
        profesoresAleatorios[j],
        profesoresAleatorios[i],
      ];
    }

    let indiceProfesor = 0;

    periodos.forEach((_, hIndex) => {
      dias.forEach((_, dIndex) => {
        const clave = claveCelda(hIndex, dIndex);
        const asignados = [];

        for (let i = 0; i < cantidad; i++) {
          const profesor =
            profesoresAleatorios[indiceProfesor % profesoresAleatorios.length];
          asignados.push(profesor);
          indiceProfesor++;
        }

        nuevo[clave] = asignados;
      });
    });

    setGuardias(nuevo);
  }

  if (isLoading || loadingPeriodos) return <div>Cargando datos...</div>;

  return (
    <div className="container mx-auto py-10 p-12">
      <div className="grid grid-cols-[350px_1fr] gap-6">
        {/* PANEL IZQUIERDO: PROFESORES */}
        <Card>
          <CardHeader>
            <CardTitle>Profesores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar profesor..."
                className="pl-8"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[750px] pr-3">
              <div className="space-y-2">
                {profesoresFiltrados.map((profesor) => (
                  <div
                    key={profesor.uid}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData(
                        "profesor",
                        JSON.stringify(profesor)
                      )
                    }
                    className="cursor-grab rounded-lg bg-blue-400 text-white px-3 py-2 text-sm shadow-sm hover:bg-blue-600 active:cursor-grabbing active:scale-[0.98] transition"
                  >
                    {nombreProfesor(profesor)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* PANEL DERECHO: CUADRANTE + BOTONES ARRIBA */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle>Cuadrante de guardias</CardTitle>

            {/* BOTONES ARRIBA A LA DERECHA */}
            <div className="flex gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    Asignar automático
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="sm:max-w-[400px]"
                  onInteractOutside={(e) => e.preventDefault()}
                >
                  <DialogHeader>
                    <DialogTitle>Asignación automática</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-2 py-2">
                    <Label htmlFor="numPorHora">Profesores por hora</Label>
                    <Input
                      id="numPorHora"
                      type="number"
                      min={1}
                      value={numPorHora}
                      onChange={(e) => setNumPorHora(Number(e.target.value))}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        asignacionAutomaticaCustom(numPorHora);
                        setDialogOpen(false);
                      }}
                    >
                      Asignar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Botón Limpiar con AlertDialog */}
              <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex-1 flex items-center gap-2 bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Limpiar
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent className="sm:max-w-[400px]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar limpieza</AlertDialogTitle>
                  </AlertDialogHeader>
                  <div className="py-2">
                    ¿Estás seguro de que quieres limpiar todos los datos de la
                    tabla de guardias?
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <Button
                      onClick={() => {
                        limpiarCuadrante();
                        setAlertOpen(false);
                      }}
                    >
                      Confirmar
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-[110px_repeat(5,1fr)]">
              <div />
              {dias.map((d) => (
                <div
                  key={d}
                  className="border text-center font-medium py-2 bg-muted"
                >
                  {d}
                </div>
              ))}

              {periodos.map((periodo, hIndex) => (
                <div key={periodo.id} className="contents">
                  <div className="border text-center py-3 font-medium bg-muted text-sm">
                    <div>{periodo.nombre}</div>
                    <div className="text-xs text-muted-foreground">
                      {periodo.inicio} - {periodo.fin}
                    </div>
                  </div>

                  {dias.map((dia, dIndex) => {
                    const clave = claveCelda(hIndex, dIndex);
                    const profesoresCelda = guardias[clave] || [];
                    const seleccionada = celdaSeleccionada === clave;

                    return (
                      <div
                        key={clave}
                        onClick={() => setCeldaSeleccionada(clave)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setCeldaHover(clave);
                        }}
                        onDragLeave={() => setCeldaHover(null)}
                        onDrop={(e) => handleDrop(e, hIndex, dIndex)}
                        className={cn(
                          "border min-h-[100px] p-2 cursor-pointer transition",
                          seleccionada && "bg-blue-50 border-blue-400",
                          celdaHover === clave && "bg-blue-100 border-blue-500"
                        )}
                      >
                        <div className="flex flex-col gap-1">
                          {profesoresCelda.map((p) => (
                            <div
                              key={p.uid}
                              className="flex items-center justify-between text-xs rounded-lg bg-blue-400 text-white px-2 py-1 shadow-sm"
                            >
                              {nombreProfesor(p)}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  eliminarProfesor(clave, p.uid);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
