import { useEffect, useState } from "react";
import { columns } from "../components/colums";
import { TablaUsuarios } from "../components/TablaUsuarios";
import { DialogoListadoCurso } from "../components/DialogoListadoCurso";
import { Loader } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Printer, Tag, Users } from "lucide-react";

export function AlumnosIndex() {
  const [data, setData] = useState([]);
  const [alumnosFiltrados, setAlumnosFiltrados] = useState([]);
  const [abrirDialogoListadoCurso, setAbrirDialogoListadoCurso] =
    useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(true); // nuevo estado

  useEffect(() => {
    setLoading(true); // empieza la carga
    fetch(`${API_URL}/ldap/usuarios?tipo=students`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setAlumnosFiltrados(data);
      })
      .catch((error) => {
        console.error("❌ Error al cargar alumnos:", error);
      })
      .finally(() => {
        setLoading(false); // termina la carga
      });
  }, []);

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <TablaUsuarios
          columns={columns}
          data={data}
          onFilteredChange={(rows) => setAlumnosFiltrados(rows)}
          acciones={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Printer className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setAbrirDialogoListadoCurso(true)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Alumnos por grupo
                </DropdownMenuItem>
                {/* Aquí puedes añadir más opciones */}
                {/* <DropdownMenuItem>Otro documento</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
      )}

      <DialogoListadoCurso
        alumnos={alumnosFiltrados}
        open={abrirDialogoListadoCurso}
        onOpenChange={setAbrirDialogoListadoCurso}
      />
    </div>
  );
}
