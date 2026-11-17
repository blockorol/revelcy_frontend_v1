import MaintenanceRoute from "@components/maintenance/MaintenanceRoute";
import PremarketCreationFlow from "@screens/PremarketCreationFlow";
import { IS_SITE_SNAPSHOT } from "env";

export default function TokenCreationPage() {
  return IS_SITE_SNAPSHOT ? <MaintenanceRoute /> : <PremarketCreationFlow />;
}
