// modules/Login/pages/LoginFormExterno.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginFormExterno() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    ldapHost: "",
    pgHost: "",
    pgDatabase: "",
    pgUser: "",
    pgPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${API_URL}/login-externo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify(form),
      });

      if (response.ok) {
        navigate("/alumnos");
      } else {
        // leer JSON del backend
        const errorData = await response.json().catch(() => null);
        const mensaje = errorData?.error || "Datos de acceso incorrectos"; 
        alert(`Error: ${mensaje}`);
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>Login Externo</CardTitle>
        <CardDescription>Conecta con tu LDAP y BD remota</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="username">Usuario LDAP</Label>
            <Input id="username" name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="password">Contraseña LDAP</Label>
            <Input id="password" type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="ldapHost">IP/Host LDAP</Label>
            <Input id="ldapHost" name="ldapHost" value={form.ldapHost} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="pgHost">IP/Host PostgreSQL</Label>
            <Input id="pgHost" name="pgHost" value={form.pgHost} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="pgDatabase">Nombre Base de Datos</Label>
            <Input id="pgDatabase" name="pgDatabase" value={form.pgDatabase} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="pgUser">Usuario BD</Label>
            <Input id="pgUser" name="pgUser" value={form.pgUser} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="pgPassword">Contraseña BD</Label>
            <Input id="pgPassword" type="password" name="pgPassword" value={form.pgPassword} onChange={handleChange} required />
          </div>

          <Button type="submit" className="w-full mt-2">Acceder</Button>
        </form>
      </CardContent>
    </Card>
  );
}
