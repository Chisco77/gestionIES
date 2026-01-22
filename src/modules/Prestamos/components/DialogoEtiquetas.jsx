/**
 * Componente: DialogoEtiquetas
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Este componente muestra un diálogo para configurar y generar etiquetas en PDF
 * para una lista de usuarios (alumnos, becarios, etc.).
 * Permite:
 *   - Seleccionar el número de etiquetas por usuario (1-12)
 *   - Seleccionar el curso académico
 *   - Elegir tamaño de etiqueta (40 o 24 por página)
 *   - Personalizar el nombre del archivo PDF
 *   - Visualizar barra de progreso mientras se genera el PDF
 *   - Generar un PDF con la información de los usuarios y el logo institucional
 *
 * Props:
 *   - usuarios: array → lista de usuarios que tendrán etiquetas
 *       - Cada usuario debe contener al menos:
 *           - nombreUsuario: string
 *           - curso: string
 *   - open: boolean → indica si el diálogo está abierto
 *   - onOpenChange: function → callback para abrir/cerrar el diálogo
 *
 * Estados internos:
 *   - etiquetasPorUsuario: string → número de etiquetas por usuario seleccionado
 *   - cursoSeleccionado: string → curso académico seleccionado
 *   - nombrePdf: string → nombre del archivo PDF
 *   - tamanoEtiqueta: string → tamaño de etiqueta seleccionado (40 o 24)
 *   - loading: boolean → indica si se está generando el PDF
 *   - progress: number → porcentaje de progreso de generación del PDF
 *   - showSuccessToast: boolean → muestra un toast de éxito al finalizar
 *
 * Funciones principales:
 *   - generatePdfLabels():
 *       - Crea un objeto jsPDF con formato A4
 *       - Calcula el layout de la etiqueta según el tamaño elegido
 *       - Dibuja el logo y nombre de usuario centrado en cada etiqueta
 *       - Ajusta el texto si el nombre es demasiado largo
 *       - Añade información del curso académico
 *       - Controla saltos de página automáticamente
 *       - Actualiza el estado `progress` para mostrar la barra de progreso
 *       - Guarda el PDF con la extensión .pdf automáticamente
 *
 * Uso de librerías:
 *   - jsPDF → generación de PDF
 *   - React → useState, useEffect
 *   - Componentes UI: Dialog, Select, Input, Button
 *   - Logo importado desde `/src/images/logo.png`
 *
 * Flujo de uso:
 *   1. Abrir el diálogo con `open={true}`.
 *   2. Configurar:
 *       - Número de etiquetas por usuario
 *       - Curso académico
 *       - Tamaño de etiqueta
 *       - Nombre del PDF
 *   3. Pulsar "Confirmar y generar":
 *       - Muestra barra de progreso
 *       - Genera el PDF
 *       - Al finalizar, muestra un toast de éxito
 *       - Cierra el diálogo
 *
 */

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import logo from "/src/images/logo.png";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DialogoEtiquetas({ usuarios, open, onOpenChange }) {
  const [etiquetasPorUsuario, setEtiquetasPorUsuario] = useState("1");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("2024-25");
  const [nombrePdf, setNombrePdf] = useState("etiquetasbecarios");
  const [tamanoEtiqueta, setTamanoEtiqueta] = useState("40");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const generatePdfLabels = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const layout = {
      40: { cols: 4, rows: 10, width: 52.5, height: 29.7 },
      24: { cols: 3, rows: 8, width: 70, height: 37 },
    }[tamanoEtiqueta];

    const labelsPerPage = layout.cols * layout.rows;
    const logoWidth = 12;
    const logoHeight = 8;

    const image = await new Promise((resolve) => {
      const img = new Image();
      //img.src = img.src = `${import.meta.env.BASE_URL}logo.png`;
      img.src = img.src=`${import.meta.env.BASE_URL}public/logo.png`

      img.onload = () => resolve(img);
    });

    let etiquetas = [];
    usuarios.forEach((usuario) => {
      for (let i = 0; i < Number(etiquetasPorUsuario); i++) {
        etiquetas.push(usuario);
      }
    });

    const total = etiquetas.length;

    for (let i = 0; i < total; i++) {
      const usuario = etiquetas[i];
      if (i > 0 && i % labelsPerPage === 0) doc.addPage();

      const indexInPage = i % labelsPerPage;
      const col = indexInPage % layout.cols;
      const row = Math.floor(indexInPage / layout.cols);
      const x = col * layout.width;
      const y = row * layout.height;
      const centerX = x + layout.width / 2;
      const logoX = centerX - logoWidth / 2;
      const logoY = y + 3;

      doc.addImage(image, "JPEG", logoX, logoY, logoWidth, logoHeight);

      let nombreCompleto = `${usuario.nombreUsuario}`;
      if (nombreCompleto.length > 25)
        nombreCompleto = nombreCompleto.slice(0, 22) + "…";

      doc.setFontSize(9);
      doc.text(nombreCompleto, centerX, y + 15, { align: "center" });

      doc.setFontSize(8);
      doc.text(
        `Curso: ${usuario.curso} - ${cursoSeleccionado}`,
        centerX,
        y + 18,
        { align: "center" }
      );

      if (i % 10 === 0) await new Promise((r) => setTimeout(r, 0));
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    doc.save(nombrePdf.endsWith(".pdf") ? nombrePdf : `${nombrePdf}.pdf`);
  };

  useEffect(() => {
    if (showSuccessToast) {
      const timeout = setTimeout(() => setShowSuccessToast(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showSuccessToast]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Configuración de etiquetas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Número de etiquetas por alumno
              </label>
              <Select
                value={etiquetasPorUsuario}
                onValueChange={setEtiquetasPorUsuario}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Curso académico
              </label>
              <Select
                value={cursoSeleccionado}
                onValueChange={setCursoSeleccionado}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }).map((_, i) => {
                    const yearStart = 2020 + i;
                    const value = `${yearStart}-${(yearStart + 1).toString().slice(2)}`;
                    return (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Formato de etiqueta
              </label>
              <Select value={tamanoEtiqueta} onValueChange={setTamanoEtiqueta}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="40">40 (Apli 01286 10x4)</SelectItem>
                  <SelectItem value="24">24 (Apli 01293 8x3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre del archivo PDF
              </label>
              <Input
                type="text"
                value={nombrePdf}
                onChange={(e) => setNombrePdf(e.target.value)}
                placeholder="Ejemplo: etiquetas_2025"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                No es necesario añadir extensión .pdf, se añadirá
                automáticamente.
              </p>
            </div>
          </div>
          {loading && (
            <div className="w-full">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-600 h-4 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-center text-sm mt-2 text-gray-700">
                Generando etiquetas... {progress}%
              </div>
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button
              disabled={loading || nombrePdf.trim() === ""}
              onClick={async () => {
                setLoading(true);
                setProgress(0);
                setShowSuccessToast(false);
                try {
                  await generatePdfLabels();
                  setShowSuccessToast(true);
                  onOpenChange?.(false);
                } finally {
                  setLoading(false);
                  setProgress(0);
                }
              }}
            >
              {loading ? "Generando..." : "Confirmar y generar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out">
          PDF generado con éxito
        </div>
      )}
    </>
  );
}
