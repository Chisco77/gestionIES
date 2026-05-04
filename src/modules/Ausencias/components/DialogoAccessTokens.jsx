/**
 * DialogoAccessTokens.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Proyecto: gestionIES
 * ------------------------------------------------------------
 *
 * Descripción:
 * Diálogo para gestionar el token de acceso de la proyección
 * de la Sala de Profesores (Modo TV).
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Monitor, Save, X, ShieldCheck } from "lucide-react";

export function DialogoAccessTokens({ open, onOpenChange }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  // Estados del formulario
  const [idExistente, setIdExistente] = useState(null);
  const [token, setToken] = useState("");
  const [ldapUser, setLdapUser] = useState("");
  const [ldapPass, setLdapPass] = useState("");
  const [cargando, setCargando] = useState(false);

  // Valores fijos según requerimiento
  const NOMBRE_FIJO = "panel-sala-profesores";
  const ROL_FIJO = "viewer";

  // Cargar datos al abrir
  useEffect(() => {
    if (open) {
      fetchTokenConfig();
    }
  }, [open]);

  const fetchTokenConfig = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_URL}/access-tokens`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al obtener tokens");
      const data = await res.json();

      // Buscamos si ya existe la configuración de la sala de profesores
      const config = data.find((t) => t.nombre === NOMBRE_FIJO);

      if (config) {
        setIdExistente(config.id);
        setToken(config.token);
        setLdapUser(config.ldap_user || "");
        setLdapPass(config.ldap_pass || "");
      } else {
        setIdExistente(null);
        setToken("");
        setLdapUser("");
        setLdapPass("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar la configuración de acceso");
    } finally {
      setCargando(false);
    }
  };

  // Mutación para Guardar (POST si es nuevo, PUT si existe)
  const guardarMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        nombre: NOMBRE_FIJO,
        token,
        rol: ROL_FIJO,
        ldap_user: ldapUser,
        ldap_pass: ldapPass,
      };

      const url = idExistente
        ? `${API_URL}/access-tokens/${idExistente}`
        : `${API_URL}/access-tokens`;

      const method = idExistente ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al procesar la solicitud");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Configuración de acceso guardada");
      queryClient.invalidateQueries(["access-tokens"]);
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 rounded-lg w-[600px] flex flex-col"
      >
        <DialogHeader className="bg-green-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700 rounded-lg">
              <Monitor className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-center leading-snug">
                Configuración de Proyección
              </DialogTitle>
              <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">
                Modo TV - Sala de Profesores
              </p>
            </div>
          </div>
        </DialogHeader>

        <Card className="border-none shadow-none">
          <CardContent className="p-8 space-y-6">
            {/* Selector de Pantalla (Fijo según tu petición) */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">
                Pantalla de destino
              </Label>
              <Select defaultValue={NOMBRE_FIJO} disabled>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Seleccionar panel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NOMBRE_FIJO}>
                    Sala de Profesores (Principal)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-slate-500 italic">
                Identificador único del panel de visualización.
              </p>
            </div>

            {/* Token de acceso */}
            <div className="space-y-2">
              <Label
                htmlFor="token"
                className="text-sm font-bold text-slate-700"
              >
                Token de Acceso Público
              </Label>
              <div className="relative">
                <Input
                  id="token"
                  placeholder="Introduce el token alfanumérico"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="pl-10 h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <KeyRound className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              </div>
            </div>

            {/* Credenciales LDAP (Necesarias según tu insertToken) */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">
                  Usuario LDAP
                </Label>
                <Input
                  placeholder="Usuario"
                  value={ldapUser}
                  onChange={(e) => setLdapUser(e.target.value)}
                  className="h-10 bg-slate-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">
                  Contraseña LDAP
                </Label>
                <Input
                  type="password"
                  placeholder="Password"
                  value={ldapPass}
                  onChange={(e) => setLdapPass(e.target.value)}
                  className="h-10 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Aviso informativo */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-600" />
                <p className="text-xs text-amber-800 leading-tight">
                  Este token permite la visualización pública de datos en
                  pantallas del centro. Asegúrate de que el rol sea{" "}
                  <strong>{ROL_FIJO}</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer con acciones */}
        <DialogFooter className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>

          <Button
            onClick={() => guardarMutation.mutate()}
            disabled={guardarMutation.isLoading || cargando || !token}
            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
          >
            {guardarMutation.isLoading ? (
              "Procesando..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {idExistente ? "Actualizar" : "Configurar"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
