/**
 * ProfesoresIndex.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Componente principal para visualizar y gestionar profesores desde LDAP.
 *
 * Funcionalidades:
 * - Obtiene profesores mediante el hook `useProfesoresActivos` (React Query)
 * - Muestra los profesores en `TablaUsuarios` con:
 *     • Filtrado por grupo, apellidos y usuario
 *     • Ordenación y paginación
 *     • Ofuscación de datos sensibles
 *
 * Estados principales:
 * - profesoresFiltrados: profesores visibles tras filtrado en la tabla
 *
 * Dependencias:
 * - TablaUsuarios: tabla con filtros, ordenación y paginación
 * - Componentes UI: Button (interno en TablaUsuarios)
 * - Iconos: lucide-react
 * - Hook: useProfesoresActivos
 *
 */
/*
 */

import { useState, useEffect } from "react";
import { columns } from "../../Usuarios/components/colums";
import { TablaUsuarios } from "../../Usuarios/components/TablaUsuarios";
import { useProfesoresActivos } from "@/hooks/useProfesoresActivos";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { useConfiguracionCentro } from "@/hooks/useConfiguracionCentro";
import { resolverRutaLogo } from "@/Informes/utils";
//import { useProfesoresLdap } from "@/hooks/useProfesoresLdap";
import {
  Loader,
  Plus,
  Pencil,
  Trash2,
  Users,
  Printer,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { generateListadoAPs } from "../../../utils/Informes";
import { DialogoEditarHorario } from "../components/DialogoEditarHorario";
import { DialogoAsignarHorario } from "../components/DialogoAsignarHorario";
import { generarPdfHorariosProfesores } from "@/Informes/horarios";

export function HorariosIndex() {
  const [profesoresFiltrados, setProfesoresFiltrados] = useState([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [abrirAsignarHorario, setAbrirAsignarHorario] = useState(false);

  const { data: periodos } = usePeriodosHorarios();
  const { data: centro } = useConfiguracionCentro();

  const API_URL = import.meta.env.VITE_API_URL;

  const {
    data: profesores,
    isLoading: loadingProfesores,
    error: errorProfesores,
  } = useProfesoresActivos();

  const handleInsertar = () => {
    alert("Inserción de profesor: No implementado");
  };

  const handleEliminar = (profesor) => {
    if (!profesor) {
      alert("Selecciona un profesor para eliminar.");
      return;
    }
    alert(`Eliminación de profesor ${profesor.uid}: No implementado`);
  };

  const handleEditarHorario = (seleccionado) => {
    if (!seleccionado) {
      alert("Selecciona un profesor para editar su horario.");
      return;
    }

    // Guardamos el profesor seleccionado
    setProfesorSeleccionado(seleccionado);

    // Si tuvieras empleado relacionado, aquí podrías buscarlo
    setEmpleadoSeleccionado(seleccionado); // por ahora usamos el mismo objeto

    // Abrimos el diálogo
    setAbrirEditar(true);
  };

  const handleGenerarPdf = async () => {
    if (!profesoresFiltrados.length) {
      alert("No hay profesores seleccionados para generar el informe.");
      return;
    }

    try {
      // 1. Resolvemos el logo antes de empezar[cite: 1, 2]
      const urlParaPdf =
        typeof resolverRutaLogo === "function"
          ? resolverRutaLogo(centro?.logoCentroUrl)
          : centro?.logoCentroUrl;

      const uids = profesoresFiltrados.map((p) => p.uid).filter(Boolean);
      const query = new URLSearchParams();
      uids.forEach((uid) => query.append("uid", uid));

      const url = `${API_URL}/db/horario-profesorado/enriquecido?${query.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.ok) {
        alert("Error al obtener horarios: " + (data.error || "Desconocido"));
        return;
      }

      const horarioOrdenado = [...data.horario].sort((a, b) => {
        const comparacionNombres = a.nombreProfesor.localeCompare(
          b.nombreProfesor,
          "es",
          { sensitivity: "base" }
        );
        if (comparacionNombres === 0) {
          if (a.dia_semana !== b.dia_semana) return a.dia_semana - b.dia_semana;
          return a.idperiodo - b.idperiodo;
        }
        return comparacionNombres;
      });

      // 2. Enviamos el logo resuelto como cuarto parámetro[cite: 2]
      generarPdfHorariosProfesores(
        horarioOrdenado,
        periodos,
        "horarios_profesores",
        urlParaPdf
      );
    } catch (err) {
      console.error("[ERROR] Excepción generando informe de horarios:", err);
      alert("Error generando el informe de horarios.");
    }
  };

  const isLoading = loadingProfesores;
  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : errorProfesores ? (
        <div className="text-red-500 text-center">
          ❌ Error al cargar profesores: {errorProfesores.message}
        </div>
      ) : (
        <TablaUsuarios
          columns={columns}
          data={profesores}
          onFilteredChange={(rows) => setProfesoresFiltrados(rows)}
          informes={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Printer className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleGenerarPdf}>
                  <Users className="mr-2 h-4 w-4" />
                  Listar horarios
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
          acciones={(seleccionado) => (
            <>
              <Button variant="outline" size="icon" disabled={true}>
                <Plus className="w-4 h-4" />
              </Button>

              {/* Botón Editar horario */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (!seleccionado) return;
                  setProfesorSeleccionado(seleccionado); // Guardamos profesor
                  setEmpleadoSeleccionado(seleccionado); // Si quieres usar empleado
                  setAbrirEditar(true); // Abrimos diálogo editar
                }}
                disabled={!seleccionado}
              >
                <Pencil className="w-4 h-4" />
              </Button>

              {/* Botón Eliminar */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEliminar(seleccionado)}
                disabled={true}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              {/* Botón Duplicar horario */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (!seleccionado) return;
                  setProfesorSeleccionado(seleccionado); // Guardamos profesor de la fila
                  setAbrirAsignarHorario(true); // Abrimos diálogo duplicar
                }}
                disabled={!seleccionado}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </>
          )}
        />
      )}

      {/* Diálogo Editar horario */}
      <DialogoEditarHorario
        open={abrirEditar}
        onClose={() => setAbrirEditar(false)}
        usuarioSeleccionado={profesorSeleccionado}
        empleadoSeleccionado={empleadoSeleccionado}
        esAlumno={false}
      />

      {/* Diálogo Asignar/Duplicar horario */}
      <DialogoAsignarHorario
        profesorOrigen={profesorSeleccionado}
        open={abrirAsignarHorario}
        onOpenChange={setAbrirAsignarHorario}
      />
    </div>
  );
}
