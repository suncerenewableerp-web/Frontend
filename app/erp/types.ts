export type Role = string;

export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface RoleDefinition {
  id: string;
  name: string;
  label: string;
  color: string;
  permissions: Record<string, ModulePermission>;
  isSystem?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type TicketStatus =
  | "CREATED"
  | "PICKUP_SCHEDULED"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "DIAGNOSIS"
  | "REPAIR"
  | "TESTING"
  | "DISPATCHED"
  | "CLOSED";

export interface Ticket {
  id: string;
  ticketId: string;
  customer: string;
  inverterMake: string;
  inverterModel: string;
  capacity: string;
  serialNumber: string;
  faultDescription: string;
  errorCode: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: TicketStatus;
  warrantyStatus: boolean;
  assignedEngineer: string;
  createdAt: string;
  slaStatus: "MET" | "BREACHED" | "AT_RISK";
}

