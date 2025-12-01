import { z } from "zod";

export const schemaExtraescolar = z.object({
  titulo: z.string().min(3, "El título es obligatorio"),
  descripcion: z
    .string()
    .min(25, "La descripción debe tener al menos 25 caracteres"),
  gidnumber: z.number().min(1, "Debe seleccionar un departamento"),

  fecha_inicio: z.string().nonempty("Debe indicar la fecha de inicio"),
  fecha_fin: z.string().nonempty("Debe indicar la fecha de fin"),

  cursos_gids: z.array(z.string()).min(1, "Debe seleccionar al menos un curso"),
  responsables_uids: z
    .array(z.string())
    .min(1, "Debe seleccionar al menos un profesor"),

  ubicacion: z.string().nonempty("La ubicación es obligatoria"),
  tipo: z.enum(["complementaria", "extraescolar"]),

  idperiodo_inicio: z.number().optional(),
  idperiodo_fin: z.number().optional(),

  coords: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
}).refine(
  (data) => {
    // Solo validar fecha_fin > fecha_inicio si es extraescolar
    if (data.tipo === "extraescolar") {
      return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
    }
    return true;
  },
  {
    message: "La fecha y hora de fin debe ser posterior a la de inicio",
    path: ["fecha_fin"],
  }
);
