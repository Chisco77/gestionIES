/**
 * PlantasIndex.jsx - Selección de planta para el módulo de llaves
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
 * Componente que muestra la lista de plantas disponibles para
 * gestionar el préstamo de llaves, con enlaces a:
 *  - Plano de cada planta (baja, primera, segunda)
 *  - Visualización de llaves actualmente prestadas
 *
 * Uso:
 * <PlantasIndex />
 *
 * Dependencias:
 * - React
 * - react-router-dom (Link)
 */


import React from "react";
import { Link } from "react-router-dom";

export default function PlantasIndex(){
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Préstamo de llaves — Plantas</h2>
      <ul className="mt-4 space-y-2">
        <li><Link to="/llaves/planta-baja">Planta BAJA</Link></li>
        <li><Link to="/llaves/planta-primera">Planta PRIMERA</Link></li>
        <li><Link to="/llaves/planta-segunda">Planta SEGUNDA</Link></li>
        <li><Link to="/llaves/prestadas">Ver llaves prestadas</Link></li>
      </ul>
    </div>
  );
}
