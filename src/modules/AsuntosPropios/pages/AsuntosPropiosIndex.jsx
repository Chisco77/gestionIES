import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PanelReservas } from "@/modules/Comunes/PanelReservas";
import { DialogoInsertarAsunto } from "../components/DialogoInsertarAsunto";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function AsuntosPropiosIndex() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [abrirDialogo, setAbrirDialogo] = useState(false);
  const [reloadPanel, setReloadPanel] = useState(0);

  const { user } = useAuth();
  const uid = user?.username;
  const todayStr = formatDateKey(new Date());

  // --- Cálculo de calendario ---
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const startDay = (firstDay + 6) % 7;
  const weeks = [];
  let day = 1 - startDay;
  while (day <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(day > 0 && day <= daysInMonth ? day : null);
      day++;
    }
    weeks.push(week);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const handleDiaClick = (dateKey) => {
    setSelectedDate(dateKey);
    setAbrirDialogo(true);
  };

  const onInsertarSuccess = () => {
    setReloadPanel((v) => v + 1);
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calendario */}
        <Card className="shadow-lg rounded-2xl h-[300px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
            <button onClick={handlePrevMonth}>
              <ChevronLeft className="w-6 h-6" />
            </button>
            <CardTitle className="capitalize text-lg font-semibold">
              {new Date(currentYear, currentMonth).toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
            <button onClick={handleNextMonth}>
              <ChevronRight className="w-6 h-6" />
            </button>
          </CardHeader>

          <CardContent className="p-2 flex-grow flex items-start justify-center">
            <div className="w-full">
              <table className="w-full border-collapse text-center align-top">
                <thead>
                  <tr>
                    {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                      <th key={d} className="p-1 font-medium">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="align-top">
                  {weeks.map((week, i) => (
                    <tr key={i}>
                      {week.map((d, j) => {
                        if (!d) return <td key={j} className="p-2"></td>;
                        const dateKey = formatDateKey(
                          new Date(currentYear, currentMonth, d)
                        );
                        const isToday = dateKey === todayStr;
                        const isSelected = dateKey === selectedDate;
                        return (
                          <td
                            key={j}
                            className={`p-1 cursor-pointer relative rounded-lg transition
                              ${isToday ? "bg-blue-200 border-2 border-blue-400" : ""}
                              ${isSelected ? "bg-gray-200" : ""}`}
                            onClick={() => handleDiaClick(dateKey)}
                          >
                            {d}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Panel de Asuntos Propios */}
        <div className="h-full">
          <PanelReservas
            uid={uid}
            reloadKey={reloadPanel}
            onAsuntoModificado={onInsertarSuccess}
          />
        </div>
      </div>

      {/* Diálogo de inserción */}
      {abrirDialogo && (
        <DialogoInsertarAsunto
          open={abrirDialogo}
          onClose={() => setAbrirDialogo(false)}
          fecha={selectedDate}
          onSuccess={onInsertarSuccess}
        />
      )}
    </div>
  );
}
