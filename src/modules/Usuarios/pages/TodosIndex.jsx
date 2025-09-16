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


export function TodosIndex() {
  const [data, setData] = useState([]);
  const [alumnosFiltrados, setAlumnosFiltrados] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/ldap/usuarios?tipo=all`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setAlumnosFiltrados(data); // al principio, sin filtros
      })
      .catch((error) => {
        console.error("❌ Error al cargar profesores:", error);
      });
  }, []);


  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaUsuarios
        columns={columns}
        data={data}
        onFilteredChange={(rows) => setAlumnosFiltrados(rows)}
      />
     
    </div>
  );
}

