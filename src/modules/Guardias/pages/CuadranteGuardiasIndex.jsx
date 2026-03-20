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

import { Label } from "@/components/ui/label";
import { Search, X, Wand2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { Button } from "@/components/ui/button";
import { getCursoActual } from "@/utils/fechasHoras";

import { toast } from "sonner";

import { useEffect } from "react";

import { useEstancias } from "@/hooks/Estancias/useEstancias";
import { useMaterias } from "@/hooks/useMaterias";
import { useCursosLdap } from "@/hooks/useCursosLdap";

import { DialogoEditarCeldaHorario } from "../components/DialogoEditarCeldaHorario";

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

  const [maxGuardiasSemana, setMaxGuardiasSemana] = useState(3);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [sesionAEditar, setSesionAEditar] = useState(null);

  const profesoresFiltrados = useMemo(() => {
    return profesores.filter((p) =>
      `${p.givenName ?? ""} ${p.sn ?? ""}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [busqueda, profesores]);

  const { data: estancias = [] } = useEstancias(); // Asumiendo que tienes estos hooks
  const { data: cursos = [] } = useCursosLdap();
  const { data: materias = [] } = useMaterias();

  // Función para persistir en la BD
  const sincronizarConBD = async (nuevoCuadrante, mensajeExito = null) => {
    try {
      const curso = getCursoActual().label;

      const resp = await fetch(
        `${API_URL}/db/horario-profesorado/insertCuadranteGuardias`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cuadrante: nuevoCuadrante,
            curso_academico: curso,
          }),
        }
      );

      const data = await resp.json();
      if (!data.ok) throw new Error(data.error);

      // 🔥 SIEMPRE usar lo que viene del backend
      setGuardias(data.cuadranteActualizado);

      if (mensajeExito) toast.success(mensajeExito);
    } catch (err) {
      console.error("❌ Error sincronización:", err);
    }
  };

  const abrirEditorSesion = (e, registroEnCelda, periodo, dIndex) => {
    e.stopPropagation();

    // 1. Extraemos el tipo con un "fallback" agresivo
    // Si registroEnCelda.tipo no existe, usamos "guardia"
    const tipoReal = registroEnCelda.tipo || "guardia";

    const datosParaDialogo = {
      ...registroEnCelda,
      id: registroEnCelda.id_registro || registroEnCelda.id,
      idperiodo: periodo.id,
      dia_semana: dIndex + 1,
      // FORZAMOS el tipo aquí para que no sea undefined
      tipo: tipoReal,
      idestancia:
        registroEnCelda.estancia?.id || registroEnCelda.idestancia || null,
    };

    console.log("🚀 DATOS FINALES ENVIADOS AL HIJO:", datosParaDialogo);

    setSesionAEditar(datosParaDialogo);
    setEditDialogOpen(true);
  };

  useEffect(() => {
    async function cargarCuadrante() {
      try {
        const curso = getCursoActual().label;
        const resp = await fetch(
          `${API_URL}/db/horario-profesorado/enriquecido?curso_academico=${curso}`
        );
        const data = await resp.json();
        console.log("RAW BACKEND:", data.horario[0]); // Ya lo tienes
        console.log(
          "✅ Todos los tipos:",
          data.horario.map((r) => ({ id: r.id, tipo: r.tipo }))
        );
        if (!data.ok) throw new Error(data.error || "Error desconocido");

        const guardiasFiltradas = data.horario.filter(
          (r) => r.tipo === "guardia"
        );
        console.log(
          "🔹 Guardias filtradas:",
          guardiasFiltradas.map((g) => ({
            id: g.id,
            uid: g.uid,
            tipo: g.tipo,
          }))
        );
        const nuevoGuardias = {};
        const nuevoNumPorCelda = {}; // 👈 Creamos un objeto para los números

        guardiasFiltradas.forEach((g) => {
          const clave = `${g.idperiodo}-${g.dia_semana - 1}`;

          if (!nuevoGuardias[clave]) {
            nuevoGuardias[clave] = [];
          }

          const registroNormalizado = {
            ...g,

            // 🔥 Forzamos tipo
            tipo: g.tipo ?? null,

            id_registro: g.id,

            givenName: g.nombreProfesor?.split(", ")[1]?.trim() || "",
            sn: g.nombreProfesor?.split(", ")[0]?.trim() || "",

            estancia: g.idestancia
              ? {
                  id: g.idestancia,
                  descripcion: g.estancia_descripcion || g.nombreEstancia,
                }
              : null,
          };

          // DEBUG (muy importante ahora)
          if (!registroNormalizado.tipo) {
            console.warn(
              "⚠️ Registro sin tipo tras normalizar:",
              registroNormalizado
            );
          } else {
            console.log(
              "✅ Registro normalizado:",
              registroNormalizado.id,
              registroNormalizado.tipo
            );
          }

          nuevoGuardias[clave].push(registroNormalizado);
        });

        setGuardias(nuevoGuardias);
        // Dentro de cargarCuadrante, justo después de generar nuevoGuardias:

        Object.entries(nuevoGuardias).forEach(([clave, listaProfes]) => {
          // Ponemos como valor de la celda el número de profesores que vienen de la BD
          nuevoNumPorCelda[clave] = listaProfes.length;
        });

        setGuardias(nuevoGuardias);
        setNumPorCelda(nuevoNumPorCelda);
      } catch (err) {
        // <--- Asegúrate de que esta línea esté así
        console.error("Error cargando cuadrante:", err);
        toast.error("Error al cargar los datos iniciales.");
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

  function eliminarGuardia(clave, uid) {
    const nuevo = {
      ...guardias,
      [clave]: guardias[clave].filter((p) => p.uid !== uid),
    };

    setGuardias(nuevo);
    sincronizarConBD(nuevo);
  }

  function nombreProfesor(p) {
    return `${p.givenName ?? ""} ${p.sn ?? ""}`.trim();
  }
  const handleNumCeldaChange = (clave, valor) => {
    const num = parseInt(valor, 10);
    setNumPorCelda((prev) => ({
      ...prev,
      [clave]: isNaN(num) ? 0 : num,
    }));
  };

  function claveCelda(idperiodo, dIndex) {
    return `${idperiodo}-${dIndex}`;
  }

  function handleDrop(e, hIndex, dIndex) {
    e.preventDefault();
    const profesor = JSON.parse(e.dataTransfer.getData("profesor"));
    const clave = `${hIndex}-${dIndex}`;

    if (disponibilidad[profesor.uid]?.has(clave)) {
      toast.error(
        `Conflicto: ${nombreProfesor(profesor)} ya tiene clase o guardia en esta hora.`
      );
      return;
    }

    const nuevo = {
      ...guardias,
      [clave]: [
        ...(guardias[clave] || []),
        {
          ...profesor,
          tipo: "guardia", // 🔥 obligatorio
        },
      ],
    };

    setGuardias(nuevo);
    sincronizarConBD(nuevo); // 🔥 inmediato
  }

  function limpiarCuadrante() {
    // Al poner guardias como objeto vacío, el debounce enviará {} a la BD
    // y el backend ejecutará el DELETE de todo el curso.
    setGuardias({});
    sincronizarConBD({}, "El cuadrante ha sido borrado por completo.");
  }

  function getNumGuardiasCelda(clave) {
    return numPorCelda[clave] ?? numPorHora;
  }

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
    setAutoDialogOpen(false);

    // FORZAMOS la sincronización inmediata con el objeto "nuevo"
    sincronizarConBD(
      nuevo,
      "Se ha generado y guardado el nuevo cuadrante correctamente."
    );
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

                    // Determinamos el valor actual de la celda
                    const valorEfectivo = getNumGuardiasCelda(clave);
                    const esPersonalizado = numPorCelda[clave] !== undefined;

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
                          "border min-h-[120px] p-1 cursor-pointer transition relative group",
                          seleccionada && "bg-blue-50 border-blue-400",
                          celdaHover === clave && "bg-blue-100 border-blue-500"
                        )}
                      >
                        {/* Control de número de guardias por celda */}
                        <div className="flex justify-end items-center mb-1 gap-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">
                            G:
                          </span>
                          <Input
                            type="number"
                            min={0}
                            value={valorEfectivo}
                            onChange={(e) =>
                              handleNumCeldaChange(clave, e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()} // Evita seleccionar la celda al hacer clic en el input
                            className={cn(
                              "h-6 w-10 text-[11px] px-1 text-center font-bold",
                              esPersonalizado
                                ? "border-orange-400 bg-orange-50"
                                : "bg-transparent border-dashed"
                            )}
                          />
                        </div>

                        <div className="flex flex-col">
                          <div className="flex flex-col gap-1">
                            {profesoresCelda.map((p) => (
                              <div
                                key={p.id_registro}
                                onClick={(e) =>
                                  abrirEditorSesion(e, p, periodo, dIndex)
                                } // ✨ Añadido
                                className="flex items-center justify-between text-xs rounded-lg bg-blue-400 text-white px-2 py-1 shadow-sm w-full cursor-pointer hover:bg-blue-500 transition-colors"
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
                                  className="h-3 w-3 cursor-pointer ml-1 shrink-0 hover:text-red-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    eliminarGuardia(clave, p.uid);
                                  }}
                                />
                              </div>
                            ))}

                            {/* Indicador visual si faltan profesores por asignar */}
                            {profesoresCelda.length < valorEfectivo && (
                              <div className="mt-1 border border-dashed border-slate-300 rounded text-[10px] text-center text-slate-400 py-1">
                                Faltan {valorEfectivo - profesoresCelda.length}
                              </div>
                            )}
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
      {sesionAEditar && (
        <DialogoEditarCeldaHorario
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSesionAEditar(null);
          }}
          celdaActual={sesionAEditar}
          dia={dias[sesionAEditar.dia_semana - 1]}
          periodo={
            periodos.find((p) => p.id === sesionAEditar.idperiodo)?.nombre
          }
          estancias={estancias}
          cursos={cursos}
          materias={materias}
          onGuardar={(datosActualizados) => {
            const clave = `${sesionAEditar.idperiodo}-${sesionAEditar.dia_semana - 1}`;

            const nuevo = {
              ...guardias,
              [clave]: guardias[clave].map((p) =>
                // Comparamos por id_registro o id
                p.id_registro === datosActualizados.id ||
                p.id === datosActualizados.id
                  ? {
                      ...p,
                      // Prioridad: 1. Lo que viene del diálogo, 2. Lo que ya tenía el objeto, 3. "guardia"
                      tipo: datosActualizados.tipo || p.tipo || "guardia",
                      materia: datosActualizados.materia,
                      grupo: datosActualizados.grupo,
                      gidnumber: datosActualizados.gidnumber,
                      estancia: datosActualizados.estancia,
                    }
                  : p
              ),
            };

            setGuardias(nuevo);
            sincronizarConBD(nuevo);
            setEditDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
