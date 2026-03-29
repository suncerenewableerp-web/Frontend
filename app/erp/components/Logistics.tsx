"use client";

import { useState } from "react";
import type { Ticket } from "../types";
import { StatusBadge } from "./Badges";
import SchedulePickupModal from "./SchedulePickupModal";

export default function Logistics({
  tickets,
  onSchedulePickup,
}: {
  tickets: Ticket[];
  onSchedulePickup?: (input: {
    ticketId: string;
    pickupDate: string;
    courierName: string;
    lrNumber: string;
    pickupLocation: string;
  }) => Promise<void>;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="content">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div className="page-title">Logistics & Pickup</div>
          <div className="page-sub">Track shipments and manage pickups</div>
        </div>
        {onSchedulePickup ? (
          <button className="btn btn-accent" onClick={() => setShowModal(true)}>
            + Schedule Pickup
          </button>
        ) : null}
      </div>
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">Active Shipments</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Customer</th>
              <th>Courier</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets
              .filter((t) => !["CREATED", "CLOSED"].includes(t.status))
              .map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className="td-mono">{t.ticketId}</span>
                  </td>
                  <td>{t.customer}</td>
                  <td>BlueDart</td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <SchedulePickupModal
          tickets={tickets}
          onClose={() => setShowModal(false)}
          onSchedule={async (input) => {
            if (onSchedulePickup) {
              await onSchedulePickup(input);
            }
          }}
        />
      )}
    </div>
  );
}
