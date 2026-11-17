// app/me.tsx

import MeScreen from "@screens/MeScreen";
import MaintenanceRoute from "@components/maintenance/MaintenanceRoute";
import { IS_SITE_SNAPSHOT } from "env";

export default function Me() {
  return (
    IS_SITE_SNAPSHOT ? <MaintenanceRoute /> : <MeScreen />
  );
}

