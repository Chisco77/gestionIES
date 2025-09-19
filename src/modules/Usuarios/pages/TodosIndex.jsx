/**
 * TodosIndex.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 * 
 * Componente principal para visualizar todos los usuarios (alumnos y profesores) desde LDAP.
 *
 * Funcionalidades:
 * - Obtiene todos los usuarios mediante fetch a la API (`/ldap/usuarios?tipo=all`)
 * - Muestra los usuarios en `TablaUsuarios` con:
 *     • Filtrado por grupo, apellidos y usuario
 *     • Ordenación y paginación
 *     • Ofuscación de datos sensibles
 *
 * Estados principales:
 * - data: todos los usuarios obtenidos desde la API
 * - alumnosFiltrados: usuarios visibles tras filtrado en la tabla
 *
 * Dependencias:
 * - TablaUsuarios: tabla con filtros, ordenación y paginación
 * - Componentes UI: Button, Input, MultiSelect (internos en TablaUsuarios)
 * - Iconos: lucide-react (internos en TablaUsuarios)
 *
 */

import { useEffect, useState } from "react";
import { columns } from "../components/colums";
import { TablaUsuarios } from "../components/TablaUsuarios";
import { Loader, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTodosLdap } from "@/hooks/useTodosLdap";


const handleInsertar = () => {
  alert("Inserción de profesor: No implementado");
};

const handleEditar = (seleccionado) => {
  if (!seleccionado) {
    alert("Selecciona un profesor para editar.");
    return;
  }
  alert(`Edición de profesor ${seleccionado.uid}: No implementado`);
};

const handleEliminar = (seleccionado) => {
  if (!seleccionado) {
    alert("Selecciona un profesor para eliminar.");
    return;
  }
  alert(`Eliminación de profesor ${seleccionado.uid}: No implementado`);
};

export function TodosIndex() {
  const [data, setData] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const { data: todos, isLoading, error } = useTodosLdap();
  
  const API_URL = import.meta.env.VITE_API_URL;

  /*useEffect(() => {
    fetch(`${API_URL}/ldap/usuarios?tipo=all`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setAlumnosFiltrados(data); // al principio, sin filtros
      })
      .catch((error) => {
        console.error("❌ Error al cargar usuarios:", error);
      });
  }, []);*/


  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">
          ❌ Error al cargar usuarios: {error.message}
        </div>
      ) : (
        <TablaUsuarios
          columns={columns}
          data={todos}
          onFilteredChange={(rows) => setUsuariosFiltrados(rows)}
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
    </div>
  );
}

