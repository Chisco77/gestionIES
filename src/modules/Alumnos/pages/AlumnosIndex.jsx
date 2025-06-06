// BecariosIndex.jsx
import { useEffect, useState } from "react";
import { columns } from "../components/colums";
import { TablaAlumnos } from "../components/TablaAlumnos";
import { DialogoEtiquetas } from "../components/DialogoEtiquetas";
import { DialogoMes } from "../components/DialogoMes";

export function AlumnosIndex() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/alumnos")
      .then(response => response.json())
      .then(data => setData(data))
      .catch(() => console.log("error al cargar alumnos"));
  }, []);

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaAlumnos columns={columns} data={data} />
          <div className="flex gap-4">
        <DialogoEtiquetas alumnos={data} />
        <DialogoMes />
    </div>
    </div>


  );
}
