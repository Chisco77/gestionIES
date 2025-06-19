import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";

export function Informes ({ cursos }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Informes
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => console.log("Etiquetas", cursos)}>
          <Printer className="mr-2 h-4 w-4" />
          Etiquetas
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("Informe", cursos)}>
          <FileText className="mr-2 h-4 w-4" />
          Informe de cursos
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
