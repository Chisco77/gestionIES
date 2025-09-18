/**
 * DialogoEtiquetas.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 * 
 * Componente de diálogo para la configuración y generación de etiquetas
 * PDF de alumnos o profesores.
 *
 * Funcionalidades:
 * - Selección de número de etiquetas por usuario (1 a 12)
 * - Selección de curso académico (2020-21 a 2030-31)
 * - Personalización del nombre del archivo PDF
 * - Generación de etiquetas en formato A4 con:
 *     • Logo institucional
 *     • Nombre del usuario (limitado a 25 caracteres)
 *     • Curso y curso académico seleccionado
 * - Visualización de barra de progreso durante la generación del PDF
 * - Notificación visual al finalizar la generación
 *
 * Estados principales:
 * - etiquetasPorUsuario: número de etiquetas por cada usuario
 * - cursoSeleccionado: curso académico a mostrar en la etiqueta
 * - nombrePdf: nombre del archivo PDF a generar
 * - loading: indica si se está generando el PDF
 * - progress: porcentaje de progreso de la generación
 * - showSuccessToast: muestra un toast al finalizar
 *
 * Dependencias:
 * - jsPDF para generación de PDFs
 * - Componentes UI: Dialog, Select, Input, Button
 * - Imagen de logo: /src/images/logo.png
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
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  /*const generatePdfLabels = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const labelWidth = 52.5;
    const labelHeight = 29.7;
    const cols = 4;
    const rows = 10;
    const labelsPerPage = cols * rows;
    const logoWidth = 18;
    const logoHeight = 8;

    const image = await new Promise((resolve) => {
      const img = new Image();
      img.src = logo;
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
      const col = indexInPage % cols;
      const row = Math.floor(indexInPage / cols);
      const x = col * labelWidth;
      const y = row * labelHeight;
      const centerX = x + labelWidth / 2;
      const logoX = centerX - logoWidth / 2;
      const logoY = y + 3;

      doc.addImage(image, "JPEG", logoX, logoY, logoWidth, logoHeight);

      let nombreCompleto = `${usuario.givenName} ${usuario.sn}`;
      if (nombreCompleto.length > 25)
        nombreCompleto = nombreCompleto.slice(0, 22) + "…";

      doc.setFontSize(9);
      doc.text(nombreCompleto, centerX, y + 15, { align: "center" });

      doc.setFontSize(8);
      doc.text(
        `Curso: ${usuario.groups[1]} - ${cursoSeleccionado}`,
        centerX,
        y + 21,
        { align: "center" }
      );

      if (i % 10 === 0) await new Promise((r) => setTimeout(r, 0));
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    doc.save(nombrePdf.endsWith(".pdf") ? nombrePdf : `${nombrePdf}.pdf`);
  };*/

  const generatePdfLabels = async () => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const labelWidth = 52.5;
  const labelHeight = 29.7;
  const cols = 4;
  const rows = 10;
  const labelsPerPage = cols * rows;
  const logoWidth = 18;
  const logoHeight = 8;

  // fallback logo institucional
  const fallbackLogo = await new Promise((resolve) => {
    const img = new Image();
    img.src = logo;
    img.onload = () => resolve(img);
  });

  // función para cargar foto del usuario
  const loadUserImage = async (uid) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const extensions = ["jpg", "jpeg", "png"];

    for (const ext of extensions) {
      try {
        const res = await fetch(`${API_URL}/uploads/alumnos/${uid}.${ext}`, {
          credentials: "include",
        });
        if (res.ok) {
          const blob = await res.blob();
          return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result); // Base64
            reader.readAsDataURL(blob);
          });
        }
      } catch (e) {
        console.warn(`No se pudo cargar ${uid}.${ext}`);
      }
    }
    return null;
  };

  // construir lista de etiquetas según nº elegido
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
    const col = indexInPage % cols;
    const row = Math.floor(indexInPage / cols);
    const x = col * labelWidth;
    const y = row * labelHeight;
    const centerX = x + labelWidth / 2;
    const logoX = centerX - logoWidth / 2;
    const logoY = y + 3;

    // cargar imagen del alumno
    const userImage = await loadUserImage(usuario.uid);

    if (userImage) {
      doc.addImage(userImage, "JPEG", logoX, logoY, logoWidth, logoHeight);
    } else {
      // si no tiene foto -> logo por defecto
      doc.addImage(fallbackLogo, "JPEG", logoX, logoY, logoWidth, logoHeight);
    }

    let nombreCompleto = `${usuario.givenName} ${usuario.sn}`;
    if (nombreCompleto.length > 25)
      nombreCompleto = nombreCompleto.slice(0, 22) + "…";

    doc.setFontSize(9);
    doc.text(nombreCompleto, centerX, y + 15, { align: "center" });

    doc.setFontSize(8);
    doc.text(
      `Curso: ${usuario.groups[1]} - ${cursoSeleccionado}`,
      centerX,
      y + 21,
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
