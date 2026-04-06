import type {
  ModulePermission,
  RoleDefinition,
  Ticket,
  TicketStatus,
  User,
} from "./types";
import type { IconType } from "react-icons";
import {
  LuChartBar,
  LuLayoutDashboard,
  LuSettings2,
  LuTicket,
  LuTimer,
  LuTruck,
  LuUsers,
  LuWrench,
} from "react-icons/lu";

export const ALL_MODULES = [
  { id: "dashboard", label: "Dashboard", Icon: LuLayoutDashboard },
  { id: "tickets", label: "Tickets", Icon: LuTicket },
  { id: "jobcard", label: "Job Cards", Icon: LuWrench },
  { id: "logistics", label: "Logistics", Icon: LuTruck },
  { id: "sla", label: "SLA Monitor", Icon: LuTimer },
  { id: "reports", label: "Reports", Icon: LuChartBar },
  { id: "users", label: "User Management", Icon: LuUsers },
  { id: "settings", label: "Settings", Icon: LuSettings2 },
] satisfies ReadonlyArray<{ id: string; label: string; Icon: IconType }>;

export const DEFAULT_PERMISSIONS: ModulePermission = {
  view: false,
  create: false,
  edit: false,
  delete: false,
};

export const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: "ADMIN",
    name: "ADMIN",
    label: "Administrator",
    color: "#8B4513",
    isSystem: true,
    permissions: {
      dashboard: { view: true, create: true, edit: true, delete: true },
      tickets: { view: true, create: true, edit: true, delete: true },
      jobcard: { view: true, create: true, edit: true, delete: true },
      logistics: { view: true, create: true, edit: true, delete: true },
      sla: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, edit: true, delete: true },
      users: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, create: true, edit: true, delete: true },
    },
  },
  {
    id: "SALES",
    name: "SALES",
    label: "Sales / BD",
    color: "#B8860B",
    isSystem: true,
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false },
      tickets: { view: true, create: true, edit: true, delete: false },
      jobcard: { view: true, create: false, edit: false, delete: false },
      logistics: { view: true, create: true, edit: true, delete: false },
      sla: { view: true, create: false, edit: true, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
      users: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: "ENGINEER",
    name: "ENGINEER",
    label: "Service Engineer",
    color: "#4682B4",
    isSystem: true,
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false },
      tickets: { view: true, create: false, edit: true, delete: false },
      jobcard: { view: true, create: false, edit: true, delete: false },
      logistics: { view: true, create: false, edit: false, delete: false },
      sla: { view: true, create: false, edit: false, delete: false },
      reports: { view: false, create: false, edit: false, delete: false },
      users: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: "CUSTOMER",
    name: "CUSTOMER",
    label: "Customer",
    color: "#2E8B57",
    isSystem: true,
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false },
      tickets: { view: true, create: true, edit: false, delete: false },
      jobcard: { view: false, create: false, edit: false, delete: false },
      logistics: { view: true, create: false, edit: false, delete: false },
      sla: { view: true, create: false, edit: false, delete: false },
      reports: { view: false, create: false, edit: false, delete: false },
      users: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false },
    },
  },
];

