// BecariosIndex.jsx
import { useEffect, useState } from "react";
import { columns } from "../components/colums";
import { TablaUsuarios } from "../components/TablaUsuarios";
import { DialogoEtiquetas } from "../components/DialogoEtiquetas";
import { API_BASE_URL } from '../../../config';

export function TodosIndex() {
  const [data, setData] = useState([]);
  const [alumnosFiltrados, setAlumnosFiltrados] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/ldap/usuarios?tipo=all`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ Datos LDAP:", data);
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
      <div className="flex gap-4">
        <DialogoEtiquetas alumnos={alumnosFiltrados} />
      </div>
    </div>
  );
}

