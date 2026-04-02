"use client";

import { ENGINEER_OUTCOME_COLORS, PRIORITY_COLORS, SLA_COLORS, STATUS_COLORS } from "../constants";
import type { TicketStatus } from "../types";

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="badge"
      style={{ background: color + "18", color, border: `1px solid ${color}28` }}
    >
      <span className="badge-dot" style={{ background: color }} />
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <Badge label={status.replace(/_/g, " ")} color={STATUS_COLORS[status]} />;
}

export function PriorityBadge({
  priority,
}: {
  priority: "LOW" | "MEDIUM" | "HIGH";
}) {
  return <Badge label={priority} color={PRIORITY_COLORS[priority]} />;
}

export function SlaBadge({ status }: { status: "MET" | "BREACHED" | "AT_RISK" }) {
  return (
    <Badge
      label={status === "AT_RISK" ? "AT RISK" : status}
      color={SLA_COLORS[status]}
    />
  );
}

export function EngineerOutcomeBadge({ outcome }: { outcome: "REPAIRED" | "SCRAP" }) {
  return <Badge label={outcome} color={ENGINEER_OUTCOME_COLORS[outcome]} />;
}
