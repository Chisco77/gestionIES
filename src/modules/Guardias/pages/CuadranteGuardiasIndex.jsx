/**
 * ============================================================
 * 🧭 MÓDULO: Cuadrante de Guardias (GuardiasIndex)
 * ============================================================
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 * Este módulo es el núcleo central del sistema de gestión de
 * guardias del centro.
 *
 * Permite visualizar, editar, generar y sincronizar en tiempo real
 * la asignación de guardias del profesorado.
 *
 * ------------------------------------------------------------
 * FUNCIONALIDADES PRINCIPALES
 * ------------------------------------------------------------
 *
 * 1.  Carga de datos
 *    - Obtiene horarios enriquecidos del profesorado desde backend
 *    - Filtra únicamente registros de tipo "guardia"
 *    - Construye estructura inicial del cuadrante (periodo × día)
 *
 * 2.  Asignación manual
 *    - Drag & drop de profesores a celdas del cuadrante
 *    - Reasignación entre celdas
 *    - Eliminación de asignaciones individuales
 *
 * 3.  Asignación automática
 *    - Generación inteligente de cuadrante completo
 *    - Respeta disponibilidad real del profesorado
 *    - Evita conflictos con clases u otras actividades
 *    - Optimiza distribución de carga horaria
 *    - Prioriza contigüidad de horarios y equidad
 *
 * 4.  Control de carga
 *    - Límite configurable de guardias por profesor/semana
 *    - Contador dinámico de asignaciones
 *    - Visualización de saturación por docente
 *
 * 5.  Configuración dinámica
 *    - Número de guardias por celda configurable
 *    - Ajustes globales y por celda
 *    - Reglas de distribución en tiempo real
 *
 * 6.  Persistencia
 *    - Sincronización completa del estado con backend
 *    - El backend actúa como espejo del cuadrante actual
 *    - Cada cambio (manual o automático) se guarda inmediatamente
 *
 * 7.  Exportación
 *    - Generación de informes PDF del cuadrante
 *    - Visualización imprimible del estado actual
 *
 *
 * ------------------------------------------------------------
 * NOTAS DE ARQUITECTURA
 * ------------------------------------------------------------
 *
 * - El frontend es responsable de la lógica de asignación
 * - El backend actúa como persistencia de estado completo
 * - El sistema prioriza consistencia sobre rendimiento parcial
 * - Todas las modificaciones sincronizan el estado global
 *
 *
 * ============================================================
 */

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
import { cn } from "@/lib/utils";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { Button } from "@/components/ui/button";
import { getCursoActual } from "@/utils/fechasHoras";

import { toast } from "sonner";

import { useEffect } from "react";

import { useEstancias } from "@/hooks/Estancias/useEstancias";
import { useMaterias } from "@/hooks/useMaterias";
import { useCursosLdap } from "@/hooks/useCursosLdap";

import { DialogoEditarCeldaHorario } from "../../HorariosProfesorado/components/DialogoEditarCeldaHorario";

