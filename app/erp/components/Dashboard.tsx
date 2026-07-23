"use client";

import { useEffect, useMemo, useState } from "react";
import type { Ticket, User } from "../types";
import { StatusBadge } from "./Badges";
import { STATUS_COLORS } from "../constants";
import {
  LuCircleCheck,
  LuShieldAlert,
  LuShieldCheck,
  LuTicket,
  LuTruck,
  LuWrench,
} from "react-icons/lu";
import {
  apiDashboardTicketTrends,
  apiDashboardServicingStatus,
  apiDashboardClientDetailsDaily,
  apiDashboardClientDetailsList,
  apiDashboardInventorySummary,
  apiJobCardsList,
  apiPendingDispatchApprovalsList,
  type ClientSummaryRow,
  type ClientLocation,
  type DashboardPeriodInput,
  type InventorySummaryResult,
  type ServicingStatusDayRow,
  type JobCardListRow,
  type PendingDispatchApprovalTicket,
  type TicketTrendsPoint,
} from "../api";
import ComboBarLineChart from "./ComboBarLineChart";
import { formatTicketStatusLabel } from "../utils";

const VENDOR_PIE_COLORS = ["#0d9488", "#f97316", "#0ea5e9", "#7c3aed", "#16a34a", "#dc2626", "#2563eb", "#d97706"];

const STATUS_PIE_COLORS: Record<string, string> = {
  CREATED: "#0d9488",
  PICKUP_SCHEDULED: "#0ea5e9",
  IN_TRANSIT: "#38bdf8",
  UNDER_REPAIRED: "#f97316",
  UNDER_DISPATCH: "#7c3aed",
  DISPATCHED: "#16a34a",
  INSTALLATION_DONE: "#4ade80",
  CLOSED: "#6b7280",
};

type VendorPieSlice = {
  vendor: string;
  count: number;
  percent: number;
  color: string;
  startAngle: number;
  endAngle: number;
};

function normalizeInventoryLabel(value: string | undefined, fallback: string) {
  const raw = String(value || "").trim();
  if (!raw || raw === "-" || raw === "—" || raw === "â€”") return fallback;
  return raw;
}

function piePoint(cx: number, cy: number, radius: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}
//for testing

