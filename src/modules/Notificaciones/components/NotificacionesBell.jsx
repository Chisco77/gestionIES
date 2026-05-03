/**
 * ------------------------------------------------------------
 * Componente: NotificacionesBell.jsx
 *
 * Descripción:
 * Componente visual que representa una campana de notificaciones.
 * Muestra un indicador numérico con el total de notificaciones
 * pendientes y un efecto visual de "ping" cuando hay elementos.
 *
 * Funcionalidad:
 * - Renderiza un icono de campana
 * - Muestra contador de notificaciones si total > 0
 * - Incluye animación para llamar la atención del usuario
 *
 * Props:
 * - total (number): número total de notificaciones pendientes
 *
 * Dependencias principales:
 * - Lucide-react (icono Bell)
 *
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * Centro: IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 */


import { Bell } from "lucide-react";

export default function NotificacionesBell({ total }) {
  return (
    <div className="relative inline-flex items-center">
      {/* Campana */}
      <Bell className="h-6 w-6 cursor-pointer text-white" />

      {total > 0 && (
        <div className="relative ml-2 flex items-center justify-center">
          {/* Ping latiente */}
          <span className="absolute inline-flex h-5 w-5 rounded-full bg-red-600 opacity-50 animate-ping"></span>
          {/* Círculo con número */}
          <span className="relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-white text-[0.75rem] font-bold">
            {total}
          </span>
        </div>
      )}
    </div>
  );
}
