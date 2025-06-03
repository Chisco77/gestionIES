// components/ui/MultiSelect.js
import Select from "react-select";

export function MultiSelect({ values, onChange, options, placeholder }) {
  return (
    <Select
      isMulti
      options={options}
      value={options.filter((opt) => values?.includes(opt.value))}
      onChange={(selected) => onChange(selected.map((s) => s.value))}
      placeholder={placeholder}
      className="min-w-[200px]"
    />
  );
}
