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
 */

import { useState, useEffect } from "react";
import { columns } from "../components/colums";
import { TablaUsuarios } from "../components/TablaUsuarios";
import { useProfesoresLdap } from "@/hooks/useProfesoresLdap";
//import { useEmpleados } from "@/hooks/useEmpleados";
import { Loader, Plus, Pencil, Trash2, Users, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import DialogoEditarUsuario from "../components/DialogoEditarUsuario";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { generateListadoAPs } from "../../../utils/Informes";

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

  //const { data: empleados = [], isLoading: loadingEmpleados } = useEmpleados();

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
    //const empleado = empleados.find((e) => e.uid === seleccionado.uid) || null;
    setEmpleadoSeleccionado(seleccionado);

    setAbrirEditar(true);
  };

  const handleEliminar = (profesor) => {
    if (!profesor) {
      alert("Selecciona un profesor para eliminar.");
      return;
    }
    alert(`Eliminación de profesor ${profesor.uid}: No implementado`);
  };

  /*const handleGenerarPdf = () => {
    // Combinamos profesoresFiltrados con datos de empleados
    const listadoCombinado = profesoresFiltrados.map((profesor) => {
      const empleadoExtra = empleados.find((e) => e.uid === profesor.uid) || {};
      return {
        ...profesor,
        dni: empleadoExtra.dni || "",
        asuntos_propios: empleadoExtra.asuntos_propios || 0,
        tipo_empleado: empleadoExtra.tipo_empleado || "",
      };
    });

    generateListadoAPs(listadoCombinado);
  };*/

  const handleGenerarPdf = () => {
    // Ahora los datos de empleado ya están en cada profesor
    const listadoCombinado = profesoresFiltrados.map((profesor) => ({
      ...profesor,
      dni: profesor.dni || "",
      asuntos_propios: profesor.asuntos_propios || 0,
      tipo_empleado: profesor.tipo_empleado || "",
    }));

    generateListadoAPs(listadoCombinado);
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
                  Listado profesores
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
