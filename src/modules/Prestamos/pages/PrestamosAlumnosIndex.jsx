/*import { useState, useEffect } from "react";
import { columns } from "../components/columns";
import { TablaPrestamos } from "../components/TablaPrestamos";
import { DialogoAsignacionMasiva } from "../components/DialogoAsignacionMasiva";
import { DialogoEditarPrestamos } from "../components/DialogoEditarPrestamos";
import { DialogoPrestarLibros } from "../components/DialogoPrestarLibros";
import { DialogoDocumentoPrestamo } from "../components/DialogoDocumentoPrestamo";
import { DialogoEtiquetas } from "../components/DialogoEtiquetas";
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
  Plus,
  Trash2,
  Pencil,
  LibraryBig,
  Loader,
} from "lucide-react";
import { usePrestamos } from "@/hooks/usePrestamos";

export function PrestamosAlumnosIndex() {
  const [prestamosFiltrados, setPrestamosFiltrados] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [abrirInsertarMasivo, setAbrirInsertarMasivo] = useState(false);
  const [abrirDialogoPrestar, setAbrirDialogoPrestar] = useState(false);
  const [abrirDialogoDocumentoPrestamo, setAbrirDialogoDocumentoPrestamo] =
    useState(false);
  const [abrirDialogoEtiquetas, setAbrirDialogoEtiquetas] = useState(false);

  const { data: prestamos, isLoading, error, refetch } = usePrestamos({
    esAlumno: true,
  });

  const uidsConPrestamo = prestamos?.map((p) => p.uid) || [];

  // Inicializar préstamos filtrados al cargar la data
  useEffect(() => {
    if (prestamos?.length > 0) {
      setPrestamosFiltrados(prestamos);
    }
  }, [prestamos]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error.message}</div>;
  }

  const handleEliminar = async (alumno) => {
    if (!alumno) return;
    // lógica de eliminar préstamos del backend
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaPrestamos
        columns={columns}
        data={prestamos}
        onFilteredChange={(filasFiltradas) => {
          // filasFiltradas debe ser un array de objetos (alumno)
          setPrestamosFiltrados(filasFiltradas);
        }}
        onSelectUsuario={(usuario) => setAlumnoSeleccionado(usuario)}
        acciones={(alumnoSeleccionado) => (
          <>
            <Button
              onClick={() => setAbrirDialogoPrestar(true)}
              title="Prestar libros"
              variant="outline"
              size="icon"
              disabled={!alumnoSeleccionado}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setAbrirInsertarMasivo(true)}
              title="Asignación masiva"
              variant="outline"
              size="icon"
            >
              <LibraryBig className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setAbrirEditar(true)}
              disabled={!alumnoSeleccionado}
              title="Editar préstamos"
              variant="outline"
              size="icon"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleEliminar(alumnoSeleccionado)}
              disabled={!alumnoSeleccionado}
              title="Eliminar préstamos"
              variant="outline"
              size="icon"
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
                Documento Préstamo Libros
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
        onSuccess={refetch}
      />

      <DialogoEditarPrestamos
        open={abrirEditar}
        onClose={() => setAbrirEditar(false)}
        usuario={alumnoSeleccionado}
        onSuccess={refetch}
      />

      <DialogoPrestarLibros
        open={abrirDialogoPrestar}
        onClose={() => setAbrirDialogoPrestar(false)}
        onSuccess={() => {
          refetch();
          setAbrirDialogoPrestar(false);
        }}
        uidsConPrestamo={uidsConPrestamo}
        esAlumno={true}
      />

      <DialogoDocumentoPrestamo
        open={abrirDialogoDocumentoPrestamo}
        onOpenChange={setAbrirDialogoDocumentoPrestamo}
        alumnos={prestamosFiltrados} // solo visibles
      />

      <DialogoEtiquetas
        usuarios={prestamosFiltrados} // solo visibles
        open={abrirDialogoEtiquetas}
        onOpenChange={setAbrirDialogoEtiquetas}
      />
    </div>
  );
}
*/

