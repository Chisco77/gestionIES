import { useState, useMemo } from "react";
import { useProfesoresActivos } from "@/hooks/useProfesoresActivos";
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

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const dias = ["L", "M", "X", "J", "V"];

export function CuadranteGuardiasIndex() {
  const { data: profesores = [], isLoading } = useProfesoresActivos();
  const { data: periodos = [], isLoading: loadingPeriodos } =
    usePeriodosHorarios();

  const [busqueda, setBusqueda] = useState("");
  const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);
  const [celdaHover, setCeldaHover] = useState(null);
  const [guardias, setGuardias] = useState({});
  const [numPorHora, setNumPorHora] = useState(3);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [numPorCelda, setNumPorCelda] = useState({});
  const [autoDialogOpen, setAutoDialogOpen] = useState(false);

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

  function getNumGuardiasCelda(clave) {
    return numPorCelda[clave] ?? numPorHora;
  }

  //
  //Evitar que el mismo profesor esté dos horas consecutivas.
  //
  //Evitar que el mismo profesor se repita en el mismo día.
  //
  function asignacionAutomaticaCustom() {
    if (!profesores.length) {
      console.warn("⚠️ No hay profesores cargados");
      return;
    }

    const nuevo = {};

    // Mezcla aleatoria de profesores
    const profesoresAleatorios = [...profesores];
    for (let i = profesoresAleatorios.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [profesoresAleatorios[i], profesoresAleatorios[j]] = [
        profesoresAleatorios[j],
        profesoresAleatorios[i],
      ];
    }

    dias.forEach((_, dIndex) => {
      const usadosEnDia = new Set(); // Profesores ya asignados en este día
      const ultimoAsignadoHora = {}; // Para evitar consecutivas

      periodos.forEach((_, hIndex) => {
        const clave = claveCelda(hIndex, dIndex);
        const cantidad = Math.max(0, getNumGuardiasCelda(clave));

        console.log(`📍 Celda ${clave} → necesita ${cantidad}`);

        const asignados = [];

        for (let i = 0; i < cantidad; i++) {
          let intentos = 0;
          let profesor = null;

          while (intentos < profesoresAleatorios.length) {
            const candidato =
              profesoresAleatorios[
                (i + hIndex + dIndex + intentos) % profesoresAleatorios.length
              ];

            // 👉 No repetir en el mismo día y no en hora consecutiva
            if (
              !usadosEnDia.has(candidato.uid) &&
              ultimoAsignadoHora[hIndex - 1] !== candidato.uid
            ) {
              profesor = candidato;
              break;
            }

            intentos++;
          }

          // fallback si no hay disponible
          if (!profesor) {
            profesor =
              profesoresAleatorios[
                (i + hIndex + dIndex) % profesoresAleatorios.length
              ];
          }

          if (profesor) {
            asignados.push(profesor);
            usadosEnDia.add(profesor.uid);
            ultimoAsignadoHora[hIndex] = profesor.uid;
          }
        }

        console.log(
          `✅ Celda ${clave} asignados:`,
          asignados.map((p) => nombreProfesor(p))
        );

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
            <div className="flex items-center gap-2">
              {/* INPUT GLOBAL */}
              <div className="flex items-center gap-2">
                <Label className="text-sm">Guardias/hora</Label>
                <Input
                  type="number"
                  min={1}
                  value={numPorHora}
                  onChange={(e) => setNumPorHora(Number(e.target.value))}
                  className="w-20"
                />
              </div>

              {/* BOTÓN ASIGNAR */}
              <AlertDialog
                open={autoDialogOpen}
                onOpenChange={setAutoDialogOpen}
              >
                {" "}
                <AlertDialogTrigger asChild>
                  <Button
                    className="flex items-center gap-2"
                    onClick={() => setAutoDialogOpen(true)}
                  >
                    <Wand2 className="h-4 w-4" />
                    Asignar automático
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-[400px]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Asignación automática</AlertDialogTitle>
                  </AlertDialogHeader>

                  <div className="py-2 text-sm">
                    Se realizará una asignación automática de guardias usando:
                    <ul className="list-disc ml-4 mt-2">
                      <li>Número global: {numPorHora}</li>
                      <li>Configuraciones personalizadas por celda</li>
                      <li>Distribución aleatoria de profesores</li>
                    </ul>
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <Button
                      onClick={() => {
                        asignacionAutomaticaCustom();
                        setAutoDialogOpen(false); // 👈 cerrar automáticamente
                      }}
                    >
                      Confirmar
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
                            "border min-h-[100px] p-2 cursor-pointer transition flex flex-col",
                            seleccionada && "bg-blue-50 border-blue-400",
                            celdaHover === clave &&
                              "bg-blue-100 border-blue-500"
                          )}
                        >
                          {/* HEADER CELDA */}
                          <div className="flex justify-between items-start">
                            <span className="text-xs text-muted-foreground">
                              {profesoresCelda.length}/
                              {getNumGuardiasCelda(clave)}
                            </span>

                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                >
                                  ⚙️
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-40">
                                <div className="space-y-2">
                                  <Label>Nº guardias</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={getNumGuardiasCelda(clave)}
                                    onChange={(e) =>
                                      setNumPorCelda((prev) => ({
                                        ...prev,
                                        [clave]: Number(e.target.value),
                                      }))
                                    }
                                  />

                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full"
                                    onClick={() =>
                                      setNumPorCelda((prev) => {
                                        const copy = { ...prev };
                                        delete copy[clave];
                                        return copy;
                                      })
                                    }
                                  >
                                    Usar global
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* LISTA PROFESORES */}
                          <div className="flex flex-col gap-1 mt-2">
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
