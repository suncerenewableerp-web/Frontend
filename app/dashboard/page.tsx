import ErpApp from "../erp/ErpApp";

export default function DashboardPage() {
  return <ErpApp initialAuthView="login" bootMode="dashboard" />;
}
