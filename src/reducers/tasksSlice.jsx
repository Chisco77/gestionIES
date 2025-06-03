import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    tasksList: [
        {
            titulo: "Tarea por defecto REDUX",
            responsable: "Responsable por defecto REDUX",
            activo: true
        }
    ]
}


const tasksSlice = createSlice({
    name: "tareas",
    initialState,
    reducers: {
        addTask: (state, action) => {
            //action.payload
            state.tasksList.push(action.payload)
        },
        changeTask: (state, action) => {
            state.tasksList = state.tasksList.map((tarea, i) =>
                action.payload == i ? { ...tarea, activo: !tarea.activo } : tarea)
        }
    }
})

export const {addTask, changeTask} = tasksSlice.actions
export default tasksSlice.reducer