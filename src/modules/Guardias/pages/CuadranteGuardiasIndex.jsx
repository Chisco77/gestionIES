import { useState, useMemo } from "react";
import { useProfesoresLdap } from "@/hooks/useProfesoresLdap";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const dias = ["L", "M", "X", "J", "V"];
const horas = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª"];

export function CuadranteGuardiasIndex() {
  const { data: profesores = [], isLoading } = useProfesoresLdap();

  const [busqueda, setBusqueda] = useState("");
  const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);

  const [guardias, setGuardias] = useState({});

  const profesoresFiltrados = useMemo(() => {
    return profesores.filter((p) =>
      `${p.givenName ?? ""} ${p.sn ?? ""}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [busqueda, profesores]);

  function nombreProfesor(p) {
    return `${p.givenName ?? ""} ${p.sn ?? ""}`.trim();
  }

  function claveCelda(hIndex, dIndex) {
    return `${hIndex}-${dIndex}`;
  }

  function handleDrop(e, hIndex, dIndex) {
    e.preventDefault();

    const profesor = JSON.parse(e.dataTransfer.getData("profesor"));
    const clave = claveCelda(hIndex, dIndex);

    setGuardias((prev) => {
      const lista = prev[clave] || [];

      if (lista.find((p) => p.uid === profesor.uid)) return prev;

      return {
        ...prev,
        [clave]: [...lista, profesor],
      };
    });
  }

  function eliminarProfesor(clave, uid) {
    setGuardias((prev) => ({
      ...prev,
      [clave]: prev[clave].filter((p) => p.uid !== uid),
    }));
  }

  if (isLoading) return <div>Cargando profesores...</div>;

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <div className="grid grid-cols-[320px_1fr] gap-6">
        {/* PANEL PROFESORES */}

        <Card>
          <CardHeader>
            <CardTitle>Profesores</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />

              <Input
                placeholder="Buscar profesor..."
                className="pl-8"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <ScrollArea className="h-[520px] pr-3">
              <div className="space-y-2">
                {profesoresFiltrados.map((profesor) => (
                  <div
                    key={profesor.uid}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData(
                        "profesor",
                        JSON.stringify(profesor)
                      )
                    }
                    className="cursor-grab rounded-md border px-3 py-2 text-sm hover:bg-muted"
                  >
                    {nombreProfesor(profesor)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* CALENDARIO */}

        <Card>
          <CardHeader>
            <CardTitle>Cuadrante de guardias</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-[80px_repeat(5,1fr)]">
              <div />

              {dias.map((d) => (
                <div
                  key={d}
                  className="border text-center font-medium py-2 bg-muted"
                >
                  {d}
                </div>
              ))}

              {horas.map((hora, hIndex) => (
                <>
                  <div
                    key={hora}
                    className="border text-center py-3 font-medium bg-muted"
                  >
                    {hora}
                  </div>

                  {dias.map((dia, dIndex) => {
                    const clave = claveCelda(hIndex, dIndex);
                    const profesoresCelda = guardias[clave] || [];
                    const seleccionada = celdaSeleccionada === clave;

                    return (
                      <div
                        key={clave}
                        onClick={() => setCeldaSeleccionada(clave)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, hIndex, dIndex)}
                        className={cn(
                          "border min-h-[100px] p-2 cursor-pointer",
                          seleccionada && "bg-blue-50 border-blue-400"
                        )}
                      >
                        <div className="flex flex-col gap-1">
                          {profesoresCelda.map((p) => (
                            <div
                              key={p.uid}
                              className="flex items-center justify-between text-xs bg-primary/10 px-2 py-1 rounded"
                            >
                              {nombreProfesor(p)}

                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  eliminarProfesor(clave, p.uid);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
