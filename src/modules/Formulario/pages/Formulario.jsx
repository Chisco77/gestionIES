import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@radix-ui/react-label'
import React, { useState } from 'react'



export const Formulario = () => {

    const [task, setTask] = useState(
        {
            titulo: "",
            responsable: "",
            errorTitulo: "",
            errorResponsable: "",
            activo: false
        }
    )

    const [tasks, setTasks] = useState([])

    const handleChange = (e) => {
        setTask({
            ...task,
            [e.target.name]: e.target.value,
            errorTitulo: "",
            errorResponsable: ""
        })
    }

    const handleClick = (e) => {
        e.preventDefault()

        if (task.titulo == "") {
            setTask({
                ...task,
                errorTitulo: "El Titulo no puede estar vacío"
            })
            return
        }

        if (task.responsable == "") {
            setTask({
                ...task,
                errorResponsable: "El Responsable no puede estar vacío"
            })
            return
        }

        setTasks([
            ...tasks,
            task
        ])
        setTask({
            titulo: "",
            responsable: "",
            errorTitulo: "",
            errorResponsable: "",
            activo: false
        })
    }

    const handleCheckboxChange = (index) => {
        console.log(index)

        const updatedTask = tasks.map((tarea, i) =>
            index == i ? { ...tarea, activo: !tarea.activo } : tarea
        )
        setTasks(updatedTask)
    }



    const { titulo, responsable } = task


    return (
        <>
            <div className="flex flex-1 flex-col gap-4 p-4">
                <h1 className="mb-4 text-2xl font-bold">Formulario</h1>
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Columna Izquierda: Formulario */}
                    <div>
                        <form
                            className="space-y-4 p-4 border rounded-md"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="titulo">Título</Label>


                                <Input
                                    id="titulo"
                                    name="titulo"
                                    onChange={handleChange}
                                    value={titulo}
                                    placeholder="Ingresa el título"
                                />
                                <div className="text-sm text-red-500">{task.errorTitulo}</div>



                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="responsable">Responsable</Label>
                                <Input
                                    id="responsable"
                                    name="responsable"
                                    onChange={handleChange}
                                    value={responsable}
                                    placeholder="Ingresa el responsable"
                                />
                                <div className="text-sm text-red-500">{task.errorResponsable}</div>
                            </div>
                            <Button
                                variant="default"
                                className="mt-2"
                                onClick={handleClick}
                            >
                                Guardar
                            </Button>
                        </form>
                    </div>

                    {/* Columna Derecha: Lista con checkbox, título y responsable */}
                    <div className="p-4 border rounded-md">
                        <ul className="space-y-4">

                            {
                                tasks.map(({ titulo, responsable, activo }, index) =>


                                    <li
                                        key={index}
                                        className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={activo}
                                            onClick={() => handleCheckboxChange(index)}
                                            className="h-6 w-6"
                                        />
                                        <div>
                                            <p className="font-semibold text-lg">{titulo}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Responsable: {responsable}
                                            </p>
                                        </div>
                                    </li>



                                )
                            }







                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}