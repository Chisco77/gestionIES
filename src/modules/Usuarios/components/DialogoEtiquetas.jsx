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

export function DialogoEtiquetas({
  usuarios,
  open,
  onOpenChange,
  esAlumno = true,
}) {
  const [etiquetasPorUsuario, setEtiquetasPorUsuario] = useState("1");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("2024-25");
  const [nombrePdf, setNombrePdf] = useState(
    esAlumno ? "etiquetas_portatiles" : "etiquetas_profesores"
  );
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [formato, setFormato] = useState("40");

  // Actualizar el nombre por defecto si cambia el tipo de usuario
  useEffect(() => {
    setNombrePdf(esAlumno ? "etiquetas_portatiles" : "etiquetas_profesores");
  }, [esAlumno]);

  const generatePdfLabels = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const layout = {
      40: {
        cols: 4,
        rows: 10,
        width: 52.5,
        height: 29.7,
        marginX: 0,
        marginY: 0,
        spacingX: 0,
        spacingY: 0,
      },
      24: {
        cols: 3,
        rows: 8,
        width: 70,
        height: 33.8,
        marginX: 0,
        marginY: 12.7,
        spacingX: 2.5,
        spacingY: 0,
      },
      33: {
        cols: 3,
        rows: 11,
        width: 70,
        height: 25.4,
        marginX: 0,
        marginY: 8,
        spacingX: 2.5,
        spacingY: 0,
      },
    }[formato];

    const labelsPerPage = layout.cols * layout.rows;
    const imageWidth = 12;
    const imageHeight = 8;

    // Solo cargamos el fallback si es alumno (ya que lleva foto)
    let fallbackLogo = null;
    if (esAlumno) {
      fallbackLogo = await new Promise((resolve) => {
        const img = new Image();
        img.src = `${import.meta.env.BASE_URL}public/logo.png`;
        img.onload = () => resolve(img);
      });
    }

    const loadUserImage = async (uid) => {
      if (!esAlumno) return null;
      const extensions = ["jpg", "jpeg", "png"];
      for (const ext of extensions) {
        const url = `/gestionIES/uploads/alumnos/${uid}.${ext}`;
        try {
          const res = await fetch(url, { method: "HEAD" });
          if (res.ok) return url;
        } catch (e) {
          console.warn(`No se pudo cargar ${uid}.${ext}`);
        }
      }
      return null;
    };

    let etiquetas = [];
    usuarios.forEach((usuario) => {
      for (let i = 0; i < Number(etiquetasPorUsuario); i++) {
        etiquetas.push(usuario);
      }
    });

    const total = etiquetas.length;

    // --- Reemplaza el bucle "for" de generación dentro de generatePdfLabels por este ---

    for (let i = 0; i < total; i++) {
      const usuario = etiquetas[i];

      if (i > 0 && i % labelsPerPage === 0) doc.addPage();

      const indexInPage = i % labelsPerPage;
      const col = indexInPage % layout.cols;
      const row = Math.floor(indexInPage / layout.cols);
      const x = layout.marginX + col * (layout.width + layout.spacingX);
      const y = layout.marginY + row * (layout.height + layout.spacingY);
      const centerX = x + layout.width / 2;

      if (esAlumno) {
        // --- Lógica original para Alumnos (Foto + Nombre + Curso) ---
        const imageWidth = 12;
        const imageHeight = 8;
        const logoX = centerX - imageWidth / 2;
        const logoY = y + 3;
        const userImage = await loadUserImage(usuario.uid);

        if (userImage) {
          doc.addImage(
            userImage,
            "JPEG",
            logoX,
            logoY,
            imageWidth,
            imageHeight
          );
        } else if (fallbackLogo) {
          doc.addImage(
            fallbackLogo,
            "JPEG",
            logoX,
            logoY,
            imageWidth,
            imageHeight
          );
        }

        let nombreCompleto = `${usuario.givenName} ${usuario.sn}`;
        if (nombreCompleto.length > 25) {
          nombreCompleto = nombreCompleto.slice(0, 22) + "…";
        }

        doc.setFontSize(9);
        doc.text(nombreCompleto, centerX, y + 15, { align: "center" });

        doc.setFontSize(8);
        const grupo =
          usuario.groups && usuario.groups[0] ? usuario.groups[0] : "S/G";
        doc.text(`Curso: ${grupo} - ${cursoSeleccionado}`, centerX, y + 18, {
          align: "center",
        });
      } else {
        // --- Lógica optimizada para Profesores (2 Líneas, MAYÚSCULAS y más grande) ---

        // Convertimos a mayúsculas limpiando espacios de los extremos
        const nombre = (usuario.givenName || "").trim().toUpperCase();
        const apellidos = (usuario.sn || "").trim().toUpperCase();

        // Subimos la fuente a un tamaño mucho más visible (ej. 13 o 14)
        doc.setFontSize(13);
        // Usamos negrita para mejorar el impacto visual si tu fuente por defecto lo permite
        doc.setFont("helvetica", "bold");

        // Calculamos el centro vertical exacto de la etiqueta
        const centroY = y + layout.height / 2;

        // Línea 1: Nombre (un poco por encima del centro)
        doc.text(nombre, centerX, centroY - 1, { align: "center" });

        // Línea 2: Apellidos (un poco por debajo del centro)
        // Cambiamos a fuente normal opcionalmente para los apellidos, o mantenemos negrita
        doc.setFont("helvetica", "normal");
        doc.text(apellidos, centerX, centroY + 5, { align: "center" });

        // Restauramos la fuente a normal por si acaso para las siguientes iteraciones
        doc.setFont("helvetica", "normal");
      }

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
            <DialogTitle>
              Configuración de etiquetas ({esAlumno ? "Alumnos" : "Profesores"})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Formato de etiquetas
              </label>
              <Select value={formato} onValueChange={setFormato}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="40">40 (Apli 01286 10x4)</SelectItem>
                  <SelectItem value="24">24 (Apli 01293 8x3)</SelectItem>
                  <SelectItem value="33">33 (Apli 01270 11x3)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Número de etiquetas por profesor/a
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

            {/* Solo mostramos el curso académico si es Alumno */}
            {esAlumno && (
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
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre del archivo PDF
              </label>
              <Input
                type="text"
                value={nombrePdf}
                onChange={(e) => setNombrePdf(e.target.value)}
                placeholder="Ejemplo: etiquetas_profesores"
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
                } catch (err) {
                  console.error(err);
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

/*export function DialogoEtiquetas({ usuarios, open, onOpenChange }) {
  const [etiquetasPorUsuario, setEtiquetasPorUsuario] = useState("1");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("2024-25");
  const [nombrePdf, setNombrePdf] = useState("etiquetas_portatiles");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [formato, setFormato] = useState("40"); // valor por defecto

  const generatePdfLabels = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    // Layout según el formato de etiquetas seleccionado
    const layout = {
      40: {
        cols: 4,
        rows: 10,
        width: 52.5,
        height: 29.7,
        marginX: 0,
        marginY: 0,
        spacingX: 0,
        spacingY: 0,
      },
      24: {
        cols: 3,
        rows: 8,
        width: 70,
        height: 33.8,
        marginX: 0,
        marginY: 12.7,
        spacingX: 2.5,
        spacingY: 0,
      },

      33: {
        cols: 3,
        rows: 11,
        width: 70,
        height: 25.4,
        marginX: 0,
        marginY: 8,
        spacingX: 2.5,
        spacingY: 0,
      },
    }[formato]; // estado

    const labelsPerPage = layout.cols * layout.rows;
    const imageWidth = 12;
    const imageHeight = 8;

    // fallback logo IES
    const fallbackLogo = await new Promise((resolve) => {
      const img = new Image();
      img.src = `${import.meta.env.BASE_URL}public/logo.png`;
      img.onload = () => resolve(img);
    });

    // función para cargar foto del usuario desde Nginx
    const loadUserImage = async (uid) => {
      const extensions = ["jpg", "jpeg", "png"];
      for (const ext of extensions) {
        // Ruta relativa a Nginx
        const url = `/gestionIES/uploads/alumnos/${uid}.${ext}`;
        try {
          // hacemos HEAD para comprobar si existe
          const res = await fetch(url, { method: "HEAD" });
          if (res.ok) return url; // devolvemos URL directamente, jsPDF la puede cargar
        } catch (e) {
          console.warn(`No se pudo cargar ${uid}.${ext}`);
        }
      }
      return null; // ninguna encontrada
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
      const col = indexInPage % layout.cols;
      const row = Math.floor(indexInPage / layout.cols);
      const x = layout.marginX + col * (layout.width + layout.spacingX);
      const y = layout.marginY + row * (layout.height + layout.spacingY);
      const centerX = x + layout.width / 2;
      const logoX = centerX - imageWidth / 2;
      const logoY = y + 3;

      const userImage = await loadUserImage(usuario.uid);
      if (userImage) {
        doc.addImage(userImage, "JPEG", logoX, logoY, imageWidth, imageHeight);
      } else {
        doc.addImage(
          fallbackLogo,
          "JPEG",
          logoX,
          logoY,
          imageWidth,
          imageHeight
        );
      }

      let nombreCompleto = `${usuario.givenName} ${usuario.sn}`;
      if (nombreCompleto.length > 25)
        nombreCompleto = nombreCompleto.slice(0, 22) + "…";

      doc.setFontSize(9);
      doc.text(nombreCompleto, centerX, y + 15, { align: "center" });

      doc.setFontSize(8);
      doc.text(
        `Curso: ${usuario.groups[0]} - ${cursoSeleccionado}`,
        centerX,
        y + 18,
        { align: "center" }
      );

      // actualizar progreso
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  Formato de etiquetas
                </label>
                <Select value={formato} onValueChange={setFormato}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="40">40 (Apli 01286 10x4)</SelectItem>
                    <SelectItem value="24">24 (Apli 01293 8x3)</SelectItem>
                    <SelectItem value="33">33 (Apli 01270 11x3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
}*/
