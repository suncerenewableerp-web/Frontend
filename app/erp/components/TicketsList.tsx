"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { STATUS_ORDER } from "../constants";
import type { RoleDefinition, Ticket, TicketStatus, User } from "../types";
import { canAccess, formatTicketStatusLabel } from "../utils";
import { EngineerOutcomeBadge, StatusBadge } from "./Badges";
import { LuDownload, LuSearch, LuTicket, LuTrash2 } from "react-icons/lu";
import {
  apiApprovedDispatchApprovalsList,
  apiJobCardsList,
  apiPendingDispatchApprovalsList,
  apiTicketDelete,
  type JobCardListRow,
} from "../api";
import DeleteTicketModal from "./DeleteTicketModal";

const INWARD_STATUSES: TicketStatus[] = ["CREATED", "PICKUP_SCHEDULED", "IN_TRANSIT"];
const OUTWARD_STATUSES: TicketStatus[] = ["UNDER_DISPATCH", "DISPATCHED", "INSTALLATION_DONE"];

function includesStatus(haystack: TicketStatus[], needle: string): needle is TicketStatus {
  return (haystack as readonly string[]).includes(String(needle || "").toUpperCase());
}

type DateFilter = "ALL" | "YESTERDAY" | "WEEK" | "MONTH" | "YEAR";
type ClosedYearFilter = "ALL" | string;

function toLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isOnsiteTicket(t: Ticket): boolean {
  return String(t.serviceType || "")
    .trim()
    .toUpperCase() === "ONSITE";
}

