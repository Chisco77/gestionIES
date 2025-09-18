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
import { LoginFormExterno } from "@/modules/Login/pages/LoginFormExterno";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      {/* Tabs envuelven todo el Card */}
      <Tabs defaultValue="interno" className="w-full max-w-sm md:max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col items-center space-y-4">
            <h2 className="text-2xl font-bold">gestionIES</h2>
            <p className="text-muted-foreground">IES Francisco de Orellana</p>

            {/* Pestañas */}
            <TabsList className="grid grid-cols-2 w-full bg-transparent shadow-none border-b">
              <TabsTrigger
                value="interno"
                className="bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
              >
                IES Francisco de Orellana
              </TabsTrigger>
              <TabsTrigger
                value="externo"
                className="bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
              >
                Externo
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="interno">
              <LoginForm />
            </TabsContent>
            <TabsContent value="externo">
              <LoginFormExterno />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
