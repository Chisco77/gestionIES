import { configureStore } from "@reduxjs/toolkit";
import tareas from "./tasksSlice"


const store = configureStore({
    reducer: {
        tareas: tareas
    }    
})

export default store