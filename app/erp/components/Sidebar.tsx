"use client";

import type { RoleDefinition, User } from "../types";
import { getNavItems } from "../utils";
import { LuLogOut, LuSunMedium } from "react-icons/lu";

export default function Sidebar({
  user,
  roles,
  active,
  open,
  onNav,
  onClose,
  onLogout,
}: {
  user: User;
  roles: RoleDefinition[];
  active: string;
  open: boolean;
  onNav: (p: string) => void;
  onClose: () => void;
  onLogout: () => void;
}) {
  const navItems = getNavItems(roles, user.role);
  const roleDef = roles.find((r) => r.id === user.role);

  return (
    <div
      id="erp-sidebar"
      className={`sidebar ${open ? "open" : ""}`}
      role="navigation"
      aria-label="Primary"
    >
      <div className="sidebar-header">
        <div className="logo-icon" aria-hidden>
          <LuSunMedium />
        </div>
        <div>
          <div className="logo-text">Sunce ERP</div>
          <div className="logo-sub">Service Platform</div>
        </div>
      </div>
      <div className="sidebar-user">
        <div
          className="user-avatar"
          style={{
            background: `linear-gradient(135deg, ${roleDef?.color || "#8B4513"}, ${(roleDef?.color || "#a0522d") + "cc"})`,
          }}
        >
          {user.name[0]}
        </div>
        <div>
          <div className="user-name">{user.name.split(" ")[0]}</div>
          <div className="user-role" style={{ color: roleDef?.color || "var(--accent)" }}>
            {user.role}
          </div>
        </div>
      </div>
      <div className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">Navigation</div>
        </div>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => {
              onNav(item.id);
              onClose();
            }}
          >
            <span className="nav-icon" aria-hidden>
              <item.Icon />
            </span>
            {item.label}
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={() => {
            onLogout();
            onClose();
          }}
        >
          <span aria-hidden style={{ display: "inline-flex" }}>
            <LuLogOut />
          </span>{" "}
          Sign Out
        </button>
      </div>
    </div>
  );
}
