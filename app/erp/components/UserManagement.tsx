"use client";

import { useState } from "react";
import { ALL_MODULES } from "../constants";
import type { ModulePermission, RoleDefinition, User } from "../types";
import { Badge } from "./Badges";
import RoleBuilderModal from "./RoleBuilderModal";

export default function UserManagement({
  roles,
  users,
  onRolesChange,
}: {
  roles: RoleDefinition[];
  users: User[];
  onRolesChange: (roles: RoleDefinition[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "permissions">(
    "users",
  );
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null | undefined>(
    undefined,
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSaveRole = (r: RoleDefinition) => {
    const exists = roles.find((x) => x.id === r.id);
    onRolesChange(exists ? roles.map((x) => (x.id === r.id ? r : x)) : [...roles, r]);
  };

  return (
    <div className="content">
      <div className="page-header page-header-row">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-sub">Manage users, roles, and access permissions</div>
        </div>
        <div className="page-header-actions">
          {activeTab === "roles" && (
            <button
              className="btn btn-accent"
              onClick={() => {
                setEditingRole(null);
                setShowRoleModal(true);
              }}
            >
              + Create Role
            </button>
          )}
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {[
          { id: "users", label: "👥 Users" },
          { id: "roles", label: "🏷️ Role Management" },
          { id: "permissions", label: "🔐 Permission Matrix" },
        ].map((tab) => (
          <div
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {activeTab === "users" && (
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">All Users ({users.length})</div>
          </div>
          <div className="scroll-x">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const roleDef = roles.find((r) => r.id === u.role);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 7,
                              background: `linear-gradient(135deg, ${roleDef?.color || "#8B4513"}, ${(roleDef?.color || "#a0522d") + "aa"})`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "white",
                              flexShrink: 0,
                            }}
                          >
                            {u.name[0]}
                          </div>
                          <span style={{ fontWeight: 500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 12,
                          color: "var(--text2)",
                        }}
                      >
                        {u.email}
                      </td>
                      <td>
                        <Badge label={roleDef?.label || u.role} color={roleDef?.color || "#8B4513"} />
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 10,
                            background: "var(--surface2)",
                            color: "var(--text3)",
                            fontFamily: "var(--mono)",
                            fontWeight: 600,
                            border: "1px solid var(--border)",
                          }}
                        >
                          Live
                        </span>
                      </td>
                      <td>
                        <Badge label="Active" color="#16a34a" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "roles" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
            marginBottom: 24,
          }}
        >
          {roles.map((role) => (
            <div key={role.id} className="role-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 9,
                      background: role.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 800,
                      fontSize: 16,
                    }}
                  >
                    {role.label[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{role.label}</div>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        color: "var(--text3)",
                        marginTop: 2,
                      }}
                    >
                      {role.id}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {role.isSystem && <span className="system-badge">SYSTEM</span>}
                  {!role.isSystem && <span className="new-role-badge">CUSTOM</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setEditingRole(role);
                    setShowRoleModal(true);
                  }}
                >
                  ✏️ Edit
                </button>
                {!role.isSystem && (
                  deleteConfirm === role.id ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          onRolesChange(roles.filter((r) => r.id !== role.id));
                          setDeleteConfirm(null);
                        }}
                      >
                        Confirm
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(role.id)}>
                      🗑️
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
          <div
            className="role-card"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "2px dashed var(--border2)",
              cursor: "pointer",
              minHeight: 140,
              gap: 8,
              background: "var(--surface2)",
            }}
            onClick={() => {
              setEditingRole(null);
              setShowRoleModal(true);
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "var(--surface3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              +
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>
              Create New Role
            </div>
          </div>
        </div>
      )}

      {activeTab === "permissions" && (
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">Full Permission Matrix</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th style={{ minWidth: 140 }}>Module</th>
                  {roles.map((r) => (
                    <th key={r.id} style={{ textAlign: "center", minWidth: 110 }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 5,
                            background: r.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          {r.label[0]}
                        </div>
                        <span style={{ fontSize: 11 }}>{r.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_MODULES.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{m.icon}</span>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{m.label}</span>
                      </div>
                    </td>
                    {roles.map((r) => {
                      const p = r.permissions[m.id];
                      if (!p) {
                        return (
                          <td key={r.id} style={{ textAlign: "center" }}>
                            <span className="access-chip access-none">None</span>
                          </td>
                        );
                      }
                      const actions = (
                        Object.entries(p) as [keyof ModulePermission, boolean][]
                      )
                        .filter(([, v]) => v)
                        .map(([k]) => k);
                      if (actions.length === 0) {
                        return (
                          <td key={r.id} style={{ textAlign: "center" }}>
                            <span className="access-chip access-none">None</span>
                          </td>
                        );
                      }
                      const isFull = actions.length === 4;
                      return (
                        <td key={r.id} style={{ textAlign: "center" }}>
                          <span
                            className={`access-chip ${isFull ? "access-full" : "access-partial"}`}
                          >
                            {isFull ? "Full" : actions.join(" · ")}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showRoleModal && editingRole !== undefined && (
        <RoleBuilderModal
          role={editingRole}
          onClose={() => {
            setShowRoleModal(false);
            setEditingRole(undefined);
          }}
          onSave={handleSaveRole}
        />
      )}
    </div>
  );
}
