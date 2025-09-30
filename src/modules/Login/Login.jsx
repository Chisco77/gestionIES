/**
 * LoginPage.jsx - Página de login de la aplicación
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
 * Esta página renderiza el formulario de inicio de sesión, que en
 * realidad son 2: para conexion interna al orellana y externo a la
 * subred del orellana.
 *
 * Estructura:
 * - Contenedor principal (div)
 *   - Centrado vertical y horizontal
 *   - Padding adaptativo (p-6 en móviles, p-10 en md)
 * - Caja interna (div)
 *   - Limita el ancho máximo del formulario
 *   - Renderiza el componente LoginForm o LoginFormExterno
 *     dentro de Tabs
 */

import { LoginForm } from "@/modules/Login/pages/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <LoginForm />
    </div>
  );
}
