export type Role = string;

export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface RoleDefinition {
  id: string;
  dbId?: string;
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

export type YesNo = "YES" | "NO" | "";

export type JobCardComponentUsed = {
  name: string;
  qty: number | "";
};

export interface JobCardServiceJob {
  sn: number;
  jobName: string;
  specification: string;
  componentsUsed?: JobCardComponentUsed[]; // Spare/components used (multi, with qty)
  qty: number | "";
  reason: string;
  date: string; // YYYY-MM-DD
  doneBy: string;
}

export interface JobCardFinalTestingActivity {
  sr: number;
  activity: string;
  result: YesNo;
  remarks: string;
}

export interface JobCard {
  id: string;
  ticketId: string;
  // Engineer workflow (legacy backend fields)
  diagnosis?: string;
  testResults?: string;
  repairNotes?: string;
  repairActionsByName?: string;
  jobNo: string;
  item: string;
  itemAndSiteDetails: string;
  customerName: string;
  inDate: string; // YYYY-MM-DD
  outDate: string; // YYYY-MM-DD
  currentStatus: string;
  engineerFinalStatus?: string;
  engineerFinalizedAt?: string; // YYYY-MM-DD
  remarks: string;
  checkedByName: string;
  checkedByDate: string; // YYYY-MM-DD
  serviceJobs: JobCardServiceJob[];
  finalTestingActivities: JobCardFinalTestingActivity[];
  finalStatus: string;
  finalRemarks: string;
  finalCheckedByName: string;
  finalCheckedByDate: string; // YYYY-MM-DD
}

export type TicketStatus =
  | "CREATED"
  | "PICKUP_SCHEDULED"
  | "IN_TRANSIT"
  | "UNDER_REPAIRED"
  | "UNDER_DISPATCH"
  | "DISPATCHED"
  | "INSTALLATION_DONE"
  | "CLOSED";

export interface Ticket {
  id: string;
  ticketId: string;
  customer: string;
  customerName?: string;
  customerCompany?: string;
  customerPhone?: string;
  customerEmail?: string;
  createdByEmail?: string;
  customerAddress?: string;
  pickupDate?: string; // YYYY-MM-DD
  courierName?: string;
  lrNumber?: string;
  inverterMake: string;
  inverterModel: string;
  capacity: string;
  serialNumber: string;
  faultDescription: string;
  errorCode: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: TicketStatus;
  warrantyStatus: boolean;
  warrantyEndDate?: string; // YYYY-MM-DD (derived from inverter.warrantyEnd)
  assignedEngineer: string;
  createdAt: string;
  slaStatus: "MET" | "BREACHED" | "AT_RISK";
  jobCard?: JobCard;
}