import { generarPdfCuadrante } from "@/Informes/horarios";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Loader2, Search, X, Wand2, Trash2, Printer } from "lucide-react";

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

  const [maxGuardiasSemana, setMaxGuardiasSemana] = useState(2);
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

        if (!data.ok) throw new Error(data.error || "Error desconocido");

        const guardiasFiltradas = data.horario.filter(
          (r) => r.tipo === "guardia"
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

  const nombreProfesor = (p) => {
    if (!p) return "Desconocido";
    const apellidos = p.sn ? p.sn.trim() : "";
    const nombre = p.givenName ? p.givenName.trim() : "";

    // Retorna "APELLIDOS, Nombre"
    return `${apellidos}, ${nombre}`.trim();
  };

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

    const claveDestino = `${hIndex}-${dIndex}`;
    const tipo = e.dataTransfer.getData("tipo");

    // 1. Identificar al profesor y su origen
    let profesor;
    let origenClave = null;

    if (tipo === "interna") {
      const data = JSON.parse(e.dataTransfer.getData("guardiaInterna"));
      profesor = data.profesor;
      origenClave = data.origenClave;
    } else {
      profesor = JSON.parse(e.dataTransfer.getData("profesor"));
    }

    // 2. Si es arrastre interno y cae en la misma celda, no hacemos nada
    if (tipo === "interna" && origenClave === claveDestino) return;

    // 3. VALIDACIÓN 1: ¿Ya está el profesor en esta celda específica?
    // Esto evita duplicados si arrastras dos veces al mismo desde la izquierda
    const yaEstaEnCelda = guardias[claveDestino]?.some(
      (p) => p.uid === profesor.uid
    );
    if (yaEstaEnCelda) {
      toast.warning(
        `${nombreProfesor(profesor)} ya está asignado a esta hora.`
      );
      return;
    }

    // 4. VALIDACIÓN 2: Disponibilidad (clases u otras actividades)
    if (disponibilidad[profesor.uid]?.has(claveDestino)) {
      toast.error(
        `Conflicto: ${nombreProfesor(profesor)} ya tiene clase o guardia en esta hora.`
      );
      return;
    }

    // 5. Ejecutar el movimiento en el estado
    const nuevo = { ...guardias };

    // Si es interno, lo borramos de la celda antigua usando el UID
    // (Usar UID es vital porque los elementos recién creados no tienen id_registro aún)
    if (tipo === "interna" && origenClave) {
      nuevo[origenClave] = (nuevo[origenClave] || []).filter(
        (p) => p.uid !== profesor.uid
      );
    }

    // Añadir a la nueva celda
    if (!nuevo[claveDestino]) nuevo[claveDestino] = [];

    nuevo[claveDestino].push({
      ...profesor,
      tipo: "guardia",
    });

    // 6. Actualizar y persistir
    setGuardias(nuevo);
    sincronizarConBD(nuevo);
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

    try {
      const curso = getCursoActual().label;
      const resp = await fetch(
        `${API_URL}/db/horario-profesorado/enriquecido?curso_academico=${curso}`
      );
      const data = await resp.json();
      if (data.ok) {
        data.horario.forEach((h) => {
          // Guardamos el día de la semana (0-4) para facilitar la comprobación de "día libre"
          const diaIndex = h.dia_semana - 1;
          const key = `${h.idperiodo}-${diaIndex}`;

          if (!disponibilidad[h.uid]) {
            disponibilidad[h.uid] = {
              celdas: new Set(),
              diasConClase: new Set(),
            };
          }
          disponibilidad[h.uid].celdas.add(key);
          disponibilidad[h.uid].diasConClase.add(diaIndex); // Guardamos qué días trabaja
        });
      }
    } catch (err) {
      console.error("Error cargando disponibilidad:", err);
    }

    const contadorGuardias = {};
    profesores.forEach((p) => {
      contadorGuardias[p.uid] = 0;
    });

    dias.forEach((_, dIndex) => {
      const usadosEnDia = new Set();
      const ultimoAsignadoHora = {};

      // --- FILTRO DE DÍA LIBRE MEJORADO ---
      // Solo entran los que tienen el dIndex en su Set de 'diasConClase'
      const profesConActividadHoy = profesores.filter((p) => {
        const datosDisp = disponibilidad[p.uid];
        return datosDisp && datosDisp.diasConClase.has(dIndex);
      });

      periodos.forEach((periodo) => {
        const idperiodo = periodo.id;
        const clave = `${idperiodo}-${dIndex}`;
        const cantidad = Math.max(0, getNumGuardiasCelda(clave));

        for (let j = 0; j < cantidad; j++) {
          let candidatos = profesConActividadHoy.filter(
            (c) =>
              !usadosEnDia.has(c.uid) &&
              ultimoAsignadoHora[idperiodo - 1] !== c.uid &&
              !disponibilidad[c.uid]?.celdas.has(clave) &&
              contadorGuardias[c.uid] < maxGuardiasSemana
          );

          if (candidatos.length === 0) {
            candidatos = profesConActividadHoy.filter(
              (c) =>
                !disponibilidad[c.uid]?.celdas.has(clave) &&
                contadorGuardias[c.uid] < maxGuardiasSemana
            );
          }

          if (candidatos.length === 0) continue;

          // ORDENACIÓN (Carga + Contigüidad)
          candidatos.sort((a, b) => {
            const diffCarga = contadorGuardias[a.uid] - contadorGuardias[b.uid];
            if (diffCarga !== 0) return diffCarga;

            const tieneAdyacente = (prof) => {
              const horaAnterior = `${idperiodo - 1}-${dIndex}`;
              const horaPosterior = `${idperiodo + 1}-${dIndex}`;
              const disp = disponibilidad[prof.uid]?.celdas;
              return (
                disp?.has(horaAnterior) ||
                disp?.has(horaPosterior) ||
                nuevo[horaAnterior]?.some((p) => p.uid === prof.uid)
              );
            };

            const aContiguo = tieneAdyacente(a);
            const bContiguo = tieneAdyacente(b);

            if (aContiguo && !bContiguo) return -1;
            if (!aContiguo && bContiguo) return 1;

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
    sincronizarConBD(
      nuevo,
      "Cuadrante generado respetando días libres y contigüidad."
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

  function limpiarCuadrante() {
    setGuardias({});
    // Reseteamos los contadores personalizados de cada celda al valor general
    setNumPorCelda({});
    sincronizarConBD({}, "El cuadrante y los contadores han sido borrados.");
  }

  // Pantalla de carga
  if (isLoading || loadingPeriodos || cargandoCuadrante) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full gap-4 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <div className="space-y-1 text-center">
          <p className="text-lg font-semibold text-foreground animate-pulse">
            Preparando cuadrante...
          </p>
          <p className="text-sm text-muted-foreground">
            gestionIES está cargando los horarios
          </p>
        </div>
      </div>
    );
  }

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
                {profesoresFiltrados.map((profesor) => {
                  const total = totalesPorProfesor[profesor.uid] || 0;
                  const disponible = total < maxGuardiasSemana;

                  return (
                    <div
                      key={profesor.uid}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData(
                          "profesor",
                          JSON.stringify(profesor)
                        )
                      }
                      className={cn(
                        "cursor-grab rounded-lg text-white px-3 py-2 text-sm shadow-sm transition w-full flex flex-nowrap items-center overflow-hidden",
                        disponible
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-blue-400 hover:bg-blue-600"
                      )}
                    >
                      <span className="truncate min-w-0 flex-1 block">
                        {nombreProfesor(profesor)}
                      </span>

                      {/* Contador */}
                      <span className="ml-2 text-[10px] bg-white text-black rounded px-1 shrink-0">
                        {total}/{maxGuardiasSemana}
                      </span>
                    </div>
                  );
                })}
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
                <div className="flex items-center gap-2">
                  <Button
                    className="flex items-center gap-2"
                    onClick={() => generarPdfCuadrante(guardias, periodos)}
                  >
                    <Printer className="h-4 w-4" /> Imprimir cuadrante
                  </Button>
                </div>
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
                            {[...profesoresCelda]
                              .sort((a, b) => {
                                const aTieneEstancia = !!a.estancia;
                                const bTieneEstancia = !!b.estancia;

                                // 1. Con estancia primero
                                if (aTieneEstancia && !bTieneEstancia)
                                  return -1;
                                if (!aTieneEstancia && bTieneEstancia) return 1;

                                // 2. Si ambos tienen estancia → ordenar por estancia
                                if (aTieneEstancia && bTieneEstancia) {
                                  const estA =
                                    a.estancia.descripcion.toLowerCase();
                                  const estB =
                                    b.estancia.descripcion.toLowerCase();

                                  if (estA < estB) return -1;
                                  if (estA > estB) return 1;
                                }

                                // 3. Orden por apellidos (sn)
                                const snA = (a.sn || "").toLowerCase();
                                const snB = (b.sn || "").toLowerCase();

                                if (snA < snB) return -1;
                                if (snA > snB) return 1;

                                // 4. Desempate por nombre
                                const gnA = (a.givenName || "").toLowerCase();
                                const gnB = (b.givenName || "").toLowerCase();

                                if (gnA < gnB) return -1;
                                if (gnA > gnB) return 1;

                                return 0;
                              })
                              .map((p) => (
                                <TooltipProvider key={p.id_registro}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        draggable
                                        onDragStart={(e) => {
                                          e.stopPropagation();

                                          e.dataTransfer.setData(
                                            "guardiaInterna",
                                            JSON.stringify({
                                              profesor: p,
                                              origenClave: clave,
                                            })
                                          );

                                          e.dataTransfer.setData(
                                            "tipo",
                                            "interna"
                                          );
                                        }}
                                        onClick={(e) =>
                                          abrirEditorSesion(
                                            e,
                                            p,
                                            periodo,
                                            dIndex
                                          )
                                        }
                                        className="flex items-center justify-between text-xs rounded-lg bg-blue-400 text-white px-2 py-1 shadow-sm w-full cursor-grab active:cursor-grabbing hover:bg-blue-500 transition-colors"
                                      >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                          <span className="truncate flex gap-1">
                                            {p.estancia && (
                                              <span className="font-bold">
                                                {p.estancia.descripcion} -
                                              </span>
                                            )}
                                            <span>{nombreProfesor(p)}</span>
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
                                    </TooltipTrigger>

                                    <TooltipContent>
                                      {`${p.sn || ""}, ${p.givenName || ""}`}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
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
