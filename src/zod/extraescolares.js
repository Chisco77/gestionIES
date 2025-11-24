// src/schemas/extraescolares.js
import { z } from "zod";

export const schemaExtraescolar = z.object({
  titulo: z.string().optional(),
  descripcion: z
    .string()
    .min(25, "La descripción debe tener al menos 25 caracteres"),
  departamento: z.string().nonempty("Debe seleccionar un departamento"),
  fechaInicio: z.string().nonempty("Debe indicar la fecha de inicio"),
  fechaFin: z
    .string()
    .nonempty("Debe indicar la fecha de fin"),
  cursosSeleccionados: z
    .array(z.string())
    .min(1, "Debe seleccionar al menos un curso"),
  profesoresSeleccionados: z
    .array(z.string())
    .min(1, "Debe seleccionar al menos un profesor"),
  ubicacion: z.string().nonempty("La ubicación es obligatoria"),
}).refine(
  (data) =>
    !data.fechaFin || !data.fechaInicio || new Date(data.fechaFin) >= new Date(data.fechaInicio),
  {
    message: "La fecha de fin no puede ser anterior a la fecha de inicio",
    path: ["fechaFin"],
  }
);
