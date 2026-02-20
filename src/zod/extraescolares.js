import { z } from "zod";

export const schemaExtraescolar = z
  .object({
    titulo: z
      .string()
      .trim()
      .min(3, "El título debe tener al menos 3 caracteres"),

    descripcion: z
      .string()
      .trim()
      .nonempty("La descripción es obligatoria")
      .min(15, "La descripción debe tener al menos 15 caracteres"),

    gidnumber: z.coerce.number().min(1, "Debe seleccionar un departamento"),

    tipo: z.enum(["complementaria", "extraescolar"]),

    fecha_inicio: z.string().nonempty("Debe indicar la fecha de inicio"),

    fecha_fin: z.string().nonempty("Debe indicar la fecha de fin"),

    cursos_gids: z.array(z.coerce.number()), // ← ahora acepta array vacío

    responsables_uids: z
      .array(z.string())
      .min(1, "Debe seleccionar al menos un profesor"),

    ubicacion: z.string().trim().nonempty("La ubicación es obligatoria"),

    idperiodo_inicio: z.number().optional(),
    idperiodo_fin: z.number().optional(),

    coords: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  })
  .refine(
    (data) => {
      if (data.tipo === "extraescolar") {
        return new Date(data.fecha_fin) > new Date(data.fecha_inicio);
      }
      return true;
    },
    {
      message: "La fecha y hora de fin debe ser posterior a la de inicio",
      path: ["fecha_fin"],
    }
  );
