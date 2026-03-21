"use client";

import type { Ticket } from "../types";

export default function Reports({ tickets }: { tickets: Ticket[] }) {
  const monthlyData = [
    { month: "Oct", count: 8 },
    { month: "Nov", count: 12 },
    { month: "Dec", count: 7 },
    { month: "Jan", count: 15 },
    { month: "Feb", count: 11 },
    { month: "Mar", count: tickets.length },
  ];
  const maxCount = Math.max(...monthlyData.map((d) => d.count));

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
            <div className="bar-chart">
              {monthlyData.map((d) => (
                <div key={d.month} className="bar-col">
                  <div className="bar-val">{d.count}</div>
                  <div className="bar" style={{ height: `${(d.count / maxCount) * 80}px` }} />
                  <div className="bar-label">{d.month}</div>
                </div>
              ))}
            </div>
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
                count: tickets.filter((t) => t.warrantyStatus).length,
                color: "#16a34a",
              },
              {
                label: "Out of Warranty",
                count: tickets.filter((t) => !t.warrantyStatus).length,
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
                      width: `${(item.count / tickets.length) * 100}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

