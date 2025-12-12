// components/DialogoEtiquetasGenericas.jsx
import { useState } from "react";
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
import { generateEtiquetasGenericasPdf } from "@/utils/Informes";

export function DialogoEtiquetasGenericas({ open, onOpenChange }) {
  const [prefijo, setPrefijo] = useState("");
  const [cantidad, setCantidad] = useState("40");
  const [nombrePdf, setNombrePdf] = useState("etiquetas");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [totalEtiquetas, setTotalEtiquetas] = useState(40);
  const [posicionInicial, setPosicionInicial] = useState(1); // posición en la hoja
  const [numeroInicial, setNumeroInicial] = useState(1); // número inicial de etiqueta (sufijo)

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent
        className="p-0 overflow-hidden rounded-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="bg-blue-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Generar etiquetas genéricas
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4 p-6">
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
                setTotalEtiquetas(Number(value));
              }}
            >
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
              Posición inicial en la página
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
              Comenzar numeración en
            </label>
            <Input
              type="number"
              min="1"
              value={numeroInicial}
              onChange={(e) => setNumeroInicial(Number(e.target.value))}
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

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button
            variant="outline"
            disabled={
              loading ||
              prefijo.trim() === "" ||
              nombrePdf.trim() === "" ||
              totalEtiquetas < 1 ||
              posicionInicial < 1 ||
              numeroInicial < 1
            }
            onClick={async () => {
              setLoading(true);
              setProgress(0);
              try {
                await generateEtiquetasGenericasPdf({
                  prefijo,
                  cantidad: Number(cantidad),
                  totalEtiquetas,
                  posicionInicial,
                  numeroInicial,
                  nombrePdf,
                  onProgress: (p) => setProgress(p),
                });

                setShowSuccessToast(true);
                onOpenChange(false);
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
