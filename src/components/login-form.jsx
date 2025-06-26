
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
import { API_BASE_URL } from '../config';

export function LoginForm({ className, ...props }) {
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

  const handleSubmit = (e) => {
  e.preventDefault();
  const url = `${API_BASE_URL}/login`;

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // ⬅️ ¡IMPORTANTE para mantener sesión!
    body: JSON.stringify(usuario),
  })
    .then((response) => {
      if (response.status === 200) {
        navigate("/alumnos"); 
      } else {
        alert("Usuario o Password incorrectos");
      }
    })
    .catch(() => alert("Error de conexión con el servidor"));
};

  return (
    <div className={`flex flex-col gap-6 mx-auto max-w-sm ${className}`} {...props}>
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
                  src="/public/logo.png"
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
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
