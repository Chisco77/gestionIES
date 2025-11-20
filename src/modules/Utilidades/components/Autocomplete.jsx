/* ============================
   AUTOCOMPLETE
============================ */
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";


export function Autocomplete({
  value,
  onChange,
  onSelect,
  buscar,
  placeholder = "",
}) {
  const [sugerencias, setSugerencias] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const safeBuscar = async (texto) => {
    try {
      const resultados = await buscar(texto);
      setSugerencias(Array.isArray(resultados) ? resultados : []);
      setAbierto(true);
    } catch {
      setSugerencias([]);
      setAbierto(false);
    }
  };

  const handleInput = (texto) => {
    onChange(texto);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!texto || texto.length < 3) {
      setSugerencias([]);
      setAbierto(false);
      return;
    }
    debounceRef.current = setTimeout(() => safeBuscar(texto), 300);
  };

  const handleSelect = (item) => {
    onSelect(item);
    setAbierto(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => {
          if (sugerencias.length > 0) setAbierto(true);
        }}
      />
      {abierto && sugerencias.length > 0 && (
        <ul
          className="absolute w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-[1000]"
          role="listbox"
        >
          {sugerencias.map((s, i) => (
            <li
              key={i}
              role="option"
              className="p-2 text-sm cursor-pointer hover:bg-gray-100"
              onMouseDown={() => handleSelect(s)}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}