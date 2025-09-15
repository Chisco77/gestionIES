// utils/ofuscar.js
export function ofuscarTexto(texto, { tipo = "nombre" } = {}) {
  if (!texto) return "";

  if (tipo === "nombre") {
    // Ej: "Juan Pérez" -> "Alumno A23"
    const random = Math.floor(Math.random() * 90 + 10); 
    return `Alumno ${random}`;
  }

  if (tipo === "curso") {
    // Ej: "3º ESO B" -> "Curso X"
    return "Curso X";
  }

  if (tipo === "libro") {
    // Ej: "Don Quijote" -> "Libro 1"
    const random = Math.floor(Math.random() * 50 + 1);
    return `Libro ${random}`;
  }

  return "—";
}
