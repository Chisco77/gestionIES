import { useEffect, useState } from "react";
import { columns } from "../components/columns";
import { TablaPrestamos } from "../components/TablaPrestamos";
import { DialogoAsignacionMasiva } from "../components/DialogoAsignacionMasiva";
import { DialogoEditarPrestamos } from "../components/DialogoEditarPrestamos";
import { DialogoPrestarLibros } from "../components/DialogoPrestarLibros";
import { DialogoDocumentoPrestamo } from "../components/DialogoDocumentoPrestamo";

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
  LibraryBig,
} from "lucide-react";

import { DialogoEtiquetas } from "../components/DialogoEtiquetas";

export function PrestamosProfesoresIndex() {
  const [data, setData] = useState([]);
  const [prestamosFiltrados, setPrestamosFiltrados] = useState([]);
  const [abrirInsertarMasivo, setAbrirInsertarMasivo] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [abrirDialogoPrestar, setAbrirDialogoPrestar] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const [abrirDialogoEtiquetas, setAbrirDialogoEtiquetas] = useState(false);

  const [abrirDialogoDocumentoPrestamo, setAbrirDialogoDocumentoPrestamo] =
    useState(false);

  // Obtiene prestamos agrupados por uid
  const cargarPrestamos = (esalumno = false) => {
    fetch(`${API_URL}/db/prestamos/agrupados`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setPrestamosFiltrados(data);
      })
      .catch((error) => {
        console.error("❌ Error al cargar préstamos:", error);
      });
  };

  useEffect(() => {
    cargarPrestamos();
  }, []);

  const handleEditar = (seleccionado) => {
    if (!seleccionado) return;
    setAlumnoSeleccionado(seleccionado);
    setAbrirEditar(true);
  };

  const uidsConPrestamo = data.map((p) => p.uid);

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaPrestamos
        columns={columns}
        data={data}
        onFilteredChange={(rows) => setPrestamosFiltrados(rows)}
        acciones={(seleccionado) => (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAbrirDialogoPrestar(true)}
              title="Prestar libros a un alumno"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAbrirInsertarMasivo(true)}
              title="Asignación masiva"
            >
              <LibraryBig className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEditar(seleccionado)}
              disabled={!seleccionado}
              title="Editar préstamos"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEliminar(seleccionado)}
              disabled={!seleccionado}
              title="Eliminar préstamos"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
        informes={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" title="Informes">
                <Printer className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setAbrirDialogoDocumentoPrestamo(true)}
              >
                <Tag className="mr-2 h-4 w-4" />
                Documento Préstamo Libros{" "}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAbrirDialogoEtiquetas(true)}>
                <Tag className="mr-2 h-4 w-4" />
                Etiquetas libros
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <DialogoAsignacionMasiva
        open={abrirInsertarMasivo}
        onClose={() => setAbrirInsertarMasivo(false)}
        onSuccess={cargarPrestamos}
      />

      <DialogoEditarPrestamos
        open={abrirEditar}
        onClose={() => setAbrirEditar(false)}
        alumno={alumnoSeleccionado}
        onSuccess={cargarPrestamos}
      />

      <DialogoPrestarLibros
        open={abrirDialogoPrestar}
        onClose={() => setAbrirDialogoPrestar(false)}
        onSuccess={() => {
          cargarPrestamos();
          setAbrirDialogoPrestar(false);
        }}
        uidsConPrestamo={uidsConPrestamo}
      />

      <DialogoDocumentoPrestamo
        open={abrirDialogoDocumentoPrestamo}
        onOpenChange={setAbrirDialogoDocumentoPrestamo}
        alumnos={prestamosFiltrados} // o simplemente data
      />

      {/* Diálogo para generar etiquetas */}
      <DialogoEtiquetas
        alumnos={prestamosFiltrados}
        open={abrirDialogoEtiquetas}
        onOpenChange={setAbrirDialogoEtiquetas}
      />
    </div>
  );
}
