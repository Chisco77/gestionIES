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
import { getCursoActual } from "@/utils/fechasHoras";

import { useEffect } from "react";

const dias = ["L", "M", "X", "J", "V"];

export function CuadranteGuardiasIndex() {
  const { data: profesores = [], isLoading } = useProfesoresActivos();
  const { data: periodos = [], isLoading: loadingPeriodos } =
    usePeriodosHorarios();
  const API_URL = import.meta.env.VITE_API_URL;

  const [busqueda, setBusqueda] = useState("");
  const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);
  const [celdaHover, setCeldaHover] = useState(null);
  const [guardias, setGuardias] = useState({});
  const [guardiasTotales, setGuardiasTotales] = useState({});

  const [numPorHora, setNumPorHora] = useState(3);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [numPorCelda, setNumPorCelda] = useState({});
  const [autoDialogOpen, setAutoDialogOpen] = useState(false);
  const [cargandoCuadrante, setCargandoCuadrante] = useState(true);

  const [horarioProfesores, setHorarioProfesores] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState({});

  const [maxGuardiasSemana, setMaxGuardiasSemana] = useState(5);

  const profesoresFiltrados = useMemo(() => {
    return profesores.filter((p) =>
      `${p.givenName ?? ""} ${p.sn ?? ""}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [busqueda, profesores]);

  useEffect(() => {
    async function cargarCuadrante() {
      try {
        const curso = getCursoActual().label;
        const resp = await fetch(
          `${API_URL}/db/horario-profesorado/enriquecido?curso_academico=${curso}`
        );
        const data = await resp.json();
        if (!data.ok) throw new Error(data.error || "Error desconocido");

        // Mapear a la estructura { "idperiodo-dia": [profesor,...] }
        // Filtrar solo guardias (esto SÍ es correcto aquí)
        const guardiasFiltradas = data.horario.filter(
          (r) => r.tipo === "guardia"
        );

        // Mapear a la estructura { "idperiodo-dia": [profesor,...] }
        const nuevoGuardias = {};
        guardiasFiltradas.forEach((g) => {
          const clave = `${g.idperiodo}-${g.dia_semana - 1}`;
          if (!nuevoGuardias[clave]) nuevoGuardias[clave] = [];
          nuevoGuardias[clave].push({
            uid: g.uid,
            givenName: g.nombreProfesor.split(", ")[1] || "",
            sn: g.nombreProfesor.split(", ")[0] || "",
          });
        });

        setGuardias(nuevoGuardias);
      } catch (err) {
        console.error("Error cargando cuadrante:", err);
        alert("❌ No se pudo cargar el cuadrante actual: " + err.message);
      } finally {
        setCargandoCuadrante(false);
      }
    }

    cargarCuadrante();
  }, []);

  useEffect(() => {
    const fetchHorario = async () => {
      try {
        const curso = getCursoActual().label;
        const resp = await fetch(
          `${API_URL}/db/horario-profesorado/enriquecido?curso_academico=${curso}`
        );
        const data = await resp.json();
        if (!data.ok) throw new Error(data.error || "Error obteniendo horario");

        // ✔️ Guardamos TODO el horario
        setHorarioProfesores(data.horario);

        // ✔️ Construimos disponibilidad REAL (no solo guardias)
        const dispo = {};
        data.horario.forEach((h) => {
          const key = `${h.idperiodo}-${h.dia_semana - 1}`;

          if (!dispo[h.uid]) dispo[h.uid] = new Set();
          dispo[h.uid].add(key);
        });

        setDisponibilidad(dispo);
      } catch (err) {
        console.error("Error cargando horario profesores:", err);
      }
    };

    fetchHorario();
  }, []);

  function nombreProfesor(p) {
    return `${p.givenName ?? ""} ${p.sn ?? ""}`.trim();
  }

  function claveCelda(idperiodo, dIndex) {
    return `${idperiodo}-${dIndex}`;
  }

  function handleDrop(e, hIndex, dIndex) {
    e.preventDefault();
    const profesor = JSON.parse(e.dataTransfer.getData("profesor"));
    const clave = `${hIndex}-${dIndex}`;

    // comprobar disponibilidad
    if (disponibilidad[profesor.uid]?.has(clave)) {
      alert(`${nombreProfesor(profesor)} ya tiene guardia en esta hora.`);
      return;
    }

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

  /*async function asignacionAutomaticaCustom() {
    if (!profesores.length || !periodos.length) return;

    const nuevo = {};

    // 1️⃣ Disponibilidad real (NO solo guardias)
    let disponibilidad = {};
    try {
      const curso = getCursoActual().label;
      const resp = await fetch(
        `${API_URL}/db/horario-profesorado/enriquecido?curso_academico=${curso}`
      );
      const data = await resp.json();
      if (data.ok) {
        disponibilidad = {};
        data.horario.forEach((h) => {
          const clave = `${h.idperiodo}-${h.dia_semana - 1}`;
          if (!disponibilidad[h.uid]) disponibilidad[h.uid] = new Set();
          disponibilidad[h.uid].add(clave);
        });
      }
    } catch (err) {
      console.error("Error cargando disponibilidad:", err);
      disponibilidad = {};
    }

    // 2️⃣ Contador global
    const contadorGuardias = {};

    // Inicializar a 0
    profesores.forEach((p) => {
      contadorGuardias[p.uid] = 0;
    });

    // 3️⃣ Recorrido
    dias.forEach((_, dIndex) => {
      const usadosEnDia = new Set();
      const ultimoAsignadoHora = {};

      periodos.forEach((periodo) => {
        const idperiodo = periodo.id;
        const clave = `${idperiodo}-${dIndex}`;
        const cantidad = Math.max(0, getNumGuardiasCelda(clave));

        const asignados = [];

        for (let j = 0; j < cantidad; j++) {
          // 🔥 1. Filtrar candidatos válidos
          let candidatos = profesores.filter(
            (c) =>
              !usadosEnDia.has(c.uid) &&
              ultimoAsignadoHora[idperiodo - 1] !== c.uid &&
              !disponibilidad[c.uid]?.has(clave) &&
              contadorGuardias[c.uid] < maxGuardiasSemana
          );

          // 🔁 fallback más flexible
          if (candidatos.length === 0) {
            candidatos = profesores.filter(
              (c) =>
                !disponibilidad[c.uid]?.has(clave) &&
                contadorGuardias[c.uid] < maxGuardiasSemana
            );
          }

          if (candidatos.length === 0) continue;

          // 🔥 2. ORDENAR POR MENOS CARGA
          candidatos.sort((a, b) => {
            const diff = contadorGuardias[a.uid] - contadorGuardias[b.uid];

            // desempate aleatorio para evitar patrones rígidos
            if (diff === 0) return Math.random() - 0.5;

            return diff;
          });

          const profesor = candidatos[0];

          // 3. Asignar
          asignados.push(profesor);
          usadosEnDia.add(profesor.uid);
          ultimoAsignadoHora[idperiodo] = profesor.uid;

          contadorGuardias[profesor.uid]++;
        }

        nuevo[clave] = asignados;
      });
    });

    console.log("Distribución final:", contadorGuardias);

    setGuardias(nuevo);
    setGuardiasTotales(contadorGuardias);
  }*/

  /**
   * Realiza la asignación automática de guardias siguiendo criterios de carga horaria y contigüidad.
   * * CRITERIOS DE ASIGNACIÓN (en orden de prioridad):
   * 1. DISPONIBILIDAD REAL: El profesor no debe tener clases u otras actividades registradas en esa hora.
   * 2. EXCLUSIÓN DE DÍA LIBRE: Solo se asignan guardias a profesores que tengan actividad (clases) el mismo día.
   * 3. LÍMITE SEMANAL: No se superará el máximo de guardias definido por 'maxGuardiasSemana'.
   * 4. REGLA DE NO REPETICIÓN: Se evita asignar una guardia a un profesor que ya tenga una guardia ese mismo día.
   * 5. EVITAR DOBLE HORA: Se intenta no asignar una guardia inmediatamente después de otra guardia (descanso entre guardias).
   * * PRIORIZACIÓN (Ordenación de candidatos):
   * - Menor Carga: Se eligen primero los profesores con menos guardias acumuladas en la semana.
   * - Contigüidad: A igualdad de carga, se prioriza a profesores que ya tengan una hora adyacente ocupada
   * (anterior o posterior), para compactar su horario y evitar horas "huecas".
   * - Azar: Empate final resuelto de forma aleatoria.
   */
  async function asignacionAutomaticaCustom() {
    if (!profesores.length || !periodos.length) return;

    const nuevo = {};
    let disponibilidad = {};

    // 1️⃣ Obtención de disponibilidad real
    try {
      const curso = getCursoActual().label;
      const resp = await fetch(
        `${API_URL}/db/horario-profesorado/enriquecido?curso_academico=${curso}`
      );
      const data = await resp.json();
      if (data.ok) {
        data.horario.forEach((h) => {
          const key = `${h.idperiodo}-${h.dia_semana - 1}`;
          if (!disponibilidad[h.uid]) disponibilidad[h.uid] = new Set();
          disponibilidad[h.uid].add(key);
        });
      }
    } catch (err) {
      console.error("Error cargando disponibilidad:", err);
    }

    const contadorGuardias = {};
    profesores.forEach((p) => {
      contadorGuardias[p.uid] = 0;
    });

    // 2️⃣ Bucle de días y periodos
    dias.forEach((_, dIndex) => {
      const usadosEnDia = new Set();
      const ultimoAsignadoHora = {};

      // --- FILTRO DE DÍA LIBRE ---
      // Identificamos qué profesores tienen al menos una sesión este día (dIndex)
      const profesConActividadHoy = profesores.filter((p) => {
        // Buscamos en su disponibilidad si tiene alguna clave que termine en "-dIndex"
        const tieneClaseHoy = Array.from(disponibilidad[p.uid] || []).some(
          (key) => key.endsWith(`-${dIndex}`)
        );
        return tieneClaseHoy;
      });

      periodos.forEach((periodo) => {
        const idperiodo = periodo.id;
        const clave = `${idperiodo}-${dIndex}`;
        const cantidad = Math.max(0, getNumGuardiasCelda(clave));

        const asignados = [];

        for (let j = 0; j < cantidad; j++) {
          //  1. FILTRADO:  usamos 'profesConActividadHoy'
          let candidatos = profesConActividadHoy.filter(
            (c) =>
              !usadosEnDia.has(c.uid) &&
              ultimoAsignadoHora[idperiodo - 1] !== c.uid &&
              !disponibilidad[c.uid]?.has(clave) && // No está ocupado en esta hora
              contadorGuardias[c.uid] < maxGuardiasSemana
          );

          // Fallback si la hora está muy vacía de personal
          if (candidatos.length === 0) {
            candidatos = profesConActividadHoy.filter(
              (c) =>
                !disponibilidad[c.uid]?.has(clave) &&
                contadorGuardias[c.uid] < maxGuardiasSemana
            );
          }

          if (candidatos.length === 0) continue;

          //  2. ORDENACIÓN (Carga + Contigüidad)
          candidatos.sort((a, b) => {
            const diffCarga = contadorGuardias[a.uid] - contadorGuardias[b.uid];
            if (diffCarga !== 0) return diffCarga;

            const tieneAdyacente = (prof) => {
              const horaAnterior = `${idperiodo - 1}-${dIndex}`;
              const horaPosterior = `${idperiodo + 1}-${dIndex}`;
              return (
                disponibilidad[prof.uid]?.has(horaAnterior) ||
                disponibilidad[prof.uid]?.has(horaPosterior) ||
                nuevo[horaAnterior]?.some((p) => p.uid === prof.uid)
              );
            };

            if (tieneAdyacente(a) && !tieneAdyacente(b)) return -1;
            if (!tieneAdyacente(a) && tieneAdyacente(b)) return 1;

            return Math.random() - 0.5;
          });

          const profesor = candidatos[0];

          if (!nuevo[clave]) nuevo[clave] = [];
          nuevo[clave].push(profesor);

          usadosEnDia.add(profesor.uid);
          ultimoAsignadoHora[idperiodo] = profesor.uid;
          contadorGuardias[profesor.uid]++;
        }
      });
    });

    setGuardias(nuevo);
    setGuardiasTotales(contadorGuardias);
  }

  const totalesPorProfesor = useMemo(() => {
    const totales = {};
    Object.values(guardias).forEach((profesoresEnCelda) => {
      profesoresEnCelda.forEach((p) => {
        totales[p.uid] = (totales[p.uid] || 0) + 1;
      });
    });
    return totales;
  }, [guardias]);

  if (isLoading || loadingPeriodos || cargandoCuadrante)
    return <div>Cargando datos...</div>;

  return (
    <div className="container mx-auto py-5 p-5">
      <div className="grid grid-cols-[minmax(0,300px)_1fr] gap-3">
        {/* Panel Profesores */}
        <Card className="h-[750px] flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle>Profesores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 flex flex-col overflow-hidden">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar profesor..."
                className="pl-8"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <ScrollArea className="flex-1 pr-3">

              <div className="space-y-2 w-full max-w-[240px]">
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

                    className="cursor-grab rounded-lg bg-blue-400 text-white px-3 py-2 text-sm shadow-sm hover:bg-blue-600 transition w-full flex flex-nowrap items-center overflow-hidden"
                  >
                    <span className="truncate min-w-0 flex-1 block">
                      {nombreProfesor(profesor)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Panel Cuadrante */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Máx/semana</Label>
                  <Input
                    type="number"
                    min={1}
                    value={maxGuardiasSemana}
                    onChange={(e) =>
                      setMaxGuardiasSemana(Number(e.target.value))
                    }
                    className="w-20"
                  />
                </div>
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

                {/* Botón Asignar */}
                <AlertDialog
                  open={autoDialogOpen}
                  onOpenChange={setAutoDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      className="flex items-center gap-2"
                      onClick={() => setAutoDialogOpen(true)}
                    >
                      <Wand2 className="h-4 w-4" /> Generar nuevo ...
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-[400px]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Generar nuevo cuadrante
                      </AlertDialogTitle>
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
                          setAutoDialogOpen(false);
                        }}
                      >
                        Confirmar
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Botón Guardar Cuadrante */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                      Guardar Cuadrante
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Guardar cuadrante de guardias</DialogTitle>
                    </DialogHeader>
                    <div className="py-2 text-sm">
                      Se guardará el cuadrante de guardias, sobreescribiendo
                      cualquier registro anterior del curso actual.
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={async () => {
                          try {
                            const curso = getCursoActual().label;
                            const resp = await fetch(
                              `${API_URL}/db/horario-profesorado/insertCuadranteGuardias`,
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  cuadrante: guardias,
                                  curso_academico: curso,
                                }),
                              }
                            );
                            const data = await resp.json();
                            if (!data.ok)
                              throw new Error(
                                data.error || "Error desconocido"
                              );
                            setDialogOpen(false);
                            alert(
                              `✅ Guardado ${data.total} registros de guardias`
                            );
                          } catch (err) {
                            console.error(err);
                            alert(
                              "❌ Error guardando cuadrante: " + err.message
                            );
                          }
                        }}
                      >
                        Guardar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Botón Limpiar */}
                <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex-1 flex items-center gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" /> Limpiar
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
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-[110px_repeat(5,minmax(0,1fr))] w-full">
              {" "}
              <div />
              {dias.map((d) => (
                <div
                  key={d}
                  className="border text-center font-medium py-2 bg-muted"
                >
                  {d}
                </div>
              ))}
              {periodos.map((periodo) => (
                <div key={periodo.id} className="contents">
                  <div className="border text-center py-3 font-medium bg-muted text-sm">
                    <div>{periodo.nombre}</div>
                    <div className="text-xs text-muted-foreground">
                      {periodo.inicio} - {periodo.fin}
                    </div>
                  </div>

                  {dias.map((_, dIndex) => {
                    const clave = claveCelda(periodo.id, dIndex);
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
                        onDrop={(e) => handleDrop(e, periodo.id, dIndex)}
                        className={cn(
                          "border min-h-[100px] p-2 cursor-pointer transition",
                          seleccionada && "bg-blue-50 border-blue-400",
                          celdaHover === clave && "bg-blue-100 border-blue-500"
                        )}
                      >
                        <div className="flex flex-col">
                          <div className="flex flex-col gap-1 mt-2">
                            {profesoresCelda.map((p) => (
                              <div
                                key={p.uid}
                                /* Importante: w-full y overflow-hidden para respetar el redondeado */
                                className="flex items-center justify-between text-xs rounded-lg bg-blue-400 text-white px-2 py-1 shadow-sm w-full overflow-hidden"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="truncate">
                                    {nombreProfesor(p)}
                                  </span>

                                  <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-white text-blue-600 rounded-full shrink-0">
                                    {totalesPorProfesor[p.uid] || 0}
                                  </span>
                                </div>

                                <X
                                  className="h-3 w-3 cursor-pointer ml-1 shrink-0"
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
