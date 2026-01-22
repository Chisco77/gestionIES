/**
 * LoginForm.jsx - Página de login de la aplicación
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Descripción:
 * - Renderiza el formulario de inicio de sesión.
 * - Actualiza el contexto de usuario después de login.
 * - Mantiene sesión mediante cookies.
 */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext"; // <-- Importar contexto

export function LoginForm({ className, ...props }) {
  const queryClient = useQueryClient();
  const { setUser } = useAuth(); // Para actualizar contexto
  const [usuario, setUsuario] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Intentar login
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Mantener sesión
        body: JSON.stringify(usuario),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const mensaje = errorData?.error || "Usuario o contraseña incorrectos";
        alert(`❌ Error: ${mensaje}`);
        return;
      }

      // Limpiar cache de React Query
      queryClient.invalidateQueries(["alumnos-ldap"]);
      queryClient.invalidateQueries(["profesores-ldap"]);
      queryClient.invalidateQueries(["todos-ldap"]);
      queryClient.invalidateQueries(["prestamos"]);
      queryClient.invalidateQueries(["reservasPanel"]);
      queryClient.invalidateQueries(["ldap-departamentos"]);
      queryClient.invalidateQueries(["ldap-cursos"]);

      queryClient.invalidateQueries(["estancias"]);

      queryClient.invalidateQueries(["extraescolares", "uid"]);
      queryClient.invalidateQueries(["extraescolares", "all"]);

      queryClient.invalidateQueries(["reservas"]);

      queryClient.invalidateQueries(["reservas", "dia"]);
      queryClient.invalidateQueries(["reservas", "uid"]);

      queryClient.invalidateQueries(["permisos", "todos"]);
      queryClient.invalidateQueries(["panel", "permisos"]);
      queryClient.invalidateQueries(["permisosMes"]);

      queryClient.invalidateQueries(["avisos"]);
      queryClient.invalidateQueries(["empleados"]); 
      queryClient.invalidateQueries(["restricciones_asuntos"]);  
      queryClient.invalidateQueries(["asuntos_permitidos", "uid"]);

      // Hacer check-auth con reintento
      const checkAuth = async (retries = 2) => {
        for (let i = 0; i < retries; i++) {
          const res = await fetch(`${API_URL}/check-auth`, {
            credentials: "include",
          });

          if (res.ok) return res.json();

          // si 401, esperar un poco y reintentar
          if (res.status === 401) {
            await new Promise((r) => setTimeout(r, 200));
            continue;
          }

          throw new Error("Error en check-auth");
        }
        throw new Error("No autenticado");
      };

      // Obtener usuario y perfil actual desde check-auth
      const data = await checkAuth();

      // Actualizar contexto con los datos de usuario y perfil
      setUser({
        username: data.username,
        perfil: data.perfil ?? "profesor",
        givenName: data.givenName || "",
        sn: data.sn || "",
        employeeNumber: data.employeeNumber || null,
      });

      // Redirigir al dashboard o ruta especial
      if (data.perfil === "ordenanza") {
        navigate("/llavesPlantaBaja"); // ruta especial
      } else {
        navigate("/"); // ruta normal (dashboard)
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
      console.error(error);
    }
  };

  return (
    <div
      className={`flex flex-col gap-6 mx-auto max-w-sm ${className}`}
      {...props}
    >
      <Card>
        <CardHeader className="flex flex-col items-center justify-center text-center">
          <CardTitle className="text-2xl">miIES</CardTitle>
          <CardDescription>{import.meta.env.VITE_IES_NAME}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <Avatar className="flex justify-center">
                <AvatarImage
                  src={`${import.meta.env.BASE_URL}public/logo.png`}
                  alt="Logo"
                  style={{ width: "25%", height: "25%" }}
                />
              </Avatar>
              <div className="grid gap-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  onChange={handleChange}
                  value={usuario.username}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  onChange={handleChange}
                  value={usuario.password}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#1DA1F2] text-white hover:bg-[#0d8ddb]"
              >
                Acceder
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
