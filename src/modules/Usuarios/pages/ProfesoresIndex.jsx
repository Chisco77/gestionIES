// BecariosIndex.jsx
import { useEffect, useState } from "react";
import { columns } from "../components/colums";
import { TablaUsuarios } from "../components/TablaUsuarios";


export function ProfesoresIndex() {
  const [data, setData] = useState([]);
  const [alumnosFiltrados, setAlumnosFiltrados] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/ldap/usuarios?tipo=teachers`, {
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

