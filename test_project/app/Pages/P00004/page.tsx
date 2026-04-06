import { DashboardClient } from "./DashboardClient";

export default function Page() {
  // Server Component는 페이지 껍데기만 즉시 렌더하고,
  // 실제 위젯 데이터는 DashboardClient에서 진입 후 비동기 로드
  return <DashboardClient />;
}