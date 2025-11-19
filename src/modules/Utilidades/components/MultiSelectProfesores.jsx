// src/components/forms/MultiSelectProfesores.jsx
import { MultiSelect } from "@/components/ui/multiselect";
import { Label } from "@/components/ui/label";
import { useProfesoresLdap } from "@/hooks/useProfesoresLdap";

export function MultiSelectProfesores({ value, onChange }) {
  const { data, isLoading } = useProfesoresLdap();

  const opciones = (data || []).map((p) => ({
    value: p.uid,
    label: `${p.sn}, ${p.givenName}`,
  }));

  return (
    <div className="space-y-2">
      <Label>Profesores responsables</Label>
      <MultiSelect
        values={value}
        onChange={onChange}
        options={opciones}
        placeholder={
          isLoading ? "Cargando profesores..." : "Seleccionar profesores"
        }
      />
    </div>
  );
}
