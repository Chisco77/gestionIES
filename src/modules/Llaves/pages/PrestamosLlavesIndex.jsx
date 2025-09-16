/**
 * PrestamosLlavesIndex.jsx - Visualización de llaves prestadas
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Fecha de creación: 2025
 *
 * Descripción:
 * Componente que muestra la lista de llaves prestadas actualmente.
 * En esta versión inicial muestra un mensaje informativo y servirá
 * como base para conectarlo posteriormente con el hook `usePrestamosLlaves()`.
 * Permitirá gestionar devoluciones y consultar préstamos activos.
 *
 * Uso:
 * <PrestamosLlavesIndex />
 *
 * Dependencias:
 * - React
 */


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
