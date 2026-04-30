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
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useConfiguracionCentro } from "@/hooks/useConfiguracionCentro";

export function LoginForm({ className, ...props }) {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();
  const [usuario, setUsuario] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const { data: centro } = useConfiguracionCentro();

  // Resolución de la URL del logo respetando la configuración del centro
  const logoAMostrar = useMemo(() => {
    if (!centro?.logoMiiesUrl) {
      return `${import.meta.env.BASE_URL}public/miIES.png`.replace(/\/+/g, "/");
    }

    const urlDb = centro.logoMiiesUrl;
    if (urlDb.startsWith("http")) return urlDb;

    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
    let cleanPath = urlDb;

    if (cleanPath.startsWith(baseUrl) && baseUrl !== "") {
      cleanPath = cleanPath.substring(baseUrl.length);
    }

    return `${baseUrl}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
  }, [centro]);

  const nombreIES = centro?.nombreIes || import.meta.env.VITE_IES_NAME;

  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(usuario),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const mensaje = errorData?.error || "Usuario o contraseña incorrectos";
        alert(`❌ Error: ${mensaje}`);
        return;
      }

      // Invalidación de caché para todos los módulos
      const keys = [
        "alumnos-ldap",
        "profesores-ldap",
        "staff-ldap",
        "todos-ldap",
        "prestamos",
        "reservasPanel",
        "ldap-departamentos",
        "ldap-cursos",
        "estancias",
        "extraescolares",
        "reservas",
        "permisos",
        "panel",
        "avisos",
        "empleados",
        "ausencias",
        "horario-profesorado",
        "configuracion-centro",
        "guardias",
        "planos-centro",
      ];
      keys.forEach((k) => queryClient.invalidateQueries([k]));

      const checkAuth = async (retries = 2) => {
        for (let i = 0; i < retries; i++) {
          const res = await fetch(`${API_URL}/check-auth`, {
            credentials: "include",
          });
          if (res.ok) return res.json();
          if (res.status === 401) {
            await new Promise((r) => setTimeout(r, 200));
            continue;
          }
          throw new Error("Error en check-auth");
        }
        throw new Error("No autenticado");
      };

      const data = await checkAuth();

      setUser({
        username: data.username,
        perfil: data.perfil ?? "profesor",
        givenName: data.givenName || "",
        sn: data.sn || "",
        employeeNumber: data.employeeNumber || null,
      });

      if (data.perfil === "ordenanza") {
        navigate("/ordenanza-home");
      } else {
        navigate("/");
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
          <CardDescription>{nombreIES}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <Avatar className="flex justify-center">
                <AvatarImage
                  src={logoAMostrar}
                  alt="Logo"
                  style={{ width: "25%", height: "25%", objectFit: "contain" }}
                  onError={(e) => {
                    e.target.src = `${import.meta.env.BASE_URL}public/miIES.png`;
                  }}
                />
              </Avatar>
              <div className="grid gap-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Usuario"
                  required
                  value={usuario.username}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={usuario.password}
                  onChange={handleChange}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
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
