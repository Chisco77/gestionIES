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

/*
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
        "permisosMes",
        "panel",
        "avisos",
        "empleados",
        "ausencias",
        "horario-profesorado",
        "configuracion-centro",
        "guardias",
        "planos-centro",
        "asuntos_permitidos",
        "profes-guardia",
        "reservasPanel",
        "restricciones_asuntos",
        "materias",
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
}*/

/**
 * LoginForm.jsx - Versión Profesional "Limpia" (Sin efectos psicodélicos)
 * ------------------------------------------------------------
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
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useConfiguracionCentro } from "@/hooks/useConfiguracionCentro";
import { LockKeyhole, User, ShieldCheck } from "lucide-react";

export function LoginForm({ className, ...props }) {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();
  const [usuario, setUsuario] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const { data: centro } = useConfiguracionCentro();

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
        "permisosMes",
        "panel",
        "avisos",
        "empleados",
        "ausencias",
        "horario-profesorado",
        "configuracion-centro",
        "guardias",
        "planos-centro",
        "asuntos_permitidos",
        "profes-guardia",
        "restricciones_asuntos",
        "materias",
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
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50 overflow-hidden">
      <div className={`w-full max-w-[380px] p-4 ${className}`} {...props}>
        <Card className="shadow-xl border-slate-200 overflow-hidden bg-white">
          {/* Cabecera con fondo sutil */}
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-8 text-center">
            <div className="flex justify-center mb-4">
              {/* Contenedor circular limpio */}
              <div className="h-20 w-20 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden p-2">
                <img
                  src={logoAMostrar}
                  alt="Logo"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.src = `${import.meta.env.BASE_URL}public/miIES.png`;
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <CardTitle className="text-3xl font-black text-slate-800 tracking-tight">
                miIES
              </CardTitle>
              <CardDescription className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] px-4">
                {nombreIES}
              </CardDescription>
            </div>

            <div className="mt-6 flex flex-col items-center">
              <div className="h-[1px] w-8 bg-slate-200 mb-4"></div>
              <h2 className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                Acceso al Sistema
              </h2>
            </div>
          </CardHeader>

          <CardContent className="pt-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="username"
                  className="text-xs font-bold text-slate-500 ml-1"
                >
                  Usuario
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="usuario del centro"
                    required
                    value={usuario.username}
                    onChange={handleChange}
                    className="pl-10 h-11 bg-white border-slate-200 focus:ring-1 focus:ring-slate-300 transition-all shadow-none"
                  />
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  title="Contraseña de Rayuela"
                  className="text-xs font-bold text-slate-500 ml-1"
                >
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={usuario.password}
                    onChange={handleChange}
                    className="pl-10 h-11 bg-white border-slate-200 focus:ring-1 focus:ring-slate-300 transition-all shadow-none"
                  />
                  <LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all active:scale-[0.98]"
              >
                Acceder
              </Button>
            </form>
          </CardContent>
        </Card>

        <footer className="mt-6 text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] leading-relaxed">
            Sistema de gestión para centros públicos de Extremadura
          </p>
        </footer>
      </div>
    </div>
  );
}
