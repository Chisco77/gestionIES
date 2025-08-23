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
