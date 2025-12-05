import {
  Home,
  HeartPulse,
  UserRoundSearch,
  Baby,
  Users,
  GraduationCap,
  CalendarClock,
  FileText,
  AlertTriangle,
} from "lucide-react";

export const ICONOS_TIPOS_PERMISOS = {
  2: HeartPulse, // Fallecimiento / enfermedad grave
  3: HeartPulse, // Enfermedad propia
  4: Home,       // Traslado de domicilio
  7: Baby,       // Exámenes prenatales
  11: UserRoundSearch, // Deber inexcusable
  14: Users,     // Funciones sindicales
  15: GraduationCap, // Exámenes finales
  32: CalendarClock, // Reducción jornada
  13: FileText, // Asuntos propios
  0: AlertTriangle, // Otros
};

export function getIconoTipo(tipo) {
  return ICONOS_TIPOS_PERMISOS[tipo] || AlertTriangle;
}
