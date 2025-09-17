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
 * Esta página renderiza el formulario de inicio de sesión.
 *
 * Estructura:
 * - Contenedor principal (div)
 *   - Centrado vertical y horizontal
 *   - Padding adaptativo (p-6 en móviles, p-10 en md)
 * - Caja interna (div)
 *   - Limita el ancho máximo del formulario
 *   - Renderiza el componente LoginForm
 *
 * Dependencias:
 * - @/components/login-form
 *
 * Notas:
 * - La altura mínima ocupa toda la ventana (min-h-svh)
 * - Fondo con color muted
 * - Todo el contenido centrado
 */


import { LoginForm } from "@/components/login-form"


export default function LoginPage() {
  return (
    (<div
      className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>)
  );
}

