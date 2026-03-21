"use client";

import { STATUS_ORDER } from "../constants";
import type { TicketStatus } from "../types";

export default function TicketTimeline({
  currentStatus,
}: {
  currentStatus: TicketStatus;
}) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  return (
    <div className="timeline">
      {STATUS_ORDER.map((s, i) => (
        <div key={s} className="timeline-step">
          <div className="timeline-node">
            <div
              className={`timeline-circle ${i < currentIdx ? "done" : i === currentIdx ? "current" : ""}`}
            >
              {i < currentIdx ? "✓" : i + 1}
            </div>
            <div
              className={`timeline-label ${i <= currentIdx ? (i === currentIdx ? "current" : "done") : ""}`}
            >
              {s.replace(/_/g, " ")}
            </div>
          </div>
          {i < STATUS_ORDER.length - 1 && (
            <div className={`timeline-line ${i < currentIdx ? "done" : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
}

