import React from "react";

export function PrestamosLlavesIndex(){
  // Posteriormente conecta con usePrestamosLlaves()
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Préstamos de llaves</h2>
      <p className="mt-2 text-sm text-muted-foreground">Aquí verás la lista de llaves prestadas y controles para devolver.</p>
      {/* Lista con table o cards conectada al backend */}
    </div>
  );
}
