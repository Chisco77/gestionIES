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

/**
 * DialogoConfiguracionCentro.jsx
 */
import { useState, useEffect, useRef } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Save,
  ImageIcon,
  Upload,
} from "lucide-react";
import { useConfiguracionCentro } from "@/hooks/useConfiguracionCentro";

export function DialogoConfiguracionCentro({ open, onOpenChange }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";
  const queryClient = useQueryClient();

  // Referencias independientes para cada explorador de archivos
  const fileInputAppRef = useRef(null);
  const fileInputCentroRef = useRef(null);

  const { data: centro, isLoading } = useConfiguracionCentro();

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
    logo_miIES_url: "", // Logo de la Aplicación
    logo_centro_url: "", // Logo del Centro (Nuevo)
  });

  useEffect(() => {
    if (centro && open) {
      setFormData({
        id: centro.id,
        nombre_ies: centro.nombreIes,
        direccion_linea_1: centro.direccionLinea1,
        direccion_linea_2: centro.direccionLinea2,
        direccion_linea_3: centro.direccionLinea3,
        telefono: centro.telefono,
        fax: centro.fax,
        email: centro.email,
        localidad: centro.localidad,
        provincia: centro.provincia,
        codigo_postal: centro.codigoPostal,
        web_url: centro.webUrl,
        logo_miIES_url: centro.logoUrl,
        logo_centro_url: centro.logoCentroUrl || "",
      });
    }
  }, [centro, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejador genérico para archivos Base64
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast.error("Debe ser una imagen");
    if (file.size > 1.5 * 1024 * 1024) return toast.error("Máximo 1.5MB");

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, [field]: reader.result }));
      toast.info("Imagen actualizada en el formulario");
    };
    reader.readAsDataURL(file);
  };

  const guardarMutation = useMutation({
    mutationFn: async (payload) => {
      const esUpdate = !!payload.id;
      const url = esUpdate
        ? `${API_BASE}/configuracion-centro/${payload.id}`
        : `${API_BASE}/configuracion-centro`;

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
      toast.success("Datos actualizados correctamente");
      queryClient.invalidateQueries(["configuracion-centro"]);
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    if (!formData.nombre_ies) return toast.error("El nombre es obligatorio");
    guardarMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 rounded-lg max-w-2xl flex flex-col max-h-[90vh]"
      >
        {/* Inputs ocultos */}
        <input
          type="file"
          ref={fileInputAppRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "logo_miIES_url")}
        />
        <input
          type="file"
          ref={fileInputCentroRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "logo_centro_url")}
        />

        <DialogHeader className="bg-green-600 text-white rounded-t-lg py-3 px-6 shadow-md">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5" />
            <DialogTitle className="text-lg font-bold tracking-tight">
              Configuración Institucional
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="py-4 px-8 space-y-5">
              {isLoading ? (
                <div className="py-10 text-center text-gray-500 italic">
                  Cargando datos...
                </div>
              ) : (
                <>
                  {/* SECCIÓN LOGOS DOBLE COLUMNA (ALTURA REDUCIDA) */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Logo Aplicación */}
                    <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 gap-2">
                      <Label className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">
                        Logo Aplicación
                      </Label>
                      <div
                        onClick={() => fileInputAppRef.current.click()}
                        className="relative w-20 h-20 bg-white rounded-lg border border-slate-200 cursor-pointer overflow-hidden group hover:border-green-500 transition-all shadow-sm"
                      >
                        {formData.logo_miIES_url ? (
                          <img
                            src={formData.logo_miIES_url}
                            alt="App Logo"
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="text-white w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Logo Centro */}
                    <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 gap-2">
                      <Label className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">
                        Logo del Centro
                      </Label>
                      <div
                        onClick={() => fileInputCentroRef.current.click()}
                        className="relative w-20 h-20 bg-white rounded-lg border border-slate-200 cursor-pointer overflow-hidden group hover:border-blue-500 transition-all shadow-sm"
                      >
                        {formData.logo_centro_url ? (
                          <img
                            src={formData.logo_centro_url}
                            alt="Centro Logo"
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="text-white w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nombre Oficial */}
                  <div className="space-y-1.5">
                    <Label className="text-green-800 font-bold text-xs">
                      Nombre Oficial del IES
                    </Label>
                    <Input
                      name="nombre_ies"
                      value={formData.nombre_ies}
                      onChange={handleChange}
                      placeholder="Ej: IES Francisco de Orellana"
                      className="border-green-100 focus:ring-green-500 h-9"
                    />
                  </div>

                  {/* Dirección */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5 col-span-2">
                      <Label className="text-[11px] font-semibold flex items-center gap-2 text-slate-600">
                        <MapPin className="w-3 h-3" /> Dirección Principal
                      </Label>
                      <Input
                        name="direccion_linea_2"
                        value={formData.direccion_linea_2}
                        onChange={handleChange}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-slate-500">
                        Línea Secundaria
                      </Label>
                      <Input
                        name="direccion_linea_1"
                        value={formData.direccion_linea_1}
                        onChange={handleChange}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-slate-500">
                        Línea Adicional
                      </Label>
                      <Input
                        name="direccion_linea_3"
                        value={formData.direccion_linea_3}
                        onChange={handleChange}
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* Contacto Compacto */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase text-slate-400 font-bold">
                        C.P.
                      </Label>
                      <Input
                        name="codigo_postal"
                        value={formData.codigo_postal}
                        onChange={handleChange}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase text-slate-400 font-bold">
                        Localidad
                      </Label>
                      <Input
                        name="localidad"
                        value={formData.localidad}
                        onChange={handleChange}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase text-slate-400 font-bold">
                        Provincia
                      </Label>
                      <Input
                        name="provincia"
                        value={formData.provincia}
                        onChange={handleChange}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase text-slate-400 font-bold">
                        Teléfono
                      </Label>
                      <Input
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase text-slate-400 font-bold">
                        Fax
                      </Label>
                      <Input
                        name="fax"
                        value={formData.fax}
                        onChange={handleChange}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase text-slate-400 font-bold">
                        Email
                      </Label>
                      <Input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                      <Globe className="w-3 h-3 text-blue-500" /> Web
                      Institucional
                    </Label>
                    <Input
                      name="web_url"
                      value={formData.web_url}
                      onChange={handleChange}
                      className="h-9"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="px-8 py-3 bg-gray-50 rounded-b-lg border-t gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={guardarMutation.isLoading || isLoading}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
          >
            {guardarMutation.isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
