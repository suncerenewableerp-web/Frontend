"use client";

import { useState } from "react";
import { ALL_MODULES, DEFAULT_PERMISSIONS, PRESET_COLORS } from "../constants";
import type { ModulePermission, RoleDefinition } from "../types";
import { Badge } from "./Badges";

export default function RoleBuilderModal({
  role,
  onClose,
  onSave,
}: {
  role: RoleDefinition | null;
  onClose: () => void;
  onSave: (r: RoleDefinition) => void;
}) {
  const isNew = role === null;
  const [name, setName] = useState(role?.name || "");
  const [label, setLabel] = useState(role?.label || "");
  const [color, setColor] = useState(role?.color || PRESET_COLORS[0]);
  const [permissions, setPermissions] = useState<Record<string, ModulePermission>>(
    role?.permissions ||
      Object.fromEntries(
        ALL_MODULES.map((m) => [m.id, { ...DEFAULT_PERMISSIONS }]),
      ),
  );

  const togglePerm = (moduleId: string, action: keyof ModulePermission) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], [action]: !prev[moduleId]?.[action] },
    }));
  };

  const toggleAllForModule = (moduleId: string) => {
    const perms = permissions[moduleId] || DEFAULT_PERMISSIONS;
    const allOn = Object.values(perms).every(Boolean);
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: {
        view: !allOn,
        create: !allOn,
        edit: !allOn,
        delete: !allOn,
      },
    }));
  };

  const toggleAllForAction = (action: keyof ModulePermission) => {
    const allOn = ALL_MODULES.every((m) => permissions[m.id]?.[action]);
    const updated: Record<string, ModulePermission> = { ...permissions };
    ALL_MODULES.forEach((m) => {
      updated[m.id] = { ...updated[m.id], [action]: !allOn };
    });
    setPermissions(updated);
  };

  const handleSave = () => {
    if (!name.trim() || !label.trim()) return;
    const roleId = name.toUpperCase().replace(/\s+/g, "_");
    onSave({
      id: isNew ? roleId : role?.id || roleId,
      name: roleId,
      label,
      color,
      permissions,
      isSystem: role?.isSystem,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {(label || name || "?")[0]?.toUpperCase()}
            </div>
            <div>
              <div className="modal-title">
                {isNew ? "Create New Role" : `Edit Role — ${role?.label}`}
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
                Define name, color & module-level permissions
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="form-section">Role Identity</div>
          <div className="form-grid" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Role Name (ID) *</label>
              <input
                className="form-input"
                placeholder="e.g. FIELD_MANAGER"
                value={name}
                onChange={(e) =>
                  setName(e.target.value.toUpperCase().replace(/\s+/g, "_"))
                }
                disabled={role?.isSystem}
                style={{
                  fontFamily: "var(--mono)",
                  opacity: role?.isSystem ? 0.6 : 1,
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Display Label *</label>
              <input
                className="form-input"
                placeholder="e.g. Field Manager"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <div className="form-group full">
              <label className="form-label">Role Color</label>
              <div className="color-picker-row">
                {PRESET_COLORS.map((c) => (
                  <div
                    key={c}
                    className={`color-swatch ${color === c ? "active" : ""}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    width: 36,
                    height: 28,
                    border: "1.5px solid var(--border)",
                    borderRadius: 6,
                    cursor: "pointer",
                    padding: 2,
                  }}
                />
                <Badge label={label || name || "ROLE"} color={color} />
              </div>
            </div>
          </div>
          <div className="form-section">Module Permissions</div>
          <div style={{ overflowX: "auto" }}>
            <table className="perm-matrix">
              <thead>
                <tr>
                  <th style={{ width: "30%" }}>Module</th>
                  {(["view", "create", "edit", "delete"] as const).map((action) => (
                    <th
                      key={action}
                      style={{ textAlign: "center", cursor: "pointer" }}
                      onClick={() => toggleAllForAction(action)}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span style={{ textTransform: "uppercase" }}>
                          {action}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            color: "var(--accent)",
                            fontWeight: 400,
                          }}
                        >
                          toggle all ↕
                        </span>
                      </div>
                    </th>
                  ))}
                  <th style={{ textAlign: "center" }}>All</th>
                </tr>
              </thead>
              <tbody>
                {ALL_MODULES.map((m) => {
                  const p = permissions[m.id] || DEFAULT_PERMISSIONS;
                  const allOn = Object.values(p).every(Boolean);
                  return (
                    <tr key={m.id}>
                      <td>
                        <div
                          style={{ display: "flex", alignItems: "center", gap: 8 }}
                        >
                          <span
                            style={{
                              fontSize: 16,
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                            aria-hidden
                          >
                            <m.Icon />
                          </span>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>
                            {m.label}
                          </span>
                        </div>
                      </td>
                      {(["view", "create", "edit", "delete"] as const).map(
                        (action) => (
                          <td key={action} style={{ textAlign: "center" }}>
                            <input
                              type="checkbox"
                              className="perm-checkbox"
                              checked={p[action] || false}
                              onChange={() => togglePerm(m.id, action)}
                            />
                          </td>
                        ),
                      )}
                      <td style={{ textAlign: "center" }}>
                        <button
                          className={`btn btn-sm ${allOn ? "btn-accent" : "btn-ghost"}`}
                          style={{ fontSize: 11, padding: "3px 10px" }}
                          onClick={() => toggleAllForModule(m.id)}
                        >
                          {allOn ? "All ✓" : "All"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-accent" onClick={handleSave}>
            {isNew ? "Create Role →" : "Save Changes →"}
          </button>
        </div>
      </div>
    </div>
  );
}
