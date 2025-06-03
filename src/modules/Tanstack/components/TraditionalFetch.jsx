import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'


import { TaskCard } from './TaskCard'

export function TraditionalFetch() {

  //recojo los datos de la api

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  useEffect(() => {
    fetch("http://localhost:3001/tareas")
      .then(response => response.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch((error) => {
        console.log("error")
        setLoading(false)
        setError(error)
      })
  }, [])


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-10 h-10 text-indigo-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-10">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Tareas</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {//muestr la información de cada Task
          data.map((taskItem) => {
            return <TaskCard task={taskItem} />
          }
          )
        }
      </div>
    </div>
  )
}
