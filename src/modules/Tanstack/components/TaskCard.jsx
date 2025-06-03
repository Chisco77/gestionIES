import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export const TaskCard = ({ task }) => {
  const navigate = useNavigate()

  return (
    <Card className="shadow-sm border rounded-md">
      <CardHeader>
        <CardTitle>{task.titulo}</CardTitle>
        <CardDescription>Responsable: {task.responsable}</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Sección con el estado y el icono de borrar */}
        <div className="flex items-center justify-between gap-2">
          {/* Estado y fecha */}
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
            <div>
              <p className="text-sm font-medium">
                Estado:
                <Badge
                  variant={task.activo ? 'success' : 'destructive'}
                  className="ml-2"
                >
                  {task.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </p>
              <p className="text-xs text-gray-400">Actualizado hace 1 hora</p>
            </div>
          </div>

          {/* Botón con icono para borrar 
          <Button
            variant="ghost"
            size="icon"
            aria-label="Borrar tarea"
          >
            <Trash2 className="w-4 h-4" />
          </Button>*/}
        </div>
      </CardContent>

      {/* Pie de la tarjeta para ver detalles */}
      <CardFooter>
        <Button
          variant="default"
          className="w-full"
          onClick={() => navigate(`/tanstack/${task.id}`)}
        >
          Ver detalles
        </Button>
      </CardFooter>
    </Card>
  )
}
