import React from "react";
import PlanoEstanciasInteractivo from "../components/PlanoEstanciasInteractivo";

/**
 * Recibe la planta como prop desde la ruta (App.jsx)
 * Props:
 *  - planta: "baja" | "primera" | "segunda"
 */
export function PlanoPlanta({ planta }) {
  return <PlanoEstanciasInteractivo planta={planta} />;
}

