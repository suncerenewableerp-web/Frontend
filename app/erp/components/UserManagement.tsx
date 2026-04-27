"use client";

import { useEffect, useMemo, useState } from "react";
import { ALL_MODULES } from "../constants";
import type { ModulePermission, RoleDefinition, User } from "../types";
import {
  apiRoleCreate,
  apiRoleDelete,
  apiRoleUpdate,
  apiUserDelete,
  apiUserUpdateRole,
  apiUsersList,
  getStoredAuth,
} from "../api";
import { LuKeyRound, LuTags, LuUsers } from "react-icons/lu";
import { Badge } from "./Badges";
import RoleBuilderModal from "./RoleBuilderModal";
import UserProvisionModal from "./UserProvisionModal";
import { canAccess } from "../utils";

export default function UserManagement({
  roles,
  users,
  onRolesChange,
  onUsersChange,
  userRole,
}: {
  roles: RoleDefinition[];
  users: User[];
  onRolesChange: (roles: RoleDefinition[]) => void;
  onUsersChange: (users: User[]) => void;
  userRole: string;
}) {
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "permissions">(
    "users",
  );
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null | undefined>(
    undefined,
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [savingRole, setSavingRole] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [passwordForUser, setPasswordForUser] = useState<User | null>(null);
  const [updatingRoleForId, setUpdatingRoleForId] = useState<string | null>(null);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const PAGE_SIZE = 10;

  const isAdmin = String(userRole || "").trim().toUpperCase() === "ADMIN";
  const canUpdateUserRole = isAdmin && canAccess(roles, userRole, "users", "edit");
  const canDeleteUsers = canAccess(roles, userRole, "users", "delete");
  const currentUserId = getStoredAuth()?.user?.id || null;

  const roleLabelById = useMemo(
    () => Object.fromEntries(roles.map((r) => [r.id, r.label])),
    [roles],
  );

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = String(u.name || "").toLowerCase();
      const email = String(u.email || "").toLowerCase();
      const roleLabel = String(roleLabelById[u.role] || u.role || "").toLowerCase();
      return name.includes(q) || email.includes(q) || roleLabel.includes(q);
    });
  }, [users, userSearch, roleLabelById]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, userPage), totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
  const showingFrom = filteredUsers.length ? startIndex + 1 : 0;
  const showingTo = Math.min(startIndex + PAGE_SIZE, filteredUsers.length);

  useEffect(() => {
    if (userPage !== currentPage) setUserPage(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filteredUsers.length]);

  const reloadUsers = async () => {
    try {
      const list = await apiUsersList();
      onUsersChange(list);
    } catch (e) {
      setRoleError(e instanceof Error ? e.message : "Failed to refresh users");
    }
  };

  const handleSaveRole = async (r: RoleDefinition) => {
    setSavingRole(true);
    setRoleError("");
    try {
      const saved = r.dbId
        ? await apiRoleUpdate(r.dbId, {
            label: r.label,
            color: r.color,
            permissions: r.permissions,
          })
        : await apiRoleCreate({
            name: r.name,
            label: r.label,
            color: r.color,
            permissions: r.permissions,
          });

      const exists = roles.find((x) => x.id === saved.id);
      onRolesChange(
        exists ? roles.map((x) => (x.id === saved.id ? saved : x)) : [...roles, saved],
      );
    } catch (e) {
      setRoleError(e instanceof Error ? e.message : "Failed to save role");
      throw e;
    } finally {
      setSavingRole(false);
    }
  };

  return (
    <div className="content">
      <div className="page-header page-header-row">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-sub">Manage users, roles, and access permissions</div>
        </div>
        <div className="page-header-actions">
          {activeTab === "users" && canAccess(roles, userRole, "users", "create") && (
            <button className="btn btn-accent" onClick={() => setShowCreateUser(true)}>
              + Create User
            </button>
          )}
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
          { id: "users", label: "Users", Icon: LuUsers },
          { id: "roles", label: "Role Management", Icon: LuTags },
          { id: "permissions", label: "Permission Matrix", Icon: LuKeyRound },
        ].map((tab) => (
          <div
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span aria-hidden style={{ display: "inline-flex" }}>
                <tab.Icon />
              </span>
              {tab.label}
            </span>
          </div>
        ))}
      </div>

      {activeTab === "users" && (
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">All Users ({filteredUsers.length})</div>
            <div className="table-actions">
              <div className="search-wrap">
                <span className="search-icon" aria-hidden>
                  <LuUsers />
                </span>
                <input
                  className="search-input"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                />
              </div>
            </div>
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
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((u) => {
                  const roleDef = roles.find((r) => r.id === u.role);
                  const isSelf = Boolean(currentUserId && u.id === currentUserId);
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
                            {(u.name && u.name[0]) || "?"}
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
                        {canUpdateUserRole ? (
                          <select
                            value={u.role}
                            disabled={updatingRoleForId === u.id}
                            onChange={async (e) => {
                              const nextRole = String(e.target.value || "").trim().toUpperCase();
                              const prevRole = u.role;
                              if (!nextRole || nextRole === prevRole) return;

                              setRoleError("");
                              setUpdatingRoleForId(u.id);
                              try {
                                await apiUserUpdateRole(u.id, nextRole);
                                await reloadUsers();
                              } catch (err) {
                                await reloadUsers();
                                setRoleError(
                                  err instanceof Error ? err.message : "Failed to update role",
                                );
                              } finally {
                                setUpdatingRoleForId((cur) => (cur === u.id ? null : cur));
                              }
                            }}
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              padding: "4px 10px",
                              borderRadius: 999,
                              border: "1px solid rgba(44,26,14,0.18)",
                              background: "rgba(255,255,255,0.9)",
                              color: "var(--brown)",
                              cursor: updatingRoleForId === u.id ? "not-allowed" : "pointer",
                            }}
                            title="Change role"
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Badge
                            label={roleDef?.label || u.role}
                            color={roleDef?.color || "#8B4513"}
                          />
                        )}
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
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          {canAccess(roles, userRole, "users", "edit") && (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setPasswordForUser(u)}
                            >
                              Set Password
                            </button>
                          )}
                          {canDeleteUsers &&
                            (deleteUserConfirm === u.id ? (
                              <>
                                <button
                                  className="btn btn-danger btn-sm"
                                  disabled={deletingUserId === u.id}
                                  onClick={async () => {
                                    setDeletingUserId(u.id);
                                    setRoleError("");
                                    try {
                                      await apiUserDelete(u.id);
                                      setDeleteUserConfirm(null);
                                      await reloadUsers();
                                    } catch (e) {
                                      setRoleError(
                                        e instanceof Error ? e.message : "Failed to delete user",
                                      );
                                    } finally {
                                      setDeletingUserId((cur) => (cur === u.id ? null : cur));
                                    }
                                  }}
                                >
                                  Confirm
                                </button>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  disabled={deletingUserId === u.id}
                                  onClick={() => setDeleteUserConfirm(null)}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={isSelf}
                                title={isSelf ? "You cannot delete your own account" : "Delete user"}
                                onClick={() => {
                                  setRoleError("");
                                  setDeleteUserConfirm(u.id);
                                }}
                              >
                                🗑️
                              </button>
                            ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length > PAGE_SIZE ? (
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
                Showing {showingFrom}-{showingTo} of {filteredUsers.length}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={currentPage <= 1}
                  onClick={() => setUserPage((p) => Math.max(1, Math.min(totalPages, p - 1)))}
                >
                  Prev
                </button>
                <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)" }}>
                  Page {currentPage}/{totalPages}
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setUserPage((p) => Math.max(1, Math.min(totalPages, p + 1)))}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
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
                        disabled={savingRole}
                        onClick={async () => {
                          setSavingRole(true);
                          setRoleError("");
                          try {
                            if (role.dbId) await apiRoleDelete(role.dbId);
                            onRolesChange(roles.filter((r) => r.id !== role.id));
                            setDeleteConfirm(null);
                          } catch (e) {
                            setRoleError(e instanceof Error ? e.message : "Failed to delete role");
                          } finally {
                            setSavingRole(false);
                          }
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

      {showCreateUser && (
        <UserProvisionModal
          mode="create"
          roles={roles}
          onClose={() => setShowCreateUser(false)}
          onDone={() => {
            void reloadUsers();
          }}
        />
      )}

      {passwordForUser && (
        <UserProvisionModal
          mode="password"
          roles={roles}
          user={passwordForUser}
          allowReset={canAccess(roles, userRole, "users", "edit")}
          onClose={() => setPasswordForUser(null)}
          onDone={() => {
            void reloadUsers();
          }}
        />
      )}

      {roleError && (
        <div style={{ position: "fixed", left: 16, bottom: 16, fontSize: 12, color: "var(--red)" }}>
          {roleError}
        </div>
      )}
    </div>
  );
}
