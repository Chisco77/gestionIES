/**
 * LoginFormExterno.jsx - Página de login de la aplicación, para conexiones
 *   externas de la subred del orellana
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
 * Esta página renderiza el formulario de inicio de sesión para acceso
 * desde fuera de la subred del Orellana.
 * 
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

export function LoginFormExterno({ className, ...props }) {
  const queryClient = useQueryClient();

  const [usuario, setUsuario] = useState({
    username: "",
    password: "",
    ldapHost: "",
    pgHost: "",
    pgDatabase: "",
    pgUser: "postgres", // valor por defecto
    pgPassword: "",
  });

  const navigate = useNavigate();

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
      const response = await fetch(`${API_URL}/login-externo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(usuario),
      });

      if (response.ok) {
        // limpiar cache de hooks
        queryClient.invalidateQueries(["alumnos-ldap"]);
        queryClient.invalidateQueries(["profesores-ldap"]);
        queryClient.invalidateQueries(["prestamos"]);

        navigate("/alumnos");
      } else {
        const errorData = await response.json().catch(() => null);
        const mensaje = errorData?.error || "Error en login externo";
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
          <CardDescription>Login Externo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <Avatar className="flex justify-center">
                <AvatarImage
                  src="/logoeducarex.jpeg"
                  alt="Logo"
                  style={{ width: "25%", height: "25%" }}
                />
              </Avatar>

              <div className="grid gap-2">
                <Label htmlFor="username">Usuario LDAP</Label>
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
                <Label htmlFor="password">Password LDAP</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  onChange={handleChange}
                  value={usuario.password}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ldapHost">IP LDAP</Label>
                <Input
                  id="ldapHost"
                  name="ldapHost"
                  type="text"
                  onChange={handleChange}
                  value={usuario.ldapHost}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pgHost">IP PostgreSQL</Label>
                <Input
                  id="pgHost"
                  name="pgHost"
                  type="text"
                  onChange={handleChange}
                  value={usuario.pgHost}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pgDatabase">Nombre BD</Label>
                <Input
                  id="pgDatabase"
                  name="pgDatabase"
                  type="text"
                  onChange={handleChange}
                  value={usuario.pgDatabase}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pgUser">Usuario BD</Label>
                <Input
                  id="pgUser"
                  name="pgUser"
                  type="text"
                  onChange={handleChange}
                  value={usuario.pgUser}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pgPassword">Password BD</Label>
                <Input
                  id="pgPassword"
                  name="pgPassword"
                  type="password"
                  onChange={handleChange}
                  value={usuario.pgPassword}
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
