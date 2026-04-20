"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { STATUS_ORDER } from "../constants";
import {
  apiInverterBrandAdd,
  apiInverterBrandsList,
  apiLogisticsByTicket,
  apiSchedulePickup,
  apiScheduleDispatch,
  apiUnderDispatchSave,
  apiDispatchApprove,
  apiTicketApproveInstallationDone,
  apiTicketInstallationDocumentsGet,
  apiTicketInstallationDocumentUpload,
  apiSlaSettingsGet,
  apiSlaSettingsUpdate,
  apiJobCardEngineerNameAdd,
  apiJobCardEngineerNameDelete,
  apiJobCardEngineerNamesList,
  apiTicketJobCardGet,
  apiTicketJobCardFinalize,
  apiTicketJobCardUpdate,
  apiTicketPickupDetailsGet,
  apiTicketPickupDocumentUpload,
  apiTicketGet,
  apiEngineerNamesList,
  apiTicketOnsiteAssign,
  apiTicketOnsiteJobCardUpdate,
  apiUpdateTicketDetails,
  apiUpdateTicketFaultDescription,
  type BackendLogistics,
} from "../api";
import type {
  JobCard,
  JobCardComponentUsed,
  JobCardFinalTestingActivity,
  JobCardServiceJob,
  RoleDefinition,
  Ticket,
  TicketStatus,
  User,
} from "../types";
import { canAccess } from "../utils";
import { Badge, PriorityBadge, SlaBadge, StatusBadge } from "./Badges";
import DatePicker from "./DatePicker";
import NameCombobox from "./NameCombobox";
import TicketTimeline from "./TicketTimeline";
import WhatsAppShareModal from "./WhatsAppShareModal";
import { FiFile, FiFileText, FiImage } from "react-icons/fi";

const DEFAULT_FINAL_TESTING: Array<Pick<JobCardFinalTestingActivity, "sr" | "activity">> = [
  { sr: 1, activity: "Continuity test of AC side" },
  { sr: 2, activity: "Continuity test of DC side" },
  { sr: 3, activity: "Check all internal cable connections" },
  { sr: 4, activity: "Check all card mounting screws" },
  { sr: 5, activity: "Check all MC4 connectors" },
  { sr: 6, activity: "Check all DC fuse" },
  { sr: 7, activity: "Check all DC MPPT input during power testing" },
  { sr: 8, activity: "Check and match Sr. No. with body and display" },
  { sr: 9, activity: "Check body cover mounting screws" },
  { sr: 10, activity: "Cleaning of all filters" },
  { sr: 11, activity: "Cleaning of inverter body" },
];

const DEFAULT_ENGINEER_DROPDOWN = Object.freeze([
  "Avinash Kumar",
  "Ranjan Kumar",
  "Sourav kumar",
]);

function docLinkLabel(u: string): string {
  const raw = String(u || "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    const publicId = parsed.searchParams.get("public_id");
    const format = parsed.searchParams.get("format");
    if (publicId) {
      const decoded = decodeURIComponent(publicId);
      const base = decoded.split("/").pop() || decoded;
      return format ? `${base}.${format}` : base;
    }
    const parts = parsed.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || raw;
  } catch {
    return raw.split("/").slice(-1)[0].split("?")[0];
  }
}

function docKind(u: string): { kind: "image" | "pdf" | "other"; format: string } {
  const raw = String(u || "").trim();
  if (!raw) return { kind: "other", format: "" };
  try {
    const parsed = new URL(raw);
    const format = String(parsed.searchParams.get("format") || "").toLowerCase();
    if (format) {
      if (format === "pdf") return { kind: "pdf", format };
      if (["png", "jpg", "jpeg", "webp", "gif", "bmp", "tif", "tiff", "avif", "svg"].includes(format)) {
        return { kind: "image", format };
      }
      return { kind: "other", format };
    }
    const base = (parsed.pathname.split("/").filter(Boolean).pop() || "").toLowerCase();
    const ext = base.includes(".") ? base.split(".").pop() || "" : "";
    if (ext === "pdf") return { kind: "pdf", format: ext };
    if (["png", "jpg", "jpeg", "webp", "gif", "bmp", "tif", "tiff", "avif", "svg"].includes(ext)) {
      return { kind: "image", format: ext };
    }
    return { kind: "other", format: ext };
  } catch {
    const clean = raw.split("?")[0] || "";
    const ext = clean.includes(".") ? (clean.split(".").pop() || "").toLowerCase() : "";
    if (ext === "pdf") return { kind: "pdf", format: ext };
    if (["png", "jpg", "jpeg", "webp", "gif", "bmp", "tif", "tiff", "avif", "svg"].includes(ext)) {
      return { kind: "image", format: ext };
    }
    return { kind: "other", format: ext };
  }
}

function emptyServiceJob(sn: number): JobCardServiceJob {
  return {
    sn,
    jobName: "",
    specification: "",
    componentsUsed: [{ name: "", qty: "" }],
    qty: "",
    reason: "",
    date: "",
    doneBy: "",
  };
}

function toComponentUsed(v: unknown): JobCardComponentUsed {
  type ComponentUsedLike = {
    name?: unknown;
    component?: unknown;
    partName?: unknown;
    value?: unknown;
    qty?: unknown;
    quantity?: unknown;
  };
  if (!v) return { name: "", qty: "" };
  if (typeof v === "string") return { name: String(v || "").trim(), qty: "" };
  if (typeof v === "object") {
    const o = v as ComponentUsedLike;
    const name = String(o?.name ?? o?.component ?? o?.partName ?? o?.value ?? "").trim();
    const rawQty = o?.qty ?? o?.quantity ?? "";
    const qtyNum = rawQty === "" || rawQty == null ? NaN : Number(rawQty);
    return { name, qty: Number.isFinite(qtyNum) ? qtyNum : "" };
  }
  return { name: String(v || "").trim(), qty: "" };
}

function normalizeServiceJobs(jobs: JobCardServiceJob[], minRows = 5): JobCardServiceJob[] {
  const next: JobCardServiceJob[] = (jobs || []).map((j, idx) => {
    const base = { ...emptyServiceJob(idx + 1), ...j, sn: idx + 1 };
    // Backward compatibility: older job cards stored components in `specification` string only.
    // For engineer workflow we prefer `componentsUsed[]` so we can show multiple inputs.
    const componentsUsedRaw: unknown[] =
      Array.isArray(base.componentsUsed) && base.componentsUsed.length
        ? (base.componentsUsed as unknown[])
        : base.specification
          ? base.specification
              .split(/[\n,]+/g)
              .map((x) => x.trim())
              .filter(Boolean)
          : [];
    const componentsUsed = componentsUsedRaw.map(toComponentUsed);
    if (!componentsUsed.length) componentsUsed.push({ name: "", qty: "" });
    const keptNames = componentsUsed.map((c) => String(c?.name || "").trim()).filter(Boolean);
    return {
      ...base,
      componentsUsed,
      // Keep legacy string in a normalized form so other views/exports remain consistent.
      specification: keptNames.length ? keptNames.join(", ") : base.specification,
    };
  });
  while (next.length < minRows) next.push(emptyServiceJob(next.length + 1));
  return next;
}

