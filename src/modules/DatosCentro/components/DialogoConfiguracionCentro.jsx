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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  UserCheck,
  Palette,
  Trash2,
} from "lucide-react";
import { useConfiguracionCentro } from "@/hooks/useConfiguracionCentro";
import { useProfesoresActivos } from "@/hooks/useProfesoresActivos";
import { SelectProfesoresSimple } from "@/modules/Utilidades/components/SelectProfesoresSimple";

export function DialogoConfiguracionCentro({ open, onOpenChange }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";
  const queryClient = useQueryClient();

  const fileInputAppRef = useRef(null);
  const fileInputCentroRef = useRef(null);
  const fileInputFaviconRef = useRef(null);

  const { data: centro, isLoading } = useConfiguracionCentro();

  const { data: profesores = [] } = useProfesoresActivos();

  // Función auxiliar para obtener el nombre desde el UID
  const getNombreCompleto = (uid) => {
    const p = profesores.find((prof) => prof.uid === uid);
    if (!p) return uid;
    return `${p.givenName} ${p.sn}`;
  };

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
    uid_directora: null,
    uid_secretaria: null,
    uid_jefa_estudios: null,
    uids_adjuntos: [],
  });

  const [selectedFiles, setSelectedFiles] = useState({
    logo_miies: null,
    logo_centro: null,
    favicon: null,
  });

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
        uid_directora: centro.uidDirectora || null,
        uid_secretaria: centro.uidSecretaria || null,
        uid_jefa_estudios: centro.uidJefaEstudios || null,
        uids_adjuntos: Array.isArray(centro.uidsAdjuntos)
          ? centro.uidsAdjuntos.filter((uid) => uid && uid.trim() !== "")
          : [],
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
    setSelectedFiles((prev) => ({ ...prev, [field]: file }));
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      [`${field}_url`]: previewUrl,
    }));
  };

  const guardarMutation = useMutation({
    mutationFn: async (payload) => {
      console.log("Payload: ", payload);
      const data = new FormData();
      Object.keys(payload).forEach((key) => {
        if (payload[key] !== null && !key.endsWith("_url")) {
          if (key === "uids_adjuntos") {
            // ⬇️ ENVIAMOS SOLO UIDs REALES
            const validUids = payload[key].filter(
              (uid) => uid && uid.trim() !== ""
            );
            // Si el array queda vacío tras filtrar, enviamos un array vacío o nada
            if (validUids.length > 0) {
              validUids.forEach((uid) => data.append("uids_adjuntos", uid));
            } else {
              // Dependiendo de tu backend, puedes enviar una cadena vacía
              // o simplemente no hacer el append para que el backend lo limpie
              data.append("uids_adjuntos", "");
            }
          } else {
            data.append(key, payload[key]);
          }
        }
        data.set("web_url", payload.web_url || "");
      });
      if (selectedFiles.logo_miies)
        data.append("logo_miies", selectedFiles.logo_miies);
      if (selectedFiles.logo_centro)
        data.append("logo_centro", selectedFiles.logo_centro);
      if (selectedFiles.favicon) data.append("favicon", selectedFiles.favicon);

      const res = await fetch(`${API_BASE}/configuracion-centro`, {
        method: "POST",
        body: data,
        credentials: "include",
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
        className="p-0 rounded-xl w-[600px] flex flex-col overflow-hidden border-none shadow-2xl"
      >
        {/* Inputs de Archivo Ocultos */}
        <input
          type="file"
          ref={fileInputAppRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "logo_miies")}
        />
        <input
          type="file"
          ref={fileInputCentroRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "logo_centro")}
        />
        <input
          type="file"
          ref={fileInputFaviconRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "favicon")}
        />

        <DialogHeader className="bg-green-600 text-white flex items-center justify-center py-5 px-6 shrink-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <Building2 className="w-5 h-5" /> Centro
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="identidad" className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3 mx-8 mt-4 bg-slate-100">
              <TabsTrigger value="identidad" className="gap-2">
                <Palette className="w-4 h-4" /> Identidad
              </TabsTrigger>
              <TabsTrigger value="contacto" className="gap-2">
                <MapPin className="w-4 h-4" /> Dirección
              </TabsTrigger>
              <TabsTrigger value="directiva" className="gap-2">
                <UserCheck className="w-4 h-4" /> Directiva
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-8 py-4">
              {isLoading ? (
                <div className="py-20 text-center animate-pulse italic">
                  Cargando...
                </div>
              ) : (
                <>
                  {/* TAB: IDENTIDAD VISUAL */}
                  <TabsContent value="identidad" className="space-y-6 mt-0">
                    <div className="grid grid-cols-3 gap-4">
                      {/* Logo App */}
                      <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 gap-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500">
                          Logo App
                        </Label>
                        <div
                          onClick={() => fileInputAppRef.current.click()}
                          className="relative w-24 h-24 bg-white rounded-lg border cursor-pointer overflow-hidden group hover:border-green-500 transition-all"
                        >
                          {formData.logo_miies_url ? (
                            <img
                              src={formData.logo_miies_url}
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                              <ImageIcon />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Upload className="text-white w-6 h-6" />
                          </div>
                        </div>
                      </div>
                      {/* Logo Centro */}
                      <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 gap-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500">
                          Logo Centro
                        </Label>
                        <div
                          onClick={() => fileInputCentroRef.current.click()}
                          className="relative w-24 h-24 bg-white rounded-lg border cursor-pointer overflow-hidden group hover:border-blue-500 transition-all"
                        >
                          {formData.logo_centro_url ? (
                            <img
                              src={formData.logo_centro_url}
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                              <Building2 />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Upload className="text-white w-6 h-6" />
                          </div>
                        </div>
                      </div>
                      {/* Favicon */}
                      <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 gap-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500">
                          Favicon
                        </Label>
                        <div
                          onClick={() => fileInputFaviconRef.current.click()}
                          className="relative w-24 h-24 bg-white rounded-lg border cursor-pointer overflow-hidden group hover:border-amber-500 transition-all"
                        >
                          {formData.favicon_url ? (
                            <img
                              src={formData.favicon_url}
                              className="w-full h-full object-contain p-4"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                              <Fingerprint />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Upload className="text-white w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-green-800 font-bold">
                        Nombre Oficial del IES
                      </Label>
                      <Input
                        name="nombre_ies"
                        value={formData.nombre_ies}
                        onChange={handleChange}
                        className="border-green-100 h-11 text-lg font-semibold"
                      />
                    </div>
                  </TabsContent>

                  {/* TAB: UBICACIÓN Y CONTACTO */}
                  <TabsContent value="contacto" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">
                          Calle / Número
                        </Label>
                        <Input
                          name="direccion_linea_2"
                          value={formData.direccion_linea_2}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">
                          Código Postal
                        </Label>
                        <Input
                          name="codigo_postal"
                          value={formData.codigo_postal}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">
                          Localidad
                        </Label>
                        <Input
                          name="localidad"
                          value={formData.localidad}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-blue-700 flex items-center gap-2">
                          <Phone className="w-3 h-3" /> Teléfono
                        </Label>
                        <Input
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-blue-700 flex items-center gap-2">
                          <Mail className="w-3 h-3" /> Email
                        </Label>
                        <Input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                        <Globe className="w-3 h-3" /> Web Institucional
                      </Label>
                      <Input
                        name="web_url"
                        value={formData.web_url}
                        onChange={handleChange}
                        placeholder="https://..."
                      />
                    </div>
                  </TabsContent>

                  {/* TAB: DIRECTIVA */}
                  <TabsContent
                    value="directiva"
                    className="space-y-6 mt-0 py-4"
                  >
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
                      {/* 1. Directora (Línea independiente) */}
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-green-600" />{" "}
                          Director / Directora
                        </Label>
                        <SelectProfesoresSimple
                          value={formData.uid_directora}
                          onChange={(val) =>
                            setFormData((p) => ({ ...p, uid_directora: val }))
                          }
                        />
                        <p className="text-[11px] text-slate-400">
                          Firmante principal de documentos oficiales.
                        </p>
                      </div>

                      {/* 2. Secretaria (Línea independiente) */}
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-blue-600" />{" "}
                          Secretario / Secretaria
                        </Label>
                        <SelectProfesoresSimple
                          value={formData.uid_secretaria}
                          onChange={(val) =>
                            setFormData((p) => ({ ...p, uid_secretaria: val }))
                          }
                        />
                      </div>

                      <hr className="border-slate-200" />

                      {/* 3. Jefa de Estudios */}
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-amber-600" />{" "}
                          Jefe/a de Estudios
                        </Label>
                        <SelectProfesoresSimple
                          value={formData.uid_jefa_estudios}
                          onChange={(val) =>
                            setFormData((p) => ({
                              ...p,
                              uid_jefa_estudios: val,
                            }))
                          }
                        />
                      </div>

                      {/* 4. Jefaturas Adjuntas con Nombres Completos */}
                      <div className="space-y-3 pt-2">
                        <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-amber-600" />{" "}
                          Jefaturas de Estudios Adjuntas
                        </Label>

                        <SelectProfesoresSimple
                          value=""
                          placeholder="Añadir adjunto a la lista..."
                          onChange={(val) => {
                            if (val && !formData.uids_adjuntos.includes(val)) {
                              setFormData((p) => ({
                                ...p,
                                uids_adjuntos: [...p.uids_adjuntos, val],
                              }));
                            }
                          }}
                        />

                        <div className="space-y-2 mt-3">
                          {/* Solo mapeamos si hay elementos en el array */}
                          {formData.uids_adjuntos.length > 0 ? (
                            formData.uids_adjuntos.map((uid) => (
                              <div
                                key={uid}
                                className="flex items-center justify-between bg-white border border-slate-200 pl-4 pr-2 py-2 rounded-xl shadow-sm hover:border-blue-200 transition-colors group"
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-700">
                                    {getNombreCompleto(uid)}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {uid}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setFormData((p) => ({
                                      ...p,
                                      uids_adjuntos: p.uids_adjuntos.filter(
                                        (u) => u !== uid
                                      ),
                                    }))
                                  }
                                  className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            /* Si el array está vacío ([]), mostramos este mensaje elegante en lugar de nada o de cards vacías */
                            <div className="text-center py-4 border-2 border-dashed rounded-xl border-slate-100 bg-slate-50/30">
                              <p className="text-xs text-slate-400 italic">
                                No hay jefaturas adjuntas configuradas.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 shrink-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={guardarMutation.isLoading}
            className="bg-green-600 hover:bg-green-700 min-w-[150px]"
          >
            {guardarMutation.isLoading ? (
              "Guardando..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Guardar Todo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