function parseLocalDateOnly(yyyyMmDd: string): Date | null {
  const raw = String(yyyyMmDd || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [y, m, day] = raw.split("-").map((x) => Number(x));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(day)) return null;
  const d = new Date(y, m - 1, day);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function startOfWeekMonday(d: Date) {
  const dd = toLocalMidnight(d);
  const dow = dd.getDay(); // 0=Sun
  const daysSinceMonday = (dow + 6) % 7; // Mon=0 ... Sun=6
  dd.setDate(dd.getDate() - daysSinceMonday);
  return dd;
}

function matchesDateFilter(createdAtYmd: string, filter: DateFilter, now = new Date()): boolean {
  if (filter === "ALL") return true;
  const created = parseLocalDateOnly(createdAtYmd);
  if (!created) return false;

  const createdMid = toLocalMidnight(created);
  const todayMid = toLocalMidnight(now);

  if (filter === "YESTERDAY") {
    const y = new Date(todayMid);
    y.setDate(y.getDate() - 1);
    return createdMid.getTime() === y.getTime();
  }

  if (filter === "WEEK") {
    return createdMid.getTime() >= startOfWeekMonday(todayMid).getTime();
  }

  if (filter === "MONTH") {
    const start = new Date(todayMid.getFullYear(), todayMid.getMonth(), 1);
    return createdMid.getTime() >= start.getTime();
  }

  if (filter === "YEAR") {
    const start = new Date(todayMid.getFullYear(), 0, 1);
    return createdMid.getTime() >= start.getTime();
  }

  return true;
}

function ticketYear(createdAtYmd: string): string {
  const raw = String(createdAtYmd || "").trim();
  const match = raw.match(/^(\d{4})/);
  return match ? match[1] : "";
}

function escapeHtmlCell(input: unknown): string {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function downloadTicketsAsExcel(tickets: Ticket[], filenameBase: string) {
  const headers = [
    "Ticket ID",
    "Status",
    "Customer",
    "Sales Owner",
    "Service Type",
    "Engineer",
    "Visit Date",
    "Remark",
    "Inverter Make",
    "Inverter Model",
    "Capacity",
    "Serial No",
    "Fault",
    "Error Code",
    "Created",
  ];

  const bodyRows = (tickets || []).map((t) => [
    t.ticketId,
    t.status,
    t.customer,
    t.salesAssigneeName || t.salesAssigneeEmail || "",
    t.serviceType || "",
    t.onsiteEngineerName || (t.assignedEngineer && t.assignedEngineer !== "-" ? t.assignedEngineer : ""),
    t.onsiteVisitDate || t.onsiteMarkedRepairedAt || "",
    t.onsiteRemark || "",
    t.inverterMake,
    t.inverterModel,
    t.capacity,
    t.serialNumber,
    t.faultDescription,
    t.errorCode,
    t.createdAt,
  ]);

  const table = `<table border="1"><thead><tr>${headers
    .map((h) => `<th>${escapeHtmlCell(h)}</th>`)
    .join("")}</tr></thead><tbody>${bodyRows
    .map((r) => `<tr>${r.map((c) => `<td>${escapeHtmlCell(c)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;

  const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body>${table}</body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${filenameBase}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function TicketsList({
  user,
  roles,
  tickets,
  loadError,
  initialStatusFilter,
  initialPriorityFilter,
  initialTabOverride,
  onView,
  onNew,
  onBack,
  onTicketDeleted,
  onNotify,
}: {
  user: User;
  roles: RoleDefinition[];
  tickets: Ticket[];
  loadError?: string;
  initialStatusFilter?: string;
  initialPriorityFilter?: string;
  initialTabOverride?:
    | "open"
    | "all"
    | "inward"
    | "repaired"
    | "offline_booking"
    | "outward"
    | "approval_pending"
    | "approved_by_admin"
    | "closed";
  onView: (
    t: Ticket,
    opts?: {
      tab?: "overview" | "jobcard" | "logistics" | "sla";
      logisticsStage?: "pickup" | "under_dispatch" | "dispatch";
      notify?: string;
    },
  ) => void;
  onNew: () => void;
  onBack?: () => void;
  onTicketDeleted?: (ticketDbId: string) => void;
  onNotify?: (msg: string) => void;
}) {
  const roleNorm = String(user.role || "").trim().toUpperCase();
  const isEngineer = roleNorm === "ENGINEER";
  const isAdmin = roleNorm === "ADMIN";
  const isSales = roleNorm === "SALES";
  const isCustomer = roleNorm === "CUSTOMER";
  const canSeeSerialNumber = !isCustomer;
  const canSeeSalesOwner = !isCustomer && (isSales || isAdmin);
  const canSeeAllTab = (isAdmin || isSales) && !isEngineer;
  const canExport = (isAdmin || isSales) && canAccess(roles, user.role, "tickets", "view");
  const normalizedInitialStatus = String(initialStatusFilter || "").toUpperCase().trim();

  const derivedInitialTab:
    | "open"
    | "all"
    | "inward"
    | "repaired"
    | "offline_booking"
    | "approved_by_admin"
    | "outward"
    | "approval_pending"
    | "closed" =
    isCustomer
      ? normalizedInitialStatus === "CLOSED"
        ? "closed"
        : "open"
      : isEngineer
      ? "repaired"
      : canSeeAllTab && !normalizedInitialStatus
        ? "all"
      : normalizedInitialStatus === "APPROVAL_PENDING"
        ? "approval_pending"
      : normalizedInitialStatus === "APPROVED_BY_ADMIN"
        ? "approved_by_admin"
      : normalizedInitialStatus === "CLOSED"
        ? "closed"
      : normalizedInitialStatus === "UNDER_REPAIRED"
          ? "repaired"
          : includesStatus(OUTWARD_STATUSES, normalizedInitialStatus)
            ? "outward"
            : "inward";

  const initialTab =
    isCustomer && initialTabOverride && initialTabOverride !== "open" && initialTabOverride !== "closed"
      ? derivedInitialTab
      : (initialTabOverride as typeof derivedInitialTab | undefined) || derivedInitialTab;

  const safeInitialStatusFilter =
    isEngineer
      ? "ALL"
      : normalizedInitialStatus &&
          normalizedInitialStatus !== "OPEN" &&
          normalizedInitialStatus !== "APPROVAL_PENDING" &&
          normalizedInitialStatus !== "APPROVED_BY_ADMIN" &&
          normalizedInitialStatus !== "CLOSED"
        ? normalizedInitialStatus
        : "ALL";

  const canLoadJobCards = canAccess(roles, user.role, "jobcard", "view") && roleNorm !== "CUSTOMER";
  const canDeleteTickets = isAdmin && canAccess(roles, user.role, "tickets", "delete");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [ticketsTab, setTicketsTab] = useState<
    | "open"
    | "all"
    | "inward"
    | "repaired"
    | "offline_booking"
    | "outward"
    | "approval_pending"
    | "approved_by_admin"
    | "closed"
  >(initialTab);
  const [repairedTab, setRepairedTab] = useState<"all" | "repairable" | "not_repairable">("all");
  const [offlineBookingTab, setOfflineBookingTab] = useState<"running" | "done">("running");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(safeInitialStatusFilter);
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [closedYearFilter, setClosedYearFilter] = useState<ClosedYearFilter>("ALL");
  const [page, setPage] = useState(1);
  const [showAllRows, setShowAllRows] = useState(false);
  const PAGE_SIZE = 8;

  const [jobCards, setJobCards] = useState<JobCardListRow[]>([]);
  const [jobCardsError, setJobCardsError] = useState("");

  const [approvalPendingIds, setApprovalPendingIds] = useState<string[]>([]);
  const [approvalPendingError, setApprovalPendingError] = useState("");

  const [approvedByAdminIds, setApprovedByAdminIds] = useState<string[]>([]);
  const [approvedByAdminError, setApprovedByAdminError] = useState("");

  const visibleTickets = useMemo(() => tickets || [], [tickets]);

  const openDelete = (t: Ticket) => {
    setDeleteTarget(t);
    setDeleteConfirmId("");
    setDeleteError("");
    setDeleteOpen(true);
  };

  const closeDelete = (opts?: { force?: boolean }) => {
    if (deleteBusy && !opts?.force) return;
    setDeleteOpen(false);
    setDeleteTarget(null);
    setDeleteConfirmId("");
    setDeleteError("");
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await apiTicketDelete(deleteTarget.id, deleteConfirmId);
      onTicketDeleted?.(deleteTarget.id);
      onNotify?.(`Ticket ${deleteTarget.ticketId} deleted.`);
      closeDelete({ force: true });
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Failed to delete ticket");
    } finally {
      setDeleteBusy(false);
    }
  };

  useEffect(() => {
    if (!isAdmin && !isSales) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      apiPendingDispatchApprovalsList()
        .then((r) => {
          if (cancelled) return;
          setApprovalPendingIds((r.tickets || []).map((x) => x.ticketDbId).filter(Boolean));
          setApprovalPendingError("");
        })
        .catch((e) => {
          if (cancelled) return;
          setApprovalPendingIds([]);
          setApprovalPendingError(
            e instanceof Error ? e.message : "Failed to load approval pending tickets",
          );
        });
    };
    tick();
    const interval = setInterval(tick, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAdmin, isSales]);

  useEffect(() => {
    if (!isSales) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      apiApprovedDispatchApprovalsList()
        .then((r) => {
          if (cancelled) return;
          setApprovedByAdminIds((r.tickets || []).map((x) => x.ticketDbId).filter(Boolean));
          setApprovedByAdminError("");
        })
        .catch((e) => {
          if (cancelled) return;
          setApprovedByAdminIds([]);
          setApprovedByAdminError(
            e instanceof Error ? e.message : "Failed to load approved tickets",
          );
        });
    };
    tick();
    const interval = setInterval(tick, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isSales]);

  useEffect(() => {
    if (!canLoadJobCards) return;
    let cancelled = false;
    const fetchRows = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      apiJobCardsList()
        .then((rows) => {
          if (cancelled) return;
          setJobCards(rows);
          setJobCardsError("");
        })
        .catch((e) => {
          if (cancelled) return;
          setJobCards([]);
          setJobCardsError(e instanceof Error ? e.message : "Failed to load repaired tickets");
        });
    };
    fetchRows();
    const interval = setInterval(fetchRows, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [canLoadJobCards]);

  const engineerFinalByTicketId = useMemo(() => {
    const latestByTicket = new Map<string, JobCardListRow>();
    (jobCards || []).forEach((r) => {
      const t = r?.ticket;
      const ticketId = String(t?.id || "");
      if (!ticketId) return;
      const prev = latestByTicket.get(ticketId);
      if (!prev || (r.updatedAtMs || 0) >= (prev.updatedAtMs || 0)) latestByTicket.set(ticketId, r);
    });
    const out = new Map<string, string>();
    latestByTicket.forEach((r, id) => {
      const final = String(r?.engineerFinalStatus || "").toUpperCase().trim();
      if (final) out.set(id, final);
    });
    return out;
  }, [jobCards]);

  const repairMetaByTicketId = useMemo(() => {
    const latestByTicket = new Map<string, JobCardListRow>();
    (jobCards || []).forEach((r) => {
      const t = r?.ticket;
      const ticketId = String(t?.id || "");
      if (!ticketId) return;
      const prev = latestByTicket.get(ticketId);
      if (!prev || (r.updatedAtMs || 0) >= (prev.updatedAtMs || 0)) latestByTicket.set(ticketId, r);
    });
    const out = new Map<string, { engineer: string; qa: string }>();
    latestByTicket.forEach((r, id) => {
      // In JobCard UI: Engineer Name = checkedByName, QA/Sub engineer = repairActionsByName
      const engineer = String(r?.checkedByName || "").trim();
      const qa = String(r?.repairActionsByName || "").trim();
      if (engineer || qa) out.set(id, { engineer, qa });
    });
    return out;
  }, [jobCards]);

  const engineerRemarksByTicketId = useMemo(() => {
    const latestByTicket = new Map<string, JobCardListRow>();
    (jobCards || []).forEach((r) => {
      const t = r?.ticket;
      const ticketId = String(t?.id || "");
      if (!ticketId) return;
      const prev = latestByTicket.get(ticketId);
      if (!prev || (r.updatedAtMs || 0) >= (prev.updatedAtMs || 0)) latestByTicket.set(ticketId, r);
    });
    const out = new Map<string, string>();
    latestByTicket.forEach((r, id) => {
      const remark = String(r?.finalRemarks || "").trim();
      if (remark) out.set(id, remark);
    });
    return out;
  }, [jobCards]);

  const openTickets = useMemo(
    () => visibleTickets.filter((t) => t.status !== "CLOSED"),
    [visibleTickets],
  );
  const inwardTickets = useMemo(
    () =>
      visibleTickets.filter((t) => !isOnsiteTicket(t) && INWARD_STATUSES.includes(t.status)),
    [visibleTickets],
  );
  const repairedTickets = useMemo(
    () => visibleTickets.filter((t) => !isOnsiteTicket(t) && t.status === "UNDER_REPAIRED"),
    [visibleTickets],
  );
  const offlineBookingTickets = useMemo(
    () => visibleTickets.filter((t) => isOnsiteTicket(t) && t.status !== "CLOSED"),
    [visibleTickets],
  );
  const offlineBookingRunningTickets = useMemo(
    () => offlineBookingTickets.filter((t) => !t.onsiteMarkedRepairedAt),
    [offlineBookingTickets],
  );
  const offlineBookingDoneTickets = useMemo(
    () => offlineBookingTickets.filter((t) => Boolean(t.onsiteMarkedRepairedAt)),
    [offlineBookingTickets],
  );
  const outwardTickets = useMemo(
    () =>
      visibleTickets.filter((t) => !isOnsiteTicket(t) && OUTWARD_STATUSES.includes(t.status)),
    [visibleTickets],
  );
  const approvalPendingTickets = useMemo(() => {
    const set = new Set(approvalPendingIds);
    return visibleTickets.filter((t) => set.has(t.id));
  }, [visibleTickets, approvalPendingIds]);
  const approvedByAdminTickets = useMemo(() => {
    const set = new Set(approvedByAdminIds);
    return visibleTickets.filter((t) => set.has(t.id));
  }, [visibleTickets, approvedByAdminIds]);
  const closedTickets = useMemo(
    () => visibleTickets.filter((t) => t.status === "CLOSED"),
    [visibleTickets],
  );
  const closedYearCounts = useMemo(() => {
    const counts = new Map<string, number>();
    closedTickets.forEach((t) => {
      const year = ticketYear(t.createdAt);
      if (!year) return;
      counts.set(year, (counts.get(year) || 0) + 1);
    });
    return [...counts.entries()]
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => Number(b.year) - Number(a.year));
  }, [closedTickets]);

  const matchesClosedYearFilter = useCallback(
    (t: Ticket) => closedYearFilter === "ALL" || ticketYear(t.createdAt) === closedYearFilter,
    [closedYearFilter],
  );

  const allCount = useMemo(
    () => visibleTickets.filter((t) => matchesDateFilter(t.createdAt, dateFilter)).length,
    [visibleTickets, dateFilter],
  );
  const openCount = useMemo(
    () => openTickets.filter((t) => matchesDateFilter(t.createdAt, dateFilter)).length,
    [openTickets, dateFilter],
  );
  const inwardCount = useMemo(
    () => inwardTickets.filter((t) => matchesDateFilter(t.createdAt, dateFilter)).length,
    [inwardTickets, dateFilter],
  );
  const repairedCount = useMemo(
    () => repairedTickets.filter((t) => matchesDateFilter(t.createdAt, dateFilter)).length,
    [repairedTickets, dateFilter],
  );
  const offlineBookingCount = useMemo(
    () => offlineBookingTickets.filter((t) => matchesDateFilter(t.createdAt, dateFilter)).length,
    [offlineBookingTickets, dateFilter],
  );
  const offlineBookingTabCounts = useMemo(() => {
    let running = 0;
    let done = 0;
    offlineBookingTickets.forEach((t) => {
      if (!matchesDateFilter(t.createdAt, dateFilter)) return;
      if (t.onsiteMarkedRepairedAt) done++;
      else running++;
    });
    return { running, done };
  }, [offlineBookingTickets, dateFilter]);
  const outwardCount = useMemo(
    () => outwardTickets.filter((t) => matchesDateFilter(t.createdAt, dateFilter)).length,
    [outwardTickets, dateFilter],
  );
  const approvalPendingCount = useMemo(
    () => approvalPendingTickets.filter((t) => matchesDateFilter(t.createdAt, dateFilter)).length,
    [approvalPendingTickets, dateFilter],
  );
  const approvedByAdminCount = useMemo(
    () => approvedByAdminTickets.filter((t) => matchesDateFilter(t.createdAt, dateFilter)).length,
    [approvedByAdminTickets, dateFilter],
  );
  const closedCount = useMemo(
    () =>
      closedTickets.filter(
        (t) => matchesDateFilter(t.createdAt, dateFilter) && matchesClosedYearFilter(t),
      ).length,
    [closedTickets, dateFilter, matchesClosedYearFilter],
  );

  const repairedTabCounts = useMemo(() => {
    if (!canLoadJobCards) return { repairable: 0, notRepairable: 0 };
    let repairable = 0;
    let notRepairable = 0;
    repairedTickets.forEach((t) => {
      if (!matchesDateFilter(t.createdAt, dateFilter)) return;
      const final = String(engineerFinalByTicketId.get(t.id) || "").toUpperCase().trim();
      if (final === "REPAIRABLE") repairable++;
      if (final === "NOT_REPAIRABLE") notRepairable++;
    });
    return { repairable, notRepairable };
  }, [canLoadJobCards, repairedTickets, engineerFinalByTicketId, dateFilter]);

  const baseTickets = useMemo(() => {
    if (ticketsTab === "open") return openTickets;
    if (ticketsTab === "all") return visibleTickets;
    if (ticketsTab === "inward") return inwardTickets;
    if (ticketsTab === "repaired") return repairedTickets;
    if (ticketsTab === "offline_booking") {
      if (isAdmin || isSales) return offlineBookingTab === "done" ? offlineBookingDoneTickets : offlineBookingRunningTickets;
      return offlineBookingTickets;
    }
    if (ticketsTab === "outward") return outwardTickets;
    if (ticketsTab === "approval_pending") return approvalPendingTickets;
    if (ticketsTab === "approved_by_admin") return approvedByAdminTickets;
    return closedTickets;
  }, [
    ticketsTab,
    visibleTickets,
    openTickets,
    inwardTickets,
    repairedTickets,
    offlineBookingTickets,
    offlineBookingRunningTickets,
    offlineBookingDoneTickets,
    offlineBookingTab,
    outwardTickets,
    approvalPendingTickets,
    approvedByAdminTickets,
    closedTickets,
    isAdmin,
    isSales,
  ]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return baseTickets.filter((t) => {
      const inverter = `${t.inverterMake} ${t.inverterModel}`.toLowerCase();
      const matchSearch =
        !q ||
        t.ticketId.toLowerCase().includes(q) ||
        String(t.serialNumber || "").toLowerCase().includes(q) ||
        inverter.includes(q) ||
        t.faultDescription.toLowerCase().includes(q) ||
        String(t.errorCode || "").toLowerCase().includes(q) ||
        (!isCustomer && t.customer.toLowerCase().includes(q));
      const matchDate = matchesDateFilter(t.createdAt, dateFilter);
      const matchStatus = statusFilter === "ALL" ? true : t.status === statusFilter;
      const matchClosedYear = ticketsTab === "closed" ? matchesClosedYearFilter(t) : true;
      return matchSearch && matchDate && matchStatus && matchClosedYear;
    });
  }, [baseTickets, search, statusFilter, dateFilter, matchesClosedYearFilter, ticketsTab, isCustomer]);

  const filteredRepaired = useMemo(() => {
    if (ticketsTab !== "repaired" || !canLoadJobCards) return filtered;
    if (repairedTab === "all") return filtered;
    return filtered.filter((t) => {
      const final = String(engineerFinalByTicketId.get(t.id) || "").toUpperCase().trim();
      if (repairedTab === "repairable") return final === "REPAIRABLE";
      return final === "NOT_REPAIRABLE";
    });
  }, [filtered, ticketsTab, canLoadJobCards, repairedTab, engineerFinalByTicketId]);

  const rows = ticketsTab === "repaired" ? filteredRepaired : filtered;

  const totalPages = showAllRows ? 1 : Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = showAllRows ? 1 : Math.min(page, totalPages);
  const startIndex = showAllRows ? 0 : (currentPage - 1) * PAGE_SIZE;
  const pageRows = showAllRows ? rows : rows.slice(startIndex, startIndex + PAGE_SIZE);
  const showingFrom = rows.length ? startIndex + 1 : 0;
  const showingTo = showAllRows ? rows.length : Math.min(startIndex + PAGE_SIZE, rows.length);

  const statusFilterLabel =
    ticketsTab === "all"
      ? "All Status"
      : ticketsTab === "open"
      ? "All Status"
      : ticketsTab === "inward"
      ? "All Inward Status"
      : ticketsTab === "outward"
        ? "All Outward Status"
        : "All Status";

  const statusOptions: TicketStatus[] =
    ticketsTab === "all"
      ? STATUS_ORDER
      : ticketsTab === "open"
      ? STATUS_ORDER.filter((s) => s !== "CLOSED")
      : ticketsTab === "inward"
      ? STATUS_ORDER.filter((s) => INWARD_STATUSES.includes(s))
      : ticketsTab === "outward"
        ? STATUS_ORDER.filter((s) => OUTWARD_STATUSES.includes(s))
        : [];

  const baseEmptyColSpanBase = isCustomer
    ? 7
    : ticketsTab === "repaired"
      ? canSeeSalesOwner
        ? 11
        : 10
      : canSeeSalesOwner
        ? 9
        : 8;
  const showEngineerRemarksCol = !isCustomer && canLoadJobCards && ticketsTab !== "offline_booking";
  const offlineBookingExtraCols = ticketsTab === "offline_booking" ? 3 : 0; // engineer/date/remark
  const baseEmptyColSpan =
    baseEmptyColSpanBase +
    (canSeeSerialNumber ? 1 : 0) +
    offlineBookingExtraCols +
    (showEngineerRemarksCol ? 1 : 0);
  const emptyColSpan = baseEmptyColSpan + (canDeleteTickets ? 1 : 0);

  return (
    <div className="content">
      <div className="page-header page-header-row">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {onBack && (
            <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginTop: 2 }}>
              ← Back
            </button>
          )}
          <div>
            <div className="page-title">Service Tickets</div>
            <div className="page-sub">
              {rows.length} tickets{" "}
              {isCustomer
                ? "found for your account"
                : user.role === "ENGINEER"
                  ? "assigned to you or in Under Repair"
                  : "found"}
            </div>
          </div>
        </div>
        <div className="page-header-actions">
          {canAccess(roles, user.role, "tickets", "create") && (
            <button className="btn btn-accent" onClick={onNew}>
              + New Ticket
            </button>
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="tabs" style={{ marginBottom: 0 }}>
          {isCustomer ? (
            <>
              <div
                className={`tab ${ticketsTab === "open" ? "active" : ""}`}
                onClick={() => {
                  setTicketsTab("open");
                  setStatusFilter("ALL");
                  setRepairedTab("all");
                  setPage(1);
                }}
              >
                My Tickets ({openCount})
              </div>
              <div
                className={`tab ${ticketsTab === "closed" ? "active" : ""}`}
                onClick={() => {
                  setTicketsTab("closed");
                  setStatusFilter("ALL");
                  setRepairedTab("all");
                  setPage(1);
                }}
              >
                Closed ({closedCount})
              </div>
            </>
          ) : (
            <>
              {canSeeAllTab ? (
                <div
                  className={`tab ${ticketsTab === "all" ? "active" : ""}`}
                  onClick={() => {
                    setTicketsTab("all");
                    setStatusFilter("ALL");
                    setRepairedTab("all");
                    setPage(1);
                  }}
                >
                  All Tickets ({allCount})
                </div>
              ) : null}
              {!isEngineer ? (
                <div
                  className={`tab ${ticketsTab === "inward" ? "active" : ""}`}
                  onClick={() => {
                    setTicketsTab("inward");
                    setStatusFilter("ALL");
                    setRepairedTab("all");
                    setPage(1);
                  }}
                >
                  Inward Stage ({inwardCount})
                </div>
              ) : null}
              <div
                className={`tab ${ticketsTab === "repaired" ? "active" : ""}`}
                onClick={() => {
                  setTicketsTab("repaired");
                  setStatusFilter("ALL");
                  setRepairedTab("all");
                  setPage(1);
                }}
              >
                Under Progress ({repairedCount})
              </div>
              {roleNorm !== "CUSTOMER" ? (
                <div
                  className={`tab ${ticketsTab === "offline_booking" ? "active" : ""}`}
                  onClick={() => {
                    setTicketsTab("offline_booking");
                    setStatusFilter("ALL");
                    setRepairedTab("all");
                    setOfflineBookingTab("running");
                    setPage(1);
                  }}
                >
                  On-site Repairing ({offlineBookingCount})
                </div>
              ) : null}
              {!isSales ? (
                <div
                  className={`tab ${ticketsTab === "outward" ? "active" : ""}`}
                  onClick={() => {
                    setTicketsTab("outward");
                    setStatusFilter("ALL");
                    setRepairedTab("all");
                    setPage(1);
                  }}
                >
                  Outward ({outwardCount})
                </div>
              ) : null}
	              {isAdmin || isSales ? (
	                <div
	                  className={`tab ${ticketsTab === "approval_pending" ? "active" : ""}`}
	                  onClick={() => {
	                    setTicketsTab("approval_pending");
	                    setStatusFilter("ALL");
	                    setRepairedTab("all");
	                    setPage(1);
	                  }}
	                  title={approvalPendingError ? approvalPendingError : undefined}
	                >
	                  {isAdmin ? "Approval Pending" : "Under Approval"} ({approvalPendingCount})
	                </div>
	              ) : null}
              {isSales ? (
                <div
                  className={`tab ${ticketsTab === "approved_by_admin" ? "active" : ""}`}
                  onClick={() => {
                    setTicketsTab("approved_by_admin");
                    setStatusFilter("ALL");
                    setRepairedTab("all");
                    setPage(1);
                  }}
                  title={approvedByAdminError ? approvedByAdminError : undefined}
                >
                  Approved by Admin ({approvedByAdminCount})
                </div>
              ) : null}
              {isSales ? (
                <div
                  className={`tab ${ticketsTab === "outward" ? "active" : ""}`}
                  onClick={() => {
                    setTicketsTab("outward");
                    setStatusFilter("ALL");
                    setRepairedTab("all");
                    setPage(1);
                  }}
                >
                  Outward ({outwardCount})
                </div>
              ) : null}
              <div
                className={`tab ${ticketsTab === "closed" ? "active" : ""}`}
                onClick={() => {
                  setTicketsTab("closed");
                  setStatusFilter("ALL");
                  setRepairedTab("all");
                  setPage(1);
                }}
              >
                Closed Tickets ({closedCount})
              </div>
            </>
          )}
        </div>

        {loadError ? (
          <div className="form-error" style={{ margin: "14px 20px 0" }}>
            Tickets could not be loaded: {loadError}
          </div>
        ) : null}

        <div className="table-header">
          <div className="table-actions">
            <div className="search-wrap">
              <span className="search-icon" aria-hidden>
                <LuSearch />
              </span>
              <input
                className="search-input"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {canExport ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  const today = new Date();
                  const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
                    today.getDate(),
                  ).padStart(2, "0")}`;
                  const base = `tickets_${ticketsTab}_${statusFilter || "ALL"}_${ymd}`;
                  downloadTicketsAsExcel(rows, base);
                }}
                title="Download tickets as Excel"
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <LuDownload aria-hidden />
                  Export Excel
                </span>
              </button>
            ) : null}

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setShowAllRows((v) => !v);
                setPage(1);
              }}
              title={showAllRows ? "Switch to paginated view" : "Show all tickets in one scrollable list"}
            >
              {showAllRows ? "Paginate" : "Show All"}
            </button>

            {statusOptions.length ? (
              <select
                className="select-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">{statusFilterLabel}</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {formatTicketStatusLabel(s)}
                  </option>
                ))}
              </select>
            ) : null}

            <select
              className="select-filter"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as DateFilter);
                setPage(1);
              }}
            >
              <option value="ALL">All Dates</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
              <option value="YEAR">This Year</option>
            </select>

            {ticketsTab === "closed" && closedYearCounts.length ? (
              <select
                className="select-filter"
                value={closedYearFilter}
                onChange={(e) => {
                  setClosedYearFilter(e.target.value as ClosedYearFilter);
                  setDateFilter("ALL");
                  setPage(1);
                }}
                title="Filter closed tickets by year"
              >
                <option value="ALL">All Years ({closedTickets.length})</option>
                {closedYearCounts.map(({ year, count }) => (
                  <option key={year} value={year}>
                    {year} ({count})
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        </div>

        {ticketsTab === "repaired" && canLoadJobCards && !isEngineer ? (
          <div style={{ padding: "16px 20px 0" }}>
            {jobCardsError ? (
              <div className="empty-state" style={{ marginTop: 10, marginBottom: 16 }}>
                <div className="empty-icon" aria-hidden>
                  <LuTicket />
                </div>
                <div className="empty-text">{jobCardsError}</div>
              </div>
            ) : (
              <div className="tabs" style={{ marginBottom: 14 }}>
                <div
                  className={`tab ${repairedTab === "all" ? "active" : ""}`}
                  onClick={() => {
                    setRepairedTab("all");
                    setPage(1);
                  }}
                >
                  All ({repairedCount})
                </div>
                <div
                  className={`tab ${repairedTab === "repairable" ? "active" : ""}`}
                  onClick={() => {
                    setRepairedTab("repairable");
                    setPage(1);
                  }}
                >
                  Repaired ({repairedTabCounts.repairable})
                </div>
                <div
                  className={`tab ${repairedTab === "not_repairable" ? "active" : ""}`}
                  onClick={() => {
                    setRepairedTab("not_repairable");
                    setPage(1);
                  }}
                >
                  Scrap ({repairedTabCounts.notRepairable})
                </div>
              </div>
            )}
          </div>
        ) : null}
        {ticketsTab === "offline_booking" && (isAdmin || isSales) ? (
          <div style={{ padding: "16px 20px 0" }}>
            <div className="tabs" style={{ marginBottom: 14 }}>
              <div
                className={`tab ${offlineBookingTab === "running" ? "active" : ""}`}
                onClick={() => {
                  setOfflineBookingTab("running");
                  setPage(1);
                }}
              >
                Running ({offlineBookingTabCounts.running})
              </div>
              <div
                className={`tab ${offlineBookingTab === "done" ? "active" : ""}`}
                onClick={() => {
                  setOfflineBookingTab("done");
                  setPage(1);
                }}
              >
                Mark as Done ({offlineBookingTabCounts.done})
              </div>
            </div>
          </div>
        ) : null}
        {ticketsTab === "approved_by_admin" ? (
          <div style={{ padding: "12px 20px 0" }}>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>
              These tickets are approved by Admin for dispatch. Click Ticket ID to open Logistics → Dispatch.
            </div>
            {approvedByAdminError ? (
              <div className="form-error" style={{ marginTop: 10 }}>
                {approvedByAdminError}
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          className="scroll-x"
          style={showAllRows ? { maxHeight: "70vh", overflowY: "auto" } : undefined}
        >
          <table>
	            <thead>
	              <tr>
		                <th style={{ width: 70 }}>Sr No.</th>
		                <th>Ticket ID</th>
                    <th style={{ width: 120 }}>Ticket Date</th>
                    <th>Inverter</th>
                    <th style={{ minWidth: 110 }}>Inverter Capacity</th>
                    {canSeeSerialNumber ? <th style={{ minWidth: 160 }}>Serial No.</th> : null}
                    {ticketsTab === "offline_booking" ? <th style={{ minWidth: 160 }}>Engineer</th> : null}
                    {ticketsTab === "offline_booking" ? <th style={{ width: 120 }}>Date</th> : null}
                    {ticketsTab === "offline_booking" ? <th style={{ minWidth: 220 }}>Remark</th> : null}
		                {!isCustomer ? <th>Customer</th> : null}
		                {canSeeSalesOwner ? <th>Sales Owner</th> : null}
	                    {ticketsTab === "repaired" ? <th>Repair Engineer</th> : null}
	                    {ticketsTab === "repaired" ? <th>QA</th> : null}
			                <th>Fault</th>
                      {showEngineerRemarksCol ? <th style={{ minWidth: 240 }}>Engineer Remarks</th> : null}
                <th>Status</th>
                {canDeleteTickets ? <th style={{ width: 64 }}>Delete</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={emptyColSpan}>
                    <div className="empty-state">
                      <div className="empty-icon" aria-hidden>
                        <LuTicket />
                      </div>
                      <div className="empty-text">No tickets found</div>
                    </div>
                  </td>
                </tr>
              ) : (
	                pageRows.map((t, idx) => {
	                  const final = String(engineerFinalByTicketId.get(t.id) || "").toUpperCase().trim();
	                  const showOutcome = ticketsTab === "repaired" && canLoadJobCards && !!final;
	                  const outcome =
	                    final === "NOT_REPAIRABLE" ? "SCRAP" : final === "REPAIRABLE" ? "REPAIRED" : null;
	                  const meta = ticketsTab === "repaired" ? repairMetaByTicketId.get(t.id) : null;
                    const engineerRemark = showEngineerRemarksCol
                      ? String(engineerRemarksByTicketId.get(t.id) || "").trim()
                      : "";

	                  return (
                    <tr key={t.id}>
                      <td
                        style={{
                          fontSize: 12,
                          color: "var(--text3)",
                          fontFamily: "var(--mono)",
                        }}
                      >
                        {startIndex + idx + 1}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="td-mono table-link"
                          onClick={() =>
                            onView(
                              t,
                              ticketsTab === "approval_pending"
                                ? { tab: "logistics" }
                                : ticketsTab === "approved_by_admin"
                                  ? {
                                      tab: "logistics",
                                      logisticsStage: "dispatch",
                                      notify: "Admin approved dispatch. Dispatch tab opened.",
                                    }
                                : ticketsTab === "repaired" && canLoadJobCards
                                  ? { tab: "jobcard" }
                                  : undefined,
                            )
                          }
                          title="View ticket"
                        >
	                          {t.ticketId}
	                        </button>
	                      </td>
                        <td
                          style={{
                            fontSize: 12,
                            color: "var(--text3)",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          {t.createdAt}
                        </td>
	                      <td>
	                        <span className="tag">
	                          {t.inverterMake} {t.inverterModel}
	                        </span>
	                      </td>
                        <td>
                          <span className="tag">{String(t.capacity || "").trim() || "—"}</span>
                        </td>
                        {canSeeSerialNumber ? (
                          <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text2)" }}>
                            {String(t.serialNumber || "").trim() || "—"}
                          </td>
                        ) : null}
                        {ticketsTab === "offline_booking" ? (
                          <td style={{ fontSize: 12, color: "var(--text2)" }}>
                            {String(t.onsiteEngineerName || "").trim() ||
                              (t.assignedEngineer && t.assignedEngineer !== "-" ? t.assignedEngineer : "—")}
                          </td>
                        ) : null}
                        {ticketsTab === "offline_booking" ? (
                          <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text3)" }}>
                            {t.onsiteVisitDate || t.onsiteMarkedRepairedAt || "—"}
                          </td>
                        ) : null}
                        {ticketsTab === "offline_booking" ? (
                          <td
                            style={{
                              maxWidth: 260,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "var(--text2)",
                              fontSize: 12,
                            }}
                            title={String(t.onsiteRemark || "").trim() || undefined}
                          >
                            {String(t.onsiteRemark || "").trim() || "—"}
                          </td>
                        ) : null}
	                      {!isCustomer ? <td style={{ fontWeight: 500 }}>{t.customer}</td> : null}
	                      {canSeeSalesOwner ? (
	                        <td style={{ fontSize: 12, color: "var(--text2)" }}>
	                          {t.salesAssigneeName || t.salesAssigneeEmail || "—"}
	                        </td>
	                      ) : null}
                        {ticketsTab === "repaired" ? (
                          <td style={{ fontSize: 12, color: "var(--text2)" }}>
                            {meta?.engineer || "—"}
                          </td>
                        ) : null}
                        {ticketsTab === "repaired" ? (
                          <td style={{ fontSize: 12, color: "var(--text2)" }}>
                            {meta?.qa || "—"}
                          </td>
                        ) : null}
	                      <td
	                        style={{
	                          maxWidth: 180,
	                          overflow: "hidden",
	                          textOverflow: "ellipsis",
	                          whiteSpace: "nowrap",
	                          color: "var(--text2)",
	                          fontSize: 12,
	                        }}
	                      >
	                        {t.faultDescription}
	                      </td>
                        {showEngineerRemarksCol ? (
                          <td
                            style={{
                              maxWidth: 260,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "var(--text2)",
                              fontSize: 12,
                            }}
                            title={engineerRemark || undefined}
                          >
                            {engineerRemark || "—"}
                          </td>
                        ) : null}
	                      <td>
	                        <div className="status-sla">
	                          <StatusBadge status={t.status} />
	                          {showOutcome && outcome ? <EngineerOutcomeBadge outcome={outcome} /> : null}
	                        </div>
                      </td>
                      {canDeleteTickets ? (
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openDelete(t);
                            }}
                            title="Delete ticket (requires ID confirmation)"
                            aria-label={`Delete ticket ${t.ticketId}`}
                            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <LuTrash2 aria-hidden />
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <DeleteTicketModal
          open={deleteOpen}
          ticket={deleteTarget}
          confirmId={deleteConfirmId}
          onConfirmIdChange={(v) => {
            setDeleteConfirmId(v);
            if (deleteError) setDeleteError("");
          }}
          busy={deleteBusy}
          error={deleteError}
          onClose={() => closeDelete()}
          onDelete={doDelete}
        />

        {!showAllRows && rows.length > PAGE_SIZE ? (
          <div
            style={{
              padding: "12px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              borderTop: "1px solid var(--border2)",
            }}
          >
            <div style={{ fontSize: 12, color: "var(--text3)" }}>
              Showing {showingFrom}-{showingTo} of {rows.length}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                className="btn btn-ghost btn-sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, Math.min(totalPages, p - 1)))}
              >
                Prev
              </button>
              <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)" }}>
                Page {currentPage}/{totalPages}
              </div>
              <button
                className="btn btn-ghost btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.max(1, Math.min(totalPages, p + 1)))}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
