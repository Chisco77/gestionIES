/**
 * DialogoConfiguracionCentro.jsx
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Proyecto: gestionIES
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
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
  ImageIcon,
  Upload,
  Fingerprint,
  Save,
  X,
} from "lucide-react";
import { useConfiguracionCentro } from "@/hooks/useConfiguracionCentro";

export function DialogoConfiguracionCentro({ open, onOpenChange }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";
  const queryClient = useQueryClient();

  // Referencias para los inputs de archivos
  const fileInputAppRef = useRef(null);
  const fileInputCentroRef = useRef(null);
  const fileInputFaviconRef = useRef(null);

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
    logo_miies_url: "",
    logo_centro_url: "",
    favicon_url: "",
  });

  // Sincronizar datos cuando el diálogo se abre o los datos cargan
  useEffect(() => {
    if (centro && open) {
      setFormData({
        id: centro.id,
        nombre_ies: centro.nombreIes || "",
        direccion_linea_1: centro.direccionLinea1 || "",
        direccion_linea_2: centro.direccionLinea2 || "",
        direccion_linea_3: centro.direccionLinea3 || "",
        telefono: centro.telefono || "",
        fax: centro.fax || "",
        email: centro.email || "",
        localidad: centro.localidad || "",
        provincia: centro.provincia || "",
        codigo_postal: centro.codigoPostal || "",
        web_url: centro.webUrl || "",
        logo_miies_url: centro.logoMiiesUrl || "",
        logo_centro_url: centro.logoCentroUrl || "",
        favicon_url: centro.faviconUrl || "",
      });
    }
  }, [centro, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast.error("El archivo debe ser una imagen");

    // Límite de 1.5MB para evitar payloads excesivos en la BD
    if (file.size > 1.5 * 1024 * 1024)
      return toast.error("La imagen es demasiado pesada (Máx 1.5MB)");

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, [field]: reader.result }));
      toast.info("Imagen cargada en el formulario");
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
      toast.success("Configuración actualizada correctamente");
      queryClient.invalidateQueries(["configuracion-centro"]);
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    if (!formData.nombre_ies)
      return toast.error("El nombre del centro es obligatorio");
    guardarMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 rounded-lg max-w-2xl flex flex-col max-h-[95vh]"
      >
        {/* Inputs de Archivo Ocultos */}
        <input
          type="file"
          ref={fileInputAppRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "logo_miies_url")}
        />
        <input
          type="file"
          ref={fileInputCentroRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "logo_centro_url")}
        />
        <input
          type="file"
          ref={fileInputFaviconRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "favicon_url")}
        />

        <DialogHeader className="bg-green-600 text-white rounded-t-lg py-4 px-8 shadow-md">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6" />
            <DialogTitle className="text-xl font-bold tracking-tight">
              Datos del centro
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="py-6 px-8 space-y-6">
              {isLoading ? (
                <div className="py-20 text-center text-gray-500 animate-pulse italic">
                  Cargando configuración...
                </div>
              ) : (
                <>
                  {/* SECCIÓN DE IDENTIDAD VISUAL (3 COLUMNAS) */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Logo Aplicación */}
                    <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 gap-2">
                      <Label className="text-slate-500 font-bold uppercase text-[9px] tracking-widest text-center">
                        Logo App
                      </Label>
                      <div
                        onClick={() => fileInputAppRef.current.click()}
                        className="relative w-20 h-20 bg-white rounded-lg border border-slate-200 cursor-pointer overflow-hidden group hover:border-green-500 transition-all shadow-sm"
                      >
                        {formData.logo_miies_url ? (
                          <img
                            src={formData.logo_miies_url}
                            alt="App"
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                            <ImageIcon className="w-7 h-7" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="text-white w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    {/* Logo Centro */}
                    <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 gap-2">
                      <Label className="text-slate-500 font-bold uppercase text-[9px] tracking-widest text-center">
                        Logo Centro
                      </Label>
                      <div
                        onClick={() => fileInputCentroRef.current.click()}
                        className="relative w-20 h-20 bg-white rounded-lg border border-slate-200 cursor-pointer overflow-hidden group hover:border-blue-500 transition-all shadow-sm"
                      >
                        {formData.logo_centro_url ? (
                          <img
                            src={formData.logo_centro_url}
                            alt="Centro"
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                            <Building2 className="w-7 h-7" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="text-white w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    {/* Favicon */}
                    <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 gap-2">
                      <Label className="text-slate-500 font-bold uppercase text-[9px] tracking-widest text-center">
                        Favicon (Tab)
                      </Label>
                      <div
                        onClick={() => fileInputFaviconRef.current.click()}
                        className="relative w-20 h-20 bg-white rounded-lg border border-slate-200 cursor-pointer overflow-hidden group hover:border-amber-500 transition-all shadow-sm"
                      >
                        {formData.favicon_url ? (
                          <img
                            src={formData.favicon_url}
                            alt="Favicon"
                            className="w-full h-full object-contain p-4"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                            <Fingerprint className="w-7 h-7" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="text-white w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nombre del Centro */}
                  <div className="space-y-2">
                    <Label className="text-green-800 font-bold text-xs flex items-center gap-2">
                      NOMBRE del centro
                    </Label>
                    <Input
                      name="nombre_ies"
                      value={formData.nombre_ies}
                      onChange={handleChange}
                      placeholder="Ej: IES Francisco de Orellana"
                      className="border-green-100 focus:ring-green-500 h-10 font-medium"
                    />
                  </div>

                  {/* Bloque de Dirección */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-2 col-span-2">
                      <Label className="text-[11px] font-bold flex items-center gap-2 text-slate-600 uppercase tracking-tighter">
                        <MapPin className="w-3 h-3 text-red-500" /> Dirección
                        Principal (Calle, Número)
                      </Label>
                      <Input
                        name="direccion_linea_2"
                        value={formData.direccion_linea_2}
                        onChange={handleChange}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] text-slate-500 font-semibold uppercase">
                        Línea Secundaria
                      </Label>
                      <Input
                        name="direccion_linea_1"
                        value={formData.direccion_linea_1}
                        onChange={handleChange}
                        className="h-9 bg-slate-50/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] text-slate-500 font-semibold uppercase">
                        Línea Adicional
                      </Label>
                      <Input
                        name="direccion_linea_3"
                        value={formData.direccion_linea_3}
                        onChange={handleChange}
                        className="h-9 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Datos de Localización y Contacto */}
                  <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-slate-400 font-black">
                        C. Postal
                      </Label>
                      <Input
                        name="codigo_postal"
                        value={formData.codigo_postal}
                        onChange={handleChange}
                        className="h-9 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-slate-400 font-black">
                        Localidad
                      </Label>
                      <Input
                        name="localidad"
                        value={formData.localidad}
                        onChange={handleChange}
                        className="h-9 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-slate-400 font-black">
                        Provincia
                      </Label>
                      <Input
                        name="provincia"
                        value={formData.provincia}
                        onChange={handleChange}
                        className="h-9 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-slate-400 font-black flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" /> Teléfono
                      </Label>
                      <Input
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="h-9 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-slate-400 font-black">
                        Fax
                      </Label>
                      <Input
                        name="fax"
                        value={formData.fax}
                        onChange={handleChange}
                        className="h-9 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-slate-400 font-black flex items-center gap-1">
                        <Mail className="w-2.5 h-2.5" /> Email
                      </Label>
                      <Input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="h-9 bg-white"
                      />
                    </div>
                  </div>

                  {/* Web Institucional */}
                  <div className="space-y-2 pb-2">
                    <Label className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase">
                      <Globe className="w-3 h-3 text-blue-500" /> Web del Centro
                    </Label>
                    <Input
                      name="web_url"
                      value={formData.web_url}
                      onChange={handleChange}
                      placeholder="https://iesfranciscodeorellana.educarex.es"
                      className="h-10 border-blue-50"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="px-8 py-4 bg-gray-50 rounded-b-lg border-t gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-slate-500 hover:bg-slate-100"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={guardarMutation.isLoading || isLoading}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white min-w-[140px] shadow-sm flex gap-2"
          >
            {guardarMutation.isLoading ? (
              "Guardando..."
            ) : (
              <>
                <Save className="w-4 h-4" /> Guardar Configuración
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
