import { useEffect, useState } from "react";
import { columns } from "../components/columns";
import { TablaCursos } from "../components/TablaCursos";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DialogoInsertarCurso } from "../components/DialogoInsertarCurso";
import { DialogoEditarCurso } from "../components/DialogoEditarCurso";
import { DialogoEliminarCurso } from "../components/DialogoEliminarCurso";
import { API_BASE_URL } from '../../../config';

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
      const response = await fetch(`${API_BASE_URL}/db/cursos`, {
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

  const onEliminarSuccess = async () => {
    await fetchCursos();
    setAbrirDialogoEliminar(false);
    setCursoSeleccionado(null);
  };

  const onInsertarSuccess = async () => {
    await fetchCursos();
    setAbrirDialogoInsertar(false);
    setCursoSeleccionado(null);
  };

  // Carga inicial
  useEffect(() => {
    fetchCursos();
  }, []);

  const handleEditar = (curso) => {
    if (!curso) {
      alert("Selecciona un curso para editar.");
      return;
    }
    setCursoSeleccionado(curso);
    setAbrirDialogoEditar(true);
  };

  const handleEliminar = (curso) => {
    if (!curso) {
      alert("Selecciona un curso para eliminar.");
      return;
    }
    setCursoSeleccionado(curso);
    setAbrirDialogoEliminar(true);
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaCursos
        columns={columns}
        data={data}
        onFilteredChange={(rows) => setCursosFiltrados(rows)}
        acciones={(seleccionado) => (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAbrirDialogoInsertar(true)}
            >
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
      <DialogoEditarCurso
        open={abrirDialogoEditar}
        onClose={() => setAbrirDialogoEditar(false)}
        cursoSeleccionado={cursoSeleccionado}
        onSuccess={onEditarSuccess}
      />

      <DialogoEliminarCurso
        open={abrirDialogoEliminar}
        onClose={() => setAbrirDialogoEliminar(false)}
        cursoSeleccionado={cursoSeleccionado}
        onSuccess={onEliminarSuccess}
      />

      <DialogoInsertarCurso
        open={abrirDialogoInsertar}
        onClose={() => setAbrirDialogoInsertar(false)}
        cursoSeleccionado={cursoSeleccionado}
        onSuccess={onInsertarSuccess}
      />      
    </div>
  );
}
