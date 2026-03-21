"use client";

export default function Settings() {
  return (
    <div className="content">
      <div className="page-header">
        <div className="page-title">System Settings</div>
        <div className="page-sub">
          Configure SLA thresholds and system parameters
        </div>
      </div>
      <div className="two-col">
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">SLA Configuration</div>
          </div>
          <div style={{ padding: "20px" }}>
            {[
              { label: "Critical Priority SLA", val: "24h", color: "#c0392b" },
              { label: "High Priority SLA", val: "48h", color: "#d97706" },
              { label: "Normal Priority SLA", val: "72h", color: "#16a34a" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 13 }}>{item.label}</span>
                <input
                  className="form-input"
                  defaultValue={item.val}
                  style={{ width: 72, textAlign: "center", fontFamily: "var(--mono)" }}
                />
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-accent">Save SLA Settings</button>
            </div>
          </div>
        </div>
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">System Info</div>
          </div>
          <div style={{ padding: "20px" }}>
            {[
              ["System", "Sunce ERP v1.0.0"],
              ["Stack", "Next.js + MongoDB"],
              ["Deployment", "Vercel"],
              ["Database", "MongoDB Atlas"],
            ].map(([k, v]) => (
              <div key={k} className="info-row">
                <span style={{ color: "var(--text2)" }}>{k}</span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    color: "var(--accent)",
                    fontWeight: 600,
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