import { useState } from "react";
import { columns } from "../components/columns";
import { TablaPrestamos } from "../components/TablaPrestamos";
import { DialogoAsignacionMasiva } from "../components/DialogoAsignacionMasiva";
import { DialogoEditarPrestamos } from "../components/DialogoEditarPrestamos";
import { DialogoPrestarLibros } from "../components/DialogoPrestarLibros";
import { DialogoDocumentoPrestamo } from "../components/DialogoDocumentoPrestamo";
import { DialogoEtiquetas } from "../components/DialogoEtiquetas";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Printer, Tag, Plus, Trash2, Pencil, LibraryBig, Loader } from "lucide-react";
import { usePrestamos } from "@/hooks/usePrestamos";

export function PrestamosAlumnosIndex() {
  const [prestamosFiltrados, setPrestamosFiltrados] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [abrirInsertarMasivo, setAbrirInsertarMasivo] = useState(false);
  const [abrirDialogoPrestar, setAbrirDialogoPrestar] = useState(false);
  const [abrirDialogoDocumentoPrestamo, setAbrirDialogoDocumentoPrestamo] = useState(false);
  const [abrirDialogoEtiquetas, setAbrirDialogoEtiquetas] = useState(false);

  const { data: prestamos, isLoading, error, refetch } = usePrestamos({ esAlumno: true });
  const uidsConPrestamo = prestamos?.map((p) => p.uid) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error.message}</div>;
  }

  const handleEliminar = async (alumno) => {
    if (!alumno) return;
    // lógica de eliminar préstamos del backend
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaPrestamos
        columns={columns}
        data={prestamos}
        onFilteredChange={(filasFiltradas) => setPrestamosFiltrados(filasFiltradas)}
        onSelectUsuario={(usuario) => setAlumnoSeleccionado(usuario)}
        acciones={(alumno) => (
          <>
            <Button
              onClick={() => setAbrirDialogoPrestar(true)}
              title="Prestar libros"
              variant="outline"
              size="icon"
              disabled={!alumno}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setAbrirInsertarMasivo(true)}
              title="Asignación masiva"
              variant="outline"
              size="icon"
            >
              <LibraryBig className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setAbrirEditar(true)}
              disabled={!alumno}
              title="Editar préstamos"
              variant="outline"
              size="icon"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleEliminar(alumno)}
              disabled={!alumno}
              title="Eliminar préstamos"
              variant="outline"
              size="icon"
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
              <DropdownMenuItem onClick={() => setAbrirDialogoDocumentoPrestamo(true)}>
                <Tag className="mr-2 h-4 w-4" /> Documento Préstamo Libros
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAbrirDialogoEtiquetas(true)}>
                <Tag className="mr-2 h-4 w-4" /> Etiquetas libros
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Diálogos */}
      <DialogoAsignacionMasiva
        open={abrirInsertarMasivo}
        onClose={() => setAbrirInsertarMasivo(false)}
        onSuccess={refetch}
      />

      <DialogoEditarPrestamos
        open={abrirEditar}
        onClose={() => setAbrirEditar(false)}
        usuario={alumnoSeleccionado}
        onSuccess={refetch}
      />

      <DialogoPrestarLibros
        open={abrirDialogoPrestar}
        onClose={() => setAbrirDialogoPrestar(false)}
        onSuccess={() => {
          refetch();
          setAbrirDialogoPrestar(false);
        }}
        uidsConPrestamo={uidsConPrestamo}
        esAlumno={true}
      />

      <DialogoDocumentoPrestamo
        open={abrirDialogoDocumentoPrestamo}
        onOpenChange={setAbrirDialogoDocumentoPrestamo}
        alumnos={prestamosFiltrados} // solo filtrados
      />

      <DialogoEtiquetas
        usuarios={prestamosFiltrados} // solo filtrados
        open={abrirDialogoEtiquetas}
        onOpenChange={setAbrirDialogoEtiquetas}
      />
    </div>
  );
}
