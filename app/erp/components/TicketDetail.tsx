"use client";

import { useEffect, useMemo, useState } from "react";
import { STATUS_ORDER } from "../constants";
import {
  apiLogisticsByTicket,
  apiSchedulePickup,
  apiScheduleDispatch,
  apiSlaSettingsGet,
  apiSlaSettingsUpdate,
  apiTicketJobCardGet,
  apiTicketJobCardUpdate,
  apiTicketPickupDetailsGet,
  apiTicketPickupDocumentUpload,
  apiTicketGet,
  apiUpdateTicketDetails,
  apiUpdateTicketFaultDescription,
  type BackendLogistics,
} from "../api";
import type {
  JobCard,
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
import TicketTimeline from "./TicketTimeline";

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

function emptyServiceJob(sn: number): JobCardServiceJob {
  return {
    sn,
    jobName: "",
    specification: "",
    qty: "",
    reason: "",
    date: "",
    doneBy: "",
  };
}

function normalizeServiceJobs(jobs: JobCardServiceJob[], minRows = 5): JobCardServiceJob[] {
  const next = (jobs || []).map((j, idx) => ({ ...emptyServiceJob(idx + 1), ...j, sn: idx + 1 }));
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
  initialLogisticsStage?: "pickup" | "dispatch";
}) {
  const roleName = String(user.role || "").toUpperCase();
  const canShowWarranty = roleName !== "CUSTOMER";
  const canUploadPickupDocs = roleName === "ADMIN" || roleName === "SALES";
  const tabs = useMemo(() => {
    if (roleName === "CUSTOMER") return ["overview"] as TicketTab[];
    return [...ALL_TABS] as TicketTab[];
  }, [roleName]);
  const [activeTab, setActiveTab] = useState<TicketTab>(() => {
    const desired = (initialTab || "overview") as TicketTab;
    return tabs.includes(desired) ? desired : "overview";
  });
  const [newStatus, setNewStatus] = useState(ticket.status);
  const [updating, setUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");
  const currentIdx = STATUS_ORDER.indexOf(ticket.status);
  const canSeeStatusUpdate = useMemo(() => {
    if (roleName !== "ADMIN" && roleName !== "ENGINEER" && roleName !== "SALES") return false;
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
  const canEditJobCard = useMemo(
    () => canAccess(roles, user.role, "jobcard", "edit"),
    [roles, user.role],
  );
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
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [detailsSavedMsg, setDetailsSavedMsg] = useState("");

  const [faultDesc, setFaultDesc] = useState(ticket.faultDescription === "—" ? "" : ticket.faultDescription);
  const [faultSaving, setFaultSaving] = useState(false);
  const [faultError, setFaultError] = useState("");
  const [faultSavedMsg, setFaultSavedMsg] = useState("");

  const [pickupDate, setPickupDate] = useState(() =>
    ticket.pickupDate || toDateInputValue(new Date(Date.now() + 86400000)),
  );
  const [courierName, setCourierName] = useState(ticket.courierName || "BlueDart");
  const [lrNumber, setLrNumber] = useState(ticket.lrNumber || "");
  const [pickupLocation, setPickupLocation] = useState(ticket.customerAddress || "");
  const [dispatchDate, setDispatchDate] = useState(() =>
    toDateInputValue(new Date()),
  );
  const [dispatchCourierName, setDispatchCourierName] = useState("BlueDart");
  const [dispatchLrNumber, setDispatchLrNumber] = useState("");
  const [dispatchLocation, setDispatchLocation] = useState("");

  const [logisticsStage, setLogisticsStage] = useState<"pickup" | "dispatch">(() => {
    if (initialLogisticsStage) return initialLogisticsStage;
    return ticket.status === "DISPATCHED" || ticket.status === "CLOSED"
      ? "dispatch"
      : "pickup";
  });

  const [, setPickupLogistics] = useState<BackendLogistics | null>(null);
  const [, setDispatchLogistics] = useState<BackendLogistics | null>(null);
  const [logisticsLoading, setLogisticsLoading] = useState(false);
  const [logisticsSaving, setLogisticsSaving] = useState(false);
  const [logisticsAdvancing, setLogisticsAdvancing] = useState(false);
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

  const [customerPickupLoading, setCustomerPickupLoading] = useState(false);
  const [customerPickupSaving, setCustomerPickupSaving] = useState(false);
  const [customerPickupError, setCustomerPickupError] = useState("");
  const [customerPickupSavedMsg, setCustomerPickupSavedMsg] = useState("");
  const [pickupDocuments, setPickupDocuments] = useState<string[]>([]);
  const [pickupDocFile, setPickupDocFile] = useState<File | null>(null);
  const [pickupDocUploading, setPickupDocUploading] = useState(false);
  const [pickupDocError, setPickupDocError] = useState("");

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
        setJobCard({
          ...jc,
          serviceJobs: normalizeServiceJobs(jc.serviceJobs || []),
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
  }, [activeTab, ticket.id]);

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
          pickupDateFromApi || toDateInputValue(new Date(Date.now() + 86400000));
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
        setDispatchDate(dispatchDateFromApi || toDateInputValue(new Date()));
        setDispatchCourierName(String(dispatch?.courierDetails?.courierName || "BlueDart"));
        setDispatchLrNumber(String(dispatch?.courierDetails?.lrNumber || ""));
        setDispatchLocation(
          String(dispatch?.pickupDetails?.pickupLocation || ""),
        );
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
  }, [activeTab, ticket.id, ticket.customerAddress]);

  useEffect(() => {
    queueMicrotask(() => setNewStatus(ticket.status));
  }, [ticket.status]);

  useEffect(() => {
    queueMicrotask(() => {
      const desired = (initialTab || "overview") as TicketTab;
      setActiveTab(tabs.includes(desired) ? desired : "overview");
    });
    queueMicrotask(() => setLogisticsStage(initialLogisticsStage || "pickup"));
  }, [ticket.id, initialTab, initialLogisticsStage, tabs]);

  useEffect(() => {
    if (roleName !== "CUSTOMER") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setCustomerPickupLoading(true);
      setCustomerPickupError("");
      setCustomerPickupSavedMsg("");
    });
    apiTicketPickupDetailsGet(ticket.id)
      .then((data) => {
        if (cancelled) return;
        setPickupDate(data.pickupDate || toDateInputValue(new Date(Date.now() + 86400000)));
        setPickupLocation(String(data.pickupLocation || ticket.customerAddress || ""));
        setPickupDocuments(data.documents || []);
      })
      .catch((e) => {
        if (cancelled) return;
        setCustomerPickupError(
          e instanceof Error ? e.message : "Failed to load pickup details",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setCustomerPickupLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roleName, ticket.id, ticket.customerAddress]);

  const pickupDirty = useMemo(() => {
    if (!pickupBaseline) return true;
    return (
      pickupBaseline.pickupDate !== pickupDate ||
      pickupBaseline.courierName !== courierName ||
      pickupBaseline.lrNumber !== lrNumber ||
      pickupBaseline.pickupLocation !== pickupLocation
    );
  }, [pickupBaseline, pickupDate, courierName, lrNumber, pickupLocation]);

  const canAdvanceToInTransit =
    canEditLogistics &&
    ticket.status === "PICKUP_SCHEDULED" &&
    Boolean(pickupBaseline) &&
    pickupAdvanceUnlocked &&
    !pickupDirty;

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
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
            <SlaBadge status={ticket.slaStatus} />
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 3 }}>
            {ticket.customer} · {ticket.inverterMake} {ticket.inverterModel} ({ticket.capacity})
          </div>
        </div>
      </div>

      <TicketTimeline currentStatus={ticket.status} />

      {canSeeStatusUpdate && (
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

                const openLogistics = (stage: "pickup" | "dispatch", msg?: string) => {
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

                  if (newStatus === "DISPATCHED") {
                    openLogistics(
                      "dispatch",
                      "Please open Logistics and save dispatch details first (Save Dispatch).",
                    );
                    return;
                  }

                  if (newStatus === "IN_TRANSIT") {
                    openLogistics(
                      "pickup",
                      "Please open Logistics first, then move the ticket to IN TRANSIT from there.",
                    );
                    return;
                  }

                  await onUpdateStatus(newStatus);
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
                  <Badge
                    label={ticket.warrantyStatus ? "In Warranty" : "Out of Warranty"}
                    color={ticket.warrantyStatus ? "#16a34a" : "#c0392b"}
                  />
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
                      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                        {pickupDocuments.length ? (
                          pickupDocuments.map((u) => (
                            <a
                              key={u}
                              href={u}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "var(--blue)", fontSize: 12 }}
                            >
                              {u.split("/").slice(-1)[0]}
                            </a>
                          ))
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
                      onChange={(e) => setDetails((p) => ({ ...p, inverterMake: e.target.value }))}
                    />
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
              <>
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
                    onClick={() => {
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
                          reason: r.reason.trim(),
                          doneBy: r.doneBy.trim(),
                        }))
                        .filter((r) => {
                          const hasText =
                            r.jobName ||
                            r.specification ||
                            r.reason ||
                            r.doneBy ||
                            r.date;
                          const hasQty = r.qty !== "" && Number.isFinite(Number(r.qty));
                          return Boolean(hasText || hasQty);
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
                        .then((saved) => {
                          setJobCard({
                            ...saved,
                            serviceJobs: normalizeServiceJobs(saved.serviceJobs || []),
                            finalTestingActivities: normalizeFinalTesting(saved.finalTestingActivities),
                          });
                          setJobSavedMsg("Saved!");
                        })
                        .catch((e) =>
                          setJobError(e instanceof Error ? e.message : "Failed to save job card"),
                        )
                        .finally(() => setJobSaving(false));
                    }}
                  >
                    {jobSaving ? "Saving..." : "Save Job Card"}
                  </button>
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
            {canEditLogistics ? (
              <button
                className="btn btn-accent btn-sm"
                disabled={
                  logisticsSaving ||
                  (logisticsStage === "pickup"
                    ? !pickupDate.trim()
                    : !dispatchDate.trim())
                }
                onClick={() => {
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
              <div
                className={`tab ${logisticsStage === "dispatch" ? "active" : ""}`}
                onClick={() => setLogisticsStage("dispatch")}
              >
                Dispatch
              </div>
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
                            setPickupDocFile(f);
                          }}
                        />
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
                      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                        {pickupDocuments.length ? (
                          pickupDocuments.map((u) => (
                            <a
                              key={u}
                              href={u}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "var(--blue)", fontSize: 12 }}
                            >
                              {u.split("/").slice(-1)[0]}
                            </a>
                          ))
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
                            onUpdateStatus("IN_TRANSIT")
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
            ) : (
              <>
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
                        After saving dispatch, you can move the ticket to{" "}
                        <span className="tag">CLOSED</span>.
                      </div>
                      <button
                        className="btn btn-accent btn-sm"
                        disabled={
                          logisticsAdvancing ||
                          ticket.status !== "DISPATCHED"
                        }
                        onClick={() => {
                          setLogisticsAdvancing(true);
                          onUpdateStatus("CLOSED")
                            .catch(() => {})
                            .finally(() => setLogisticsAdvancing(false));
                        }}
                      >
                        {logisticsAdvancing ? "Updating..." : "Next → Closed"}
                      </button>
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
    </div>
  );
}
