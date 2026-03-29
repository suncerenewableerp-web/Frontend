"use client";

import { useEffect, useMemo, useState } from "react";
import type { Ticket } from "../types";
import { apiReportsGet, type ReportsData } from "../api";

function monthLabel(key: string) {
  // key: YYYY-MM
  const [y, m] = key.split("-").map((x) => Number(x));
  if (!y || !m) return key;
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleString(undefined, { month: "short" });
}

export default function Reports({ tickets }: { tickets: Ticket[] }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<ReportsData | null>(null);

  useEffect(() => {
    let mounted = true;
    queueMicrotask(() => {
      if (!mounted) return;
      setLoading(true);
      setError("");
    });
    apiReportsGet({ months: 6 })
      .then((d) => {
        if (!mounted) return;
        setData(d);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load reports");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const monthlyData = useMemo(() => {
    const src = data?.monthlyTicketVolume;
    if (src?.length) return src.map((d) => ({ month: monthLabel(d.month), count: d.count }));
    return [
      { month: "Oct", count: 8 },
      { month: "Nov", count: 12 },
      { month: "Dec", count: 7 },
      { month: "Jan", count: 15 },
      { month: "Feb", count: 11 },
      { month: "Mar", count: tickets.length },
    ];
  }, [data, tickets.length]);

  const maxCount = Math.max(1, ...monthlyData.map((d) => d.count));
  const warranty = data?.warranty || {
    inWarranty: tickets.filter((t) => t.warrantyStatus).length,
    outOfWarranty: tickets.filter((t) => !t.warrantyStatus).length,
  };
  const avgResolutionHours = data?.avgResolutionHours;
  const sla = data?.slaBreakdown || {};

  return (
    <div className="content">
      <div className="page-header">
        <div className="page-title">Reports & Analytics</div>
        <div className="page-sub">
          Service performance metrics and operational trends
        </div>
      </div>
      <div className="two-col">
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">Monthly Ticket Volume</div>
          </div>
          <div style={{ padding: "20px" }}>
            {error ? (
              <div style={{ fontSize: 12, color: "#c0392b", fontFamily: "var(--mono)" }}>
                {error}
              </div>
            ) : null}
            <div className="bar-chart">
              {monthlyData.map((d) => (
                <div key={d.month} className="bar-col">
                  <div className="bar-val">{d.count}</div>
                  <div className="bar" style={{ height: `${(d.count / maxCount) * 80}px` }} />
                  <div className="bar-label">{d.month}</div>
                </div>
              ))}
            </div>
            {loading ? (
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)" }}>
                Loading real data...
              </div>
            ) : null}
          </div>
        </div>
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">Warranty Breakdown</div>
          </div>
          <div style={{ padding: "20px" }}>
            {[
              {
                label: "In Warranty",
                count: warranty.inWarranty,
                color: "#16a34a",
              },
              {
                label: "Out of Warranty",
                count: warranty.outOfWarranty,
                color: "#c0392b",
              },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--text2)" }}>{item.label}</span>
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: item.color }}>
                    {item.count}
                  </span>
                </div>
                <div className="sla-bar">
                  <div
                    className="sla-fill"
                    style={{
                      width: `${(item.count / Math.max(1, warranty.inWarranty + warranty.outOfWarranty)) * 100}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="table-card">
          <div className="table-header">
            <div className="table-title">SLA Status</div>
          </div>
          <div style={{ padding: "20px" }}>
            {[
              { label: "OK", count: sla.OK || 0, color: "#16a34a" },
              { label: "Warning", count: sla.WARNING || 0, color: "#d97706" },
              { label: "Breached", count: sla.BREACHED || 0, color: "#c0392b" },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--text2)" }}>{item.label}</span>
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: item.color }}>
                    {item.count}
                  </span>
                </div>
                <div className="sla-bar">
                  <div
                    className="sla-fill"
                    style={{
                      width: `${(item.count / Math.max(1, (sla.OK || 0) + (sla.WARNING || 0) + (sla.BREACHED || 0))) * 100}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
            {!loading && data ? (
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)" }}>
                Total tickets:{" "}
                <span style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{data.totalTickets}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="table-card">
          <div className="table-header">
            <div className="table-title">Resolution Time</div>
          </div>
          <div style={{ padding: "20px" }}>
            <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 6 }}>
              Average (closed tickets)
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 800 }}>
              {avgResolutionHours === null || avgResolutionHours === undefined
                ? "—"
                : `${Math.round(avgResolutionHours)}h`}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)" }}>
              Closed tickets:{" "}
              <span style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>
                {data?.closedTickets ?? "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
