import { useEffect, useState } from "react"
import { columns } from "../components/colums"
import { DataTable } from "../components/data-table"



export function BecariosIndex() {

    const [data, setData] = useState([])
    // fetch de datos a backend ldap, que está corriendo en puerto 5000
    useEffect(() => {
        fetch("http://localhost:5000/api/alumnos")
            .then(response => response.json())
            .then(data => setData(data))
            .catch((error) => console.log("error al cargar alumnos"))
    }, [])


    return (
        <div className="container mx-auto py-10 p-12">
            <DataTable columns={columns} data={data} />
        </div>
    )
}