export const INITIAL_MOCK_USERS: User[] = [
  { id: "1", name: "Arjun Sharma", email: "admin@sunce.in", role: "ADMIN" },
  { id: "2", name: "Priya Mehta", email: "sales@sunce.in", role: "SALES" },
  {
    id: "3",
    name: "Rahul Verma",
    email: "engineer@sunce.in",
    role: "ENGINEER",
  },
  {
    id: "4",
    name: "Vikram Solar Pvt",
    email: "customer@example.com",
    role: "CUSTOMER",
  },
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: "t1",
    ticketId: "SR-2026-0001",
    customer: "Vikram Solar Pvt",
    inverterMake: "ABB",
    inverterModel: "TRIO-50.0-TL",
    capacity: "50kW",
    serialNumber: "ABB2023001",
    faultDescription: "Inverter shows error F001, not producing output",
    errorCode: "F001",
    priority: "HIGH",
    status: "UNDER_REPAIRED",
    warrantyStatus: true,
    assignedEngineer: "Rahul Verma",
    createdAt: "2026-03-15",
    slaStatus: "AT_RISK",
  },
  {
    id: "t2",
    ticketId: "SR-2026-0002",
    customer: "GreenTech Solutions",
    inverterMake: "SMA",
    inverterModel: "Sunny Tripower 30000TL",
    capacity: "30kW",
    serialNumber: "SMA2024002",
    faultDescription: "Display blank, fans running",
    errorCode: "E205",
    priority: "MEDIUM",
    status: "UNDER_REPAIRED",
    warrantyStatus: false,
    assignedEngineer: "Rahul Verma",
    createdAt: "2026-03-17",
    slaStatus: "MET",
  },
  {
    id: "t3",
    ticketId: "SR-2026-0003",
    customer: "SunPower Ltd",
    inverterMake: "Fronius",
    inverterModel: "Symo 15.0-3-M",
    capacity: "15kW",
    serialNumber: "FRO2025003",
    faultDescription: "Grid fault alarm triggered continuously",
    errorCode: "GF-01",
    priority: "LOW",
    status: "CREATED",
    warrantyStatus: true,
    assignedEngineer: "-",
    createdAt: "2026-03-20",
    slaStatus: "MET",
  },
  {
    id: "t4",
    ticketId: "SR-2026-0004",
    customer: "Rajasthan Renewables",
    inverterMake: "Huawei",
    inverterModel: "SUN2000-100KTL",
    capacity: "100kW",
    serialNumber: "HW2023004",
    faultDescription: "Overheating, thermal shutdown every afternoon",
    errorCode: "OT-500",
    priority: "HIGH",
    status: "UNDER_REPAIRED",
    warrantyStatus: false,
    assignedEngineer: "Rahul Verma",
    createdAt: "2026-03-10",
    slaStatus: "BREACHED",
  },
  {
    id: "t5",
    ticketId: "SR-2026-0005",
    customer: "Vikram Solar Pvt",
    inverterMake: "ABB",
    inverterModel: "PVI-12.5-TL",
    capacity: "12.5kW",
    serialNumber: "ABB2024005",
    faultDescription: "Communication error with monitoring system",
    errorCode: "COM-01",
    priority: "LOW",
    status: "CLOSED",
    warrantyStatus: true,
    assignedEngineer: "Rahul Verma",
    createdAt: "2026-03-01",
    slaStatus: "MET",
  },
];

export const STATUS_ORDER: TicketStatus[] = [
  "CREATED",
  "PICKUP_SCHEDULED",
  "IN_TRANSIT",
  "UNDER_REPAIRED",
  "UNDER_DISPATCH",
  "DISPATCHED",
  "INSTALLATION_DONE",
  "CLOSED",
];

export const STATUS_COLORS: Record<TicketStatus, string> = {
  CREATED: "#6366f1",
  PICKUP_SCHEDULED: "#8b5cf6",
  IN_TRANSIT: "#d97706",
  UNDER_REPAIRED: "#ea580c",
  UNDER_DISPATCH: "#0ea5e9",
  DISPATCHED: "#16a34a",
  INSTALLATION_DONE: "#0f766e",
  CLOSED: "#64748b",
};

export const PRIORITY_COLORS = {
  LOW: "#16a34a",
  MEDIUM: "#d97706",
  HIGH: "#dc2626",
} as const;

export const SLA_COLORS = {
  MET: "#16a34a",
  AT_RISK: "#d97706",
  BREACHED: "#dc2626",
} as const;

export const ENGINEER_OUTCOME_COLORS = {
  REPAIRED: "#0ea5e9",
  SCRAP: "#dc2626",
} as const;

export const PRESET_COLORS = [
  "#8B4513",
  "#B8860B",
  "#4682B4",
  "#2E8B57",
  "#8B008B",
  "#CD5C5C",
  "#4169E1",
  "#2F4F4F",
  "#800020",
  "#556B2F",
] as const;

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN: "Full system access & configuration",
  SALES: "Ticket creation & customer management",
  ENGINEER: "Job cards, diagnosis & repairs",
  CUSTOMER: "Track your service requests",
};
