/**
 * PlanoPlanta.jsx - Wrapper para el plano interactivo de estancias
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
 * Componente que recibe como prop la planta a mostrar y renderiza
 * el componente PlanoEstanciasInteractivo, que gestiona:
 *  - Visualización de estancias en un plano SVG.
 *  - Préstamos y devoluciones de llaves a profesores.
 *  - Modo edición para crear nuevas estancias.
 *
 * Props:
 *  - planta: string con la planta a mostrar. Valores permitidos:
 *      "baja" | "primera" | "segunda"
 *
 * Uso:
 * <PlanoPlanta planta="primera" />
 *
 * Dependencias:
 * - React
 * - PlanoEstanciasInteractivo.jsx
 */


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

