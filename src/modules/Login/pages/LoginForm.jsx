/**
 * LoginForm.jsx - Página de login de la aplicación, para conexiones
 *   internas de la subred del orellana
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
 * Esta página renderiza el formulario de inicio de sesión en subred
 * solo pide usuario y password ya que en variables de entorno .env
 * están declaradas el resto.
 * 
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

export function LoginForm({ className, ...props }) {
  const queryClient = useQueryClient();

  const [usuario, setUsuario] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();

  // para guardar nombre de usuario en contexto de usuario

  const handleChange = (e) => {
    setUsuario({
      ...usuario,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", //  Mantiene la sesión
        body: JSON.stringify(usuario),
      });

      if (response.ok) {
        // limpiar cache de hooks
        queryClient.invalidateQueries(["alumnos-ldap"]);
        queryClient.invalidateQueries(["profesores-ldap"]);
        queryClient.invalidateQueries(["todos-ldap"]);
        queryClient.invalidateQueries(["prestamos"]);

        navigate("/");
      } else {
        // leer JSON del backend
        const errorData = await response.json().catch(() => null);
        const mensaje = errorData?.error || "Usuario o contraseña incorrectos";
        alert(`❌ Error: ${mensaje}`);
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div
      className={`flex flex-col gap-6 mx-auto max-w-sm ${className}`}
      {...props}
    >
      <Card>
        <CardHeader className="flex flex-col items-center justify-center text-center">
          <CardTitle className="text-2xl">gestionIES</CardTitle>
          <CardDescription>IES Francisco de Orellana</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <Avatar className="flex justify-center">
                <AvatarImage
                  src="/logo.png"
                  alt="Logo"
                  style={{ width: "25%", height: "25%" }}
                />
              </Avatar>
              <div className="grid gap-2">
                <Label htmlFor="email">Usuario</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  onChange={handleChange}
                  value={usuario.username}
                  placeholder=""
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  onChange={handleChange}
                  value={usuario.password}
                  type="password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Acceder
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
