import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { PanelReservas } from "@/modules/Comunes/PanelReservas";
import { TablaExtraescolares } from "../components/TablaExtraescolares";
import { CalendarioExtraescolares } from "../components/CalendarioExtraescolares";

export function ExtraescolaresIndex() {
  const { user } = useAuth();
  const uid = user?.username;

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CalendarioExtraescolares uid={uid} />

        <div className="h-full">
          <PanelReservas uid={uid} />
        </div>
      </div>

      <Card className="shadow-lg rounded-2xl flex flex-col p-2">
        <TablaExtraescolares user={user} />
      </Card>
    </div>
  );
}
