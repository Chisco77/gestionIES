// PerfilesUsuarioIndex.jsx - Página de gestión de perfiles de usuario

import { useEffect, useState } from "react";
import { TablaPerfilesUsuario } from "../components/TablaPerfilesUsuario";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DialogoInsertarPerfil } from "../components/DialogoInsertarPerfil";
import { DialogoEditarPerfil } from "../components/DialogoEditarPerfil";
import { DialogoEliminarPerfil } from "../components/DialogoEliminarPerfil";
import { columns } from "../components/columns"; // columnas definidas para perfiles
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PerfilesUsuarioIndex() {
  const [perfiles, setPerfiles] = useState([]);
  const [perfilesFiltrados, setPerfilesFiltrados] = useState([]);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);
  const [abrirInsertar, setAbrirInsertar] = useState(false);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [abrirEliminar, setAbrirEliminar] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Obtener todos los perfiles
  const fetchPerfiles = async () => {
    try {
      const res = await fetch(`${API_URL}/db/perfiles`, {
        credentials: "include",
      });
      const data = await res.json();
      setPerfiles(data);
    } catch (error) {
      console.error("❌ Error al obtener perfiles:", error);
      setPerfiles([]);
    }
  };

  useEffect(() => {
    fetchPerfiles();
  }, []);

  const handleEditar = (perfil) => {
    if (!perfil) {
      alert("Selecciona un perfil para editar.");
      return;
    }
    setPerfilSeleccionado(perfil);
    setAbrirEditar(true);
  };

  const handleEliminar = (perfil) => {
    if (!perfil) {
      alert("Selecciona un perfil para eliminar.");
      return;
    }
    setPerfilSeleccionado(perfil);
    setAbrirEliminar(true);
  };

  const onSuccess = () => {
    fetchPerfiles();
    setAbrirInsertar(false);
    setAbrirEditar(false);
    setAbrirEliminar(false);
    setPerfilSeleccionado(null);
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaPerfilesUsuario
        columns={columns}
        data={perfiles}
        onFilteredChange={(filtrados) => setPerfilesFiltrados(filtrados)}
        acciones={(seleccionado) => (
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAbrirInsertar(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-500 text-white">
                  <p>Nuevo perfil</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditar(seleccionado)}
                    disabled={!seleccionado}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-500 text-white">
                  <p>Editar perfil</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEliminar(seleccionado)}
                    disabled={!seleccionado}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-500 text-white">
                  <p>Eliminar perfil</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      />

      <DialogoInsertarPerfil
        open={abrirInsertar}
        onClose={() => setAbrirInsertar(false)}
        onSuccess={onSuccess}
      />

      <DialogoEditarPerfil
        open={abrirEditar}
        onClose={() => setAbrirEditar(false)}
        perfilSeleccionado={perfilSeleccionado}
        onSuccess={onSuccess}
      />

      <DialogoEliminarPerfil
        open={abrirEliminar}
        onClose={() => setAbrirEliminar(false)}
        perfilSeleccionado={perfilSeleccionado}
        onSuccess={onSuccess}
      />
    </div>
  );
}
