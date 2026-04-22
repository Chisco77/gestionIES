/**
 * DialogoConfiguracionCentro.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Proyecto: gestionIES
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Descripción:
 * Diálogo para la gestión integral de los datos del IES.
 * Sustituye el uso de variables VITE por base de datos.
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Phone, Mail, Globe, Save } from "lucide-react";

export function DialogoConfiguracionCentro({ open, onOpenChange }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  // Estado local para el formulario
  const [formData, setFormData] = useState({
    id: null,
    nombre_ies: "",
    direccion_linea_1: "",
    direccion_linea_2: "",
    direccion_linea_3: "",
    telefono: "",
    fax: "",
    email: "",
    localidad: "",
    provincia: "",
    codigo_postal: "",
    web_url: "",
  });

  // 1. Cargar datos actuales
  const { data, isLoading } = useQuery({
    queryKey: ["configuracion_centro"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/db/configuracion-centro`, {
        credentials: "include",
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.centro;
    },
    enabled: open,
  });

  // Sincronizar datos de la DB al estado local
  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Mutación para Guardar (Update o Insert)
  const guardarMutation = useMutation({
    mutationFn: async (payload) => {
      const esUpdate = !!payload.id;
      const url = esUpdate
        ? `${API_URL}/db/configuracion-centro/${payload.id}`
        : `${API_URL}/db/configuracion-centro`;

      const res = await fetch(url, {
        method: esUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al guardar la configuración");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Datos del centro actualizados correctamente");
      queryClient.invalidateQueries(["configuracion_centro"]);
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    if (!formData.nombre_ies)
      return toast.error("El nombre del IES es obligatorio");
    guardarMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 rounded-lg max-w-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header con estilo institucional */}
        <DialogHeader className="bg-green-600 text-white rounded-t-lg py-4 px-6 shadow-md">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6" />
            <DialogTitle className="text-xl font-bold tracking-tight">
              Configuración Institucional del Centro
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="py-6 px-8 space-y-6">
              {/* Sección Nombre */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-green-800 font-bold">
                  Nombre Oficial del IES
                </Label>
                <Input
                  name="nombre_ies"
                  value={formData.nombre_ies}
                  onChange={handleChange}
                  placeholder="Ej: IES Francisco de Orellana"
                  className="border-green-200 focus:ring-green-500"
                />
              </div>

              {/* Grid de Dirección */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label className="flex items-center gap-2 font-semibold">
                    <MapPin className="w-4 h-4 text-gray-500" /> Dirección
                    Principal
                  </Label>
                  <Input
                    name="direccion_linea_2"
                    value={formData.direccion_linea_2}
                    onChange={handleChange}
                    placeholder="Calle, número, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Línea Secundaria (Ej: Organismo)</Label>
                  <Input
                    name="direccion_linea_1"
                    value={formData.direccion_linea_1}
                    onChange={handleChange}
                    placeholder="Secretaría General..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Línea Adicional (Ej: Apartado Correos)</Label>
                  <Input
                    name="direccion_linea_3"
                    value={formData.direccion_linea_3}
                    onChange={handleChange}
                    placeholder="Apdo. de Correos..."
                  />
                </div>
              </div>

              {/* Localización y Contacto */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase text-gray-500">
                    Cód. Postal
                  </Label>
                  <Input
                    name="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase text-gray-500">
                    Localidad
                  </Label>
                  <Input
                    name="localidad"
                    value={formData.localidad}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase text-gray-500">
                    Provincia
                  </Label>
                  <Input
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1 text-xs uppercase text-gray-500">
                    <Phone className="w-3 h-3" /> Teléfono
                  </Label>
                  <Input
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1 text-xs uppercase text-gray-500">
                    Fax
                  </Label>
                  <Input
                    name="fax"
                    value={formData.fax}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1 text-xs uppercase text-gray-500">
                    <Mail className="w-3 h-3" /> Email
                  </Label>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Web URL */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-semibold">
                  <Globe className="w-4 h-4 text-blue-500" /> Sitio Web
                  Institucional
                </Label>
                <Input
                  name="web_url"
                  value={formData.web_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer con acciones */}
        <DialogFooter className="px-8 py-4 bg-gray-100 rounded-b-lg border-t gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={guardarMutation.isLoading || isLoading}
            className="bg-green-600 hover:bg-green-700 text-white min-w-[120px] gap-2"
          >
            {guardarMutation.isLoading ? (
              "Guardando..."
            ) : (
              <>
                <Save className="w-4 h-4" /> Guardar Cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
