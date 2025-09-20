import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardProfesor() {
  const [fechaHora, setFechaHora] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setFechaHora(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // hardcodeado, aquí se mostrarán tablas, gráficos, etc
  const aulasReservadas = 3; 
  const armariosReservados = 2;
  const asuntosPropios = 5;

  return (
    <div className="p-6">
      {/* Encabezado con hora y fecha */}
      <h1 className="text-4xl font-bold text-blue-400 text-center mb-8">
        {fechaHora.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}{" "}
        -{" "}
        {fechaHora.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </h1>

      {/* Cards en horizontal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Aulas reservadas hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-center">
              {aulasReservadas}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Armarios reservados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-center">
              {armariosReservados}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Días de asuntos propios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-center">
              {asuntosPropios}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
