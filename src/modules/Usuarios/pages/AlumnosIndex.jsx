/**
 * AlumnosIndex.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Componente principal para visualizar y gestionar alumnos desde LDAP.
 *
 * Funcionalidades:
 * - Obtiene alumnos mediante el hook `useAlumnosLdap` (React Query)
 * - Muestra los alumnos en `TablaUsuarios` con:
 *     • Filtrado por grupo, apellidos y usuario
 *     • Ordenación y paginación
 *     • Ofuscación de datos sensibles
 * - Permite generar un listado PDF de alumnos por curso a través de:
 *     - `DialogoListadoCurso`
 * - Sincroniza los alumnos filtrados para su uso en el diálogo de listado
 *
 * Estados principales:
 * - abrirDialogoListadoCurso: control de apertura del diálogo de listado por curso
 * - alumnosFiltrados: alumnos visibles tras filtrado en la tabla
 *
 * Dependencias:
 * - TablaUsuarios: tabla con filtros, ordenación y paginación
 * - DialogoListadoCurso: generación de PDF con listado de alumnos por curso
 * - Componentes UI: Button, DropdownMenu
 * - Iconos: lucide-react
 * - Hook: useAlumnosLdap
 *
 */


import { useState } from "react";
import { columns } from "../components/colums";
import { TablaUsuarios } from "../components/TablaUsuarios";
import { DialogoListadoCurso } from "../components/DialogoListadoCurso";
import { DialogoEtiquetas } from "../components/DialogoEtiquetas";
import { DialogoEditarUsuario } from "../components/DialogoEditarUsuario";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Printer, Users, Tag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAlumnosLdap } from "@/hooks/useAlumnosLdap";

const handleInsertar = () => alert("Inserción de alumno: No implementado");
const handleEliminar = (seleccionado) => {
  if (!seleccionado) {
    alert("Selecciona un alumno para eliminar.");
    return;
  }
  alert(`Eliminación de alumno ${seleccionado.uid}: No implementado`);
};

export function AlumnosIndex() {
  const [abrirDialogoListadoCurso, setAbrirDialogoListadoCurso] = useState(false);
  const [abrirDialogoEtiquetas, setAbrirDialogoEtiquetas] = useState(false);
  const [alumnosFiltrados, setAlumnosFiltrados] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [abrirEditar, setAbrirEditar] = useState(false);

  const { data: alumnos, isLoading, error } = useAlumnosLdap();

  const handleEditar = (seleccionado) => {
    if (!seleccionado) {
      alert("Selecciona un alumno para editar.");
      return;
    }
    setAlumnoSeleccionado(seleccionado);
    setAbrirEditar(true);
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin h-10 w-10 border-4 border-primary rounded-full"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">
          ❌ Error al cargar alumnos: {error.message}
        </div>
      ) : (
        <TablaUsuarios
          columns={columns}
          data={alumnos}
          onFilteredChange={(filtrados) => setAlumnosFiltrados(filtrados)}
          informes={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Printer className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setAbrirDialogoEtiquetas(true)}>
                  <Tag className="mr-2 h-4 w-4" />
                  Etiquetas para portátiles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAbrirDialogoListadoCurso(true)}>
                  <Users className="mr-2 h-4 w-4" />
                  Alumnos por grupo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
          acciones={(seleccionado) => (
            <>
              <Button variant="outline" size="icon" disabled={true}>
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEditar(seleccionado)}
                disabled={!seleccionado}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEliminar(seleccionado)}
                disabled={true}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        />
      )}

      <DialogoListadoCurso
        alumnos={alumnosFiltrados}
        open={abrirDialogoListadoCurso}
        onOpenChange={setAbrirDialogoListadoCurso}
      />

      <DialogoEtiquetas
        usuarios={alumnosFiltrados}
        open={abrirDialogoEtiquetas}
        onOpenChange={setAbrirDialogoEtiquetas}
      />

      <DialogoEditarUsuario
        open={abrirEditar}
        onClose={() => setAbrirEditar(false)}
        usuarioSeleccionado={alumnoSeleccionado}
        esAlumno={true} // muestra foto en la cabecera
      />
    </div>
  );
}
