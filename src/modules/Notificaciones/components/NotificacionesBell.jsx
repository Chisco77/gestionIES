
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