function normalizeFinalTesting(
  rows: JobCardFinalTestingActivity[] | undefined,
): JobCardFinalTestingActivity[] {
  const bySr = new Map<number, JobCardFinalTestingActivity>();
  (rows || []).forEach((r, idx) => {
    const sr = typeof r?.sr === "number" ? r.sr : idx + 1;
    bySr.set(sr, {
      sr,
      activity: r?.activity || "",
      result: r?.result || "",
      remarks: r?.remarks || "",
    });
  });

  return DEFAULT_FINAL_TESTING.map((d) => {
    const existing = bySr.get(d.sr);
    return {
      sr: d.sr,
      activity: existing?.activity || d.activity,
      result: existing?.result || "",
      remarks: existing?.remarks || "",
    };
  });
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toDateInputValueSafe(v: unknown): string {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(String(v));
  const t = d.getTime();
  if (Number.isNaN(t)) return "";
  return d.toISOString().slice(0, 10);
}

function formatHours(v: number) {
  return `${v}h`;
}

function parseHours(input: string): number | null {
  const raw = String(input || "").trim().toLowerCase();
  const m = raw.match(/^(\d+)\s*h?$/);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

const ALL_TABS = ["overview", "jobcard", "logistics", "sla"] as const;
type TicketTab = (typeof ALL_TABS)[number];

export default function TicketDetail({
  ticket,
  user,
  roles,
  onBack,
  onUpdateStatus,
  onTicketUpdated,
  initialTab = "overview",
  initialLogisticsStage,
}: {
  ticket: Ticket;
  user: User;
  roles: RoleDefinition[];
  onBack: () => void;
  onUpdateStatus: (status: TicketStatus) => Promise<void>;
  onTicketUpdated: (t: Ticket) => void;
  initialTab?: TicketTab;
  initialLogisticsStage?: "pickup" | "under_dispatch" | "dispatch";
}) {
  const roleName = String(user.role || "").toUpperCase();
  const isOnsite = String(ticket.serviceType || "").toUpperCase() === "ONSITE";
  const canShowWarranty = roleName !== "CUSTOMER";
  const canShowHeaderBadges = roleName !== "CUSTOMER";
  const canUploadPickupDocs = roleName === "ADMIN" || roleName === "SALES";
  const canSeeCustomerContact = roleName === "ADMIN" || roleName === "SALES";
  const canOfferWhatsAppShare = roleName === "ADMIN" || roleName === "SALES";
  const tabs = useMemo(() => {
    if (roleName === "CUSTOMER") return ["overview"] as TicketTab[];
    if (isOnsite) return ["overview"] as TicketTab[];
    if (roleName === "ENGINEER") return ["jobcard", "overview"] as TicketTab[];
    return [...ALL_TABS] as TicketTab[];
  }, [roleName, isOnsite]);
  const [activeTab, setActiveTab] = useState<TicketTab>(() => {
    const desired = (initialTab || "overview") as TicketTab;
    return tabs.includes(desired) ? desired : tabs[0];
  });
  const [newStatus, setNewStatus] = useState(ticket.status);
  const [updating, setUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");
  const currentIdx = STATUS_ORDER.indexOf(ticket.status);
  const canSeeStatusUpdate = useMemo(() => {
    if (roleName !== "ADMIN" && roleName !== "SALES") return false;
    return canAccess(roles, user.role, "tickets", "edit");
  }, [roles, user.role, roleName]);
  const statusUpdatesLocked = ticket.status === "CLOSED";
  const canEditLogistics = useMemo(() => {
    if (roleName !== "ADMIN" && roleName !== "SALES") return false;
    return (
      ticket.status !== "CLOSED" &&
      (canAccess(roles, user.role, "logistics", "edit") ||
        canAccess(roles, user.role, "logistics", "create"))
    );
  }, [roles, user.role, ticket.status, roleName]);

  const canEditSla = useMemo(() => {
    if (roleName !== "ADMIN" && roleName !== "SALES") return false;
    return canAccess(roles, user.role, "sla", "edit");
  }, [roles, user.role, roleName]);
  const canEditJobCard = useMemo(() => {
    if (roleName !== "ENGINEER") return false;
    const can = canAccess(roles, user.role, "jobcard", "edit");
    if (!can) return false;
    if (ticket.status !== "UNDER_REPAIRED") return false;
    return true;
  }, [roles, user.role, roleName, ticket.status]);

  const canManageOnsiteBooking = isOnsite && (roleName === "ADMIN" || roleName === "SALES");
  const canWorkOnsiteBooking = isOnsite && roleName === "ENGINEER";

  const [onsiteAssigning, setOnsiteAssigning] = useState(false);
  const [onsiteAssignError, setOnsiteAssignError] = useState("");
  const [onsiteAssignMsg, setOnsiteAssignMsg] = useState("");

  const [onsiteEngineerName, setOnsiteEngineerName] = useState(() => ticket.onsiteEngineerName || "");
  const [onsiteVisitDate, setOnsiteVisitDate] = useState(() => ticket.onsiteVisitDate || "");
  const [onsiteRemark, setOnsiteRemark] = useState(() => ticket.onsiteRemark || "");
  const [onsiteClosing, setOnsiteClosing] = useState(false);
  const [onsiteError, setOnsiteError] = useState("");
  const [onsiteSavedMsg, setOnsiteSavedMsg] = useState("");

  const canManageBrandList =
    roleName === "ADMIN" || roleName === "SALES";
  const [knownBrands, setKnownBrands] = useState<string[]>([]);
  const [brandAddMsg, setBrandAddMsg] = useState("");
  const [brandAddError, setBrandAddError] = useState("");
  const [brandAdding, setBrandAdding] = useState(false);
  const canEditTicketDetails = useMemo(() => {
    if (roleName !== "ADMIN" && roleName !== "SALES") return false;
    return canAccess(roles, user.role, "tickets", "edit") && ticket.status !== "CLOSED";
  }, [roles, user.role, ticket.status, roleName]);
  const canEditFaultDescription = useMemo(() => {
    if (roleName !== "SALES" || canEditTicketDetails) return false;
    return canAccess(roles, user.role, "tickets", "edit") && ticket.status !== "CLOSED";
  }, [roles, user.role, ticket.status, roleName, canEditTicketDetails]);

  const [details, setDetails] = useState({
    customerName: ticket.customerName || "",
    customerCompany: ticket.customerCompany || "",
    customerPhone: ticket.customerPhone || "",
    customerAddress: ticket.customerAddress || "",
    inverterMake: ticket.inverterMake === "—" ? "" : ticket.inverterMake,
    inverterModel: ticket.inverterModel === "—" ? "" : ticket.inverterModel,
    capacity: ticket.capacity === "—" ? "" : ticket.capacity,
    serialNumber: ticket.serialNumber === "—" ? "" : ticket.serialNumber,
    faultDescription: ticket.faultDescription === "—" ? "" : ticket.faultDescription,
    errorCode: ticket.errorCode || "",
    priority: ticket.priority,
    warrantyStatus: Boolean(ticket.warrantyStatus),
    warrantyEndDate: ticket.warrantyEndDate || "",
  });

  const [engineerDropdown, setEngineerDropdown] = useState<string[]>(() => [...DEFAULT_ENGINEER_DROPDOWN]);
  const [customEngineerNames, setCustomEngineerNames] = useState<string[]>([]);
  const [engineerNameAdding, setEngineerNameAdding] = useState(false);
  const [engineerNameDeletingKey, setEngineerNameDeletingKey] = useState("");
  const [engineerNameInput, setEngineerNameInput] = useState("");
  const [engineerNameAddMsg, setEngineerNameAddMsg] = useState("");
  const [engineerNameAddError, setEngineerNameAddError] = useState("");
  const [engineerNameDeleteMsg, setEngineerNameDeleteMsg] = useState("");
  const [engineerNameDeleteError, setEngineerNameDeleteError] = useState("");

  useEffect(() => {
    const shouldLoad =
      (activeTab === "jobcard" && ["ENGINEER", "ADMIN", "SALES"].includes(roleName)) ||
      (isOnsite && roleName === "ENGINEER");
    if (!shouldLoad) return;
    let cancelled = false;
    Promise.allSettled([apiEngineerNamesList(), apiJobCardEngineerNamesList()])
      .then((results) => {
        if (cancelled) return;
        const userNames =
          results[0].status === "fulfilled"
            ? (results[0].value || []).map((r) => String(r?.name || "").trim()).filter(Boolean)
            : [];
        const customNames =
          results[1].status === "fulfilled"
            ? (results[1].value || []).map((n) => String(n || "").trim()).filter(Boolean)
            : [];

        const merged = [...DEFAULT_ENGINEER_DROPDOWN, ...customNames, ...userNames];
        const uniq = Array.from(new Set(merged.map((x) => x.trim()).filter(Boolean)));
        uniq.sort((a, b) => a.localeCompare(b));
        setEngineerDropdown(uniq);

        const customUniq = Array.from(new Set(customNames.map((x) => x.trim()).filter(Boolean)));
        customUniq.sort((a, b) => a.localeCompare(b));
        setCustomEngineerNames(customUniq);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [activeTab, roleName, isOnsite]);

  const [waOpen, setWaOpen] = useState(false);
  const [waTitle, setWaTitle] = useState("Share on WhatsApp");
  const [waPhone, setWaPhone] = useState(ticket.customerPhone || "");
  const [waMessage, setWaMessage] = useState("");

  const statusLabel = (s: TicketStatus) => {
    const map: Record<TicketStatus, string> = {
      CREATED: "Created",
      PICKUP_SCHEDULED: "Pickup Scheduled",
      IN_TRANSIT: "In Transit",
      UNDER_REPAIRED: "Under Repaired",
      UNDER_DISPATCH: "Under Dispatch",
      DISPATCHED: "Dispatched",
      INSTALLATION_DONE: "Installation Done",
      CLOSED: "Closed",
    };
    return map[s] || String(s).replace(/_/g, " ");
  };

  const buildWhatsAppMessage = (nextStatus: TicketStatus, t: Ticket = ticket) => {
    const nameRaw = String(details.customerName || t.customerName || "").trim();
    const firstName = nameRaw ? nameRaw.split(/\s+/)[0] : "";
    const ticketId = String(t.ticketId || "").trim();
    const inverter = `${t.inverterMake} ${t.inverterModel} (${t.capacity})`;

    const lines: string[] = [];
    lines.push(`Hello${firstName ? ` ${firstName}` : ""},`);
    lines.push("");
    if (ticketId) lines.push(`Your service ticket ${ticketId} status has been updated.`);
    else lines.push("Your service ticket status has been updated.");
    lines.push(`Status: ${statusLabel(nextStatus)}`);

    if (nextStatus === "PICKUP_SCHEDULED") {
      const pickupDate = String(t.pickupDate || "").trim();
      const addr = String(details.customerAddress || t.customerAddress || "").trim();
      if (pickupDate) lines.push(`Pickup date: ${pickupDate}`);
      if (addr) lines.push(`Pickup location: ${addr}`);
    }

    if (nextStatus === "IN_TRANSIT" || nextStatus === "DISPATCHED") {
      const courier = String(t.courierName || "").trim();
      const lr = String(t.lrNumber || "").trim();
      if (courier || lr) lines.push(`Courier: ${[courier, lr ? `LR ${lr}` : ""].filter(Boolean).join(" · ")}`);
    }

    if (nextStatus === "UNDER_REPAIRED") {
      const eng = String(t.assignedEngineer || "").trim();
      if (eng && eng !== "-") lines.push(`Assigned engineer: ${eng}`);
    }

    lines.push("");
    lines.push(`Inverter: ${inverter}`);

    const serial = String(t.serialNumber || "").trim();
    if (serial && serial !== "—") lines.push(`Serial: ${serial}`);

    const err = String(t.errorCode || "").trim();
    if (err) lines.push(`Error code: ${err}`);

    lines.push("");
    lines.push("Thanks,");
    lines.push("Sunce Service Team");
    return lines.join("\n");
  };

  const offerWhatsAppShare = (nextStatus: TicketStatus, t: Ticket = ticket) => {
    if (!canOfferWhatsAppShare) return;
    const phone = String(details.customerPhone || t.customerPhone || "").trim();
    setWaPhone(phone);
    setWaMessage(buildWhatsAppMessage(nextStatus, t));
    setWaTitle(`WhatsApp · ${t.ticketId || "Ticket"} · ${statusLabel(nextStatus)}`);
    setWaOpen(true);
  };

  const updateStatusAndShare = async (nextStatus: TicketStatus) => {
    await onUpdateStatus(nextStatus);
    offerWhatsAppShare(nextStatus);
  };

  const redirectToInstallationOverview = () => {
    setActiveTab("overview");
    setInstallationRedirectMsg(
      "Upload the Installation Done PDF here, then click Installation Done. After that you can move to Closed.",
    );
    setTimeout(() => {
      if (installationSectionRef.current) {
        installationSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 0);
  };

  useEffect(() => {
    if (!canManageBrandList) return;
    let cancelled = false;
    apiInverterBrandsList()
      .then((rows) => {
        if (cancelled) return;
        setKnownBrands(rows || []);
      })
      .catch(() => {
        if (cancelled) return;
        setKnownBrands([]);
      });
    return () => {
      cancelled = true;
    };
  }, [canManageBrandList, ticket.id]);

  const knownBrandKeys = useMemo(() => {
    const set = new Set<string>();
    (knownBrands || []).forEach((b) => {
      const k = String(b || "").trim().toLowerCase();
      if (k) set.add(k);
    });
    return set;
  }, [knownBrands]);

  const canAddBrandToDropdown =
    canManageBrandList &&
    Boolean(details.inverterMake.trim()) &&
    !knownBrandKeys.has(details.inverterMake.trim().toLowerCase());
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [detailsSavedMsg, setDetailsSavedMsg] = useState("");

  const [faultDesc, setFaultDesc] = useState(ticket.faultDescription === "—" ? "" : ticket.faultDescription);
  const [faultSaving, setFaultSaving] = useState(false);
  const [faultError, setFaultError] = useState("");
  const [faultSavedMsg, setFaultSavedMsg] = useState("");

  // Keep pickup date blank unless it is explicitly scheduled (sales/admin can still pick a date).
  const [pickupDate, setPickupDate] = useState(() => ticket.pickupDate || "");
  const [courierName, setCourierName] = useState(ticket.courierName || "BlueDart");
  const [lrNumber, setLrNumber] = useState(ticket.lrNumber || "");
  const [pickupLocation, setPickupLocation] = useState(ticket.customerAddress || "");
  const [dispatchDate, setDispatchDate] = useState(() =>
    toDateInputValue(new Date()),
  );
  const [dispatchCourierName, setDispatchCourierName] = useState("BlueDart");
  const [dispatchLrNumber, setDispatchLrNumber] = useState("");
  const [dispatchLocation, setDispatchLocation] = useState("");
  const [dispatchInvoiceGenerated, setDispatchInvoiceGenerated] = useState(false);
  const [dispatchPaymentDone, setDispatchPaymentDone] = useState(false);

  const [logisticsStage, setLogisticsStage] = useState<"pickup" | "under_dispatch" | "dispatch">(() => {
    if (initialLogisticsStage) return initialLogisticsStage;
    return ticket.status === "UNDER_DISPATCH" ||
      ticket.status === "DISPATCHED" ||
      ticket.status === "INSTALLATION_DONE" ||
      ticket.status === "CLOSED"
      ? "dispatch"
      : "pickup";
  });

  const [, setPickupLogistics] = useState<BackendLogistics | null>(null);
  const [dispatchLogistics, setDispatchLogistics] = useState<BackendLogistics | null>(null);
  const dispatchApprovedForSales =
    roleName === "SALES" ? Boolean(dispatchLogistics?.billing?.dispatchApproved) : true;
  const canSeeDispatchStage =
    roleName === "ADMIN" || (roleName === "SALES" && dispatchApprovedForSales);
  const [logisticsLoading, setLogisticsLoading] = useState(false);
  const [logisticsSaving, setLogisticsSaving] = useState(false);
  const [logisticsAdvancing, setLogisticsAdvancing] = useState(false);
  const [underDispatchSaving, setUnderDispatchSaving] = useState(false);
  const [dispatchApprovalSaving, setDispatchApprovalSaving] = useState(false);
  const [dispatchApprovalError, setDispatchApprovalError] = useState("");
  const [logisticsError, setLogisticsError] = useState("");
  const [logisticsSavedMsg, setLogisticsSavedMsg] = useState("");

  const [pickupBaseline, setPickupBaseline] = useState<null | {
    pickupDate: string;
    courierName: string;
    lrNumber: string;
    pickupLocation: string;
  }>(null);
  const [pickupAdvanceState, setPickupAdvanceState] = useState<{ ticketId: string; unlocked: boolean }>(() => ({
    ticketId: ticket.id,
    unlocked: false,
  }));
  const pickupAdvanceUnlocked =
    pickupAdvanceState.ticketId === ticket.id ? pickupAdvanceState.unlocked : false;
  const setPickupAdvanceUnlocked = (unlocked: boolean) =>
    setPickupAdvanceState({ ticketId: ticket.id, unlocked });

  const [dispatchBaseline, setDispatchBaseline] = useState<null | {
    dispatchDate: string;
    dispatchCourierName: string;
    dispatchLrNumber: string;
    dispatchLocation: string;
  }>(null);
  const [dispatchBillingBaseline, setDispatchBillingBaseline] = useState<null | {
    invoiceGenerated: boolean;
    paymentDone: boolean;
  }>(null);
  const dispatchBillingDirty = useMemo(() => {
    if (!dispatchBillingBaseline) return true;
    return (
      dispatchBillingBaseline.invoiceGenerated !== dispatchInvoiceGenerated ||
      dispatchBillingBaseline.paymentDone !== dispatchPaymentDone
    );
  }, [dispatchBillingBaseline, dispatchInvoiceGenerated, dispatchPaymentDone]);
  const [dispatchAdvanceState, setDispatchAdvanceState] = useState<{ ticketId: string; unlocked: boolean }>(() => ({
    ticketId: ticket.id,
    unlocked: false,
  }));
  const dispatchAdvanceUnlocked =
    dispatchAdvanceState.ticketId === ticket.id ? dispatchAdvanceState.unlocked : false;
  const setDispatchAdvanceUnlocked = (unlocked: boolean) =>
    setDispatchAdvanceState({ ticketId: ticket.id, unlocked });

  const [customerPickupLoading, setCustomerPickupLoading] = useState(false);
  const [customerPickupError, setCustomerPickupError] = useState("");
  const [customerPickupSavedMsg, setCustomerPickupSavedMsg] = useState("");
  const installationSectionRef = useRef<HTMLDivElement | null>(null);
  const [installationRedirectMsg, setInstallationRedirectMsg] = useState("");
  const [installationApproving, setInstallationApproving] = useState(false);
  const [installationError, setInstallationError] = useState("");
  const [installationSavedMsg, setInstallationSavedMsg] = useState("");
  const [installationDocuments, setInstallationDocuments] = useState<string[]>([]);
  const [installationDocFile, setInstallationDocFile] = useState<File | null>(null);
  const [installationDocUploading, setInstallationDocUploading] = useState(false);
  const [installationDocError, setInstallationDocError] = useState("");
  const [installationDocSavedMsg, setInstallationDocSavedMsg] = useState("");
  const [pickupDocuments, setPickupDocuments] = useState<string[]>([]);
  const [pickupDocFile, setPickupDocFile] = useState<File | null>(null);
  const [pickupDocUploading, setPickupDocUploading] = useState(false);
  const [pickupDocError, setPickupDocError] = useState("");
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);
  const [docPreviewKind, setDocPreviewKind] = useState<"image" | "pdf" | "other">("other");

  const [showSlaSettings, setShowSlaSettings] = useState(false);
  const [slaLoading, setSlaLoading] = useState(false);
  const [slaSaving, setSlaSaving] = useState(false);
  const [slaError, setSlaError] = useState("");
  const [critical, setCritical] = useState("24h");
  const [high, setHigh] = useState("48h");
  const [normal, setNormal] = useState("72h");

  const [jobCard, setJobCard] = useState<JobCard | null>(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobSaving, setJobSaving] = useState(false);
  const [jobError, setJobError] = useState("");
  const [jobSavedMsg, setJobSavedMsg] = useState("");

  useEffect(() => {
    if (activeTab !== "jobcard") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setJobLoading(true);
      setJobError("");
      setJobSavedMsg("");
    });
    apiTicketJobCardGet(ticket.id)
      .then((jc) => {
        if (cancelled) return;
        const minRows = roleName === "ENGINEER" ? 1 : 5;
        setJobCard({
          ...jc,
          serviceJobs: normalizeServiceJobs(jc.serviceJobs || [], minRows),
          finalTestingActivities: normalizeFinalTesting(jc.finalTestingActivities),
        });
      })
      .catch((e) => setJobError(e instanceof Error ? e.message : "Failed to load job card"))
      .finally(() => {
        if (cancelled) return;
        setJobLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, ticket.id, roleName]);

  useEffect(() => {
    if (roleName !== "ENGINEER") return;
    if (!jobCard) return;
    const checkedByName = String(jobCard.checkedByName || "").trim();
    const checkedByDate = String(jobCard.checkedByDate || "").trim();
    const currentStatus = String(jobCard.currentStatus || "").trim();
    if (checkedByName && checkedByDate && currentStatus) return;

    // Defer setState to avoid cascading-renders lint rule.
    queueMicrotask(() => {
      setJobCard((p) => {
        if (!p) return p;
        const name = String(p.checkedByName || "").trim();
        const date = String(p.checkedByDate || "").trim();
        const status = String(p.currentStatus || "").trim();
        return {
          ...p,
          checkedByName: name || user.name,
          checkedByDate: date || toDateInputValue(new Date()),
          currentStatus: status || "REPAIRABLE",
        };
      });
    });
  }, [
    roleName,
    user.name,
    jobCard,
  ]);

  useEffect(() => {
    if (activeTab !== "logistics") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLogisticsLoading(true);
      setLogisticsError("");
      setLogisticsSavedMsg("");
    });
    apiLogisticsByTicket(ticket.id)
      .then((rows) => {
        if (cancelled) return;
        const pickup =
          rows.find((r) => String(r?.type || "").toUpperCase() === "PICKUP") || null;
        const dispatch =
          rows.find((r) => String(r?.type || "").toUpperCase() === "DELIVERY") ||
          null;

        setPickupLogistics(pickup);
        setDispatchLogistics(dispatch);

        const pickupDateFromApi = toDateInputValueSafe(pickup?.pickupDetails?.scheduledDate);
        const nextPickupDate =
          pickupDateFromApi ||
          (canEditLogistics ? toDateInputValue(new Date(Date.now() + 86400000)) : "");
        const nextCourier = String(pickup?.courierDetails?.courierName || "BlueDart");
        const nextLr = String(pickup?.courierDetails?.lrNumber || "");
        const nextPickupLocation = String(
          pickup?.pickupDetails?.pickupLocation || ticket.customerAddress || "",
        );

        setPickupDate(nextPickupDate);
        setCourierName(nextCourier);
        setLrNumber(nextLr);
        setPickupLocation(nextPickupLocation);
        setPickupDocuments(
          Array.isArray(pickup?.documents)
            ? pickup.documents.map((x) => String(x || "")).filter(Boolean)
            : [],
        );
        setPickupBaseline(
          pickup
            ? {
                pickupDate: nextPickupDate,
                courierName: nextCourier,
                lrNumber: nextLr,
                pickupLocation: nextPickupLocation,
              }
            : null,
        );

        const dispatchDateFromApi = toDateInputValueSafe(dispatch?.pickupDetails?.scheduledDate);
        const nextDispatchDate = dispatchDateFromApi || toDateInputValue(new Date());
        const nextDispatchCourier = String(dispatch?.courierDetails?.courierName || "BlueDart");
        const nextDispatchLr = String(dispatch?.courierDetails?.lrNumber || "");
        const nextDispatchLoc = String(dispatch?.pickupDetails?.pickupLocation || "");
        const nextInvoice = Boolean(dispatch?.billing?.invoiceGenerated);
        const nextPayment = Boolean(dispatch?.billing?.paymentDone);

        setDispatchDate(nextDispatchDate);
        setDispatchCourierName(nextDispatchCourier);
        setDispatchLrNumber(nextDispatchLr);
        setDispatchLocation(nextDispatchLoc);
        setDispatchInvoiceGenerated(nextInvoice);
        setDispatchPaymentDone(nextPayment);
        setDispatchBaseline(
          dispatch
            ? {
                dispatchDate: nextDispatchDate,
                dispatchCourierName: nextDispatchCourier,
                dispatchLrNumber: nextDispatchLr,
                dispatchLocation: nextDispatchLoc,
              }
            : null,
        );
        setDispatchBillingBaseline(
          dispatch
            ? {
                invoiceGenerated: nextInvoice,
                paymentDone: nextPayment,
              }
            : null,
        );
        setDispatchAdvanceState({ ticketId: ticket.id, unlocked: false });
      })
      .catch((e) => {
        if (cancelled) return;
        setLogisticsError(e instanceof Error ? e.message : "Failed to load logistics");
      })
      .finally(() => {
        if (cancelled) return;
        setLogisticsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, ticket.id, ticket.customerAddress, canEditLogistics]);

  useEffect(() => {
    if (roleName !== "SALES") return;
    if (!canEditLogistics) return;
    if (dispatchApprovedForSales) return;
    if (logisticsStage !== "dispatch") return;
    // Defer setState to avoid cascading-renders lint rule.
    queueMicrotask(() => setLogisticsStage("under_dispatch"));
  }, [roleName, canEditLogistics, dispatchApprovedForSales, logisticsStage]);

  useEffect(() => {
    if (activeTab !== "logistics") return;
    if (roleName !== "SALES") return;
    if (!canEditLogistics) return;
    if (dispatchApprovedForSales) return;

    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      apiLogisticsByTicket(ticket.id)
        .then((rows) => {
          if (cancelled) return;
          const dispatch =
            rows.find((r) => String(r?.type || "").toUpperCase() === "DELIVERY") || null;
          setDispatchLogistics(dispatch);
          if (Boolean(dispatch?.billing?.dispatchApproved)) {
            setLogisticsError("");
            setLogisticsSavedMsg("Admin approved dispatch.");
            setLogisticsStage("dispatch");
          }
        })
        .catch(() => {
          // Ignore polling errors; the primary fetch shows errors.
        });
    };

    tick();
    const interval = setInterval(tick, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeTab, roleName, canEditLogistics, dispatchApprovedForSales, ticket.id]);

  useEffect(() => {
    queueMicrotask(() => setNewStatus(ticket.status));
  }, [ticket.status]);

  useEffect(() => {
    queueMicrotask(() => {
      const desired = (initialTab || "overview") as TicketTab;
      setActiveTab(tabs.includes(desired) ? desired : tabs[0]);
    });
    queueMicrotask(() => setLogisticsStage(initialLogisticsStage || "pickup"));
  }, [ticket.id, initialTab, initialLogisticsStage, tabs]);

  useEffect(() => {
    if (roleName !== "CUSTOMER") return;
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let first = true;

    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        timeout = setTimeout(tick, 15000);
        return;
      }

      const showSpinner = first;
      first = false;

      if (showSpinner) {
        setCustomerPickupLoading(true);
        setCustomerPickupError("");
        setCustomerPickupSavedMsg("");
      }

      apiTicketPickupDetailsGet(ticket.id)
        .then((data) => {
          if (cancelled) return;
          setPickupDate(data.pickupDate || "");
          setPickupLocation(String(data.pickupLocation || ticket.customerAddress || ""));
          setPickupDocuments(data.documents || []);
          setCustomerPickupError("");

          const isScheduled = Boolean(String(data.pickupDate || "").trim());
          const hasDocs = Array.isArray(data.documents) && data.documents.length > 0;
          timeout = setTimeout(tick, isScheduled || hasDocs ? 30000 : 5000);
        })
        .catch((e) => {
          if (cancelled) return;
          setCustomerPickupError(e instanceof Error ? e.message : "Failed to load pickup details");
          timeout = setTimeout(tick, 15000);
        })
        .finally(() => {
          if (cancelled) return;
          if (showSpinner) setCustomerPickupLoading(false);
        });
    };

    timeout = setTimeout(tick, 0);
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [roleName, ticket.id, ticket.customerAddress]);

  useEffect(() => {
    const dispatchedIdx = STATUS_ORDER.indexOf("DISPATCHED");
    const idx = STATUS_ORDER.indexOf(ticket.status);
    if (idx < dispatchedIdx) {
      // Defer setState to avoid cascading-renders lint rule.
      queueMicrotask(() => {
        setInstallationDocuments([]);
        setInstallationDocFile(null);
        setInstallationDocUploading(false);
        setInstallationDocError("");
        setInstallationDocSavedMsg("");
      });
      return;
    }

    let cancelled = false;
    // Defer setState to avoid cascading-renders lint rule.
    queueMicrotask(() => setInstallationDocError(""));
    apiTicketInstallationDocumentsGet(ticket.id)
      .then((data) => {
        if (cancelled) return;
        setInstallationDocuments(Array.isArray(data.documents) ? data.documents : []);
      })
      .catch((e) => {
        if (cancelled) return;
        setInstallationDocError(e instanceof Error ? e.message : "Failed to load installation documents");
      });

    return () => {
      cancelled = true;
    };
  }, [ticket.id, ticket.status]);

  useEffect(() => {
    if (!docPreviewUrl) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDocPreviewUrl(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [docPreviewUrl]);

  const pickupDirty = useMemo(() => {
    if (!pickupBaseline) return true;
    return (
      pickupBaseline.pickupDate !== pickupDate ||
      pickupBaseline.courierName !== courierName ||
      pickupBaseline.lrNumber !== lrNumber ||
      pickupBaseline.pickupLocation !== pickupLocation
    );
  }, [pickupBaseline, pickupDate, courierName, lrNumber, pickupLocation]);

  const dispatchDirty = useMemo(() => {
    if (!dispatchBaseline) return true;
    return (
      dispatchBaseline.dispatchDate !== dispatchDate ||
      dispatchBaseline.dispatchCourierName !== dispatchCourierName ||
      dispatchBaseline.dispatchLrNumber !== dispatchLrNumber ||
      dispatchBaseline.dispatchLocation !== dispatchLocation
    );
  }, [
    dispatchBaseline,
    dispatchDate,
    dispatchCourierName,
    dispatchLrNumber,
    dispatchLocation,
  ]);

  const canAdvanceToInTransit =
    canEditLogistics &&
    ticket.status === "PICKUP_SCHEDULED" &&
    Boolean(pickupBaseline) &&
    pickupAdvanceUnlocked &&
    !pickupDirty;

  const canAdvanceToInstallationDone =
    canEditLogistics &&
    ticket.status === "DISPATCHED" &&
    Boolean(dispatchBaseline) &&
    dispatchAdvanceUnlocked &&
    !dispatchDirty;

  const canAdvanceToClosed =
    canEditLogistics &&
    ticket.status === "INSTALLATION_DONE" &&
    Boolean(dispatchBaseline) &&
    dispatchAdvanceUnlocked &&
    !dispatchDirty;

  useEffect(() => {
    if (!showSlaSettings || !canEditSla) return;
    let mounted = true;
    queueMicrotask(() => {
      if (!mounted) return;
      setSlaLoading(true);
      setSlaError("");
    });
    apiSlaSettingsGet()
      .then((s) => {
        if (!mounted) return;
        setCritical(formatHours(s.criticalHours));
        setHigh(formatHours(s.highHours));
        setNormal(formatHours(s.normalHours));
      })
      .catch((e) => {
        if (!mounted) return;
        setSlaError(e instanceof Error ? e.message : "Failed to load SLA settings");
      })
      .finally(() => {
        if (!mounted) return;
        setSlaLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [showSlaSettings, canEditSla]);

  const parsedSla = useMemo(() => {
    const criticalHours = parseHours(critical);
    const highHours = parseHours(high);
    const normalHours = parseHours(normal);
    const ok = criticalHours !== null && highHours !== null && normalHours !== null;
    return { ok, criticalHours, highHours, normalHours };
  }, [critical, high, normal]);

  const saveJobCard = () => {
    if (!jobCard) return;
    setJobSaving(true);
    setJobError("");
    setJobSavedMsg("");

    const cleanedService = jobCard.serviceJobs
      .map((r, idx) => ({
        ...r,
        sn: idx + 1,
        jobName: r.jobName.trim(),
        specification: r.specification.trim(),
        componentsUsed: (() => {
          if (!Array.isArray(r.componentsUsed)) return undefined;
          const cleaned = (r.componentsUsed as unknown[])
            .map(toComponentUsed)
            .map((c) => {
              const name = String(c?.name || "").trim();
              const qtyNum = c?.qty === "" || c?.qty == null ? NaN : Number(c.qty);
              return { name, qty: Number.isFinite(qtyNum) ? qtyNum : null };
            })
            .filter((c) => c.name);
          return cleaned.length ? cleaned : undefined;
        })(),
        reason: r.reason.trim(),
        doneBy: r.doneBy.trim(),
      }))
      .filter((r) => {
        const hasText = r.jobName || r.specification || r.reason || r.doneBy || r.date;
        const hasQty = r.qty !== "" && Number.isFinite(Number(r.qty));
        const hasComponents = Array.isArray(r.componentsUsed) && r.componentsUsed.length > 0;
        return Boolean(hasText || hasQty || hasComponents);
      })
      .map((r, idx) => ({
        ...r,
        sn: idx + 1,
        qty: r.qty === "" ? null : Number(r.qty),
        date: r.date || undefined,
      }));

    const cleanedFinal = jobCard.finalTestingActivities.map((r, idx) => ({
      sr: r.sr || idx + 1,
      activity: r.activity,
      result: r.result,
      remarks: r.remarks,
    }));

    const { id: _id, ticketId: _ticketId, ...rest } = jobCard;
    void _id;
    void _ticketId;

    apiTicketJobCardUpdate(ticket.id, {
      ...rest,
      serviceJobs: cleanedService,
      finalTestingActivities: cleanedFinal,
    })
      .then(async (saved) => {
        setJobCard({
          ...saved,
          serviceJobs: normalizeServiceJobs(
            saved.serviceJobs || [],
            roleName === "ENGINEER" ? 1 : 5,
          ),
          finalTestingActivities: normalizeFinalTesting(saved.finalTestingActivities),
        });
        setJobSavedMsg("Saved!");

        // If the engineer marked the unit as NOT_REPAIRABLE, backend may close the ticket.
        if (String(saved.currentStatus || "").toUpperCase() === "NOT_REPAIRABLE") {
          try {
            const fresh = await apiTicketGet(ticket.id);
            onTicketUpdated(fresh);
          } catch {
            // Ignore ticket refresh failures; jobcard save already succeeded.
          }
        }
      })
      .catch((e) => setJobError(e instanceof Error ? e.message : "Failed to save job card"))
      .finally(() => setJobSaving(false));
  };

  const finalizeJobCard = (decision: "REPAIRABLE" | "NOT_REPAIRABLE") => {
    if (!jobCard) return;
    setJobSaving(true);
    setJobError("");
    setJobSavedMsg("");
    const finalizedAt = String(jobCard.engineerFinalizedAt || "").trim() || toDateInputValue(new Date());
    apiTicketJobCardFinalize(ticket.id, decision, finalizedAt)
      .then((saved) => {
        setJobCard(saved);
        setJobSavedMsg(decision === "REPAIRABLE" ? "Finalized as REPAIRABLE." : "Finalized as NOT REPAIRABLE (SCRAP).");
      })
      .catch((e) => setJobError(e instanceof Error ? e.message : "Failed to finalize job card"))
      .finally(() => setJobSaving(false));
  };

  const renderPickupDocumentCard = (u: string) => {
    const label = docLinkLabel(u);
    const k = docKind(u).kind;
    return (
      <div
        key={u}
        style={{
          display: "flex",
          gap: 12,
          alignItems: "stretch",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "12px 12px",
          background: "var(--card)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg2)",
            flex: "0 0 auto",
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--text2)",
            position: "relative",
          }}
        >
          {k === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={u}
              alt={label || "Document"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : k === "pdf" ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <FiFileText size={24} style={{ color: "#ef4444" }} />
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)" }}>PDF</span>
            </div>
          ) : (
            <FiFile size={24} style={{ color: "var(--text2)" }} />
          )}
          {k === "image" ? (
            <div
              style={{
                position: "absolute",
                right: 6,
                bottom: 6,
                width: 22,
                height: 22,
                borderRadius: 999,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
              aria-hidden="true"
            >
              <FiImage size={14} style={{ color: "white" }} />
            </div>
          ) : null}
        </div>

        <div style={{ minWidth: 0, flex: "1 1 auto", display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              color: "var(--text1)",
              fontSize: 13,
              fontWeight: 600,
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={label}
          >
            {label}
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>
            {k === "pdf" ? "PDF Document" : k === "image" ? "Image" : "File"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            onClick={() => {
              setDocPreviewKind(k);
              setDocPreviewUrl(u);
            }}
          >
            Preview
          </button>
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            onClick={() => window.open(u, "_blank", "noopener,noreferrer")}
          >
            Open
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="content">
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          ← Back
        </button>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
              {ticket.ticketId}
            </span>
            {canShowHeaderBadges ? (
              <>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
                <SlaBadge status={ticket.slaStatus} />
              </>
            ) : null}
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 3 }}>
            {ticket.customer} · {ticket.inverterMake} {ticket.inverterModel} ({ticket.capacity})
          </div>
          {canSeeCustomerContact ? (
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
              Phone: <span className="td-mono">{ticket.customerPhone || "—"}</span>
            </div>
          ) : null}
          {canSeeCustomerContact ? (
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
              Email: <span className="td-mono">{ticket.createdByEmail || ticket.customerEmail || "—"}</span>
            </div>
          ) : null}
        </div>
      </div>

      {!isOnsite ? <TicketTimeline currentStatus={ticket.status} /> : null}

      {canSeeStatusUpdate && !isOnsite && (
        <div className="table-card" style={{ marginBottom: 16 }}>
          <div className="table-header">
            <div className="table-title">Update Status</div>
          </div>
          {statusUpdatesLocked ? (
            <div style={{ padding: "0 20px", marginTop: 12, fontSize: 12, color: "var(--text3)" }}>
              Ticket is closed. Status updates are locked.
            </div>
          ) : null}
          <div style={{ padding: "16px 20px", display: "flex", gap: 10, alignItems: "center" }}>
            <select
              className="form-select"
              value={newStatus}
              onChange={(e) => {
                setNewStatus(e.target.value as TicketStatus);
                setStatusError("");
              }}
              disabled={statusUpdatesLocked || updating}
              style={{ flex: 1 }}
            >
              {STATUS_ORDER.map((s) => (
                <option
                  key={s}
                  value={s}
                  disabled={
                    STATUS_ORDER.indexOf(s) < currentIdx ||
                    STATUS_ORDER.indexOf(s) > currentIdx + 1
                  }
                >
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <button
              className="btn btn-accent"
              disabled={updating || statusUpdatesLocked}
              onClick={() => {
                if (statusUpdatesLocked) return;
                setUpdating(true);
                setStatusError("");

                const nextIdx = STATUS_ORDER.indexOf(newStatus);
                if (nextIdx > currentIdx + 1) {
                  setStatusError("Please follow the workflow step-by-step. Skipping steps is not allowed.");
                  setUpdating(false);
                  return;
                }

                const openLogistics = (stage: "pickup" | "under_dispatch" | "dispatch", msg?: string) => {
                  setActiveTab("logistics");
                  setLogisticsStage(stage);
                  if (msg) setLogisticsError(msg);
                };

                (async () => {
                  if (newStatus === "PICKUP_SCHEDULED") {
                    openLogistics(
                      "pickup",
                      "Please schedule pickup from Logistics (fill pickup details and click Save Pickup).",
                    );
                    return;
                  }

                  if (newStatus === "IN_TRANSIT") {
                    if (!canAdvanceToInTransit) {
                      openLogistics(
                        "pickup",
                        "Please open Logistics and save pickup details first (Save Pickup).",
                      );
                      return;
                    }
                  }

	                  if (newStatus === "UNDER_DISPATCH") {
	                    openLogistics(
	                      "under_dispatch",
	                      "Please review Under Dispatch (invoice/payment) and save it before scheduling dispatch.",
	                    );
	                    await updateStatusAndShare(newStatus);
	                    return;
	                  }

                  if (newStatus === "DISPATCHED") {
                    if (roleName === "SALES" && !dispatchApprovedForSales) {
                      openLogistics(
                        "under_dispatch",
                        "Dispatch is waiting for Admin approval. Please ask Admin to approve, then you can proceed.",
                      );
                      return;
                    }
                    openLogistics(
                      "dispatch",
                      "Please open Logistics and save dispatch details first (Save Dispatch).",
                    );
                    return;
                  }

                  if (newStatus === "INSTALLATION_DONE") {
                    redirectToInstallationOverview();
                    return;
                  }

                  if (newStatus === "CLOSED") {
                    if (!canAdvanceToClosed) {
                      openLogistics(
                        "dispatch",
                        "Please open Logistics and save dispatch details first (Save Dispatch).",
                      );
                      return;
                    }
                  }

	                  await updateStatusAndShare(newStatus);
	                })()
                  .catch(() => {})
                  .finally(() => setUpdating(false));
              }}
            >
              {updating ? "Updating..." : "Update Status"}
            </button>
          </div>
          {statusError ? (
            <div className="form-error" style={{ marginTop: 10 }}>
              {statusError}
            </div>
          ) : null}
        </div>
      )}

      <div className="tabs">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {isOnsite ? (
            <div className="table-card" style={{ marginBottom: 16 }}>
              <div className="table-header">
                <div className="table-title">On-site Repair (Offline Booking)</div>
              </div>
              <div style={{ padding: "16px 20px" }}>
                <div className="detail-grid" style={{ marginBottom: 14 }}>
                  <div className="detail-card">
                    <div className="detail-label">Stage</div>
                    <div className="detail-value">
                      {ticket.status === "CREATED"
                        ? "Created"
                        : ticket.status === "UNDER_REPAIRED"
                          ? "Assigned to Engineer"
                          : ticket.status === "CLOSED"
                            ? "Closed"
                            : ticket.status.replace(/_/g, " ")}
                    </div>
                  </div>
                  <div className="detail-card">
                    <div className="detail-label">Engineer</div>
                    <div className="detail-value">
                      {ticket.onsiteEngineerName
                        ? ticket.onsiteEngineerName
                        : ticket.assignedEngineer && ticket.assignedEngineer !== "-"
                          ? ticket.assignedEngineer
                          : "—"}
                    </div>
                  </div>
                  {ticket.onsiteVisitDate ? (
                    <div className="detail-card">
                      <div className="detail-label">Visit Date</div>
                      <div className="detail-value">{ticket.onsiteVisitDate}</div>
                    </div>
                  ) : null}
                  {ticket.onsiteRemark ? (
                    <div className="detail-card">
                      <div className="detail-label">Remark</div>
                      <div className="detail-value">{ticket.onsiteRemark}</div>
                    </div>
                  ) : null}
                </div>

                {onsiteAssignMsg ? (
                  <div style={{ marginBottom: 10, fontSize: 12, color: "var(--green)" }}>
                    {onsiteAssignMsg}
                  </div>
                ) : null}
                {onsiteAssignError ? (
                  <div className="form-error" style={{ marginBottom: 10 }}>
                    {onsiteAssignError}
                  </div>
                ) : null}
                {onsiteSavedMsg ? (
                  <div style={{ marginBottom: 10, fontSize: 12, color: "var(--green)" }}>
                    {onsiteSavedMsg}
                  </div>
                ) : null}
                {onsiteError ? (
                  <div className="form-error" style={{ marginBottom: 10 }}>
                    {onsiteError}
                  </div>
                ) : null}

                {canManageOnsiteBooking && ticket.status !== "CLOSED" ? (
                  ticket.status === "CREATED" ? (
                    <div>
                      <div className="form-section">Assign to Engineer</div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <button
                          className="btn btn-accent btn-sm"
                          type="button"
                          disabled={onsiteAssigning}
                          onClick={() => {
                            setOnsiteAssigning(true);
                            setOnsiteAssignError("");
                            setOnsiteAssignMsg("");
                            apiTicketOnsiteAssign(ticket.id)
                              .then((updated) => {
                                onTicketUpdated(updated);
                                setOnsiteAssignMsg("Assigned to engineer.");
                              })
                              .catch((e) =>
                                setOnsiteAssignError(e instanceof Error ? e.message : "Failed to assign engineer"),
                              )
                              .finally(() => setOnsiteAssigning(false));
                          }}
                        >
                          {onsiteAssigning ? "Assigning..." : "Assign to Engineer"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>
                      Ticket is assigned. Waiting for engineer to complete on-site repair.
                    </div>
                  )
                ) : null}

                {canWorkOnsiteBooking && ticket.status === "UNDER_REPAIRED" ? (
                  <div style={{ marginTop: 14 }}>
                    <div className="form-section">Engineer Job Details</div>
                    <div
                      className="form-grid"
                      style={{
                        gridTemplateColumns: "minmax(220px, 360px) minmax(180px, 280px)",
                      }}
                    >
                      <div className="form-group">
                        <label className="form-label">Engineer</label>
                        <NameCombobox
                          value={onsiteEngineerName}
                          disabled={onsiteClosing}
                          options={engineerDropdown}
                          placeholder="Select engineer name"
                          onChange={(v) => {
                            setOnsiteEngineerName(v);
                            setOnsiteError("");
                            setOnsiteSavedMsg("");
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Date</label>
                        <DatePicker
                          value={onsiteVisitDate}
                          onChange={(next) => {
                            setOnsiteVisitDate(next);
                            setOnsiteError("");
                            setOnsiteSavedMsg("");
                          }}
                          placeholder="Select date"
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                        <label className="form-label">Remark</label>
                        <textarea
                          className="form-textarea"
                          rows={2}
                          value={onsiteRemark}
                          onChange={(e) => {
                            setOnsiteRemark(e.target.value);
                            setOnsiteError("");
                            setOnsiteSavedMsg("");
                          }}
                          placeholder="Enter remark..."
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                      <button
                        className="btn btn-accent btn-sm"
                        type="button"
                        disabled={onsiteClosing}
                        onClick={() => {
                          setOnsiteClosing(true);
                          setOnsiteError("");
                          setOnsiteSavedMsg("");
                          apiTicketOnsiteJobCardUpdate(ticket.id, {
                            ...(onsiteEngineerName.trim() ? { engineerName: onsiteEngineerName.trim() } : {}),
                            ...(onsiteVisitDate ? { visitDate: onsiteVisitDate } : {}),
                            remark: onsiteRemark,
                            markRepaired: true,
                          })
                            .then((updated) => {
                              onTicketUpdated(updated);
                              setOnsiteSavedMsg("Marked as done and closed.");
                            })
                            .catch((e) => setOnsiteError(e instanceof Error ? e.message : "Failed to close ticket"))
                            .finally(() => setOnsiteClosing(false));
                        }}
                      >
                        {onsiteClosing ? "Closing..." : "Mark as Done"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {!isOnsite ? (
            <div className="table-card" style={{ marginBottom: 16 }} ref={installationSectionRef}>
            <div className="table-header">
              <div className="table-title">Installation</div>
            </div>
            <div style={{ padding: "14px 16px" }}>
              {installationRedirectMsg ? (
                <div
                  style={{
                    marginBottom: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "rgba(139, 69, 19, 0.08)",
                    border: "1px solid rgba(139, 69, 19, 0.18)",
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  {installationRedirectMsg}
                </div>
              ) : null}
              {STATUS_ORDER.indexOf(ticket.status) >= STATUS_ORDER.indexOf("DISPATCHED") ? (
                <>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10, lineHeight: 1.5 }}>
                    Upload the installation PDF, then mark installation as done. After approval, the ticket can be
                    closed.
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <input
                      className="form-input"
                      type="file"
                      accept="application/pdf"
                      disabled={installationDocUploading || ticket.status === "CLOSED"}
                      onChange={(e) => {
                        setInstallationDocError("");
                        setInstallationDocSavedMsg("");
                        const f = e.target.files?.[0] || null;
                        if (f && f.size > 5 * 1024 * 1024) {
                          setInstallationDocFile(null);
                          setInstallationDocError("File too large. Max 5MB.");
                          e.target.value = "";
                          return;
                        }
                        setInstallationDocFile(f);
                      }}
                    />
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>PDF up to 5MB</div>
                    <button
                      className="btn btn-ghost btn-sm"
                      type="button"
                      disabled={!installationDocFile || installationDocUploading || ticket.status === "CLOSED"}
                      onClick={() => {
                        if (!installationDocFile) return;
                        setInstallationDocUploading(true);
                        setInstallationDocError("");
                        setInstallationDocSavedMsg("");
                        apiTicketInstallationDocumentUpload(ticket.id, installationDocFile)
                          .then((r) => {
                            setInstallationDocuments(r.documents || []);
                            setInstallationDocFile(null);
                            setInstallationDocSavedMsg("Document uploaded.");
                            setInstallationRedirectMsg("");
                          })
                          .catch((e) =>
                            setInstallationDocError(e instanceof Error ? e.message : "Upload failed"),
                          )
                          .finally(() => setInstallationDocUploading(false));
                      }}
                    >
                      {installationDocUploading ? "Uploading..." : "Upload"}
                    </button>
                  </div>

                  {installationDocSavedMsg ? (
                    <div style={{ marginTop: 10, fontSize: 12, color: "var(--green)" }}>
                      {installationDocSavedMsg}
                    </div>
                  ) : null}
                  {installationDocError ? (
                    <div className="form-error" style={{ marginTop: 10 }}>
                      {installationDocError}
                    </div>
                  ) : null}

                  <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    {installationDocuments.length ? (
                      installationDocuments.map(renderPickupDocumentCard)
                    ) : (
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>
                        No installation PDFs uploaded yet.
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    {ticket.status === "DISPATCHED" ? (
                      <button
                        className="btn btn-accent btn-sm"
                        type="button"
                        disabled={installationApproving || !installationDocuments.length}
                        onClick={() => {
                          setInstallationApproving(true);
                          setInstallationError("");
                          setInstallationSavedMsg("");
	                          apiTicketApproveInstallationDone(ticket.id)
	                            .then((updated) => {
	                              onTicketUpdated(updated);
	                              setInstallationSavedMsg("Installation approved.");
	                              setInstallationRedirectMsg("");
	                              offerWhatsAppShare("INSTALLATION_DONE", updated);
	                            })
	                            .catch((e) =>
	                              setInstallationError(
	                                e instanceof Error ? e.message : "Failed to approve installation",
	                              ),
                            )
                            .finally(() => setInstallationApproving(false));
                        }}
                      >
                        {installationApproving ? "Approving..." : "Installation Done"}
                      </button>
                    ) : ticket.status === "INSTALLATION_DONE" || ticket.status === "CLOSED" ? (
                      <div style={{ fontSize: 12, color: "var(--green)" }}>Installation confirmed.</div>
                    ) : null}
                  </div>

                  {installationSavedMsg ? (
                    <div style={{ marginTop: 10, fontSize: 12, color: "var(--green)" }}>
                      {installationSavedMsg}
                    </div>
                  ) : null}
                  {installationError ? (
                    <div className="form-error" style={{ marginTop: 10 }}>
                      {installationError}
                    </div>
                  ) : null}
                </>
              ) : (
                <div style={{ fontSize: 12, color: "var(--text3)" }}>
                  Installation documents and confirmation will be available after dispatch.
                </div>
              )}
            </div>
            </div>
          ) : null}
          {canSeeCustomerContact ? (
            <div className="detail-grid" style={{ marginBottom: 14 }}>
              {[
                ["Customer", ticket.customerName || ticket.customer || "—"],
                ["Company", ticket.customerCompany || "—"],
                ["Address", ticket.customerAddress || "—"],
              ].map(([label, val]) => (
                <div key={label} className="detail-card">
                  <div className="detail-label">{label}</div>
                  <div className="detail-value">{val}</div>
                </div>
              ))}
            </div>
          ) : null}
          <div className="detail-grid">
            {[
              ["Inverter Make", ticket.inverterMake],
              ["Model", ticket.inverterModel],
              ["Capacity", ticket.capacity],
              ["Serial Number", ticket.serialNumber],
              ["Error Code", ticket.errorCode || "—"],
            ].map(([label, val]) => (
              <div key={label} className="detail-card">
                <div className="detail-label">{label}</div>
                <div className="detail-value">{val}</div>
              </div>
            ))}
            {canShowWarranty ? (
              <div className="detail-card">
                <div className="detail-label">Warranty</div>
                <div className="detail-value">
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Badge
                      label={ticket.warrantyStatus ? "In Warranty" : "Out of Warranty"}
                      color={ticket.warrantyStatus ? "#16a34a" : "#c0392b"}
                    />
                    <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)" }}>
                      {ticket.warrantyEndDate ? `Valid up to: ${ticket.warrantyEndDate}` : "Valid up to: —"}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="table-card" style={{ marginBottom: 16 }}>
            <div className="table-header">
              <div className="table-title">Fault Description</div>
            </div>
            <div style={{ padding: "16px 20px", fontSize: 14, color: "var(--text2)", lineHeight: 1.7 }}>
              {ticket.faultDescription}
            </div>
          </div>

          {roleName === "CUSTOMER" && (
            <div className="table-card" style={{ marginBottom: 16 }}>
              <div className="table-header">
                <div className="table-title">Pickup Details</div>
              </div>
              <div style={{ padding: "16px 20px" }}>
                {customerPickupError ? (
                  <div className="form-error" style={{ marginBottom: 12 }}>
                    {customerPickupError}
                  </div>
                ) : null}
                {customerPickupSavedMsg ? (
                  <div style={{ marginBottom: 12, fontSize: 13, color: "#16a34a" }}>
                    {customerPickupSavedMsg}
                  </div>
                ) : null}

                {customerPickupLoading ? (
                  <div style={{ fontSize: 13, color: "var(--text3)" }}>Loading pickup details…</div>
                ) : (
                  <>
                    <div className="detail-grid" style={{ marginBottom: 10 }}>
                      <div className="detail-card">
                        <div className="detail-label">Pickup Date</div>
                        <div className="detail-value" style={{ fontFamily: "var(--mono)" }}>
                          {pickupDate || "—"}
                        </div>
                      </div>
                      <div className="detail-card">
                        <div className="detail-label">Pickup Location</div>
                        <div className="detail-value">{pickupLocation || "—"}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: 6 }}>
                      <div className="detail-label">Documents</div>
                      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
                        {pickupDocuments.length ? (
                          pickupDocuments.map(renderPickupDocumentCard)
                        ) : (
                          <div style={{ fontSize: 12, color: "var(--text3)" }}>
                            No documents uploaded yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {canEditFaultDescription && (
            <div className="table-card" style={{ marginBottom: 16 }}>
              <div className="table-header">
                <div className="table-title">Update Fault Description</div>
              </div>
              <div style={{ padding: "16px 20px" }}>
                {faultError && (
                  <div className="form-error" style={{ marginBottom: 12 }}>
                    {faultError}
                  </div>
                )}
                {faultSavedMsg && (
                  <div style={{ marginBottom: 12, fontSize: 13, color: "#16a34a" }}>
                    {faultSavedMsg}
                  </div>
                )}
                <textarea
                  className="form-input"
                  value={faultDesc}
                  onChange={(e) => setFaultDesc(e.target.value)}
                  rows={4}
                  style={{ resize: "vertical" }}
                />
                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-accent"
                    disabled={faultSaving || !faultDesc.trim()}
                    onClick={() => {
                      setFaultSaving(true);
                      setFaultError("");
                      setFaultSavedMsg("");
                      apiUpdateTicketFaultDescription(ticket.id, faultDesc)
                        .then((updated) => {
                          onTicketUpdated(updated);
                          setFaultDesc(updated.faultDescription === "—" ? "" : updated.faultDescription);
                          setFaultSavedMsg("Fault description saved.");
                        })
                        .catch((e) =>
                          setFaultError(e instanceof Error ? e.message : "Failed to save fault description"),
                        )
                        .finally(() => setFaultSaving(false));
                    }}
                  >
                    {faultSaving ? "Saving..." : "Save Fault Description"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {canEditTicketDetails && (
            <div className="table-card" style={{ marginBottom: 16 }}>
              <div className="table-header">
                <div className="table-title">Edit Ticket Details</div>
              </div>
              <div style={{ padding: "16px 20px" }}>
                {detailsError && (
                  <div className="form-error" style={{ marginBottom: 12 }}>
                    {detailsError}
                  </div>
                )}
                {detailsSavedMsg && (
                  <div style={{ marginBottom: 12, fontSize: 13, color: "#16a34a" }}>
                    {detailsSavedMsg}
                  </div>
                )}

                <div className="form-grid">
                  <div>
                    <div className="form-label">Customer Name</div>
                    <input
                      className="form-input"
                      value={details.customerName}
                      onChange={(e) => setDetails((p) => ({ ...p, customerName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <div className="form-label">Company</div>
                    <input
                      className="form-input"
                      value={details.customerCompany}
                      onChange={(e) => setDetails((p) => ({ ...p, customerCompany: e.target.value }))}
                    />
                  </div>
                  <div>
                    <div className="form-label">Phone</div>
                    <input
                      className="form-input"
                      value={details.customerPhone}
                      onChange={(e) => setDetails((p) => ({ ...p, customerPhone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <div className="form-label">Address</div>
                    <input
                      className="form-input"
                      value={details.customerAddress}
                      onChange={(e) => setDetails((p) => ({ ...p, customerAddress: e.target.value }))}
                    />
                  </div>

	                  <div>
	                    <div className="form-label">Inverter Make</div>
	                    <input
	                      className="form-input"
	                      value={details.inverterMake}
	                      onChange={(e) => {
	                        setBrandAddMsg("");
	                        setBrandAddError("");
	                        setDetails((p) => ({ ...p, inverterMake: e.target.value }));
	                      }}
	                    />
	                    {canAddBrandToDropdown ? (
	                      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
	                        <button
	                          className="btn btn-ghost btn-sm"
	                          type="button"
	                          disabled={brandAdding}
	                          onClick={() => {
	                            const name = details.inverterMake.trim();
	                            if (!name) return;
	                            setBrandAdding(true);
	                            setBrandAddMsg("");
	                            setBrandAddError("");
	                            apiInverterBrandAdd(name)
	                              .then((savedName) => {
	                                setKnownBrands((prev) => {
	                                  const next = Array.isArray(prev) ? [...prev] : [];
	                                  const key = String(savedName || name).trim().toLowerCase();
	                                  if (!key) return next;
	                                  const exists = next.some(
	                                    (b) => String(b || "").trim().toLowerCase() === key,
	                                  );
	                                  if (!exists) next.push(String(savedName || name).trim());
	                                  return next;
	                                });
	                                setBrandAddMsg("Added to brand dropdown.");
	                              })
	                              .catch((e) =>
	                                setBrandAddError(
	                                  e instanceof Error ? e.message : "Failed to add brand",
	                                ),
	                              )
	                              .finally(() => setBrandAdding(false));
	                          }}
	                        >
	                          {brandAdding ? "Adding..." : "Add to Brand Dropdown"}
	                        </button>
	                        {brandAddMsg ? (
	                          <span style={{ fontSize: 12, color: "var(--green)" }}>{brandAddMsg}</span>
	                        ) : brandAddError ? (
	                          <span style={{ fontSize: 12, color: "var(--red)" }}>{brandAddError}</span>
	                        ) : (
	                          <span style={{ fontSize: 12, color: "var(--text3)" }}>
	                            This brand is not in dropdown.
	                          </span>
	                        )}
	                      </div>
	                    ) : brandAddMsg ? (
	                      <div style={{ marginTop: 8, fontSize: 12, color: "var(--green)" }}>
	                        {brandAddMsg}
	                      </div>
	                    ) : brandAddError ? (
	                      <div style={{ marginTop: 8, fontSize: 12, color: "var(--red)" }}>
	                        {brandAddError}
	                      </div>
	                    ) : null}
	                  </div>
                  <div>
                    <div className="form-label">Model</div>
                    <input
                      className="form-input"
                      value={details.inverterModel}
                      onChange={(e) => setDetails((p) => ({ ...p, inverterModel: e.target.value }))}
                    />
                  </div>
                  <div>
                    <div className="form-label">Capacity</div>
                    <input
                      className="form-input"
                      value={details.capacity}
                      onChange={(e) => setDetails((p) => ({ ...p, capacity: e.target.value }))}
                    />
                  </div>
                  <div>
                    <div className="form-label">Serial Number</div>
                    <input
                      className="form-input"
                      value={details.serialNumber}
                      onChange={(e) => setDetails((p) => ({ ...p, serialNumber: e.target.value }))}
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <div className="form-label">Fault Description</div>
                    <textarea
                      className="form-input"
                      value={details.faultDescription}
                      onChange={(e) => setDetails((p) => ({ ...p, faultDescription: e.target.value }))}
                      rows={3}
                      style={{ resize: "vertical" }}
                    />
                  </div>

                  <div>
                    <div className="form-label">Error Code</div>
                    <input
                      className="form-input"
                      value={details.errorCode}
                      onChange={(e) => setDetails((p) => ({ ...p, errorCode: e.target.value }))}
                    />
                  </div>
                  <div>
                    <div className="form-label">Priority</div>
                    <select
                      className="form-select"
                      value={details.priority}
                      onChange={(e) =>
                        setDetails((p) => ({ ...p, priority: e.target.value as Ticket["priority"] }))
                      }
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>

                  {canShowWarranty ? (
                    <>
                      <div>
                        <div className="form-label">Warranty</div>
                        <select
                          className="form-select"
                          value={details.warrantyStatus ? "true" : "false"}
                          onChange={(e) => {
                            const under = e.target.value === "true";
                            setDetails((p) => ({
                              ...p,
                              warrantyStatus: under,
                              warrantyEndDate: under ? p.warrantyEndDate : "",
                            }));
                          }}
                        >
                          <option value="true">Under Warranty</option>
                          <option value="false">Out of Warranty</option>
                        </select>
                      </div>
                      {details.warrantyStatus ? (
                        <div>
                          <div className="form-label">Warranty End Date</div>
                          <DatePicker
                            value={details.warrantyEndDate}
                            onChange={(next) => setDetails((p) => ({ ...p, warrantyEndDate: next }))}
                            placeholder="Select end date"
                          />
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>

                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-accent"
                    disabled={
                      detailsSaving ||
                      !details.capacity.trim() ||
                      !details.faultDescription.trim() ||
                      (canShowWarranty && details.warrantyStatus && !details.warrantyEndDate.trim())
                    }
                    onClick={() => {
                      setDetailsSaving(true);
                      setDetailsError("");
                      setDetailsSavedMsg("");
                      apiUpdateTicketDetails(ticket.id, details)
                        .then((updated) => {
                          onTicketUpdated(updated);
                          setDetails({
                            customerName: updated.customerName || "",
                            customerCompany: updated.customerCompany || "",
                            customerPhone: updated.customerPhone || "",
                            customerAddress: updated.customerAddress || "",
                            inverterMake: updated.inverterMake === "—" ? "" : updated.inverterMake,
                            inverterModel: updated.inverterModel === "—" ? "" : updated.inverterModel,
                            capacity: updated.capacity === "—" ? "" : updated.capacity,
                            serialNumber: updated.serialNumber === "—" ? "" : updated.serialNumber,
                            faultDescription: updated.faultDescription === "—" ? "" : updated.faultDescription,
                            errorCode: updated.errorCode || "",
                            priority: updated.priority,
                            warrantyStatus: Boolean(updated.warrantyStatus),
                            warrantyEndDate: updated.warrantyEndDate || "",
                          });
                          setDetailsSavedMsg("Ticket details saved.");
                        })
                        .catch((e) =>
                          setDetailsError(e instanceof Error ? e.message : "Failed to save ticket")
                        )
                        .finally(() => setDetailsSaving(false));
                    }}
                  >
                    {detailsSaving ? "Saving..." : "Save Details"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </>
      )}

      {activeTab === "jobcard" && (
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">Job Card — {ticket.ticketId}</div>
          </div>
          <div style={{ padding: "20px" }}>
            {roleName === "ADMIN" ? (
              <div style={{ marginBottom: 16 }}>
                <div className="form-section">Engineer / Sub Engineer Names</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    className="form-input"
                    value={engineerNameInput}
                    disabled={engineerNameAdding}
                    placeholder="Add a new name (for jobcard dropdown)"
                    onChange={(e) => {
                      setEngineerNameInput(e.target.value);
                      setEngineerNameAddMsg("");
                      setEngineerNameAddError("");
                    }}
                    style={{ minWidth: 260, maxWidth: 420 }}
                  />
                  <button
                    className="btn btn-ghost btn-sm"
                    type="button"
                    disabled={engineerNameAdding || !String(engineerNameInput || "").trim()}
                    onClick={() => {
                      const name = String(engineerNameInput || "").trim().replace(/\s+/g, " ");
                      if (!name) return;
                      setEngineerNameAdding(true);
                      setEngineerNameAddMsg("");
                      setEngineerNameAddError("");
                      setEngineerNameDeleteMsg("");
                      setEngineerNameDeleteError("");
                      apiJobCardEngineerNameAdd(name)
                        .then((saved) => {
                          const out = String(saved || name).trim().replace(/\s+/g, " ");
                          setEngineerNameInput("");
                          setEngineerNameAddMsg("Added.");
                          return Promise.allSettled([apiEngineerNamesList(), apiJobCardEngineerNamesList()])
                            .then((results) => {
                              const userNames =
                                results[0].status === "fulfilled"
                                  ? (results[0].value || []).map((r) => String(r?.name || "").trim()).filter(Boolean)
                                  : [];
                              const customNames =
                                results[1].status === "fulfilled"
                                  ? (results[1].value || []).map((n) => String(n || "").trim()).filter(Boolean)
                                  : [];
                              const merged = [...DEFAULT_ENGINEER_DROPDOWN, ...customNames, ...userNames, out];
                              const uniq = Array.from(new Set(merged.map((x) => x.trim()).filter(Boolean)));
                              uniq.sort((a, b) => a.localeCompare(b));
                              setEngineerDropdown(uniq);
                              const customUniq = Array.from(
                                new Set([...customNames, out].map((x) => x.trim()).filter(Boolean)),
                              );
                              customUniq.sort((a, b) => a.localeCompare(b));
                              setCustomEngineerNames(customUniq);
                            })
                            .catch(() => {});
                        })
                        .catch((e) =>
                          setEngineerNameAddError(
                            e instanceof Error ? e.message : "Failed to add name",
                          ),
                        )
                        .finally(() => setEngineerNameAdding(false));
                    }}
                  >
                    {engineerNameAdding ? "Adding..." : "Add"}
                  </button>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>
                    This updates the dropdown used in Job Card.
                  </div>
                </div>
                {engineerNameAddMsg ? (
                  <div style={{ marginTop: 10, fontSize: 12, color: "var(--green)" }}>
                    {engineerNameAddMsg}
                  </div>
                ) : null}
                {engineerNameAddError ? (
                  <div className="form-error" style={{ marginTop: 10 }}>
                    {engineerNameAddError}
                  </div>
                ) : null}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>
                    Saved custom names ({customEngineerNames.length})
                  </div>
                  {customEngineerNames.length ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {customEngineerNames.map((n) => {
                        const key = String(n || "").trim().replace(/\s+/g, " ").toLowerCase();
                        const deleting = engineerNameDeletingKey === key;
                        return (
                          <div
                            key={key}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "6px 10px",
                              borderRadius: 999,
                              border: "1px solid rgba(148,163,184,0.35)",
                              background: "rgba(148,163,184,0.10)",
                              maxWidth: "100%",
                            }}
                          >
                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}>
                              {n}
                            </div>
                            <button
                              className="btn btn-ghost btn-sm"
                              type="button"
                              disabled={engineerNameAdding || deleting}
                              onClick={() => {
                                if (!window.confirm(`Delete "${n}" from dropdown?`)) return;
                                setEngineerNameDeletingKey(key);
                                setEngineerNameDeleteMsg("");
                                setEngineerNameDeleteError("");
                                setEngineerNameAddMsg("");
                                setEngineerNameAddError("");
                                apiJobCardEngineerNameDelete(n)
                                  .then(() =>
                                    Promise.allSettled([apiEngineerNamesList(), apiJobCardEngineerNamesList()])
                                      .then((results) => {
                                        const userNames =
                                          results[0].status === "fulfilled"
                                            ? (results[0].value || []).map((r) => String(r?.name || "").trim()).filter(Boolean)
                                            : [];
                                        const customNames =
                                          results[1].status === "fulfilled"
                                            ? (results[1].value || []).map((x) => String(x || "").trim()).filter(Boolean)
                                            : [];
                                        const merged = [...DEFAULT_ENGINEER_DROPDOWN, ...customNames, ...userNames];
                                        const uniq = Array.from(new Set(merged.map((x) => x.trim()).filter(Boolean)));
                                        uniq.sort((a, b) => a.localeCompare(b));
                                        setEngineerDropdown(uniq);
                                        const customUniq = Array.from(new Set(customNames.map((x) => x.trim()).filter(Boolean)));
                                        customUniq.sort((a, b) => a.localeCompare(b));
                                        setCustomEngineerNames(customUniq);
                                        setEngineerNameDeleteMsg("Deleted.");
                                      })
                                      .catch(() => {
                                        setEngineerNameDeleteMsg("Deleted.");
                                      }),
                                  )
                                  .catch((e) =>
                                    setEngineerNameDeleteError(
                                      e instanceof Error ? e.message : "Failed to delete name",
                                    ),
                                  )
                                  .finally(() => setEngineerNameDeletingKey(""));
                              }}
                            >
                              {deleting ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>
                      No custom names added yet.
                    </div>
                  )}
                  {engineerNameDeleteMsg ? (
                    <div style={{ marginTop: 10, fontSize: 12, color: "var(--green)" }}>
                      {engineerNameDeleteMsg}
                    </div>
                  ) : null}
                  {engineerNameDeleteError ? (
                    <div className="form-error" style={{ marginTop: 10 }}>
                      {engineerNameDeleteError}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
            {jobError && (
              <div className="form-error" style={{ marginBottom: 12, marginTop: -6 }}>
                {jobError}
              </div>
            )}
            {jobLoading && !jobCard ? (
              <div style={{ fontSize: 13, color: "var(--text3)" }}>Loading job card…</div>
            ) : !jobCard ? (
              <div style={{ fontSize: 13, color: "var(--text3)" }}>No job card data.</div>
            ) : (
              roleName === "ENGINEER" ? (
                <>
                  <div className="form-section">Ticket Details</div>
                  <div className="detail-grid" style={{ marginBottom: 16 }}>
                    {[
                      ["Customer", ticket.customer],
                      ["Phone", ticket.customerPhone || "—"],
                      ["Address", ticket.customerAddress || "—"],
                      ["Brand", ticket.inverterMake || "—"],
                      ["Model", ticket.inverterModel || "—"],
                      ["Capacity", ticket.capacity || "—"],
                      ["Serial No.", ticket.serialNumber || "—"],
                      ["Error Code", ticket.errorCode || "—"],
                    ].map(([label, val]) => (
                      <div key={label} className="detail-card">
                        <div className="detail-label">{label}</div>
                        <div className="detail-value" style={{ fontSize: 13, fontWeight: 600 }}>
                          {val}
                        </div>
                      </div>
                    ))}
                  </div>

	                  <div className="form-section">Job Assign To</div>
	                  <div className="form-grid" style={{ gridTemplateColumns: "minmax(220px, 420px) minmax(180px, 260px) 1fr" }}>
	                    <div className="form-group">
	                      <label className="form-label">Engineer Name</label>
	                      <NameCombobox
	                        value={jobCard.checkedByName || ""}
	                        disabled={!canEditJobCard}
	                        options={engineerDropdown}
	                        placeholder="Select engineer name"
	                        onChange={(v) =>
	                          setJobCard((p) => (p ? { ...p, checkedByName: v } : p))
	                        }
	                      />
	                    </div>
                      <div className="form-group">
                        <label className="form-label">Update Date</label>
                        <input
                          className="form-input"
                          type="date"
                          value={jobCard.checkedByDate || ""}
                          disabled={!canEditJobCard}
                          onChange={(e) =>
                            setJobCard((p) => (p ? { ...p, checkedByDate: e.target.value } : p))
                          }
                        />
                      </div>
	                  </div>

                  <div className="form-section">Diagnosis</div>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={jobCard.diagnosis || ""}
                    disabled={!canEditJobCard}
                    onChange={(e) =>
                      setJobCard((p) => (p ? { ...p, diagnosis: e.target.value } : p))
                    }
                    placeholder="Write diagnosis..."
                  />

                  <div className="form-section">Repairing Status</div>
                  <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <input
                        type="radio"
                        name="repairability"
                        disabled={!canEditJobCard}
                        checked={String(jobCard.currentStatus || "").toUpperCase() === "REPAIRABLE"}
                        onChange={() =>
                          setJobCard((p) => (p ? { ...p, currentStatus: "REPAIRABLE" } : p))
                        }
                      />
                      Repairable
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <input
                        type="radio"
                        name="repairability"
                        disabled={!canEditJobCard}
                        checked={
                          String(jobCard.currentStatus || "").toUpperCase() === "NOT_REPAIRABLE"
                        }
                        onChange={() =>
                          setJobCard((p) => (p ? { ...p, currentStatus: "NOT_REPAIRABLE" } : p))
                        }
                      />
                      Not Repairable
                    </label>
                    {!jobCard.currentStatus.trim() ? (
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>
                        Select repairing status to continue.
                      </div>
                    ) : null}
                  </div>

                  {String(jobCard.currentStatus || "").toUpperCase() === "NOT_REPAIRABLE" ? (
                    <div
                      style={{
                        marginTop: 10,
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(217,119,6,0.25)",
                        background: "rgba(217,119,6,0.08)",
                        fontSize: 12,
                        color: "var(--text2)",
                        lineHeight: 1.5,
                      }}
                    >
                      Selecting <b>Not Repairable</b> will close this ticket after saving and notify the sales team.
                    </div>
                  ) : null}

                  {String(jobCard.currentStatus || "").toUpperCase() === "REPAIRABLE" ? (
                    <>
	                      <div className="form-section">Card Repair Actions Carried Out By</div>
	                      <div
	                        className="form-grid"
	                        style={{ marginBottom: 10, gridTemplateColumns: "minmax(220px, 420px) 1fr" }}
	                      >
	                        <div className="form-group">
	                          <label className="form-label">Name</label>
	                          <NameCombobox
	                            value={jobCard.repairActionsByName || ""}
	                            disabled={!canEditJobCard}
	                            options={engineerDropdown}
	                            placeholder="e.g. QA Team / Sub engineer name"
	                            onChange={(v) =>
	                              setJobCard((p) =>
	                                p ? { ...p, repairActionsByName: v } : p,
	                              )
	                            }
	                          />
	                        </div>
	                      </div>
                      <div className="scroll-x">
                        <table>
                          <thead>
                            <tr>
                              <th style={{ width: 70 }}>Sr No.</th>
                              <th>Faulty Card Detail</th>
                              <th>Spare / Component Used</th>
                              <th>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {jobCard.serviceJobs.map((row, idx) => (
                              <tr key={idx}>
                                <td style={{ fontFamily: "var(--mono)", color: "var(--text3)" }}>
                                  {idx + 1}
                                </td>
                                <td>
                                  <input
                                    className="form-input"
                                    value={row.jobName}
                                    disabled={!canEditJobCard}
                                    onChange={(e) =>
                                      setJobCard((p) =>
                                        !p
                                          ? p
                                          : {
                                              ...p,
                                              serviceJobs: p.serviceJobs.map((r, i) =>
                                                i === idx ? { ...r, jobName: e.target.value } : r,
                                              ),
                                            },
                                      )
                                    }
                                    placeholder="e.g. Control card, power card..."
                                  />
                                </td>
                                <td>
                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                                      gap: 8,
                                      alignItems: "start",
                                    }}
                                  >
                                    {(
                                      (row.componentsUsed && row.componentsUsed.length
                                        ? row.componentsUsed
                                        : row.specification
                                          ? row.specification
                                              .split(/[\n,]+/g)
                                              .map((x) => x.trim())
                                              .filter(Boolean)
                                          : [{ name: "", qty: "" }]) as unknown[]
                                    )
                                      .map((x) => {
                                        // Keep raw spacing while typing; sanitize on save.
                                        if (!x) return { name: "", qty: "" };
                                        if (typeof x === "string") return { name: String(x), qty: "" };
                                        if (typeof x === "object") {
                                          const o = x as JobCardComponentUsed;
                                          return { name: String(o?.name ?? ""), qty: o?.qty ?? "" };
                                        }
                                        return { name: String(x), qty: "" };
                                      })
                                      .map((c, cIdx) => (
                                      <div
                                        key={cIdx}
                                        style={{
                                          display: "flex",
                                          flexWrap: "wrap",
                                          gap: 8,
                                          alignItems: "center",
                                          minWidth: 0,
                                        }}
                                      >
                                        <input
                                          className="form-input"
                                          style={{ flex: "1 1 280px", minWidth: 220 }}
                                          value={c.name}
                                          disabled={!canEditJobCard}
                                          onChange={(e) => {
                                            const v = e.target.value;
                                            setJobCard((p) => {
                                              if (!p) return p;
                                              const next = p.serviceJobs.map((r, i) => {
                                                if (i !== idx) return r;
                                                const base =
                                                  r.componentsUsed && r.componentsUsed.length
                                                    ? r.componentsUsed
                                                    : r.specification
                                                      ? r.specification
                                                          .split(/[\n,]+/g)
                                                          .map((x) => x.trim())
                                                          .filter(Boolean)
                                                          .map((name) => ({ name, qty: "" as const }))
                                                      : [{ name: "", qty: "" as const }];
                                                const arr: JobCardComponentUsed[] = base.map((x) => {
                                                  if (!x) return { name: "", qty: "" };
                                                  if (typeof x === "string") return { name: String(x), qty: "" };
                                                  if (typeof x === "object") {
                                                    const o = x as JobCardComponentUsed;
                                                    return { name: String(o?.name ?? ""), qty: o?.qty ?? "" };
                                                  }
                                                  return { name: String(x), qty: "" };
                                                });
                                                while (arr.length <= cIdx) arr.push({ name: "", qty: "" });
                                                arr[cIdx] = { ...arr[cIdx], name: v };
                                                const keptNames = arr
                                                  .map((x) => String(x?.name || "").trim())
                                                  .filter(Boolean);
                                                return {
                                                  ...r,
                                                  componentsUsed: arr,
                                                  // Keep legacy string in sync for old views/exports.
                                                  specification: keptNames.join(", "),
                                                };
                                              });
                                              return { ...p, serviceJobs: next };
                                            });
                                          }}
                                          placeholder={`Component ${cIdx + 1}`}
                                        />
                                        <input
                                          className="form-input"
                                          style={{ width: 88, flex: "0 0 88px" }}
                                          type="number"
                                          min={0}
                                          value={c.qty}
                                          disabled={!canEditJobCard}
                                          onChange={(e) => {
                                            const raw = e.target.value;
                                            const qty: number | "" = raw === "" ? "" : Number(raw);
                                            setJobCard((p) => {
                                              if (!p) return p;
                                              const next = p.serviceJobs.map((r, i) => {
                                                if (i !== idx) return r;
                                                const base =
                                                  r.componentsUsed && r.componentsUsed.length
                                                    ? r.componentsUsed
                                                    : r.specification
                                                      ? r.specification
                                                          .split(/[\n,]+/g)
                                                          .map((x) => x.trim())
                                                          .filter(Boolean)
                                                      : [{ name: "", qty: "" }];
                                                const arr = (base as unknown[]).map(toComponentUsed);
                                                while (arr.length <= cIdx) arr.push({ name: "", qty: "" });
                                                arr[cIdx] = { ...arr[cIdx], qty };
                                                return { ...r, componentsUsed: arr };
                                              });
                                              return { ...p, serviceJobs: next };
                                            });
                                          }}
                                          placeholder="Qty"
                                        />
                                        {canEditJobCard ? (
                                          <button
                                            type="button"
                                            className="btn btn-ghost btn-sm"
                                            disabled={
                                              !canEditJobCard ||
                                              ((row.componentsUsed && row.componentsUsed.length
                                                ? row.componentsUsed
                                                : row.specification
                                                  ? row.specification
                                                      .split(/[\n,]+/g)
                                                      .map((x) => x.trim())
                                                      .filter(Boolean)
                                                  : [{ name: "", qty: "" }]) as unknown[])
                                                .map(toComponentUsed).length <= 1
                                            }
                                            onClick={() => {
                                              setJobCard((p) => {
                                                if (!p) return p;
                                                const next = p.serviceJobs.map((r, i) => {
                                                  if (i !== idx) return r;
                                                  const base =
                                                    r.componentsUsed && r.componentsUsed.length
                                                      ? r.componentsUsed
                                                      : r.specification
                                                        ? r.specification
                                                            .split(/[\n,]+/g)
                                                            .map((x) => x.trim())
                                                            .filter(Boolean)
                                                        : [{ name: "", qty: "" }];
                                                  const arr = (base as unknown[]).map(toComponentUsed);
                                                  if (arr.length <= 1) return r;
                                                  arr.splice(cIdx, 1);
                                                  if (!arr.length) arr.push({ name: "", qty: "" });
                                                  const cleaned: JobCardComponentUsed[] = arr.map((x) => {
                                                    const c = toComponentUsed(x);
                                                    return { name: String(c?.name || "").trim(), qty: c.qty };
                                                  });
                                                  const keptNames = cleaned
                                                    .map((x) => String(x?.name || "").trim())
                                                    .filter(Boolean);
                                                  return {
                                                    ...r,
                                                    componentsUsed: cleaned,
                                                    specification: keptNames.join(", "),
                                                  };
                                                });
                                                return { ...p, serviceJobs: next };
                                              });
                                            }}
                                            title="Remove component"
                                          >
                                            Remove
                                          </button>
                                        ) : null}
                                      </div>
                                    ))}
                                    {canEditJobCard ? (
                                      <button
                                        type="button"
                                        className="btn btn-ghost btn-sm"
                                        style={{ gridColumn: "1 / -1", justifySelf: "start" }}
                                        onClick={() => {
                                          setJobCard((p) => {
                                            if (!p) return p;
                                            const next = p.serviceJobs.map((r, i) => {
                                              if (i !== idx) return r;
                                              const base =
                                                r.componentsUsed && r.componentsUsed.length
                                                  ? r.componentsUsed
                                                  : r.specification
                                                    ? r.specification
                                                        .split(/[\n,]+/g)
                                                        .map((x) => x.trim())
                                                        .filter(Boolean)
                                                    : [{ name: "", qty: "" }];
                                              const arr: JobCardComponentUsed[] = [
                                                ...(base as unknown[]).map(toComponentUsed),
                                                { name: "", qty: "" },
                                              ];
                                              return { ...r, componentsUsed: arr };
                                            });
                                            return { ...p, serviceJobs: next };
                                          });
                                        }}
                                      >
                                        + Add Component
                                      </button>
                                    ) : null}
                                  </div>
                                </td>
                                <td>
                                  <textarea
                                    className="form-textarea"
                                    rows={2}
                                    value={row.reason}
                                    disabled={!canEditJobCard}
                                    onChange={(e) =>
                                      setJobCard((p) =>
                                        !p
                                          ? p
                                          : {
                                              ...p,
                                              serviceJobs: p.serviceJobs.map((r, i) =>
                                                i === idx ? { ...r, reason: e.target.value } : r,
                                              ),
                                            },
                                      )
                                    }
                                    placeholder="Any remarks..."
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {canEditJobCard && (
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() =>
                              setJobCard((p) =>
                                !p
                                  ? p
                                  : {
                                      ...p,
                                      serviceJobs: normalizeServiceJobs(
                                        [...p.serviceJobs, emptyServiceJob(p.serviceJobs.length + 1)],
                                        p.serviceJobs.length + 1,
                                      ),
                                    },
                              )
                            }
                          >
                            + Add Row
                          </button>
                        </div>
                      )}
                    </>
                  ) : null}

                  <div className="form-section">Testing</div>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={jobCard.testResults || ""}
                    disabled={!canEditJobCard}
                    onChange={(e) =>
                      setJobCard((p) => (p ? { ...p, testResults: e.target.value } : p))
                    }
                    placeholder="Write testing details..."
                  />

	                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
	                    <button
	                      className="btn btn-accent"
	                      disabled={!canEditJobCard || jobSaving}
	                      onClick={saveJobCard}
	                    >
	                      {jobSaving ? "Saving..." : "Save Job Card"}
	                    </button>
	                    {roleName === "ENGINEER" &&
	                    String(ticket.status || "").toUpperCase() === "UNDER_REPAIRED" ? (
	                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
	                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
	                          <span style={{ fontSize: 12, color: "var(--text3)" }}>Finalize date</span>
	                          <input
	                            className="form-input"
	                            type="date"
	                            value={jobCard.engineerFinalizedAt || toDateInputValue(new Date())}
	                            disabled={jobSaving}
	                            onChange={(e) =>
	                              setJobCard((p) =>
	                                p ? { ...p, engineerFinalizedAt: e.target.value } : p,
	                              )
	                            }
	                            style={{ width: 160 }}
	                          />
	                        </div>
	                        <button
	                          className="btn btn-ghost btn-sm"
	                          type="button"
	                          disabled={jobSaving}
	                          onClick={() => finalizeJobCard("REPAIRABLE")}
	                        >
	                          Approve (Repaired)
	                        </button>
	                        <button
	                          className="btn btn-ghost btn-sm"
	                          type="button"
	                          disabled={jobSaving}
	                          onClick={() => finalizeJobCard("NOT_REPAIRABLE")}
	                        >
	                          Scrap (Not Repairable)
	                        </button>
	                        {String(jobCard.engineerFinalStatus || "").trim() ? (
	                          <span style={{ fontSize: 12, color: "var(--text3)" }}>
	                            Final:{" "}
	                            <span className="tag">
	                              {String(jobCard.engineerFinalStatus || "").toUpperCase()}
	                            </span>
	                            {jobCard.engineerFinalizedAt ? (
	                              <span style={{ marginLeft: 8, fontFamily: "var(--mono)" }}>
	                                {jobCard.engineerFinalizedAt}
	                              </span>
	                            ) : null}
	                          </span>
	                        ) : (
	                          <span style={{ fontSize: 12, color: "var(--text3)" }}>
	                            Final decision pending
	                          </span>
	                        )}
	                      </div>
	                    ) : null}
	                    {!canEditJobCard && (
	                      <div style={{ fontSize: 12, color: "var(--text3)" }}>
	                        You don&apos;t have permission to edit job cards.
	                      </div>
	                    )}
                    {jobSavedMsg && (
                      <div style={{ fontSize: 12, color: "var(--green)" }}>{jobSavedMsg}</div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="form-section">Engineer Report</div>
                  <div className="detail-grid" style={{ marginBottom: 14 }}>
                    <div className="detail-card">
                      <div className="detail-label">Engineer</div>
                      <div className="detail-value" style={{ fontSize: 13, fontWeight: 600 }}>
                        {jobCard.checkedByName || "—"}
                      </div>
                    </div>
                    <div className="detail-card">
                      <div className="detail-label">Updated Date</div>
                      <div className="detail-value" style={{ fontFamily: "var(--mono)" }}>
                        {jobCard.checkedByDate || "—"}
                      </div>
                    </div>
	                    <div className="detail-card">
	                      <div className="detail-label">Repairability</div>
	                      <div className="detail-value">
	                        {String(jobCard.currentStatus || "").trim() ? (
	                          <span className="tag">{String(jobCard.currentStatus || "").toUpperCase()}</span>
	                        ) : (
	                          "—"
	                        )}
	                      </div>
	                    </div>
	                    <div className="detail-card">
	                      <div className="detail-label">Final Decision</div>
	                      <div className="detail-value">
	                        {String(jobCard.engineerFinalStatus || "").trim() ? (
	                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
	                            <span className="tag">
	                              {String(jobCard.engineerFinalStatus || "").toUpperCase()}
	                            </span>
	                            {jobCard.engineerFinalizedAt ? (
	                              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text3)" }}>
	                                {jobCard.engineerFinalizedAt}
	                              </span>
	                            ) : null}
	                          </div>
	                        ) : (
	                          "Pending"
	                        )}
	                      </div>
	                    </div>
	                    <div className="detail-card">
	                      <div className="detail-label">Ticket Status</div>
	                      <div className="detail-value">
	                        <span className="tag">{ticket.status}</span>
                      </div>
                    </div>
                  </div>

	                  {roleName === "SALES" &&
	                  String(ticket.status || "").toUpperCase() === "UNDER_REPAIRED" &&
	                  String(jobCard.engineerFinalStatus || "").toUpperCase().trim() === "REPAIRABLE" ? (
	                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
	                      <button
	                        className="btn btn-accent btn-sm"
	                        type="button"
	                        onClick={() => {
	                          setActiveTab("logistics");
	                          setLogisticsStage("under_dispatch");
	                        }}
	                      >
	                        Under Dispatch → Logistics
	                      </button>
	                    </div>
	                  ) : null}

	                  {String(jobCard.engineerFinalStatus || "").toUpperCase() === "NOT_REPAIRABLE" ? (
	                    <div
	                      style={{
	                        marginTop: 10,
	                        marginBottom: 14,
	                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(217,119,6,0.25)",
                        background: "rgba(217,119,6,0.08)",
                        fontSize: 12,
                        color: "var(--text2)",
                        lineHeight: 1.5,
                      }}
                    >
                      This job card was marked <b>NOT REPAIRABLE</b> by the engineer.
                    </div>
                  ) : null}

                  {canEditJobCard ? (
                    <>
                      <div className="form-grid" style={{ marginBottom: 16 }}>
                        <div className="form-group full">
                          <label className="form-label">Diagnosis</label>
                          <textarea
                            className="form-textarea"
                            rows={3}
                            value={jobCard.diagnosis || ""}
                            disabled={!canEditJobCard}
                            onChange={(e) =>
                              setJobCard((p) => (p ? { ...p, diagnosis: e.target.value } : p))
                            }
                            placeholder="—"
                          />
                        </div>
                        <div className="form-group full">
                          <label className="form-label">Repair Notes</label>
                          <textarea
                            className="form-textarea"
                            rows={3}
                            value={jobCard.repairNotes || ""}
                            disabled={!canEditJobCard}
                            onChange={(e) =>
                              setJobCard((p) => (p ? { ...p, repairNotes: e.target.value } : p))
                            }
                            placeholder="—"
                          />
                        </div>
                        <div className="form-group full">
                          <label className="form-label">Test Results</label>
                          <textarea
                            className="form-textarea"
                            rows={3}
                            value={jobCard.testResults || ""}
                            disabled={!canEditJobCard}
                            onChange={(e) =>
                              setJobCard((p) => (p ? { ...p, testResults: e.target.value } : p))
                            }
                            placeholder="—"
                          />
                        </div>
                      </div>

                      <div className="form-section">Service Job History</div>
                      <div className="scroll-x">
                        <table>
                          <thead>
                            <tr>
                              <th style={{ width: 60 }}>SN</th>
                              <th>Job Name</th>
                              <th>Specification</th>
                              <th style={{ width: 90 }}>Qty</th>
                              <th>Reason</th>
                              <th style={{ width: 140 }}>Date</th>
                              <th style={{ width: 160 }}>Done By</th>
                            </tr>
                          </thead>
                          <tbody>
                            {jobCard.serviceJobs.map((row, idx) => (
                              <tr key={idx}>
                                <td style={{ fontFamily: "var(--mono)", color: "var(--text3)" }}>
                                  {idx + 1}
                                </td>
                                <td>
                                  <input
                                    className="form-input"
                                    value={row.jobName}
                                    disabled={!canEditJobCard}
                                    onChange={(e) =>
                                      setJobCard((p) =>
                                        !p
                                          ? p
                                          : {
                                              ...p,
                                              serviceJobs: p.serviceJobs.map((r, i) =>
                                                i === idx ? { ...r, jobName: e.target.value } : r,
                                              ),
                                            },
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-input"
                                    value={row.specification}
                                    disabled={!canEditJobCard}
                                    onChange={(e) =>
                                      setJobCard((p) =>
                                        !p
                                          ? p
                                          : {
                                              ...p,
                                              serviceJobs: p.serviceJobs.map((r, i) =>
                                                i === idx ? { ...r, specification: e.target.value } : r,
                                              ),
                                            },
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-input"
                                    type="number"
                                    min={0}
                                    value={row.qty}
                                    disabled={!canEditJobCard}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      const qty = v === "" ? "" : Number(v);
                                      setJobCard((p) =>
                                        !p
                                          ? p
                                          : {
                                              ...p,
                                              serviceJobs: p.serviceJobs.map((r, i) =>
                                                i === idx ? { ...r, qty } : r,
                                              ),
                                            },
                                      );
                                    }}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-input"
                                    value={row.reason}
                                    disabled={!canEditJobCard}
                                    onChange={(e) =>
                                      setJobCard((p) =>
                                        !p
                                          ? p
                                          : {
                                              ...p,
                                              serviceJobs: p.serviceJobs.map((r, i) =>
                                                i === idx ? { ...r, reason: e.target.value } : r,
                                              ),
                                            },
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-input"
                                    type="date"
                                    value={row.date}
                                    disabled={!canEditJobCard}
                                    onChange={(e) =>
                                      setJobCard((p) =>
                                        !p
                                          ? p
                                          : {
                                              ...p,
                                              serviceJobs: p.serviceJobs.map((r, i) =>
                                                i === idx ? { ...r, date: e.target.value } : r,
                                              ),
                                            },
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-input"
                                    value={row.doneBy}
                                    disabled={!canEditJobCard}
                                    onChange={(e) =>
                                      setJobCard((p) =>
                                        !p
                                          ? p
                                          : {
                                              ...p,
                                              serviceJobs: p.serviceJobs.map((r, i) =>
                                                i === idx ? { ...r, doneBy: e.target.value } : r,
                                              ),
                                            },
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {canEditJobCard && (
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() =>
                              setJobCard((p) =>
                                !p
                                  ? p
                                  : {
                                      ...p,
                                      serviceJobs: normalizeServiceJobs(
                                        [...p.serviceJobs, emptyServiceJob(p.serviceJobs.length + 1)],
                                        p.serviceJobs.length + 1,
                                      ),
                                    },
                              )
                            }
                          >
                            + Add Row
                          </button>
                        </div>
                      )}

                      <div className="form-section">Final Testing</div>
                      <div className="scroll-x">
                        <table>
                          <thead>
                            <tr>
                              <th style={{ width: 60 }}>Sr</th>
                              <th>Activity</th>
                              <th style={{ width: 80, textAlign: "center" }}>Yes</th>
                              <th style={{ width: 80, textAlign: "center" }}>No</th>
                              <th style={{ width: 260 }}>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {jobCard.finalTestingActivities.map((row, idx) => (
                              <tr key={row.sr || idx}>
                                <td style={{ fontFamily: "var(--mono)", color: "var(--text3)" }}>
                                  {row.sr}
                                </td>
                                <td>{row.activity}</td>
                                <td style={{ textAlign: "center" }}>
                                  <input
                                    type="radio"
                                    name={`ft-${row.sr}`}
                                    checked={row.result === "YES"}
                                    disabled={!canEditJobCard}
                                    onChange={() =>
                                      setJobCard((p) =>
                                        !p
                                          ? p
                                          : {
                                              ...p,
                                              finalTestingActivities: p.finalTestingActivities.map((r, i) =>
                                                i === idx ? { ...r, result: "YES" } : r,
                                              ),
                                            },
                                      )
                                    }
                                  />
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  <input
                                    type="radio"
                                    name={`ft-${row.sr}`}
                                    checked={row.result === "NO"}
                                    disabled={!canEditJobCard}
                                    onChange={() =>
                                      setJobCard((p) =>
                                        !p
                                          ? p
                                          : {
                                              ...p,
                                              finalTestingActivities: p.finalTestingActivities.map((r, i) =>
                                                i === idx ? { ...r, result: "NO" } : r,
                                              ),
                                            },
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-input"
                                    value={row.remarks}
                                    disabled={!canEditJobCard}
                                    onChange={(e) =>
                                      setJobCard((p) =>
                                        !p
                                          ? p
                                          : {
                                              ...p,
                                              finalTestingActivities: p.finalTestingActivities.map((r, i) =>
                                                i === idx ? { ...r, remarks: e.target.value } : r,
                                              ),
                                            },
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="form-section">Final Status</div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Final Status</label>
                          <input
                            className="form-input"
                            value={jobCard.finalStatus}
                            disabled={!canEditJobCard}
                            onChange={(e) =>
                              setJobCard((p) => (p ? { ...p, finalStatus: e.target.value } : p))
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Checked By</label>
                          <input
                            className="form-input"
                            value={jobCard.finalCheckedByName}
                            disabled={!canEditJobCard}
                            onChange={(e) =>
                              setJobCard((p) => (p ? { ...p, finalCheckedByName: e.target.value } : p))
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Checked Date</label>
                          <input
                            className="form-input"
                            type="date"
                            value={jobCard.finalCheckedByDate}
                            disabled={!canEditJobCard}
                            onChange={(e) =>
                              setJobCard((p) => (p ? { ...p, finalCheckedByDate: e.target.value } : p))
                            }
                          />
                        </div>
                        <div className="form-group full">
                          <label className="form-label">Final Remarks</label>
                          <textarea
                            className="form-textarea"
                            value={jobCard.finalRemarks}
                            disabled={!canEditJobCard}
                            onChange={(e) =>
                              setJobCard((p) => (p ? { ...p, finalRemarks: e.target.value } : p))
                            }
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
                        <button
                          className="btn btn-accent"
                          disabled={!canEditJobCard || jobSaving}
                          onClick={saveJobCard}
                        >
                          {jobSaving ? "Saving..." : "Save Job Card"}
                        </button>
                        {jobSavedMsg && (
                          <div style={{ fontSize: 12, color: "var(--green)" }}>{jobSavedMsg}</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {(() => {
                        const diagnosisText = String(jobCard.diagnosis || "").trim();
                        const repairNotesText = String(jobCard.repairNotes || "").trim();
                        const testResultsText = String(jobCard.testResults || "").trim();
                        const hasNotes = Boolean(diagnosisText || repairNotesText || testResultsText);

                        const doneByFallback = Array.from(
                          new Set(
                            [jobCard.checkedByName, jobCard.repairActionsByName]
                              .map((x) => String(x || "").trim())
                              .filter(Boolean),
                          ),
                        ).join(", ");

                        const filledJobs = (jobCard.serviceJobs || []).filter((r) => {
                          const jobName = String(r?.jobName || "").trim();
                          const spec = String(r?.specification || "").trim();
                          const qty = String(r?.qty ?? "").trim();
                          const comps = Array.isArray(r?.componentsUsed)
                            ? r.componentsUsed.map((x) => String(x?.name || "").trim()).filter(Boolean)
                            : [];
                          const reason = String(r?.reason || "").trim();
                          const date = String(r?.date || "").trim();
                          const doneBy = String(r?.doneBy || "").trim();
                          return Boolean(jobName || spec || qty || comps.length || reason || date || doneBy);
                        });

                        const filledFinal = (jobCard.finalTestingActivities || []).filter((r) => {
                          const result = String(r?.result || "").toUpperCase();
                          const remarks = String(r?.remarks || "").trim();
                          return result === "YES" || result === "NO" || Boolean(remarks);
                        });

                        const finalStatus = String(jobCard.finalStatus || "").trim();
                        const finalCheckedByName = String(jobCard.finalCheckedByName || "").trim();
                        const finalCheckedByDate = String(jobCard.finalCheckedByDate || "").trim();
                        const finalRemarks = String(jobCard.finalRemarks || "").trim();
                        const hasFinal = Boolean(finalStatus || finalCheckedByName || finalCheckedByDate || finalRemarks);

                        return (
                          <>
                            {hasNotes ? (
                              <>
                                <div className="form-section">Engineer Notes</div>
                                {diagnosisText ? (
                                  <div style={{ marginBottom: 10 }}>
                                    <div className="detail-label">Diagnosis</div>
                                    <div
                                      style={{
                                        marginTop: 6,
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: "1px solid var(--border)",
                                        background: "var(--bg2)",
                                        fontSize: 13,
                                        color: "var(--text2)",
                                        whiteSpace: "pre-wrap",
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {diagnosisText}
                                    </div>
                                  </div>
                                ) : null}
                                {repairNotesText ? (
                                  <div style={{ marginBottom: 10 }}>
                                    <div className="detail-label">Repair Notes</div>
                                    <div
                                      style={{
                                        marginTop: 6,
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: "1px solid var(--border)",
                                        background: "var(--bg2)",
                                        fontSize: 13,
                                        color: "var(--text2)",
                                        whiteSpace: "pre-wrap",
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {repairNotesText}
                                    </div>
                                  </div>
                                ) : null}
                                {testResultsText ? (
                                  <div style={{ marginBottom: 10 }}>
                                    <div className="detail-label">Test Results</div>
                                    <div
                                      style={{
                                        marginTop: 6,
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: "1px solid var(--border)",
                                        background: "var(--bg2)",
                                        fontSize: 13,
                                        color: "var(--text2)",
                                        whiteSpace: "pre-wrap",
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {testResultsText}
                                    </div>
                                  </div>
                                ) : null}
                              </>
                            ) : null}

                            {filledJobs.length ? (
                              <>
                                <div className="form-section" style={{ marginTop: 14 }}>Service Job History</div>
                                <div className="scroll-x">
                                  <table>
                                    <thead>
                                      <tr>
                                        <th style={{ width: 60 }}>SN</th>
                                        <th>Job Name</th>
                                        <th>Specification</th>
                                        <th style={{ width: 220 }}>Qty</th>
                                        <th>Reason</th>
                                        <th style={{ width: 140 }}>Date</th>
                                        <th style={{ width: 160 }}>Done By</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filledJobs.map((row, idx) => (
                                        <tr key={idx}>
                                          <td style={{ fontFamily: "var(--mono)", color: "var(--text3)" }}>
                                            {idx + 1}
                                          </td>
                                          <td>{row.jobName || "—"}</td>
                                          <td>
                                            {(() => {
                                              const spec = String(row.specification || "").trim();
                                              if (spec) return spec;
                                              const comps = Array.isArray(row.componentsUsed)
                                                ? row.componentsUsed
                                                    .map((c) => String(c?.name || "").trim())
                                                    .filter(Boolean)
                                                : [];
                                              return comps.length ? comps.join(", ") : "—";
                                            })()}
                                          </td>
                                          <td style={{ fontFamily: "var(--mono)", whiteSpace: "pre", lineHeight: 1.35 }}>
                                            {(() => {
                                              if (row.qty !== "" && row.qty != null) return String(row.qty);
                                              const comps = Array.isArray(row.componentsUsed)
                                                ? row.componentsUsed
                                                    .map((c) => {
                                                      const name = String(c?.name || "").trim();
                                                      const qty =
                                                        c?.qty === "" || c?.qty == null
                                                          ? ""
                                                          : Number.isFinite(Number(c.qty))
                                                            ? String(Number(c.qty))
                                                            : "";
                                                      if (!name) return "";
                                                      return qty ? `${name} = ${qty}` : name;
                                                    })
                                                    .filter(Boolean)
                                                : [];
                                              return comps.length ? comps.join("\n") : "—";
                                            })()}
                                          </td>
                                          <td>{row.reason || "—"}</td>
                                          <td style={{ fontFamily: "var(--mono)" }}>
                                            {row.date || jobCard.engineerFinalizedAt || jobCard.checkedByDate || "—"}
                                          </td>
                                          <td>{row.doneBy || doneByFallback || "—"}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </>
                            ) : null}

                            {filledFinal.length ? (
                              <>
                                <div className="form-section" style={{ marginTop: 14 }}>Final Testing</div>
                                <div className="scroll-x">
                                  <table>
                                    <thead>
                                      <tr>
                                        <th style={{ width: 60 }}>Sr</th>
                                        <th>Activity</th>
                                        <th style={{ width: 110, textAlign: "center" }}>Result</th>
                                        <th style={{ width: 320 }}>Remarks</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filledFinal.map((row, idx) => (
                                        <tr key={row.sr || idx}>
                                          <td style={{ fontFamily: "var(--mono)", color: "var(--text3)" }}>
                                            {row.sr}
                                          </td>
                                          <td>{row.activity}</td>
                                          <td style={{ textAlign: "center" }}>
                                            {String(row.result || "").toUpperCase() === "YES" ? (
                                              <span className="tag" style={{ background: "rgba(22,163,74,0.12)", borderColor: "rgba(22,163,74,0.25)" }}>
                                                YES
                                              </span>
                                            ) : String(row.result || "").toUpperCase() === "NO" ? (
                                              <span className="tag" style={{ background: "rgba(192,57,43,0.12)", borderColor: "rgba(192,57,43,0.25)" }}>
                                                NO
                                              </span>
                                            ) : (
                                              "—"
                                            )}
                                          </td>
                                          <td>{row.remarks || "—"}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </>
                            ) : null}

                            {hasFinal ? (
                              <>
                                <div className="form-section" style={{ marginTop: 14 }}>Final Status</div>
                                <div className="detail-grid" style={{ marginBottom: 10 }}>
                                  {finalStatus ? (
                                    <div className="detail-card">
                                      <div className="detail-label">Final Status</div>
                                      <div className="detail-value" style={{ fontFamily: "var(--mono)" }}>
                                        {finalStatus}
                                      </div>
                                    </div>
                                  ) : null}
                                  {finalCheckedByName ? (
                                    <div className="detail-card">
                                      <div className="detail-label">Checked By</div>
                                      <div className="detail-value">{finalCheckedByName}</div>
                                    </div>
                                  ) : null}
                                  {finalCheckedByDate ? (
                                    <div className="detail-card">
                                      <div className="detail-label">Checked Date</div>
                                      <div className="detail-value" style={{ fontFamily: "var(--mono)" }}>
                                        {finalCheckedByDate}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                                {finalRemarks ? (
                                  <div style={{ marginBottom: 10 }}>
                                    <div className="detail-label">Final Remarks</div>
                                    <div
                                      style={{
                                        marginTop: 6,
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: "1px solid var(--border)",
                                        background: "var(--bg2)",
                                        fontSize: 13,
                                        color: "var(--text2)",
                                        whiteSpace: "pre-wrap",
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {finalRemarks}
                                    </div>
                                  </div>
                                ) : null}
                              </>
                            ) : null}
                          </>
                        );
                      })()}
                    </>
                  )}
              </>
              )
            )}
          </div>
        </div>
      )}

      {activeTab === "logistics" && (
        <div className="table-card">
          <div
            className="table-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div className="table-title">Logistics</div>
            {canEditLogistics && logisticsStage !== "under_dispatch" ? (
              <button
                className="btn btn-accent btn-sm"
                disabled={
                  logisticsSaving ||
                  (logisticsStage === "pickup"
                    ? !pickupDate.trim()
                    : !dispatchDate.trim() ||
                      (ticket.status !== "UNDER_DISPATCH" && ticket.status !== "DISPATCHED"))
                }
                onClick={() => {
                  if (
                    logisticsStage === "dispatch" &&
                    ticket.status !== "UNDER_DISPATCH" &&
                    ticket.status !== "DISPATCHED"
                  ) {
                    setLogisticsError("Please complete Under Dispatch first, then schedule Dispatch.");
                    return;
                  }
                  setLogisticsSaving(true);
                  setLogisticsError("");
                  setLogisticsSavedMsg("");

                  const save =
                    logisticsStage === "pickup"
                      ? apiSchedulePickup({
                          ticketId: ticket.id,
                          pickupDate,
                          courierName,
                          lrNumber,
                          pickupLocation,
                        })
                      : apiScheduleDispatch({
                          ticketId: ticket.id,
                          dispatchDate,
                          courierName: dispatchCourierName,
                          lrNumber: dispatchLrNumber,
                          dispatchLocation,
                        });

                  Promise.resolve(save)
	                    .then(() => Promise.all([apiTicketGet(ticket.id), apiLogisticsByTicket(ticket.id)]))
	                    .then(([fresh, rows]) => {
	                      onTicketUpdated(fresh);
	                      if (fresh.status && fresh.status !== ticket.status) {
	                        offerWhatsAppShare(fresh.status, fresh);
	                      }
	                      const pickup =
	                        rows.find((r) => String(r?.type || "").toUpperCase() === "PICKUP") || null;
	                      const dispatch =
	                        rows.find((r) => String(r?.type || "").toUpperCase() === "DELIVERY") || null;
                      setPickupLogistics(pickup);
                      setDispatchLogistics(dispatch);
                      setPickupDocuments(
                        Array.isArray(pickup?.documents)
                          ? pickup.documents.map((x) => String(x || "")).filter(Boolean)
                          : [],
                      );

                      if (logisticsStage === "pickup") {
                        const pickupDateSaved =
                          toDateInputValueSafe(pickup?.pickupDetails?.scheduledDate) || pickupDate;
                        const courierSaved = String(pickup?.courierDetails?.courierName || courierName);
                        const lrSaved = String(pickup?.courierDetails?.lrNumber || lrNumber);
                        const pickupLocSaved = String(pickup?.pickupDetails?.pickupLocation || pickupLocation);
                        setPickupDate(pickupDateSaved);
                        setCourierName(courierSaved);
                        setLrNumber(lrSaved);
                        setPickupLocation(pickupLocSaved);
                        setPickupBaseline({
                          pickupDate: pickupDateSaved,
                          courierName: courierSaved,
                          lrNumber: lrSaved,
                          pickupLocation: pickupLocSaved,
                        });
                        setPickupAdvanceUnlocked(true);
                      }
                      if (logisticsStage === "dispatch") {
                        const dispatchDateSaved =
                          toDateInputValueSafe(dispatch?.pickupDetails?.scheduledDate) || dispatchDate;
                        const courierSaved = String(
                          dispatch?.courierDetails?.courierName || dispatchCourierName,
                        );
                        const lrSaved = String(dispatch?.courierDetails?.lrNumber || dispatchLrNumber);
                        const dispatchLocSaved = String(
                          dispatch?.pickupDetails?.pickupLocation || dispatchLocation,
                        );
                        const invoiceSaved = Boolean(dispatch?.billing?.invoiceGenerated);
                        const paymentSaved = Boolean(dispatch?.billing?.paymentDone);

                        setDispatchDate(dispatchDateSaved);
                        setDispatchCourierName(courierSaved);
                        setDispatchLrNumber(lrSaved);
                        setDispatchLocation(dispatchLocSaved);
                        setDispatchInvoiceGenerated(invoiceSaved);
                        setDispatchPaymentDone(paymentSaved);
                        setDispatchBaseline({
                          dispatchDate: dispatchDateSaved,
                          dispatchCourierName: courierSaved,
                          dispatchLrNumber: lrSaved,
                          dispatchLocation: dispatchLocSaved,
                        });
                        setDispatchBillingBaseline({
                          invoiceGenerated: invoiceSaved,
                          paymentDone: paymentSaved,
                        });
                        setDispatchAdvanceUnlocked(true);
                      }

                      setLogisticsSavedMsg(
                        logisticsStage === "pickup" ? "Pickup saved." : "Dispatch saved.",
                      );
                    })
                    .catch((e) =>
                      setLogisticsError(
                        e instanceof Error ? e.message : "Failed to update logistics",
                      ),
                    )
                    .finally(() => setLogisticsSaving(false));
                }}
              >
                {logisticsSaving ? "Saving..." : logisticsStage === "pickup" ? "Save Pickup" : "Save Dispatch"}
              </button>
            ) : null}
          </div>

          <div style={{ padding: "20px" }}>
            <div className="tabs" style={{ marginBottom: 14 }}>
              <div
                className={`tab ${logisticsStage === "pickup" ? "active" : ""}`}
                onClick={() => setLogisticsStage("pickup")}
              >
                Pickup Scheduled
              </div>
              {canEditLogistics ? (
                <div
                  className={`tab ${logisticsStage === "under_dispatch" ? "active" : ""}`}
                  onClick={() => setLogisticsStage("under_dispatch")}
                >
                  Under Dispatch
                </div>
              ) : null}
              {canSeeDispatchStage ? (
                <div
                  className={`tab ${logisticsStage === "dispatch" ? "active" : ""}`}
                  onClick={() => {
                    if (canEditLogistics && ticket.status === "UNDER_REPAIRED") {
                      setLogisticsStage("under_dispatch");
                      setLogisticsError("Please complete Under Dispatch first, then schedule Dispatch.");
                      return;
                    }
                    setLogisticsStage("dispatch");
                  }}
                >
                  Dispatch
                </div>
              ) : null}
            </div>

            {logisticsLoading ? (
              <div style={{ marginBottom: 12, fontSize: 12, color: "var(--text3)" }}>
                Loading logistics…
              </div>
            ) : null}

            {logisticsError ? (
              <div className="form-error" style={{ marginBottom: 12, marginTop: -6 }}>
                {logisticsError}
              </div>
            ) : null}
            {logisticsSavedMsg ? (
              <div style={{ marginBottom: 12, fontSize: 12, color: "var(--green)" }}>
                {logisticsSavedMsg}
              </div>
            ) : null}

            {logisticsStage === "pickup" ? (
              <>
                <div className="detail-grid">
                  <div className="detail-card">
                    <div className="detail-label">Pickup Date</div>
                    <DatePicker
                      value={pickupDate}
                      onChange={setPickupDate}
                      disabled={!canEditLogistics}
                      placeholder="Select pickup date"
                    />
                  </div>
                  <div className="detail-card">
                    <div className="detail-label">Pickup Location</div>
                    <input
                      className="form-input"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      disabled={!canEditLogistics}
                      placeholder="Customer site / warehouse"
                    />
                  </div>
                  <div className="detail-card">
                    <div className="detail-label">Courier</div>
                    <input
                      className="form-input"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      disabled={!canEditLogistics}
                      placeholder="e.g. BlueDart"
                    />
                  </div>
                  <div className="detail-card">
                    <div className="detail-label">LR Number</div>
                    <input
                      className="form-input"
                      value={lrNumber}
                      onChange={(e) => setLrNumber(e.target.value)}
                      disabled={!canEditLogistics}
                      placeholder="e.g. BD2026..."
                      style={{ fontFamily: "var(--mono)" }}
                    />
                  </div>
                </div>

                {canUploadPickupDocs ? (
                  <div className="table-card" style={{ marginTop: 14 }}>
                    <div className="table-header">
                      <div className="table-title">Pickup Documents</div>
                    </div>
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <input
                          className="form-input"
                          type="file"
                          accept="application/pdf,image/*"
                          disabled={pickupDocUploading}
                          onChange={(e) => {
                            setPickupDocError("");
                            const f = e.target.files?.[0] || null;
                            if (f && f.size > 2 * 1024 * 1024) {
                              setPickupDocFile(null);
                              setPickupDocError("File too large. Max 2MB.");
                              e.target.value = "";
                              return;
                            }
                            setPickupDocFile(f);
                          }}
                        />
                        <div style={{ fontSize: 12, color: "var(--text3)" }}>PDF/Image up to 2MB</div>
                        <button
                          className="btn btn-ghost btn-sm"
                          type="button"
                          disabled={!pickupDocFile || pickupDocUploading}
                          onClick={() => {
                            if (!pickupDocFile) return;
                            setPickupDocUploading(true);
                            setPickupDocError("");
                            apiTicketPickupDocumentUpload(ticket.id, pickupDocFile)
                              .then((r) => {
                                setPickupDocuments(r.documents || []);
                                setPickupDocFile(null);
                                setLogisticsSavedMsg("Document uploaded.");
                              })
                              .catch((e) =>
                                setPickupDocError(
                                  e instanceof Error ? e.message : "Upload failed",
                                ),
                              )
                              .finally(() => setPickupDocUploading(false));
                          }}
                        >
                          {pickupDocUploading ? "Uploading..." : "Upload"}
                        </button>
                      </div>
                      {pickupDocError ? (
                        <div className="form-error" style={{ marginTop: 10 }}>
                          {pickupDocError}
                        </div>
                      ) : null}
                      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                        {pickupDocuments.length ? (
                          pickupDocuments.map(renderPickupDocumentCard)
                        ) : (
                          <div style={{ fontSize: 12, color: "var(--text3)" }}>No documents uploaded yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {canEditLogistics ? (
                  <div style={{ marginTop: 18 }}>
                    <div
                      style={{
                        marginTop: 0,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>
                        {canAdvanceToInTransit ? (
                          <>
                            You can move the ticket to <span className="tag">IN TRANSIT</span>.
                          </>
                        ) : (
                          <>Save details to go to next step.</>
                        )}
                      </div>
                      {pickupAdvanceUnlocked ? (
                        <button
                          className="btn btn-accent btn-sm"
	                          disabled={logisticsAdvancing || !canAdvanceToInTransit}
	                          onClick={() => {
	                            setLogisticsAdvancing(true);
	                            updateStatusAndShare("IN_TRANSIT")
	                              .then(() => {
	                                setActiveTab("overview");
	                              })
	                              .catch(() => {})
	                              .finally(() => setLogisticsAdvancing(false));
	                          }}
                        >
                          {logisticsAdvancing ? "Updating..." : "Next → In Transit"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 16, fontSize: 12, color: "var(--text3)" }}>
                    You don&apos;t have permission to edit logistics.
                  </div>
                )}
              </>
            ) : logisticsStage === "under_dispatch" ? (
              <>
                {canEditLogistics ? (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--bg2)",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--text1)" }}>
                      Under Dispatch (Billing Review)
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10, lineHeight: 1.5 }}>
                      Only billing is required here.
                      {ticket.status === "UNDER_REPAIRED" ? (
                        <> Saving will move the ticket to <span className="tag">UNDER DISPATCH</span>.</>
                      ) : null}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={dispatchInvoiceGenerated}
                          disabled={underDispatchSaving}
                          onChange={(e) => setDispatchInvoiceGenerated(e.target.checked)}
                        />
                        Invoice generated
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={dispatchPaymentDone}
                          disabled={underDispatchSaving}
                          onChange={(e) => setDispatchPaymentDone(e.target.checked)}
                        />
                        Payment done
                      </label>
                      <button
                        className="btn btn-accent btn-sm"
                        type="button"
                        disabled={underDispatchSaving || !dispatchBillingDirty}
                        onClick={() => {
                          setUnderDispatchSaving(true);
                          setDispatchApprovalError("");
                          setLogisticsError("");
                          setLogisticsSavedMsg("");
                          apiUnderDispatchSave({
                            ticketId: ticket.id,
                            invoiceGenerated: dispatchInvoiceGenerated,
                            paymentDone: dispatchPaymentDone,
                          })
	                            .then(() => Promise.all([apiTicketGet(ticket.id), apiLogisticsByTicket(ticket.id)]))
	                            .then(([fresh, rows]) => {
	                              onTicketUpdated(fresh);
	                              if (fresh.status && fresh.status !== ticket.status) {
	                                offerWhatsAppShare(fresh.status, fresh);
	                              }
	                              const dispatch =
	                                rows.find((r) => String(r?.type || "").toUpperCase() === "DELIVERY") || null;
	                              const invoiceSaved = Boolean(dispatch?.billing?.invoiceGenerated);
	                              const paymentSaved = Boolean(dispatch?.billing?.paymentDone);
                              const approved = Boolean(dispatch?.billing?.dispatchApproved);
                              setDispatchInvoiceGenerated(invoiceSaved);
                              setDispatchPaymentDone(paymentSaved);
                              setDispatchBillingBaseline({ invoiceGenerated: invoiceSaved, paymentDone: paymentSaved });
                              setDispatchLogistics(dispatch);
                              if (roleName === "SALES" && !approved) {
                                setLogisticsSavedMsg("Under dispatch saved. Waiting for Admin approval to dispatch.");
                                setLogisticsStage("under_dispatch");
                              } else {
                                setLogisticsSavedMsg("Under dispatch saved.");
                                setLogisticsStage("dispatch");
                              }
                            })
                            .catch((e) =>
                              setLogisticsError(
                                e instanceof Error ? e.message : "Failed to save under-dispatch review",
                              ),
                            )
                            .finally(() => setUnderDispatchSaving(false));
                        }}
                      >
                        {underDispatchSaving ? "Saving..." : "Save Under Dispatch"}
                      </button>
                    </div>

                    <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                      <span className="tag">
                        Admin Approval:{" "}
                        {Boolean(dispatchLogistics?.billing?.dispatchApproved)
                          ? "APPROVED"
                          : dispatchLogistics?.billing?.dispatchApprovalRequestedAt
                            ? "PENDING"
                            : "—"}
                      </span>
                      {roleName === "SALES" && !dispatchApprovedForSales ? (
                        <div style={{ fontSize: 12, color: "var(--text3)" }}>
                          Dispatch will be available after Admin approval.
                        </div>
                      ) : null}
                      {roleName === "ADMIN" && !Boolean(dispatchLogistics?.billing?.dispatchApproved) ? (
                        <button
                          className="btn btn-ghost btn-sm"
                          type="button"
                          disabled={dispatchApprovalSaving}
                          onClick={() => {
                            setDispatchApprovalSaving(true);
                            setDispatchApprovalError("");
                            setLogisticsSavedMsg("");
                            apiDispatchApprove(ticket.id)
                              .then(() => apiLogisticsByTicket(ticket.id))
                              .then((rows) => {
                                const dispatch =
                                  rows.find((r) => String(r?.type || "").toUpperCase() === "DELIVERY") || null;
                                setDispatchLogistics(dispatch);
                                setLogisticsSavedMsg("Dispatch approved.");
                              })
                              .catch((e) =>
                                setDispatchApprovalError(
                                  e instanceof Error ? e.message : "Failed to approve dispatch",
                                ),
                              )
                              .finally(() => setDispatchApprovalSaving(false));
                          }}
                        >
                          {dispatchApprovalSaving ? "Approving..." : "Approve Dispatch"}
                        </button>
                      ) : null}
                    </div>
                    {dispatchApprovalError ? (
                      <div className="form-error" style={{ marginTop: 10 }}>
                        {dispatchApprovalError}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div style={{ marginTop: 16, fontSize: 12, color: "var(--text3)" }}>
                    You don&apos;t have permission to edit logistics.
                  </div>
                )}
              </>
            ) : (
              <>
                {roleName === "SALES" && Boolean(dispatchLogistics?.billing?.dispatchApproved) ? (
                  <div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                    <span className="tag">Admin Approval: APPROVED</span>
                  </div>
                ) : null}
                <div className="detail-grid">
                  <div className="detail-card">
                    <div className="detail-label">Dispatch Date</div>
                    <DatePicker
                      value={dispatchDate}
                      onChange={setDispatchDate}
                      disabled={!canEditLogistics}
                      placeholder="Select dispatch date"
                    />
                  </div>
                  <div className="detail-card">
                    <div className="detail-label">Dispatch Location</div>
                    <input
                      className="form-input"
                      value={dispatchLocation}
                      onChange={(e) => setDispatchLocation(e.target.value)}
                      disabled={!canEditLogistics}
                      placeholder="Warehouse / service center"
                    />
                  </div>
                  <div className="detail-card">
                    <div className="detail-label">Courier</div>
                    <input
                      className="form-input"
                      value={dispatchCourierName}
                      onChange={(e) => setDispatchCourierName(e.target.value)}
                      disabled={!canEditLogistics}
                      placeholder="e.g. BlueDart"
                    />
                  </div>
                  <div className="detail-card">
                    <div className="detail-label">LR Number</div>
                    <input
                      className="form-input"
                      value={dispatchLrNumber}
                      onChange={(e) => setDispatchLrNumber(e.target.value)}
                      disabled={!canEditLogistics}
                      placeholder="e.g. BD2026..."
                      style={{ fontFamily: "var(--mono)" }}
                    />
                  </div>
                </div>

                {canEditLogistics ? (
                  <div style={{ marginTop: 18 }}>
                    <div
                      style={{
                        marginTop: 0,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
	                      <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>
	                        {ticket.status === "DISPATCHED" && canAdvanceToInstallationDone ? (
	                          <>
	                            Next step is <span className="tag">INSTALLATION DONE</span>. Upload the installation PDF
	                            from <span className="tag">OVERVIEW</span> first.
	                          </>
	                        ) : ticket.status === "INSTALLATION_DONE" && canAdvanceToClosed ? (
	                          <>
	                            You can move the ticket to <span className="tag">CLOSED</span>.
	                          </>
                        ) : (
                          <>Save dispatch to go to next step.</>
                        )}
                      </div>
                      {dispatchAdvanceUnlocked && (ticket.status === "DISPATCHED" || ticket.status === "INSTALLATION_DONE") ? (
                        <button
                          className="btn btn-accent btn-sm"
		                          disabled={
                              logisticsAdvancing ||
                              (ticket.status === "DISPATCHED"
                                ? !canAdvanceToInstallationDone
                                : ticket.status === "INSTALLATION_DONE"
                                  ? !canAdvanceToClosed
                                  : true)
                            }
		                          onClick={() => {
		                            if (ticket.status === "DISPATCHED") {
		                              redirectToInstallationOverview();
		                              return;
		                            }
		                            setLogisticsAdvancing(true);
		                            updateStatusAndShare("CLOSED")
		                              .catch(() => {})
		                              .finally(() => setLogisticsAdvancing(false));
		                          }}
                        >
                          {logisticsAdvancing
                            ? "Updating..."
                            : ticket.status === "DISPATCHED"
                              ? "Next → Installation Done"
                              : "Next → Closed"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 16, fontSize: 12, color: "var(--text3)" }}>
                    You don&apos;t have permission to edit logistics.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "sla" && (
        <div className="table-card">
          <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="table-title">SLA Monitoring</div>
            {canEditSla ? (
              <button className="btn btn-ghost btn-sm" onClick={() => setShowSlaSettings((v) => !v)}>
                {showSlaSettings ? "Hide SLA Settings" : "Edit SLA Settings"}
              </button>
            ) : null}
          </div>
          <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: 20 }}>
              <SlaBadge status={ticket.slaStatus} />
            </div>

            {canEditSla && showSlaSettings ? (
              <div className="table-card" style={{ marginBottom: 16 }}>
                <div className="table-header">
                  <div className="table-title">SLA Configuration</div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  {slaError ? (
                    <div className="form-error" style={{ marginBottom: 12, marginTop: -6 }}>
                      {slaError}
                    </div>
                  ) : null}
                  <div className="form-grid">
                    {[
                      { label: "Critical Priority SLA", value: critical, onChange: setCritical },
                      { label: "High Priority SLA", value: high, onChange: setHigh },
                      { label: "Normal Priority SLA", value: normal, onChange: setNormal },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="form-label">{item.label}</div>
                        <input
                          className="form-input"
                          value={item.value}
                          onChange={(e) => item.onChange(e.target.value)}
                          disabled={slaLoading || slaSaving}
                          inputMode="numeric"
                          style={{ fontFamily: "var(--mono)" }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                    <button
                      className="btn btn-accent btn-sm"
                      disabled={slaLoading || slaSaving || !parsedSla.ok}
                      onClick={() => {
                        if (!parsedSla.ok) {
                          setSlaError("Please enter valid hours like 24h, 48h, 72h");
                          return;
                        }
                        const payload = {
                          criticalHours: parsedSla.criticalHours!,
                          highHours: parsedSla.highHours!,
                          normalHours: parsedSla.normalHours!,
                        };
                        setSlaSaving(true);
                        setSlaError("");
                        apiSlaSettingsUpdate(payload)
                          .then((saved) => {
                            setCritical(formatHours(saved.criticalHours));
                            setHigh(formatHours(saved.highHours));
                            setNormal(formatHours(saved.normalHours));
                          })
                          .catch((e) => setSlaError(e instanceof Error ? e.message : "Failed to save SLA settings"))
                          .finally(() => setSlaSaving(false));
                      }}
                    >
                      {slaSaving ? "Saving..." : "Save SLA Settings"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {[
              { label: "Response Time", limit: "24h", taken: "6h", pct: 25, color: "#16a34a" },
              { label: "Pickup Time", limit: "48h", taken: "36h", pct: 75, color: "#d97706" },
              { label: "Diagnosis Time", limit: "24h", taken: "28h", pct: 117, color: "#c0392b" },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontFamily: "var(--mono)", color: item.color }}>
                    {item.taken} / {item.limit}
                  </span>
                </div>
                <div className="sla-bar">
                  <div className="sla-fill" style={{ width: `${Math.min(item.pct, 100)}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {docPreviewUrl ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setDocPreviewUrl(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(980px, 100%)",
              height: "min(80vh, 760px)",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 12, color: "var(--text2)", minWidth: 0, overflow: "hidden" }}>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                  title={docLinkLabel(docPreviewUrl)}
                >
                  {docLinkLabel(docPreviewUrl)}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a className="btn btn-ghost btn-sm" href={docPreviewUrl} target="_blank" rel="noreferrer">
                  Open in new tab
                </a>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setDocPreviewUrl(null)}>
                  Close
                </button>
              </div>
            </div>

            <div style={{ flex: "1 1 auto", background: "var(--bg2)" }}>
              {docPreviewKind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={docPreviewUrl}
                  alt={docLinkLabel(docPreviewUrl)}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : docPreviewKind === "pdf" ? (
                <iframe
                  src={docPreviewUrl}
                  title={docLinkLabel(docPreviewUrl) || "PDF Preview"}
                  style={{ width: "100%", height: "100%", border: 0 }}
                />
              ) : (
                <div style={{ padding: 16, fontSize: 13, color: "var(--text2)" }}>
                  Preview not available for this file type. Use “Open in new tab”.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <WhatsAppShareModal
        open={waOpen && canOfferWhatsAppShare}
        title={waTitle}
        phone={waPhone}
        onPhoneChange={setWaPhone}
        message={waMessage}
        onClose={() => setWaOpen(false)}
      />
    </div>
  );
}
