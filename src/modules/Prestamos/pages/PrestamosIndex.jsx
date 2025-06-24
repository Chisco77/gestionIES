import { useEffect, useState } from "react";
import { columns } from "../components/columns";
import { TablaPrestamos } from "../components/TablaPrestamos";
import { DialogoAsignacionMasiva } from "../components/DialogoAsignacionMasiva";
import { DialogoEditarPrestamos } from "../components/DialogoEditarPrestamos";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Printer,
  Tag,
  Users,
  Plus,
  Trash2,
  Pencil,
  CopyPlus,
} from "lucide-react";

export function PrestamosIndex() {
  const [data, setData] = useState([]);
  const [prestamosFiltrados, setPrestamosFiltrados] = useState([]);
  const [abrirInsertarMasivo, setAbrirInsertarMasivo] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [abrirEditar, setAbrirEditar] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/db/prestamos/agrupados", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("📚 Préstamos enriquecidos:", data);
        setData(data);
        setPrestamosFiltrados(data); // al principio, sin filtros
      })
      .catch((error) => {
        console.error("❌ Error al cargar préstamos:", error);
      });
  }, []);

  const handleEditar = (seleccionado) => {
    if (!seleccionado) return;
    setAlumnoSeleccionado(seleccionado);
    setAbrirEditar(true);
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      {/* Tabla */}
      <TablaPrestamos
        columns={columns}
        data={data}
        onFilteredChange={(rows) => setPrestamosFiltrados(rows)}
        acciones={(seleccionado) => (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAbrirInsertar(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAbrirInsertarMasivo(true)}
            >
              <CopyPlus className="w-4 h-4" />
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
        informes={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Printer className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setAbrirDialogoEtiquetas(true)}>
                <Tag className="mr-2 h-4 w-4" />
                Etiquetas libros
              </DropdownMenuItem>
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
      <DialogoAsignacionMasiva
        open={abrirInsertarMasivo}
        onClose={() => setAbrirInsertarMasivo(false)}
        onSuccess={() => {
          // refresca los préstamos tras asignar
          fetch("http://localhost:5000/api/db/prestamos", {
            credentials: "include",
          })
            .then((res) => res.json())
            .then(setData);
        }}
      />
      <DialogoEditarPrestamos
        open={abrirEditar}
        onClose={() => setAbrirEditar(false)}
        alumno={alumnoSeleccionado}
      />
    </div>
  );
}
