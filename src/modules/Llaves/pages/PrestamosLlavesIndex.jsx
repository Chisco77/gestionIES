/**
 * PrestamosLlavesIndex.jsx - Página de gestión de préstamos de llaves
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Fecha de creación: 2025
 *
 * Descripción:
 * Página principal de administración de préstamos de llaves.
 * - Muestra una tabla interactiva de préstamos de llaves (TablaPrestamosLlaves)
 * - Permite filtrar por planta y texto (nombre de profesor o llave)
 * - Integra selección de fila única, paginación y acciones sobre la fila seleccionada.
 *
 * Dependencias:
 * - React (useState, useEffect)
 * - ../components/TablaPrestamosLlaves
 * - ../components/columns
 * - @/components/ui/button
 * - lucide-react (iconos)
 */

import { useEffect, useState } from "react";
import { columns } from "../components/columns";
import { TablaPrestamosLlaves } from "../components/TablaPrestamosLlaves";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Printer } from "lucide-react";

export function PrestamosLlavesIndex() {
  const [prestamos, setPrestamos] = useState([]);
  const [prestamosFiltrados, setPrestamosFiltrados] = useState([]);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [abrirInsertar, setAbrirInsertar] = useState(false);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [abrirEliminar, setAbrirEliminar] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

  const fetchPrestamos = async () => {
    try {
      const res = await fetch(`${API_BASE}/prestamos-llaves/agrupados`, {
        credentials: "include",
      });
      const data = await res.json();

      // Aplanar estructura para construir la tabla
      const prestamosAplanados = data.flatMap((prof) =>
        prof.prestamos.map((p) => ({
          ...p,
          profesor: prof.nombre,
          planta: p.planta || "",
          fechaEntrega: p.fechaentrega,
          fechaDevolucion: p.fechadevolucion,
        }))
      );

      setPrestamos(prestamosAplanados);
    } catch (error) {
      console.error("❌ Error al obtener préstamos de llaves:", error);
      setPrestamos([]);
    }
  };

  useEffect(() => {
    fetchPrestamos();
  }, []);

  const handleEditar = (prestamo) => {
    if (!prestamo) {
      alert("Selecciona un préstamo para editar.");
      return;
    }
    setPrestamoSeleccionado(prestamo);
    setAbrirEditar(true);
  };

  const handleEliminar = (prestamo) => {
    if (!prestamo) {
      alert("Selecciona un préstamo para eliminar.");
      return;
    }
    setPrestamoSeleccionado(prestamo);
    setAbrirEliminar(true);
  };

  const onSuccess = () => {
    fetchPrestamos();
    setAbrirInsertar(false);
    setAbrirEditar(false);
    setAbrirEliminar(false);
    setPrestamoSeleccionado(null);
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaPrestamosLlaves
        columns={columns}
        data={prestamos}
        onFilteredChange={(filtrados) => setPrestamosFiltrados(filtrados)}
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
          <Button variant="outline" size="icon">
            <Printer className="w-5 h-5" />
          </Button>
        }
      />

    </div>
  );
}
