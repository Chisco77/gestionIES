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
 * - Obtiene profesores mediante el hook `useProfesoresLdap` (React Query)
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
 * - Hook: useProfesoresLdap
 *
 */
/*
import { useState } from "react";
import { columns } from "../components/colums";
import { TablaUsuarios } from "../components/TablaUsuarios";
import { useProfesoresLdap } from "@/hooks/useProfesoresLdap";
import { Loader, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogoEditarUsuario } from "../components/DialogoEditarUsuario";

export function ProfesoresIndex() {
  const [profesoresFiltrados, setProfesoresFiltrados] = useState([]);
  const { data: profesores, isLoading, error } = useProfesoresLdap();
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);

  const [abrirEditar, setAbrirEditar] = useState(false);

  const handleInsertar = () => {
    alert("Inserción de profesor: No implementado");
  };

  const handleEditar = (seleccionado) => {
    if (!seleccionado) {
      alert("Selecciona un alumno para editar.");
      return;
    }
    setProfesorSeleccionado(seleccionado);
    setAbrirEditar(true);
  };

  const handleEliminar = (profesor) => {
    if (!profesor) {
      alert("Selecciona un profesor para eliminar.");
      return;
    }
    alert(`Eliminación de profesor ${profesor.uid}: No implementado`);
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">
          ❌ Error al cargar profesores: {error.message}
        </div>
      ) : (
        <TablaUsuarios
          columns={columns}
          data={profesores}
          onFilteredChange={(rows) => setProfesoresFiltrados(rows)}
          acciones={(seleccionado) => (
            <>
              <Button variant="outline" size="icon" onClick={handleInsertar}>
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
                disabled={!seleccionado}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        />
      )}
      <DialogoEditarUsuario
        open={abrirEditar}
        onClose={() => setAbrirEditar(false)}
        usuarioSeleccionado={profesorSeleccionado}
        esAlumno={false} // muestra foto en la cabecera
      />
    </div>
  );
}
*/

import { useState, useEffect } from "react";
import { columns } from "../components/colums";
import { TablaUsuarios } from "../components/TablaUsuarios";
import { useProfesoresLdap } from "@/hooks/useProfesoresLdap";
import { useEmpleados } from "@/hooks/useEmpleados";
import { Loader, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogoEditarUsuario } from "../components/DialogoEditarUsuario";

export function ProfesoresIndex() {
  const [profesoresFiltrados, setProfesoresFiltrados] = useState([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [abrirEditar, setAbrirEditar] = useState(false);

  const {
    data: profesores,
    isLoading: loadingProfesores,
    error: errorProfesores,
  } = useProfesoresLdap();
  const { data: empleados = [], isLoading: loadingEmpleados } = useEmpleados();

  const handleInsertar = () => {
    alert("Inserción de profesor: No implementado");
  };

  const handleEditar = (seleccionado) => {
    if (!seleccionado) {
      alert("Selecciona un profesor para editar.");
      return;
    }

    setProfesorSeleccionado(seleccionado);

    // Buscar empleado correspondiente por UID
    const empleado = empleados.find((e) => e.uid === seleccionado.uid) || null;
    setEmpleadoSeleccionado(empleado);

    setAbrirEditar(true);
  };

  const handleEliminar = (profesor) => {
    if (!profesor) {
      alert("Selecciona un profesor para eliminar.");
      return;
    }
    alert(`Eliminación de profesor ${profesor.uid}: No implementado`);
  };

  const isLoading = loadingProfesores || loadingEmpleados;

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

      <DialogoEditarUsuario
        open={abrirEditar}
        onClose={() => setAbrirEditar(false)}
        usuarioSeleccionado={profesorSeleccionado}
        empleadoSeleccionado={empleadoSeleccionado}
        esAlumno={false} // muestra foto en la cabecera
      />
    </div>
  );
}