function describePieSlice(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = piePoint(cx, cy, radius, endAngle);
  const end = piePoint(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [`M ${cx} ${cy}`, `L ${start.x} ${start.y}`, `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, "Z"].join(" ");
}

// Counts distinct inverters in a list of tickets: same serial number = one inverter.
// Tickets without a serial number are each counted individually.
function countDistinctInverters(list: { serialNumber?: string }[]): number {
  const seen = new Set<string>();
  let blanks = 0;
  for (const t of list) {
    const sn = String(t.serialNumber || "").trim().toUpperCase();
    if (sn && sn !== "—") seen.add(sn);
    else blanks += 1;
  }
  return seen.size + blanks;
}

export default function Dashboard({
  user,
  tickets,
  onNav,
  onViewTicket,
  onOpenTickets,
}: {
  user: User;
  tickets: Ticket[];
  onNav: (p: string) => void;
  onViewTicket: (
    t: Ticket,
    opts?: { tab?: "overview" | "jobcard" | "logistics" | "sla"; logisticsStage?: "pickup" | "under_dispatch" | "dispatch" },
  ) => void;
  onOpenTickets: (preset?: {
    status?: string;
    priority?: string;
    tab?:
      | "open"
      | "all"
      | "inward"
      | "repaired"
      | "offline_booking"
      | "outward"
      | "approval_pending"
      | "approved_by_admin"
      | "closed";
  }) => void;
}) {
  const isCustomer = String(user.role || "").toUpperCase() === "CUSTOMER";
  const isAdmin = String(user.role || "").toUpperCase() === "ADMIN";
  const isSales = String(user.role || "").toUpperCase() === "SALES";

  const myTickets = tickets;

  const statusCounts: Record<string, number> = {};
  tickets.forEach((t) => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });
  const maxCount = Math.max(...Object.values(statusCounts), 1);

  const [approvalPending, setApprovalPending] = useState<PendingDispatchApprovalTicket[]>([]);
  const [jobCards, setJobCards] = useState<JobCardListRow[]>([]);

  const ymdOf = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const showTrends = isAdmin || isSales;
  // Default range = Half Yearly (≈6 months).
  const [trendDays, setTrendDays] = useState(184);
  // Custom date range for the trends chart.
  const [trendCustom, setTrendCustom] = useState(false);
  const [trendCustomFrom, setTrendCustomFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return ymdOf(d);
  });
  const [trendCustomTo, setTrendCustomTo] = useState(() => ymdOf(new Date()));
  const [trendChartType, setTrendChartType] = useState<"bar" | "line" | "pie">("bar");
  const [trends, setTrends] = useState<TicketTrendsPoint[]>([]);
  const [trendsErr, setTrendsErr] = useState("");
  const [selectedTrendDate, setSelectedTrendDate] = useState<string>("");
  const [trendModal, setTrendModal] = useState<{ label: string; tickets: typeof tickets; summary?: { created: number; repaired: number; closed: number } } | null>(null);
  const [showAllDashboardTickets, setShowAllDashboardTickets] = useState(false);
  const [inventoryFilter, setInventoryFilter] = useState<{ type: "vendor" | "model" | "status"; label: string; vendor: string; model?: string; status?: string } | null>(null);
  const [showAllInventoryVendors, setShowAllInventoryVendors] = useState(false);
  const [showAllInventoryStatuses, setShowAllInventoryStatuses] = useState(false);

  const [counterPeriod, setCounterPeriod] = useState<"last_day" | "this_month" | "last_month" | "all_time" | "custom">("all_time");
  const [counterCustomFrom, setCounterCustomFrom] = useState("");
  const [counterCustomTo, setCounterCustomTo] = useState("");

  const now = useMemo(() => new Date(), []);
  const defaultYear = now.getFullYear();
  const defaultMonth = now.getMonth() + 1;
  const defaultFortnight = now.getDate() >= 16 ? 2 : 1;

  const counterTickets = useMemo(() => {
    const n = new Date();
    // These cards show the current pipeline, so scope by last activity (updatedAt),
    // falling back to createdAt. This way "Last Day" shows inverters worked on recently,
    // not only tickets created today.
    const actDate = (t: Ticket) => new Date(t.updatedAt || t.createdAt);
    if (counterPeriod === "last_day") {
      // "Last Day" = the most recent active day. We measure 24h back from the latest
      // activity in the data (not the wall clock), so the card still shows the last
      // day of work even if the system has been idle for a few days.
      let maxMs = 0;
      for (const t of tickets) {
        const ms = actDate(t).getTime();
        if (!isNaN(ms) && ms > maxMs) maxMs = ms;
      }
      const ref = maxMs || n.getTime();
      const from = new Date(ref - 24 * 60 * 60 * 1000);
      return tickets.filter((t) => { const d = actDate(t); return !isNaN(d.getTime()) && d.getTime() >= from.getTime(); });
    }
    if (counterPeriod === "this_month") {
      // Current calendar month, 1st → today (e.g. in June this is Jun 1 – now).
      const from = new Date(n.getFullYear(), n.getMonth(), 1, 0, 0, 0, 0);
      const to = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 23, 59, 59, 999);
      return tickets.filter((t) => {
        const d = actDate(t);
        return !isNaN(d.getTime()) && d >= from && d <= to;
      });
    }
    if (counterPeriod === "last_month") {
      // Previous calendar month, 1st → last day (e.g. in June this is May 1 – May 31).
      const from = new Date(n.getFullYear(), n.getMonth() - 1, 1, 0, 0, 0, 0);
      const to = new Date(n.getFullYear(), n.getMonth(), 0, 23, 59, 59, 999);
      return tickets.filter((t) => {
        const d = actDate(t);
        return !isNaN(d.getTime()) && d >= from && d <= to;
      });
    }
    if (counterPeriod === "custom") {
      const from = counterCustomFrom ? new Date(counterCustomFrom + "T00:00:00") : null;
      const to = counterCustomTo ? new Date(counterCustomTo + "T23:59:59") : null;
      return tickets.filter((t) => {
        const d = actDate(t);
        if (isNaN(d.getTime())) return true;
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }
    return tickets;
  }, [tickets, counterPeriod, counterCustomFrom, counterCustomTo]);

  // All counter cards report distinct inverters (by serial number), not raw ticket rows.
  const inwardCreated = countDistinctInverters(
    counterTickets.filter((t) => String(t.status || "").toUpperCase() === "CREATED"),
  );
  const inwardUnderPickup = countDistinctInverters(
    counterTickets.filter((t) => ["PICKUP_SCHEDULED", "IN_TRANSIT"].includes(String(t.status || "").toUpperCase())),
  );
  const inward = inwardCreated + inwardUnderPickup;

  const warrantyTickets = counterTickets.filter((t) => Boolean(t.warrantyStatus));
  const underWarranty = countDistinctInverters(warrantyTickets);
  const outOfWarranty = countDistinctInverters(counterTickets.filter((t) => !t.warrantyStatus));

  const underDispatch = countDistinctInverters(
    counterTickets.filter((t) => String(t.status || "").toUpperCase() === "UNDER_DISPATCH"),
  );
  const dispatched = countDistinctInverters(
    counterTickets.filter((t) => ["DISPATCHED", "INSTALLATION_DONE"].includes(String(t.status || "").toUpperCase())),
  );

  const underRepairRaw = counterTickets.filter((t) => String(t.status || "").toUpperCase() === "UNDER_REPAIRED");
  // Count raw closed ticket rows (not distinct inverters) so this matches the
  // "Closed Tickets" tab in the Tickets list, which this card links to.
  const closed = counterTickets.filter((t) => t.status === "CLOSED").length;

  // Human label for the currently selected counter period, used in card sub-text
  // so it never says "this month" while a different period (e.g. All Time) is active.
  const counterPeriodLabel =
    counterPeriod === "last_day"
      ? "last day"
      : counterPeriod === "this_month"
        ? "this month"
        : counterPeriod === "last_month"
          ? "last month"
          : counterPeriod === "custom"
            ? "selected range"
            : "all time";

  const [reportPeriod, setReportPeriod] = useState<DashboardPeriodInput["period"]>("monthly");
  const [reportYear, setReportYear] = useState(defaultYear);
  const [reportMonth, setReportMonth] = useState(defaultMonth);
  const [reportFortnight, setReportFortnight] = useState<1 | 2>(defaultFortnight as 1 | 2);
  const [reportCustomFrom, setReportCustomFrom] = useState("");
  const [reportCustomTo, setReportCustomTo] = useState("");

  const [invPeriod, setInvPeriod] = useState<"all" | "weekly" | "monthly" | "quarterly" | "halfyearly" | "yearly" | "custom">("all");
  const [invYear, setInvYear] = useState(defaultYear);
  const [invMonth, setInvMonth] = useState(defaultMonth);
  const [invCustomFrom, setInvCustomFrom] = useState("");
  const [invCustomTo, setInvCustomTo] = useState("");
  const [invData, setInvData] = useState<InventorySummaryResult | null>(null);
  const [invLoading, setInvLoading] = useState(false);
  const [invError, setInvError] = useState("");

  const [invModalPeriod, setInvModalPeriod] = useState<"all" | "weekly" | "monthly" | "quarterly" | "halfyearly" | "yearly" | "custom">("all");
  const [invModalYear, setInvModalYear] = useState(defaultYear);
  const [invModalMonth, setInvModalMonth] = useState(defaultMonth);
  const [invModalCustomFrom, setInvModalCustomFrom] = useState("");
  const [invModalCustomTo, setInvModalCustomTo] = useState("");

  const reportInput = useMemo<DashboardPeriodInput>(() => {
    return {
      period: reportPeriod,
      year: reportYear,
      ...(reportPeriod === "yearly" || reportPeriod === "weekly" || reportPeriod === "custom" ? {} : { month: reportMonth }),
      ...(reportPeriod === "fortnightly" ? { fortnight: reportFortnight } : {}),
      ...(reportPeriod === "custom" ? { dateFrom: reportCustomFrom || undefined, dateTo: reportCustomTo || undefined } : {}),
      tz: "Asia/Kolkata",
    };
  }, [reportPeriod, reportYear, reportMonth, reportFortnight, reportCustomFrom, reportCustomTo]);

  const [svcLoading, setSvcLoading] = useState(false);
  const [svcErr, setSvcErr] = useState("");
  const [svcPeriodLabel, setSvcPeriodLabel] = useState<{ from: string; to: string } | null>(null);
  const [svcTotals, setSvcTotals] = useState<{ received: number; repaired: number; scrap: number; dispatched: number } | null>(null);
  const [svcDaily, setSvcDaily] = useState<ServicingStatusDayRow[]>([]);
  const [svcDetailsOpen, setSvcDetailsOpen] = useState(false);

  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsErr, setClientsErr] = useState("");
  const [clients, setClients] = useState<ClientSummaryRow[]>([]);
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);
  const [clientDetailsLoading, setClientDetailsLoading] = useState(false);
  const [clientDetailsErr, setClientDetailsErr] = useState("");
  const [clientDetailsDaily, setClientDetailsDaily] = useState<ServicingStatusDayRow[]>([]);
  const [clientDetailsTotals, setClientDetailsTotals] = useState<{ received: number; repaired: number; scrap: number; dispatched: number } | null>(null);
  const [clientPicked, setClientPicked] = useState<{ name: string; address: string } | null>(null);
  const [clientLocationsModal, setClientLocationsModal] = useState<ClientSummaryRow | null>(null);

  useEffect(() => {
    if (!isAdmin && !isSales) return;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      apiPendingDispatchApprovalsList()
        .then((r) => {
          if (cancelled) return;
          setApprovalPending(r.tickets || []);
        })
        .catch(() => {
          if (cancelled) return;
          setApprovalPending([]);
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
    if (isCustomer) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      apiJobCardsList()
        .then((rows) => {
          if (cancelled) return;
          setJobCards(rows || []);
        })
        .catch(() => {
          if (cancelled) return;
          setJobCards([]);
        });
    };
    tick();
    const interval = setInterval(tick, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isCustomer]);

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

  const underProgressCounts = useMemo(() => {
    const repairList: typeof underRepairRaw = [];
    const repairedList: typeof underRepairRaw = [];
    const scrapList: typeof underRepairRaw = [];
    (underRepairRaw || []).forEach((t) => {
      const final = String(engineerFinalByTicketId.get(t.id) || "").toUpperCase().trim();
      if (final === "REPAIRABLE") repairedList.push(t);
      else if (final === "NOT_REPAIRABLE") scrapList.push(t);
      else repairList.push(t);
    });
    const underRepair = countDistinctInverters(repairList);
    const repaired = countDistinctInverters(repairedList);
    const scrap = countDistinctInverters(scrapList);
    return { underRepair, repaired, scrap, total: underRepair + repaired + scrap };
  }, [underRepairRaw, engineerFinalByTicketId]);

  const outwardCounts = useMemo(() => {
    return { underDispatch, dispatched, total: underDispatch + dispatched };
  }, [underDispatch, dispatched]);

  // Fetch inventory summary from backend whenever period changes
  useEffect(() => {
    let cancelled = false;
    setInvLoading(true);
    setInvError("");
    apiDashboardInventorySummary({
      period: invPeriod,
      year: invYear,
      month: invMonth,
      tz: "Asia/Kolkata",
      ...(invPeriod === "custom" ? { dateFrom: invCustomFrom || undefined, dateTo: invCustomTo || undefined } : {}),
    })
      .then((data) => { if (!cancelled) { setInvData(data); setInvLoading(false); } })
      .catch((e) => { if (!cancelled) { setInvError(e instanceof Error ? e.message : "Failed to load inventory"); setInvLoading(false); } });
    return () => { cancelled = true; };
  }, [invPeriod, invYear, invMonth, invCustomFrom, invCustomTo]);

  // Compute vendor pie slices from API data
  const inventoryVendorChart = useMemo(() => {
    const vendors = invData?.vendors ?? [];
    const total = invData?.total ?? 0;
    let cursor = 0;
    const vendorRows: VendorPieSlice[] = vendors.map((row, idx) => {
      const startAngle = total ? (cursor / total) * 360 : 0;
      cursor += row.count;
      const endAngle = total ? (cursor / total) * 360 : 0;
      return {
        vendor: row.vendor,
        count: row.count,
        percent: total ? (row.count / total) * 100 : 0,
        color: VENDOR_PIE_COLORS[idx % VENDOR_PIE_COLORS.length]!,
        startAngle,
        endAngle,
      };
    });
    return { vendorRows, total };
  }, [invData]);

  // Compute model pie slices from API data
  const inventoryModelChart = useMemo(() => {
    const models = invData?.models ?? [];
    const total = invData?.total ?? 0;
    let cursor = 0;
    const modelSlices = models.map((entry, idx) => {
      const startAngle = total ? (cursor / total) * 360 : 0;
      cursor += entry.count;
      const endAngle = total ? (cursor / total) * 360 : 0;
      return {
        ...entry,
        percent: total ? (entry.count / total) * 100 : 0,
        color: VENDOR_PIE_COLORS[idx % VENDOR_PIE_COLORS.length]!,
        startAngle,
        endAngle,
      };
    });
    return { modelSlices, total };
  }, [invData]);

  // Top 5 make & model with an "Others" aggregate slice for the pie
  const top5ModelChart = useMemo(() => {
    const { modelSlices, total } = inventoryModelChart;
    const top5 = modelSlices.slice(0, 5);
    const othersCount = modelSlices.slice(5).reduce((s, r) => s + r.count, 0);
    const rows = othersCount > 0
      ? [...top5, { vendor: "", model: "Others", count: othersCount, percent: total ? (othersCount / total) * 100 : 0, color: "#94a3b8" }]
      : top5;
    let cursor = 0;
    const slices = rows.map(row => {
      const startAngle = total ? (cursor / total) * 360 : 0;
      cursor += row.count;
      const endAngle = total ? (cursor / total) * 360 : 0;
      return { ...row, startAngle, endAngle };
    });
    return { slices, top5, total, totalModels: modelSlices.length };
  }, [inventoryModelChart]);

  // Compute customer pie slices from API data
  const inventoryCustomerChart = useMemo(() => {
    const customers = invData?.customers ?? [];
    const total = invData?.total ?? 0;
    let cursor = 0;
    const customerSlices = customers.map((row, idx) => {
      const startAngle = total ? (cursor / total) * 360 : 0;
      cursor += row.count;
      const endAngle = total ? (cursor / total) * 360 : 0;
      return {
        ...row,
        percent: total ? (row.count / total) * 100 : 0,
        color: VENDOR_PIE_COLORS[idx % VENDOR_PIE_COLORS.length]!,
        startAngle,
        endAngle,
      };
    });
    return { customerSlices, total };
  }, [invData]);

  // Top 5 customers with an "Others" aggregate slice for the pie
  const top5CustomerChart = useMemo(() => {
    const { customerSlices, total } = inventoryCustomerChart;
    const top5 = customerSlices.slice(0, 5);
    const othersCount = customerSlices.slice(5).reduce((s, r) => s + r.count, 0);
    const rows = othersCount > 0
      ? [...top5, { customer: "Others", count: othersCount, percent: total ? (othersCount / total) * 100 : 0, color: "#94a3b8" }]
      : top5;
    let cursor = 0;
    const slices = rows.map(row => {
      const startAngle = total ? (cursor / total) * 360 : 0;
      cursor += row.count;
      const endAngle = total ? (cursor / total) * 360 : 0;
      return { ...row, startAngle, endAngle };
    });
    return { slices, top5, total, totalCustomers: customerSlices.length };
  }, [inventoryCustomerChart]);

  // Compute status pie slices from API data
  const inventoryStatusChart = useMemo(() => {
    const statuses = invData?.statuses ?? [];
    const total = invData?.total ?? 0;
    let cursor = 0;
    const slices = statuses.map((row) => {
      const startAngle = total ? (cursor / total) * 360 : 0;
      cursor += row.count;
      const endAngle = total ? (cursor / total) * 360 : 0;
      return {
        ...row,
        percent: total ? (row.count / total) * 100 : 0,
        color: STATUS_PIE_COLORS[row.status] || "#94a3b8",
        startAngle,
        endAngle,
      };
    });
    return { slices, total };
  }, [invData]);

  useEffect(() => {
    if (inventoryFilter) {
      setInvModalPeriod(invPeriod);
      setInvModalYear(invYear);
      setInvModalMonth(invMonth);
      setInvModalCustomFrom(invCustomFrom);
      setInvModalCustomTo(invCustomTo);
    }
  }, [inventoryFilter, invPeriod, invYear, invMonth, invCustomFrom, invCustomTo]);

  const modalFilteredTickets = useMemo(() => {
    if (!inventoryFilter) return [];
    const byVendorModel = (tickets || []).filter((t) => {
      const vendor = normalizeInventoryLabel(t.inverterMake, "Unknown Vendor");
      const model = normalizeInventoryLabel(t.inverterModel, "Unknown Model");
      if (inventoryFilter.type === "vendor") return vendor === inventoryFilter.vendor;
      if (inventoryFilter.type === "status") return String(t.status || "").toUpperCase().trim() === inventoryFilter.status;
      return vendor === inventoryFilter.vendor && model === inventoryFilter.model;
    });
    if (invModalPeriod === "all") return byVendorModel;
    return byVendorModel.filter((t) => {
      const d = new Date(t.createdAt);
      if (Number.isNaN(d.getTime())) return false;
      if (invModalPeriod === "weekly") {
        const n = new Date();
        const day = n.getDay();
        const monday = new Date(n);
        monday.setDate(n.getDate() + (day === 0 ? -6 : 1 - day));
        monday.setHours(0, 0, 0, 0);
        return d >= monday && d <= n;
      }
      if (invModalPeriod === "monthly") {
        return d.getFullYear() === invModalYear && d.getMonth() + 1 === invModalMonth;
      }
      if (invModalPeriod === "quarterly") {
        const q = Math.floor((invModalMonth - 1) / 3);
        const dq = Math.floor(d.getMonth() / 3);
        return d.getFullYear() === invModalYear && dq === q;
      }
      if (invModalPeriod === "halfyearly") {
        const h = invModalMonth <= 6 ? 0 : 1;
        const dh = d.getMonth() < 6 ? 0 : 1;
        return d.getFullYear() === invModalYear && dh === h;
      }
      if (invModalPeriod === "yearly") {
        return d.getFullYear() === invModalYear;
      }
      if (invModalPeriod === "custom") {
        const from = invModalCustomFrom ? new Date(invModalCustomFrom + "T00:00:00") : null;
        const to = invModalCustomTo ? new Date(invModalCustomTo + "T23:59:59") : null;
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      }
      return true;
    });
  }, [inventoryFilter, tickets, invModalPeriod, invModalYear, invModalMonth, invModalCustomFrom, invModalCustomTo, now]);

  useEffect(() => {
    if (!showTrends) return;
    let cancelled = false;
    // For a custom range, fetch enough days to reach back to the "from" date
    // (backend returns the last N days ending today; capped at 365).
    let fetchDays = trendDays;
    if (trendCustom) {
      if (!trendCustomFrom) return;
      const fromMs = new Date(trendCustomFrom + "T00:00:00").getTime();
      const spanDays = Math.ceil((Date.now() - fromMs) / 86400000) + 1;
      fetchDays = Math.min(365, Math.max(7, spanDays));
    }
    apiDashboardTicketTrends(fetchDays)
      .then((r) => {
        if (cancelled) return;
        const series = Array.isArray(r.series) ? r.series : [];
        setTrends(series);
        setSelectedTrendDate((prev) => {
          if (prev && series.some((p) => p.date === prev)) return prev;
          return series.length ? String(series[series.length - 1]!.date || "") : "";
        });
        setTrendsErr("");
      })
      .catch((e) => {
        if (cancelled) return;
        setTrends([]);
        setTrendsErr(e instanceof Error ? e.message : "Failed to load ticket trends");
      });
    return () => {
      cancelled = true;
    };
  }, [showTrends, trendDays, trendCustom, trendCustomFrom]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setSvcLoading(true);
    setSvcErr("");
    apiDashboardServicingStatus(reportInput)
      .then((r) => {
        if (cancelled) return;
        setSvcPeriodLabel({ from: r.period.from, to: r.period.to });
        setSvcTotals(r.totals);
        setSvcDaily(r.daily || []);
      })
      .catch((e) => {
        if (cancelled) return;
        setSvcErr(e instanceof Error ? e.message : "Failed to load servicing status");
        setSvcPeriodLabel(null);
        setSvcTotals(null);
        setSvcDaily([]);
      })
      .finally(() => {
        if (cancelled) return;
        setSvcLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, reportInput]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setClientsLoading(true);
    setClientsErr("");
    apiDashboardClientDetailsList(reportInput)
      .then((r) => {
        if (cancelled) return;
        setClients(r.clients || []);
      })
      .catch((e) => {
        if (cancelled) return;
        setClientsErr(e instanceof Error ? e.message : "Failed to load client details");
        setClients([]);
      })
      .finally(() => {
        if (cancelled) return;
        setClientsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, reportInput]);

  const reportYears = useMemo(() => {
    const y = defaultYear;
    const out: number[] = [];
    for (let i = 0; i < 6; i += 1) out.push(y - i);
    return out;
  }, [defaultYear]);

  const reportMonths = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }, []);

  const formatRange = (fromYmd: string, toYmd: string) => {
    const fmt = (s: string) => {
      const d = new Date(`${s}T00:00:00`);
      if (Number.isNaN(d.getTime())) return s;
      return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(d);
    };
    const a = String(fromYmd || "").trim();
    const b = String(toYmd || "").trim();
    if (!a || !b) return "";
    return `${fmt(a)} → ${fmt(b)}`;
  };

  const PeriodControls = (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <select
        className="form-select"
        value={reportPeriod}
        onChange={(e) => setReportPeriod(e.target.value as DashboardPeriodInput["period"])}
        style={{ width: 150, fontFamily: "var(--mono)", fontSize: 12 }}
        aria-label="Select report period"
      >
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="halfyearly">Half Yearly</option>
        <option value="yearly">Yearly</option>
        <option value="custom">Custom Dates</option>
      </select>

      {reportPeriod === "monthly" || reportPeriod === "halfyearly" || reportPeriod === "yearly" ? (
        <select
          className="form-select"
          value={String(reportYear)}
          onChange={(e) => setReportYear(Number(e.target.value) || defaultYear)}
          style={{ width: 110, fontFamily: "var(--mono)", fontSize: 12 }}
          aria-label="Select year"
        >
          {reportYears.map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      ) : null}

      {reportPeriod === "monthly" ? (
        <select
          className="form-select"
          value={String(reportMonth)}
          onChange={(e) => setReportMonth(Number(e.target.value) || defaultMonth)}
          style={{ width: 130, fontFamily: "var(--mono)", fontSize: 12 }}
          aria-label="Select month"
        >
          {reportMonths.map((m) => (
            <option key={m} value={String(m)}>
              {new Intl.DateTimeFormat("en-IN", { month: "long" }).format(new Date(2020, m - 1, 1))}
            </option>
          ))}
        </select>
      ) : null}

      {reportPeriod === "custom" ? (
        <>
          <input type="date" value={reportCustomFrom} onChange={(e) => setReportCustomFrom(e.target.value)}
            style={{ fontSize: 12, padding: "4px 8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} />
          <span style={{ fontSize: 12, color: "var(--text3)" }}>to</span>
          <input type="date" value={reportCustomTo} onChange={(e) => setReportCustomTo(e.target.value)}
            style={{ fontSize: 12, padding: "4px 8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} />
        </>
      ) : null}
    </div>
  );

  const formatTrendDate = (raw: string) => {
    const s = String(raw || "").trim();
    if (!s) return "";
    const d = new Date(`${s}T00:00:00`);
    if (Number.isNaN(d.getTime())) return s;
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(d);
  };

  const formatTrendTooltip = (raw: string) => {
    const s = String(raw || "").trim();
    if (!s) return "";
    const d = new Date(`${s}T00:00:00`);
    if (Number.isNaN(d.getTime())) return s;
    return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "2-digit", month: "short" }).format(d);
  };

  // Calendar-scoped ranges (not rolling windows): "Weekly" (7) = current week
  // (Mon→today), "Monthly" (31) = current calendar month, "Half Yearly" (184) =
  // current half (Jan–Jun or Jul–Dec), "Yearly" (365) = current calendar year.
  // "Quarterly" (90) stays a rolling window.
  const trendsScoped = useMemo(() => {
    const raw = trends || [];
    const n = new Date();
    if (trendCustom) {
      const from = trendCustomFrom || "";
      const to = trendCustomTo || "";
      return raw.filter((p) => {
        const d = String(p.date || "");
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }
    if (trendDays === 7) {
      const dow = n.getDay(); // 0=Sun..6=Sat
      const diffToMonday = dow === 0 ? -6 : 1 - dow;
      const monday = new Date(n.getFullYear(), n.getMonth(), n.getDate() + diffToMonday);
      const mondayYmd = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
      return raw.filter((p) => String(p.date || "") >= mondayYmd);
    }
    if (trendDays === 31) {
      const ym = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
      return raw.filter((p) => String(p.date || "").startsWith(ym));
    }
    if (trendDays === 184) {
      // Current calendar half-year: H1 = Jan–Jun, H2 = Jul–Dec.
      const firstHalf = n.getMonth() <= 5;
      const start = firstHalf ? `${n.getFullYear()}-01-01` : `${n.getFullYear()}-07-01`;
      const end = firstHalf ? `${n.getFullYear()}-06-30` : `${n.getFullYear()}-12-31`;
      return raw.filter((p) => { const d = String(p.date || ""); return d >= start && d <= end; });
    }
    if (trendDays === 365) {
      const y = `${n.getFullYear()}-`;
      return raw.filter((p) => String(p.date || "").startsWith(y));
    }
    return raw;
  }, [trends, trendDays, trendCustom, trendCustomFrom, trendCustomTo]);

  // Effective span (in days) used to choose daily/weekly/monthly bucketing.
  const effectiveTrendDays = useMemo(() => {
    if (!trendCustom) return trendDays;
    if (trendCustomFrom && trendCustomTo) {
      const diff =
        Math.ceil(
          (new Date(trendCustomTo + "T00:00:00").getTime() - new Date(trendCustomFrom + "T00:00:00").getTime()) /
            86400000,
        ) + 1;
      return Math.max(1, diff);
    }
    return 90;
  }, [trendCustom, trendCustomFrom, trendCustomTo, trendDays]);

  const trendTotals = useMemo(() => {
    const created = trendsScoped.reduce((s, p) => s + (Number(p.created) || 0), 0);
    const closed = trendsScoped.reduce((s, p) => s + (Number(p.closed) || 0), 0);
    const repaired = trendsScoped.reduce((s, p) => s + (Number(p.repaired) || 0), 0);
    return { created, closed, repaired };
  }, [trendsScoped]);

  const trendsChartPoints = useMemo(() => {
    const raw = trendsScoped;
    const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Half-yearly (182) and yearly (365): group into monthly buckets
    if (effectiveTrendDays >= 182) {
      const months = new Map<string, { created: number; repaired: number; closed: number; label: string; tooltip: string }>();
      for (const p of raw) {
        const d = new Date(`${p.date}T00:00:00`);
        if (Number.isNaN(d.getTime())) continue;
        const year = d.getFullYear();
        const month = d.getMonth();
        const monthKey = `${year}-${String(month + 1).padStart(2, "0")}-01`;
        const existing = months.get(monthKey);
        if (!existing) {
          months.set(monthKey, {
            created: 0, repaired: 0, closed: 0,
            label: `${MONTH_SHORT[month]} '${String(year).slice(2)}`,
            tooltip: `${MONTH_SHORT[month]} ${year}`,
          });
        }
        const m = months.get(monthKey)!;
        m.created += Number(p.created) || 0;
        m.repaired += Number(p.repaired) || 0;
        m.closed += Number(p.closed) || 0;
      }
      return Array.from(months.entries()).map(([monthKey, m]) => ({
        id: monthKey,
        xLabel: m.label,
        xTooltip: m.tooltip,
        bars: [
          { id: "created", label: "Created", value: m.created, color: "#f59e0b" },
          { id: "repaired", label: "Repaired", value: m.repaired, color: "#3b82f6" },
          { id: "closed", label: "Closed", value: m.closed, color: "#22c55e" },
        ],
      }));
    }

    if (raw.length <= 60) {
      return raw.map((p) => ({
        id: p.date,
        xLabel: formatTrendDate(p.date),
        xTooltip: formatTrendTooltip(p.date),
        bars: [
          { id: "created", label: "Created", value: Math.max(0, Number(p.created) || 0), color: "#f59e0b" },
          { id: "repaired", label: "Repaired", value: Math.max(0, Number(p.repaired) || 0), color: "#3b82f6" },
          { id: "closed", label: "Closed", value: Math.max(0, Number(p.closed) || 0), color: "#22c55e" },
        ],
      }));
    }

    // Group into weekly buckets for 60-182 day ranges
    const weeks = new Map<string, { created: number; repaired: number; closed: number }>();
    for (const p of raw) {
      const d = new Date(p.date);
      const dayOfWeek = d.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(d);
      monday.setDate(d.getDate() + diffToMonday);
      const weekKey = monday.toISOString().slice(0, 10);
      const w = weeks.get(weekKey) ?? { created: 0, repaired: 0, closed: 0 };
      w.created += Number(p.created) || 0;
      w.repaired += Number(p.repaired) || 0;
      w.closed += Number(p.closed) || 0;
      weeks.set(weekKey, w);
    }
    return Array.from(weeks.entries()).map(([weekKey, w]) => ({
      id: weekKey,
      xLabel: formatTrendDate(weekKey),
      xTooltip: `Week of ${formatTrendTooltip(weekKey)}`,
      bars: [
        { id: "created", label: "Created", value: w.created, color: "#f59e0b" },
        { id: "repaired", label: "Repaired", value: w.repaired, color: "#3b82f6" },
        { id: "closed", label: "Closed", value: w.closed, color: "#22c55e" },
      ],
    }));
  }, [trendsScoped, effectiveTrendDays]);

  const selectedTrendSummary = useMemo(() => {
    const point = trendsChartPoints.find((p) => p.id === selectedTrendDate);
    if (!point) return null;
    const bars = point.bars || [];
    return {
      label: point.xTooltip || point.xLabel,
      created: bars.find((b) => b.id === "created")?.value ?? 0,
      repaired: bars.find((b) => b.id === "repaired")?.value ?? 0,
      closed: bars.find((b) => b.id === "closed")?.value ?? 0,
    };
  }, [trendsChartPoints, selectedTrendDate]);

  const openTrendBarModal = (pointId: string) => {
    setSelectedTrendDate(pointId);
    const point = trendsChartPoints.find((p) => p.id === pointId);
    if (!point) return;
    const bars = point.bars || [];
    const summary = {
      created: bars.find((b) => b.id === "created")?.value ?? 0,
      repaired: bars.find((b) => b.id === "repaired")?.value ?? 0,
      closed: bars.find((b) => b.id === "closed")?.value ?? 0,
    };
    // Compute date range for the period
    let from: Date | null = null;
    let to: Date | null = null;
    if (effectiveTrendDays >= 182) {
      // Monthly — pointId = "YYYY-MM-01"
      const d = new Date(pointId + "T00:00:00");
      from = new Date(d.getFullYear(), d.getMonth(), 1);
      to = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    } else if (effectiveTrendDays > 60) {
      // Weekly — pointId = Monday "YYYY-MM-DD"
      const monday = new Date(pointId + "T00:00:00");
      from = monday;
      to = new Date(monday);
      to.setDate(monday.getDate() + 6);
      to.setHours(23, 59, 59);
    } else {
      // Daily — pointId = "YYYY-MM-DD"
      const d = new Date(pointId + "T00:00:00");
      from = d;
      to = new Date(d);
      to.setHours(23, 59, 59);
    }
    const filtered = (tickets || []).filter((t) => {
      const d = new Date(t.createdAt);
      if (isNaN(d.getTime())) return false;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
    setTrendModal({ label: point.xTooltip || point.xLabel, tickets: filtered, summary });
  };

  const openTrendPieModal = (category: "created" | "repaired" | "closed", label: string, value: number) => {
    const filtered = (tickets || []).filter((t) => {
      const s = String(t.status || "").toUpperCase();
      if (category === "closed") return s === "CLOSED";
      if (category === "repaired") return s === "UNDER_REPAIRED" || s === "REPAIRED";
      return true; // "created" → show all in period
    });
    setTrendModal({
      label: `${label} (${value})`,
      tickets: filtered,
      summary: undefined,
    });
  };

  const trendsCard = showTrends ? (
    <div className="table-card" style={{ marginBottom: 16 }}>
      <div className="table-header">
        <div className="table-title">Status of Tickets</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
            {(["bar", "line", "pie"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTrendChartType(type)}
                style={{
                  padding: "4px 12px",
                  fontSize: 12,
                  fontFamily: "var(--mono)",
                  cursor: "pointer",
                  border: "none",
                  borderRight: type !== "pie" ? "1px solid var(--border)" : "none",
                  background: trendChartType === type ? "var(--primary)" : "var(--bg2)",
                  color: trendChartType === type ? "#fff" : "var(--text2)",
                  fontWeight: trendChartType === type ? 600 : 400,
                  transition: "background 0.15s",
                }}
              >
                {type === "bar" ? "Bar" : type === "line" ? "Line" : "Pie"}
              </button>
            ))}
          </div>
          <select
            className="form-select"
            value={trendCustom ? "custom" : String(trendDays)}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "custom") {
                setTrendCustom(true);
                return;
              }
              setTrendCustom(false);
              const n = Number.parseInt(v, 10);
              setTrendDays(Number.isFinite(n) ? n : 184);
            }}
            aria-label="Select trend range"
            style={{ width: 150, fontFamily: "var(--mono)", fontSize: 12 }}
          >
            <option value="7">Weekly</option>
            <option value="31">Monthly</option>
            <option value="90">Quarterly</option>
            <option value="184">Half Yearly</option>
            <option value="365">Yearly</option>
            <option value="custom">Custom</option>
          </select>
          {trendCustom && (
            <>
              <input
                type="date"
                className="form-input"
                value={trendCustomFrom}
                max={trendCustomTo || undefined}
                onChange={(e) => setTrendCustomFrom(e.target.value)}
                aria-label="Trend range from"
                style={{ width: 150, fontFamily: "var(--mono)", fontSize: 12 }}
              />
              <span style={{ color: "var(--text3)", fontSize: 12 }}>→</span>
              <input
                type="date"
                className="form-input"
                value={trendCustomTo}
                min={trendCustomFrom || undefined}
                max={ymdOf(new Date())}
                onChange={(e) => setTrendCustomTo(e.target.value)}
                aria-label="Trend range to"
                style={{ width: 150, fontFamily: "var(--mono)", fontSize: 12 }}
              />
            </>
          )}
        </div>
      </div>
      <div style={{ padding: "20px" }}>
        {trendsErr ? (
          <div style={{ fontSize: 12, color: "var(--text3)" }}>{trendsErr}</div>
        ) : trends.length ? (
          <>
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 14,
                background: "var(--bg2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      gap: 8,
                      alignItems: "center",
                      fontSize: 12,
                      color: "var(--text2)",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: "#f59e0b",
                        display: "inline-block",
                      }}
                    />
                    Created
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      gap: 8,
                      alignItems: "center",
                      fontSize: 12,
                      color: "var(--text2)",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: "#3b82f6",
                        display: "inline-block",
                      }}
                    />
                    Repaired
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      gap: 8,
                      alignItems: "center",
                      fontSize: 12,
                      color: "var(--text2)",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: "#22c55e",
                        display: "inline-block",
                      }}
                    />
                    Closed
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>
                    Total:{" "}
                    <span style={{ fontFamily: "var(--mono)" }}>
                      {trendTotals.created} created · {trendTotals.repaired} repaired · {trendTotals.closed} closed
                    </span>
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>
                {trendChartType === "pie" ? "Total breakdown" : "Tap bars/points for details"}
              </div>
              </div>

              {trendChartType !== "pie" && selectedTrendSummary ? (
                <div style={{ marginBottom: 10, fontSize: 12, color: "var(--text2)" }}>
                  Selected:{" "}
                  <span className="tag" style={{ fontFamily: "var(--mono)" }}>
                    {selectedTrendSummary.label}
                  </span>{" "}
                  <span style={{ fontFamily: "var(--mono)" }}>
                    {selectedTrendSummary.created} created · {selectedTrendSummary.repaired} repaired ·{" "}
                    {selectedTrendSummary.closed} closed
                  </span>
                </div>
              ) : null}

              {trendChartType === "bar" && (
                <ComboBarLineChart
                  points={trendsChartPoints}
                  selectedId={selectedTrendDate}
                  onSelect={openTrendBarModal}
                  height={220}
                  yLabel="Tickets"
                  showBarValues
                  showLine={false}
                  xLabelStep={effectiveTrendDays >= 182 ? 1 : undefined}
                  ariaLabel="Tickets created vs repaired vs closed bar chart"
                />
              )}

              {trendChartType === "line" && (
                <ComboBarLineChart
                  points={trendsChartPoints}
                  selectedId={selectedTrendDate}
                  onSelect={openTrendBarModal}
                  height={220}
                  yLabel="Tickets"
                  showBars={false}
                  showBarValues={false}
                  showLine={true}
                  xLabelStep={effectiveTrendDays >= 182 ? 1 : undefined}
                  ariaLabel="Tickets created vs repaired vs closed line chart"
                />
              )}

              {trendChartType === "pie" && (() => {
                const pieData = [
                  { id: "created", label: "Created", value: trendTotals.created, color: "#f59e0b" },
                  { id: "repaired", label: "Repaired", value: trendTotals.repaired, color: "#3b82f6" },
                  { id: "closed", label: "Closed", value: trendTotals.closed, color: "#22c55e" },
                ];
                const total = pieData.reduce((s, d) => s + d.value, 0);
                const cx = 100, cy = 100, r = 75, ir = 45;
                let cumAngle = -Math.PI / 2;
                return (
                  <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", justifyContent: "center", padding: "8px 0" }}>
                    <svg width={200} height={200} viewBox="0 0 200 200" aria-label="Tickets pie chart">
                      {total === 0 ? (
                        <circle cx={cx} cy={cy} r={r} fill="var(--border)" />
                      ) : pieData.map((d) => {
                        if (d.value === 0) return null;
                        const frac = d.value / total;
                        const startAngle = cumAngle;
                        const endAngle = cumAngle + frac * 2 * Math.PI;
                        cumAngle = endAngle;
                        const largeArc = frac > 0.5 ? 1 : 0;
                        const x1 = cx + r * Math.cos(startAngle);
                        const y1 = cy + r * Math.sin(startAngle);
                        const x2 = cx + r * Math.cos(endAngle);
                        const y2 = cy + r * Math.sin(endAngle);
                        const ix1 = cx + ir * Math.cos(startAngle);
                        const iy1 = cy + ir * Math.sin(startAngle);
                        const ix2 = cx + ir * Math.cos(endAngle);
                        const iy2 = cy + ir * Math.sin(endAngle);
                        const pathD = [
                          `M ${ix1} ${iy1}`,
                          `L ${x1} ${y1}`,
                          `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
                          `L ${ix2} ${iy2}`,
                          `A ${ir} ${ir} 0 ${largeArc} 0 ${ix1} ${iy1}`,
                          "Z",
                        ].join(" ");
                        return <path key={d.id} d={pathD} fill={d.color} stroke="var(--bg)" strokeWidth={2}
                          style={{ cursor: "pointer" }} onClick={() => openTrendPieModal(d.id as "created"|"repaired"|"closed", d.label, d.value)}>
                          <title>{d.label}: {d.value}</title>
                        </path>;
                      })}
                      <text x={cx} y={cy - 8} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--text1)">{total}</text>
                      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={10} fill="var(--text3)">Total</text>
                    </svg>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {pieData.map((d) => (
                        <button key={d.id} type="button" onClick={() => openTrendPieModal(d.id as "created"|"repaired"|"closed", d.label, d.value)}
                          style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, background: "none", border: "none", cursor: "pointer", padding: "2px 0", textAlign: "left" }}>
                          <span style={{ width: 12, height: 12, borderRadius: 3, background: d.color, display: "inline-block", flexShrink: 0 }} />
                          <span style={{ color: "var(--text2)", minWidth: 64 }}>{d.label}</span>
                          <span style={{ fontFamily: "var(--mono)", fontWeight: 600, color: "var(--text1)" }}>{d.value}</span>
                          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>
                            ({total > 0 ? ((d.value / total) * 100).toFixed(1) : "0.0"}%)
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {trendChartType !== "pie" && (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    fontSize: 12,
                    color: "var(--text3)",
                    marginTop: 8,
                  }}
                >
                  <span style={{ fontFamily: "var(--mono)" }}>
                    Tip: tap any point to see counts for that date.
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: "var(--text3)" }}>No data.</div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="content">
      <div className="page-header">
        <div className="page-title">
          Good Morning, {user.name.split(" ")[0]}
        </div>
        <div className="page-sub">
          Here&apos;s what&apos;s happening with your service operations today
        </div>
      </div>

      {isCustomer ? (
        <>
          <div className="table-card">
            <div className="table-header">
              <div className="table-title">Your Tickets</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowAllDashboardTickets((v) => !v)}
                >
                  {showAllDashboardTickets ? "Show Less" : "Show All"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => onNav("tickets")}>
                  View All →
                </button>
              </div>
            </div>
            <div
              className="scroll-x"
              style={showAllDashboardTickets ? { maxHeight: 420, overflowY: "auto" } : undefined}
            >
              <table>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Inverter</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {myTickets.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: 22, color: "var(--text3)" }}>
                        No tickets found.
                      </td>
                    </tr>
                  ) : (
                    (showAllDashboardTickets ? myTickets : myTickets.slice(0, 8)).map((t) => (
                      <tr key={t.id}>
                        <td>
                          <button
                            type="button"
                            className="td-mono table-link"
                            onClick={() => onViewTicket(t)}
                            title="View ticket"
                          >
                            {t.ticketId}
                          </button>
                        </td>
                        <td>
                          <span className="tag">
                            {t.inverterMake} {t.capacity}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={t.status} />
                        </td>
                        <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text3)" }}>
                          {t.createdAt}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trends chart intentionally hidden for customers */}
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {/* Counter period filter */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              {(["last_day", "this_month", "last_month", "all_time", "custom"] as const).map((p) => {
                const label = p === "last_day" ? "Last Day" : p === "this_month" ? "This Month" : p === "last_month" ? "Last Month" : p === "all_time" ? "All Time" : "Custom";
                const active = counterPeriod === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCounterPeriod(p)}
                    style={{
                      padding: "4px 12px", borderRadius: 20, border: active ? "1.5px solid #3b1a08" : "1.5px solid var(--border)",
                      background: active ? "#3b1a08" : "var(--surface)", color: active ? "#fff" : "var(--text2)",
                      fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
              {counterPeriod === "custom" && (
                <>
                  <input
                    type="date"
                    value={counterCustomFrom}
                    onChange={(e) => setCounterCustomFrom(e.target.value)}
                    style={{ fontSize: 12, padding: "3px 8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
                  />
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>to</span>
                  <input
                    type="date"
                    value={counterCustomTo}
                    onChange={(e) => setCounterCustomTo(e.target.value)}
                    style={{ fontSize: 12, padding: "3px 8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
                  />
                </>
              )}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav("tickets")}>
              View All →
            </button>
          </div>
          <div className="kpi-grid">
            {[
              {
                label: "Inward Stage",
                value: inward,
                sub: `Created: ${inwardCreated} · Under pickup: ${inwardUnderPickup}`,
                color: "#0d9488",
                Icon: LuTicket,
                onClick: () => onOpenTickets({ tab: "inward" }),
              },
              {
                label: "Under Progress",
                value: underProgressCounts.total,
                sub: `Under repair: ${underProgressCounts.underRepair} · Repaired: ${underProgressCounts.repaired} · Scrap: ${underProgressCounts.scrap}`,
                color: "#f97316",
                Icon: LuWrench,
                onClick: () => onOpenTickets({ tab: "repaired" }),
              },
              {
                label: "Outward",
                value: outwardCounts.total,
                sub: `Under dispatch: ${outwardCounts.underDispatch} · Dispatched: ${outwardCounts.dispatched}`,
                color: "#0ea5e9",
                Icon: LuTruck,
                onClick: () => onOpenTickets({ tab: "outward" }),
              },
              {
                label: "Under Approval",
                value: approvalPending.length,
                sub: "Waiting for Admin approval",
                color: "#7c3aed",
                Icon: LuShieldAlert,
                onClick: () => onOpenTickets({ tab: "approval_pending" }),
              },
              /*
              {
                label: "High Priority",
                value: high,
                sub: "Needs immediate attention",
                color: "#d97706",
                Icon: LuTriangleAlert,
                onClick: () => onOpenTickets({ status: "OPEN", priority: "HIGH" }),
              },
              {
                label: "SLA Breached",
                value: breached,
                sub: "Exceeding deadline",
                color: "#c0392b",
                Icon: LuSiren,
                onClick: () => onNav("sla"),
              },
              */
              {
                label: "Resolved",
                value: closed,
                sub: `Closed tickets · ${counterPeriodLabel}`,
                color: "#16a34a",
                Icon: LuCircleCheck,
                onClick: () => onOpenTickets({ status: "CLOSED" }),
              },
              {
                label: "Under Warranty",
                value: underWarranty,
                sub: `Out of warranty: ${outOfWarranty}`,
                color: "#0891b2",
                Icon: LuShieldCheck,
                onClick: () =>
                  setTrendModal({ label: "Under Warranty", tickets: warrantyTickets, summary: undefined }),
              },
            ].map((k) => (
              <button
                key={k.label}
                type="button"
                className="kpi-card"
                onClick={k.onClick}
                title={`Go to ${k.label}`}
              >
                <div className="kpi-accent-bar" style={{ background: k.color }} />
                <div className="kpi-icon" style={{ color: k.color }} aria-hidden>
                  <k.Icon />
                </div>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value" style={{ color: k.color }}>
                  {k.value}
                </div>
                <div className="kpi-sub">{k.sub}</div>
              </button>
            ))}
          </div>

          {/* Keep the KPI tile for admins, but don’t show the full approval list on dashboard. */}

          <div className="table-card" style={{ marginBottom: 16 }}>
            <div className="table-header" style={{ flexWrap: "wrap", gap: 12 }}>
              <div>
                <div className="table-title">Inverter Details</div>
                <div style={{ marginTop: 4, fontSize: 12, color: "var(--text3)" }}>
                  Click any slice to view vendor tickets
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <select
                  className="form-select"
                  value={invPeriod}
                  onChange={(e) => setInvPeriod(e.target.value as "all" | "weekly" | "monthly" | "quarterly" | "halfyearly" | "yearly" | "custom")}
                  style={{ width: 140, fontFamily: "var(--mono)", fontSize: 12 }}
                  aria-label="Inventory period"
                >
                  <option value="all">All Time</option>
                  <option value="weekly">This Week</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="halfyearly">Half Yearly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom Dates</option>
                </select>
                {invPeriod === "monthly" || invPeriod === "quarterly" || invPeriod === "halfyearly" || invPeriod === "yearly" ? (
                  <select
                    className="form-select"
                    value={String(invYear)}
                    onChange={(e) => setInvYear(Number(e.target.value) || defaultYear)}
                    style={{ width: 100, fontFamily: "var(--mono)", fontSize: 12 }}
                    aria-label="Inventory year"
                  >
                    {reportYears.map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                ) : null}
                {invPeriod === "monthly" ? (
                  <select
                    className="form-select"
                    value={String(invMonth)}
                    onChange={(e) => setInvMonth(Number(e.target.value) || defaultMonth)}
                    style={{ width: 120, fontFamily: "var(--mono)", fontSize: 12 }}
                    aria-label="Inventory month"
                  >
                    {reportMonths.map((m) => (
                      <option key={m} value={String(m)}>
                        {new Intl.DateTimeFormat("en-IN", { month: "long" }).format(new Date(2020, m - 1, 1))}
                      </option>
                    ))}
                  </select>
                ) : null}
                {invPeriod === "custom" ? (
                  <>
                    <input type="date" value={invCustomFrom} onChange={(e) => setInvCustomFrom(e.target.value)}
                      style={{ fontSize: 12, padding: "4px 8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} />
                    <span style={{ fontSize: 12, color: "var(--text3)" }}>to</span>
                    <input type="date" value={invCustomTo} onChange={(e) => setInvCustomTo(e.target.value)}
                      style={{ fontSize: 12, padding: "4px 8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} />
                  </>
                ) : null}
                <div className="tag" style={{ fontFamily: "var(--mono)" }}>
                  Total: {inventoryVendorChart.total}
                </div>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              {invLoading && !invData ? (
                <div style={{ fontSize: 12, color: "var(--text3)", padding: 24, textAlign: "center" }}>Loading inventory data…</div>
              ) : invError ? (
                <div style={{ fontSize: 12, color: "#dc2626", padding: 12 }}>{invError}</div>
              ) : inventoryVendorChart.total ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>

                  {/* Chart 2 — Top 5 Make & Model */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Top 5 Make &amp; Model</div>
                    <svg viewBox="0 0 220 220" width="100%" height="220" role="img" aria-label="Top 5 make & model pie chart" style={{ maxWidth: 260, display: "block" }}>
                      {top5ModelChart.slices.length === 0 ? (
                        <circle cx="110" cy="110" r="92" fill="var(--border)" />
                      ) : top5ModelChart.slices.length === 1 ? (
                        <circle cx="110" cy="110" r="92" fill={top5ModelChart.slices[0]!.color} style={{ cursor: "pointer" }}
                          onClick={() => top5ModelChart.slices[0]!.model !== "Others" && setInventoryFilter({ type: "model", label: top5ModelChart.slices[0]!.model, vendor: top5ModelChart.slices[0]!.vendor, model: top5ModelChart.slices[0]!.model })}>
                          <title>{top5ModelChart.slices[0]!.vendor ? `${top5ModelChart.slices[0]!.vendor} · ` : ""}{top5ModelChart.slices[0]!.model}: {top5ModelChart.slices[0]!.count}</title>
                        </circle>
                      ) : (
                        top5ModelChart.slices.map((slice) => (
                          <path key={`${slice.vendor}|||${slice.model}`} d={describePieSlice(110, 110, 92, slice.startAngle, slice.endAngle)}
                            fill={slice.color} stroke="var(--surface)" strokeWidth="2"
                            style={{ cursor: slice.model !== "Others" ? "pointer" : "default" }}
                            onClick={() => slice.model !== "Others" && setInventoryFilter({ type: "model", label: slice.model, vendor: slice.vendor, model: slice.model })}>
                            <title>{slice.vendor ? `${slice.vendor} · ` : ""}{slice.model}: {slice.count} ({slice.percent.toFixed(1)}%)</title>
                          </path>
                        ))
                      )}
                      <circle cx="110" cy="110" r="54" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
                      <text x="110" y="105" textAnchor="middle" fill="var(--text3)" fontSize="10" fontFamily="var(--mono)">Models</text>
                      <text x="110" y="124" textAnchor="middle" fill="var(--text)" fontSize="22" fontWeight="700" fontFamily="var(--mono)">{top5ModelChart.totalModels}</text>
                    </svg>
                    {/* Top 5 make & model legend — fixed, no expand */}
                    <div style={{ display: "grid", gap: 5, width: "100%", maxWidth: 240 }}>
                      {top5ModelChart.top5.map((entry) => (
                        <button key={`${entry.vendor}|||${entry.model}`} type="button"
                          onClick={() => setInventoryFilter({ type: "model", label: entry.model, vendor: entry.vendor, model: entry.model })}
                          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 12, textAlign: "left", padding: "2px 0" }}>
                          <span style={{ width: 8, height: 8, borderRadius: 999, background: entry.color, flex: "0 0 auto" }} />
                          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <span style={{ color: "var(--text3)", fontSize: 11 }}>{entry.vendor} · </span>{entry.model}
                          </span>
                          <span style={{ fontFamily: "var(--mono)", color: "var(--text3)", fontSize: 11 }}>{entry.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart 3 — By Dispatch Status */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>By Status</div>
                    <svg viewBox="0 0 220 220" width="100%" height="220" role="img" aria-label="Status pie chart" style={{ maxWidth: 260, display: "block" }}>
                      {inventoryStatusChart.slices.length === 1 ? (
                        <circle cx="110" cy="110" r="92" fill={inventoryStatusChart.slices[0]!.color} style={{ cursor: "pointer" }}
                          onClick={() => setInventoryFilter({ type: "status", label: inventoryStatusChart.slices[0]!.status, vendor: "", status: inventoryStatusChart.slices[0]!.status })}>
                          <title>{formatTicketStatusLabel(inventoryStatusChart.slices[0]!.status)}: {inventoryStatusChart.slices[0]!.count}</title>
                        </circle>
                      ) : (
                        inventoryStatusChart.slices.map((slice) => (
                          <path key={slice.status} d={describePieSlice(110, 110, 92, slice.startAngle, slice.endAngle)}
                            fill={slice.color} stroke="var(--surface)" strokeWidth="2" style={{ cursor: "pointer" }}
                            onClick={() => setInventoryFilter({ type: "status", label: slice.status, vendor: "", status: slice.status })}>
                            <title>{formatTicketStatusLabel(slice.status)}: {slice.count} ({slice.percent.toFixed(1)}%)</title>
                          </path>
                        ))
                      )}
                      <circle cx="110" cy="110" r="54" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
                      <text x="110" y="105" textAnchor="middle" fill="var(--text3)" fontSize="10" fontFamily="var(--mono)">Status</text>
                      <text x="110" y="124" textAnchor="middle" fill="var(--text)" fontSize="22" fontWeight="700" fontFamily="var(--mono)">{inventoryStatusChart.total}</text>
                    </svg>
                    {/* Status legend — top 5 + expand */}
                    <div style={{ display: "grid", gap: 5, width: "100%", maxWidth: 240 }}>
                      {(showAllInventoryStatuses ? inventoryStatusChart.slices : inventoryStatusChart.slices.slice(0, 5)).map((slice) => (
                        <button key={slice.status} type="button"
                          onClick={() => setInventoryFilter({ type: "status", label: slice.status, vendor: "", status: slice.status })}
                          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 12, textAlign: "left", padding: "2px 0" }}>
                          <span style={{ width: 8, height: 8, borderRadius: 999, background: slice.color, flex: "0 0 auto" }} />
                          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{formatTicketStatusLabel(slice.status)}</span>
                          <span style={{ fontFamily: "var(--mono)", color: "var(--text3)", fontSize: 11 }}>{slice.count}</span>
                        </button>
                      ))}
                      {inventoryStatusChart.slices.length > 5 && (
                        <button type="button" onClick={() => setShowAllInventoryStatuses(v => !v)}
                          style={{ fontSize: 11, color: "var(--primary, #0d9488)", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "2px 0 2px 14px", fontWeight: 500 }}>
                          {showAllInventoryStatuses ? "Show less ▲" : `+ ${inventoryStatusChart.slices.length - 5} more statuses ▼`}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chart 4 — Top 5 Clients */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Top 5 Clients</div>
                    <svg viewBox="0 0 220 220" width="100%" height="220" role="img" aria-label="Top 5 clients pie chart" style={{ maxWidth: 260, display: "block" }}>
                      {top5CustomerChart.slices.length === 0 ? (
                        <circle cx="110" cy="110" r="92" fill="var(--border)" />
                      ) : top5CustomerChart.slices.length === 1 ? (
                        <circle cx="110" cy="110" r="92" fill={top5CustomerChart.slices[0]!.color}>
                          <title>{top5CustomerChart.slices[0]!.customer}: {top5CustomerChart.slices[0]!.count}</title>
                        </circle>
                      ) : (
                        top5CustomerChart.slices.map((slice) => (
                          <path key={slice.customer} d={describePieSlice(110, 110, 92, slice.startAngle, slice.endAngle)}
                            fill={slice.color} stroke="var(--surface)" strokeWidth="2">
                            <title>{slice.customer}: {slice.count} ({slice.percent.toFixed(1)}%)</title>
                          </path>
                        ))
                      )}
                      <circle cx="110" cy="110" r="54" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
                      <text x="110" y="105" textAnchor="middle" fill="var(--text3)" fontSize="10" fontFamily="var(--mono)">Clients</text>
                      <text x="110" y="124" textAnchor="middle" fill="var(--text)" fontSize="22" fontWeight="700" fontFamily="var(--mono)">{top5CustomerChart.totalCustomers}</text>
                    </svg>
                    {/* Top 5 client legend — fixed, no expand */}
                    <div style={{ display: "grid", gap: 5, width: "100%", maxWidth: 240 }}>
                      {top5CustomerChart.top5.map((entry) => (
                        <button key={entry.customer} type="button"
                          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "default", fontSize: 12, textAlign: "left", padding: "2px 0" }}>
                          <span style={{ width: 8, height: 8, borderRadius: 999, background: entry.color, flex: "0 0 auto" }} />
                          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.customer}</span>
                          <span style={{ fontFamily: "var(--mono)", color: "var(--text3)", fontSize: 11 }}>{entry.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--text3)" }}>No inventory data.</div>
              )}
            </div>
          </div>

          {/* Inventory filter modal — vendor or model drill-down */}
          {inventoryFilter ? (
            <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setInventoryFilter(null)}>
              <div className="modal" style={{ width: 920, maxWidth: "95vw" }} role="dialog" aria-modal="true">
                <div className="modal-header" style={{ flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div className="modal-title">
                      {inventoryFilter.type === "vendor" ? "Vendor" : inventoryFilter.type === "model" ? "Model" : "Status"} · {inventoryFilter.label.replace(/_/g, " ")}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
                      {modalFilteredTickets.length} ticket{modalFilteredTickets.length !== 1 ? "s" : ""}
                      {inventoryFilter.type === "model" ? ` · ${inventoryFilter.vendor}` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <select
                      className="form-select"
                      value={invModalPeriod}
                      onChange={(e) => setInvModalPeriod(e.target.value as "all" | "weekly" | "monthly" | "quarterly" | "halfyearly" | "yearly" | "custom")}
                      style={{ width: 140, fontFamily: "var(--mono)", fontSize: 12 }}
                      aria-label="Modal period filter"
                    >
                      <option value="all">All Time</option>
                      <option value="weekly">This Week</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="halfyearly">Half Yearly</option>
                      <option value="yearly">Yearly</option>
                      <option value="custom">Custom Dates</option>
                    </select>
                    {invModalPeriod === "monthly" || invModalPeriod === "quarterly" || invModalPeriod === "halfyearly" || invModalPeriod === "yearly" ? (
                      <select
                        className="form-select"
                        value={String(invModalYear)}
                        onChange={(e) => setInvModalYear(Number(e.target.value) || defaultYear)}
                        style={{ width: 100, fontFamily: "var(--mono)", fontSize: 12 }}
                        aria-label="Modal year"
                      >
                        {reportYears.map((y) => (
                          <option key={y} value={String(y)}>{y}</option>
                        ))}
                      </select>
                    ) : null}
                    {invModalPeriod === "monthly" ? (
                      <select
                        className="form-select"
                        value={String(invModalMonth)}
                        onChange={(e) => setInvModalMonth(Number(e.target.value) || defaultMonth)}
                        style={{ width: 120, fontFamily: "var(--mono)", fontSize: 12 }}
                        aria-label="Modal month"
                      >
                        {reportMonths.map((m) => (
                          <option key={m} value={String(m)}>
                            {new Intl.DateTimeFormat("en-IN", { month: "long" }).format(new Date(2020, m - 1, 1))}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    {invModalPeriod === "custom" ? (
                      <>
                        <input type="date" value={invModalCustomFrom} onChange={(e) => setInvModalCustomFrom(e.target.value)}
                          style={{ fontSize: 12, padding: "4px 8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} />
                        <span style={{ fontSize: 12, color: "var(--text3)" }}>to</span>
                        <input type="date" value={invModalCustomTo} onChange={(e) => setInvModalCustomTo(e.target.value)}
                          style={{ fontSize: 12, padding: "4px 8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} />
                      </>
                    ) : null}
                    <button className="btn btn-ghost btn-sm" onClick={() => setInventoryFilter(null)}>
                      Close
                    </button>
                  </div>
                </div>
                <div className="modal-body">
                  <div className="scroll-x" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Ticket ID</th>
                          <th>Customer</th>
                          <th>Model</th>
                          <th>Capacity</th>
                          <th>Serial No.</th>
                          <th>Status</th>
                          <th>Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!modalFilteredTickets.length ? (
                          <tr>
                            <td colSpan={7} style={{ padding: 18, color: "var(--text3)" }}>
                              No tickets found.
                            </td>
                          </tr>
                        ) : (
                          modalFilteredTickets.map((t) => (
                            <tr key={t.id}>
                              <td>
                                <button
                                  type="button"
                                  className="td-mono table-link"
                                  onClick={() => { setInventoryFilter(null); onViewTicket(t); }}
                                  title="View ticket"
                                >
                                  {t.ticketId}
                                </button>
                              </td>
                              <td>{t.customerName || t.customer || "—"}</td>
                              <td>
                                <span className="tag">{t.inverterMake} {t.inverterModel}</span>
                              </td>
                              <td style={{ fontFamily: "var(--mono)" }}>{t.capacity || "—"}</td>
                              <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{t.serialNumber || "—"}</td>
                              <td><StatusBadge status={t.status} /></td>
                              <td>
                                <span className="tag" style={{ color: t.priority === "HIGH" ? "#dc2626" : t.priority === "MEDIUM" ? "#d97706" : undefined }}>
                                  {t.priority}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {trendsCard}

          {/* Trend detail modal */}
          {trendModal ? (
            <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setTrendModal(null)}>
              <div className="modal" style={{ width: 860, maxWidth: "95vw" }} role="dialog" aria-modal="true">
                <div className="modal-header">
                  <div>
                    <div className="modal-title">{trendModal.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
                      {trendModal.tickets.length} ticket{trendModal.tickets.length !== 1 ? "s" : ""}
                      {trendModal.summary ? ` · Created: ${trendModal.summary.created} · Repaired: ${trendModal.summary.repaired} · Closed: ${trendModal.summary.closed}` : ""}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setTrendModal(null)}>Close</button>
                </div>
                <div className="scroll-x" style={{ maxHeight: 480, overflowY: "auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Customer</th>
                        <th>Make · Model</th>
                        <th>Serial No.</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!trendModal.tickets.length ? (
                        <tr><td colSpan={7} style={{ padding: 18, color: "var(--text3)" }}>No tickets found.</td></tr>
                      ) : trendModal.tickets.map((t) => (
                        <tr key={t.id}>
                          <td>
                            <button type="button" className="td-mono table-link"
                              onClick={() => { setTrendModal(null); onViewTicket(t); }} title="View ticket">
                              {t.ticketId}
                            </button>
                          </td>
                          <td>{t.customerName || t.customer || "—"}</td>
                          <td><span className="tag">{t.inverterMake} {t.inverterModel}</span></td>
                          <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{t.serialNumber || "—"}</td>
                          <td><StatusBadge status={t.status} /></td>
                          <td>
                            <span className="tag" style={{ color: t.priority === "HIGH" ? "#dc2626" : t.priority === "MEDIUM" ? "#d97706" : undefined }}>
                              {t.priority}
                            </span>
                          </td>
                          <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{t.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}


          {isAdmin ? (
            <>
              <div className="table-card" style={{ marginBottom: 16 }}>
                <div className="table-header">
                  <div className="table-title">Servicing Status</div>
                  {PeriodControls}
                </div>
                <div className="scroll-x">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ minWidth: 220 }}>
                          {svcPeriodLabel ? formatRange(svcPeriodLabel.from, svcPeriodLabel.to) : "Period"}
                        </th>
                        <th>No of Inverters Received</th>
                        <th>No of Inverters Repaired</th>
                        <th>No of Inverters declared as SCRAP</th>
                        <th>No of Inverters Dispatched</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {svcErr ? (
                        <tr>
                          <td colSpan={6} style={{ padding: 18, color: "var(--text3)" }}>
                            {svcErr}
                          </td>
                        </tr>
                      ) : svcLoading && !svcTotals ? (
                        <tr>
                          <td colSpan={6} style={{ padding: 18, color: "var(--text3)" }}>
                            Loading…
                          </td>
                        </tr>
                      ) : svcTotals ? (
                        <tr>
                          <td style={{ fontFamily: "var(--mono)", color: "var(--text3)" }}>
                            {svcPeriodLabel ? `${svcPeriodLabel.from} → ${svcPeriodLabel.to}` : "—"}
                          </td>
                          <td style={{ fontFamily: "var(--mono)" }}>{svcTotals.received}</td>
                          <td style={{ fontFamily: "var(--mono)" }}>{svcTotals.repaired}</td>
                          <td style={{ fontFamily: "var(--mono)" }}>{svcTotals.scrap}</td>
                          <td style={{ fontFamily: "var(--mono)" }}>{svcTotals.dispatched}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => setSvcDetailsOpen(true)}
                              disabled={!svcDaily.length}
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ padding: 18, color: "var(--text3)" }}>
                            No data.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="table-card" style={{ marginBottom: 16 }}>
                <div className="table-header">
                  <div className="table-title">Client Details</div>
                  {PeriodControls}
                </div>
                <div className="scroll-x" style={{ maxHeight: 360, overflowY: "auto" }}>
                  <table className="table-wrap-head">
                    <thead>
                      <tr>
                        <th>Client Name and Address</th>
                        <th>No of Inverters Received</th>
                        <th>No of Inverters Repaired</th>
                        <th>No of Inverters declared as SCRAP</th>
                        <th>No of Inverters Dispatched</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientsErr ? (
                        <tr>
                          <td colSpan={6} style={{ padding: 18, color: "var(--text3)" }}>
                            {clientsErr}
                          </td>
                        </tr>
                      ) : clientsLoading && !clients.length ? (
                        <tr>
                          <td colSpan={6} style={{ padding: 18, color: "var(--text3)" }}>
                            Loading…
                          </td>
                        </tr>
                      ) : !clients.length ? (
                        <tr>
                          <td colSpan={6} style={{ padding: 18, color: "var(--text3)" }}>
                            No data.
                          </td>
                        </tr>
                      ) : (
                        clients.map((c) => (
                          <tr key={c.name}>
                            <td>
                              <button
                                type="button"
                                className="table-link"
                                onClick={() => setClientLocationsModal(c)}
                                title="View locations"
                              >
                                {c.name || "—"}
                              </button>
                            </td>
                            <td style={{ fontFamily: "var(--mono)" }}>{c.received}</td>
                            <td style={{ fontFamily: "var(--mono)" }}>{c.repaired}</td>
                            <td style={{ fontFamily: "var(--mono)" }}>{c.scrap}</td>
                            <td style={{ fontFamily: "var(--mono)" }}>{c.dispatched}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => setClientLocationsModal(c)}
                              >
                                Locations
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}

          {svcDetailsOpen ? (
            <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSvcDetailsOpen(false)}>
              <div className="modal" style={{ width: 920, maxWidth: "95vw" }} role="dialog" aria-modal="true">
                <div className="modal-header">
                  <div className="modal-title">
                    Servicing Status · {svcPeriodLabel ? formatRange(svcPeriodLabel.from, svcPeriodLabel.to) : ""}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSvcDetailsOpen(false)}>
                    Close
                  </button>
                </div>
                <div className="modal-body">
                  <div className="scroll-x" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ minWidth: 120 }}>Date</th>
                          <th>No of Inverters Received</th>
                          <th>No of Inverters Repaired</th>
                          <th>No of Inverters declared as SCRAP</th>
                          <th>No of Inverters Dispatched</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!svcDaily.length ? (
                          <tr>
                            <td colSpan={5} style={{ padding: 18, color: "var(--text3)" }}>
                              No data.
                            </td>
                          </tr>
                        ) : (
                          svcDaily.map((r) => (
                            <tr key={r.date}>
                              <td style={{ fontFamily: "var(--mono)", color: "var(--text3)" }}>{r.date}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.received}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.repaired}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.scrap}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.dispatched}</td>
                            </tr>
                          ))
                        )}
                        {svcTotals ? (
                          <tr>
                            <td style={{ fontWeight: 700 }}>Total</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{svcTotals.received}</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{svcTotals.repaired}</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{svcTotals.scrap}</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{svcTotals.dispatched}</td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {clientLocationsModal ? (
            <div
              className="modal-overlay"
              onClick={(e) => e.target === e.currentTarget && setClientLocationsModal(null)}
            >
              <div className="modal" style={{ width: 700, maxWidth: "95vw" }} role="dialog" aria-modal="true">
                <div className="modal-header">
                  <div className="modal-title">
                    {clientLocationsModal.name} — Locations
                  </div>
                  <button type="button" className="modal-close" onClick={() => setClientLocationsModal(null)}>✕</button>
                </div>
                <div style={{ padding: "16px 20px", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: "var(--bg2)" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left" }}>Address</th>
                        <th style={{ padding: "8px 12px", textAlign: "right" }}>Received</th>
                        <th style={{ padding: "8px 12px", textAlign: "right" }}>Repaired</th>
                        <th style={{ padding: "8px 12px", textAlign: "right" }}>Scrap</th>
                        <th style={{ padding: "8px 12px", textAlign: "right" }}>Dispatched</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(clientLocationsModal.locations || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: 16, color: "var(--text3)" }}>No location data.</td>
                        </tr>
                      ) : (
                        (clientLocationsModal.locations || []).map((loc: ClientLocation, i: number) => (
                          <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                            <td style={{ padding: "8px 12px" }}>{loc.address}</td>
                            <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--mono)" }}>{loc.received}</td>
                            <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--mono)" }}>{loc.repaired}</td>
                            <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--mono)" }}>{loc.scrap}</td>
                            <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--mono)" }}>{loc.dispatched}</td>
                          </tr>
                        ))
                      )}
                      <tr style={{ borderTop: "2px solid var(--border2)", fontWeight: 700 }}>
                        <td style={{ padding: "8px 12px" }}>Total</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--mono)" }}>{clientLocationsModal.received}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--mono)" }}>{clientLocationsModal.repaired}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--mono)" }}>{clientLocationsModal.scrap}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--mono)" }}>{clientLocationsModal.dispatched}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}

          {clientDetailsOpen ? (
            <div
              className="modal-overlay"
              onClick={(e) => e.target === e.currentTarget && setClientDetailsOpen(false)}
            >
              <div className="modal" style={{ width: 920, maxWidth: "95vw" }} role="dialog" aria-modal="true">
                <div className="modal-header">
                  <div className="modal-title">
                    Client · {clientPicked?.name || "—"}{" "}
                    {svcPeriodLabel ? `· ${formatRange(svcPeriodLabel.from, svcPeriodLabel.to)}` : ""}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setClientDetailsOpen(false)}>
                    Close
                  </button>
                </div>
                <div className="modal-body">
                  {clientDetailsErr ? <div className="form-error" style={{ marginBottom: 10 }}>{clientDetailsErr}</div> : null}
                  <div className="scroll-x" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ minWidth: 120 }}>Date</th>
                          <th>No of Inverters Received</th>
                          <th>No of Inverters Repaired</th>
                          <th>No of Inverters declared as SCRAP</th>
                          <th>No of Inverters Dispatched</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientDetailsLoading ? (
                          <tr>
                            <td colSpan={5} style={{ padding: 18, color: "var(--text3)" }}>
                              Loading…
                            </td>
                          </tr>
                        ) : !clientDetailsDaily.length ? (
                          <tr>
                            <td colSpan={5} style={{ padding: 18, color: "var(--text3)" }}>
                              No data.
                            </td>
                          </tr>
                        ) : (
                          clientDetailsDaily.map((r) => (
                            <tr key={r.date}>
                              <td style={{ fontFamily: "var(--mono)", color: "var(--text3)" }}>{r.date}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.received}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.repaired}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.scrap}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.dispatched}</td>
                            </tr>
                          ))
                        )}
                        {clientDetailsTotals ? (
                          <tr>
                            <td style={{ fontWeight: 700 }}>Total</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{clientDetailsTotals.received}</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{clientDetailsTotals.repaired}</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{clientDetailsTotals.scrap}</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{clientDetailsTotals.dispatched}</td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="two-col">
            <div className="table-card">
              <div className="table-header">
                <div className="table-title">Ticket Status Distribution</div>
              </div>
              <div style={{ padding: "20px" }}>
                <div className="bar-chart">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="bar-col">
                      <div className="bar-val">{count}</div>
                      <div
                        className="bar"
                        style={{
                          height: `${(count / maxCount) * 80}px`,
                          background: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
                        }}
                      />
                      <div className="bar-label">
                        {status.replace("_", " ").substring(0, 7)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="table-card">
            <div className="table-header">
              <div className="table-title">Recent Tickets</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowAllDashboardTickets((v) => !v)}
                >
                  {showAllDashboardTickets ? "Show Less" : "Show All"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => onNav("tickets")}>
                  View All →
                </button>
              </div>
            </div>
            <div
              className="scroll-x"
              style={showAllDashboardTickets ? { maxHeight: 420, overflowY: "auto" } : undefined}
            >
              <table>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Customer</th>
                    <th>Inverter</th>
                    <th>Inverter Capacity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllDashboardTickets ? myTickets : myTickets.slice(0, 5)).map((t) => (
                    <tr key={t.id}>
                      <td>
                        <button
                          type="button"
                          className="td-mono table-link"
                          onClick={() => onViewTicket(t)}
                          title="View ticket"
                        >
                          {t.ticketId}
                        </button>
                      </td>
                      <td>{t.customer}</td>
                      <td>
                        <span className="tag">
                          {[t.inverterMake, t.inverterModel].filter((x) => x && x !== "—").join(" ") || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="tag">{t.capacity || "—"}</span>
                      </td>
                      <td>
                        <div className="status-sla">
                          <StatusBadge status={t.status} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
