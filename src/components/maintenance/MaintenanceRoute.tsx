import MaintenanceNotice from "@components/maintenance/MaintenanceNotice";
import { useRouter } from "@hooks/useSafeRouter";

export default function MaintenanceRoute() {
  const router = useRouter();
  return <MaintenanceNotice visible onClose={() => router.replace("/discover")} />;
}
