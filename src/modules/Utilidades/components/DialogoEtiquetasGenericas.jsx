// components/DialogoEtiquetasGenericas.jsx
import { useState } from "react";
import jsPDF from "jspdf";
import {
  Dialog,
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

export function DialogoEtiquetasGenericas({ open, onOpenChange }) {
  const [prefijo, setPrefijo] = useState("");
  const [cantidad, setCantidad] = useState("40");
  const [nombrePdf, setNombrePdf] = useState("etiquetas");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [totalEtiquetas, setTotalEtiquetas] = useState(40);
  const [posicionInicial, setPosicionInicial] = useState(1);

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
        marginX: 7,
        marginY: 12.7,
        spacingX: 2.5,
        spacingY: 0,
      },
    }[cantidad];

    const labelsPerPage = layout.cols * layout.rows;
    const etiquetas = Array.from(
      { length: totalEtiquetas },
      (_, i) => `${prefijo}${i + 1}`
    );

    for (let i = 0; i < etiquetas.length; i++) {
      const globalIndex = i + (posicionInicial - 1);
      if (i > 0 && globalIndex % labelsPerPage === 0) doc.addPage();

      const indexInPage = globalIndex % labelsPerPage;
      const col = indexInPage % layout.cols;
      const row = Math.floor(indexInPage / layout.cols);

      const x = layout.marginX + col * (layout.width + layout.spacingX);
      const y = layout.marginY + row * (layout.height + layout.spacingY);

      const centerX = x + layout.width / 2;
      const centerY = y + layout.height / 2;

      const numero = i + 1;

      // Medimos los textos
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      const prefijoWidth = doc.getTextWidth(prefijo);

      doc.setFontSize(30);
      doc.setFont("helvetica", "bold");
      const numeroWidth = doc.getTextWidth(`${numero}`);

      const totalWidth = prefijoWidth + numeroWidth;
      const startX = centerX - totalWidth / 2;

      // Dibujar prefijo (normal, tamaño 14)
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(prefijo, startX, centerY, { baseline: "middle" });

      // Dibujar número (negrita, tamaño 30) ligeramente más arriba (compensación visual)
      doc.setFontSize(30);
      doc.setFont("helvetica", "bold");
      doc.text(`${numero}`, startX + prefijoWidth, centerY - 1.2, {
        baseline: "middle",
      });

      if (i % 10 === 0) await new Promise((r) => setTimeout(r, 0));
      setProgress(Math.round(((i + 1) / etiquetas.length) * 100));
    }

    doc.save(nombrePdf.endsWith(".pdf") ? nombrePdf : `${nombrePdf}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Generar etiquetas genéricas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Prefijo para la etiqueta
            </label>
            <Input
              value={prefijo}
              onChange={(e) => setPrefijo(e.target.value)}
              placeholder="Ej: PC-"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Número de etiquetas
            </label>
            <Select
              value={cantidad}
              onValueChange={(value) => {
                setCantidad(value);
                setTotalEtiquetas(Number(value)); // Valor por defecto
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="40">40 (10x4)</SelectItem>
                <SelectItem value="24">24 (Apli 01293 8x3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Número total de etiquetas a generar
            </label>
            <Input
              type="number"
              min="1"
              value={totalEtiquetas}
              onChange={(e) => setTotalEtiquetas(Number(e.target.value))}
              placeholder="Ej: 65"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Posición inicial en la página (1 a {cantidad})
            </label>
            <Input
              type="number"
              min="1"
              max={parseInt(cantidad)}
              value={posicionInicial}
              onChange={(e) => setPosicionInicial(Number(e.target.value))}
              placeholder="Ej: 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre del archivo PDF
            </label>
            <Input
              value={nombrePdf}
              onChange={(e) => setNombrePdf(e.target.value)}
              placeholder="Ej: etiquetas-genericas"
            />
          </div>
        </div>

        {loading && (
          <div className="w-full mt-4">
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
            disabled={
              loading ||
              prefijo.trim() === "" ||
              nombrePdf.trim() === "" ||
              totalEtiquetas < 1 ||
              posicionInicial < 1 ||
              posicionInicial > parseInt(cantidad)
            }
            onClick={async () => {
              setLoading(true);
              setProgress(0);
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

      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out">
          PDF generado con éxito
        </div>
      )}
    </Dialog>
  );
}
