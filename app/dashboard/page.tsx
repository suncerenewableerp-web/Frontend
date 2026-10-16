import type { Metadata } from "next";
import ErpApp from "../erp/ErpApp";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return <ErpApp initialAuthView="login" bootMode="dashboard" />;
}
