/*
export function CursosIndex() {
  const [data, setData] = useState([]);
  const [cursosFiltrados, setCursosFiltrados] = useState([]);
  const [abrirDialogoInsertar, setAbrirDialogoInsertar] = useState(false);
  const [abrirDialogoEditar, setAbrirDialogoEditar] = useState(false);
  const [abrirDialogoEliminar, setAbrirDialogoEliminar] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/db/cursos", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ Datos LDAP:", data);
        setData(data);
        setCursosFiltrados(data); // al principio, sin filtros
      })
      .catch((error) => {
        console.error("❌ Error al cargar Cursos:", error);
      });
  }, []);

  const handleEditar = () => {
    if (cursosFiltrados.length === 1) {
      setCursoSeleccionado(cursosFiltrados[0]);
      setAbrirDialogoEditar(true);
    } else {
      alert("Selecciona exactamente un curso para editar.");
    }
  };

  const handleEliminar = () => {
    if (cursosFiltrados.length === 1) {
      setCursoSeleccionado(cursosFiltrados[0]);
      setAbrirDialogoEliminar(true);
    } else {
      alert("Selecciona exactamente un curso para eliminar.");
    }
  };
  return (
    <div className="container mx-auto py-10 p-12 space-y-6">

      <TablaCursos
        columns={columns}
        data={data}
        onFilteredChange={(rows) => setCursosFiltrados(rows)}
        acciones={
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAbrirDialogoInsertar(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleEditar}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleEliminar}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        }
      />
      <DialogoEditarCurso
        open={abrirDialogoEditar}
        onClose={() => setAbrirDialogoEditar(false)}
        cursoSeleccionado={cursoSeleccionado}
        onSuccess={() => {
          // recarga la lista o actualiza según sea necesario
        }}
      />
    </div>
  );
}*/

import { useEffect, useState } from "react";
import { columns } from "../components/columns";
import { TablaCursos } from "../components/TablaCursos";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DialogoInsertarCurso } from "../components/DialogoInsertarCurso";
import { DialogoEditarCurso } from "../components/DialogoEditarCurso";
import { DialogoEliminarCurso } from "../components/DialogoEliminarCurso";

export function CursosIndex() {
  const [data, setData] = useState([]);
  const [cursosFiltrados, setCursosFiltrados] = useState([]);
  const [abrirDialogoInsertar, setAbrirDialogoInsertar] = useState(false);
  const [abrirDialogoEditar, setAbrirDialogoEditar] = useState(false);
  const [abrirDialogoEliminar, setAbrirDialogoEliminar] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);

  // Función para cargar cursos
  const fetchCursos = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/db/cursos", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error al obtener cursos");
      const data = await response.json();
      setData(data);
      setCursosFiltrados(data);
    } catch (error) {
      console.error("❌ Error al cargar Cursos:", error);
      setData([]);
      setCursosFiltrados([]);
    }
  };

  const onEditarSuccess = async () => {
    await fetchCursos();
    setAbrirDialogoEditar(false);
    setCursoSeleccionado(null);
  };

  // Carga inicial
  useEffect(() => {
    fetchCursos();
  }, []);

 const handleEditar = () => {
  if (cursosFiltrados.length === 1) {
    // Buscar el curso real en data por id, no usar cursosFiltrados directamente
    const cursoId = cursosFiltrados[0].id;
    const seleccionado = data.find((c) => c.id === cursoId);
    if (seleccionado) {
      setCursoSeleccionado(seleccionado);
      setAbrirDialogoEditar(true);
    } else {
      alert("Curso seleccionado no encontrado");
    }
  } else {
    alert("Selecciona exactamente un curso para editar.");
  }
};


  const handleEliminar = () => {
    if (cursosFiltrados.length === 1) {
      setCursoSeleccionado(cursosFiltrados[0]);
      setAbrirDialogoEliminar(true);
    } else {
      alert("Selecciona exactamente un curso para eliminar.");
    }
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaCursos
        columns={columns}
        data={data}
        onFilteredChange={(rows) => setCursosFiltrados(rows)}
        acciones={
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAbrirDialogoInsertar(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleEditar}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleEliminar}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        }
      />
      <DialogoEditarCurso
        open={abrirDialogoEditar}
        onClose={() => setAbrirDialogoEditar(false)}
        cursoSeleccionado={cursoSeleccionado}
        onSuccess={onEditarSuccess}
      />
      {/* Aquí puedes añadir DialogoInsertarCurso y DialogoEliminarCurso si quieres */}
    </div>
  );
}
