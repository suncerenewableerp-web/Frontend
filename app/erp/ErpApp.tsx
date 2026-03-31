"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LuSunMedium } from "react-icons/lu";
import {
  apiCreateTicket,
  apiLogin,
  apiRolesPublic,
  apiSchedulePickup,
  apiSignup,
  apiTicketGet,
  apiTicketsList,
  apiUpdateTicketStatus,
  apiUsersList,
  clearAuthStorage,
  getStoredAuth,
  type TicketCreateInput,
} from "./api";
import type { Ticket, User, RoleDefinition } from "./types";
import { canAccess } from "./utils";

import AuthScreen from "./components/AuthScreen";
import SignupScreen from "./components/SignupScreen";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import TicketsList from "./components/TicketsList";
import TicketDetail from "./components/TicketDetail";
import JobCards from "./components/JobCards";
import Logistics from "./components/Logistics";
import SLAMonitor from "./components/SLAMonitor";
import Reports from "./components/Reports";
import UserManagement from "./components/UserManagement";
import Settings from "./components/Settings";
import NewTicketModal from "./components/NewTicketModal";
import Notification from "./components/Notification";

export default function ErpApp({
  initialAuthView = "login",
}: {
  initialAuthView?: "login" | "signup";
}) {
  const router = useRouter();
  const [authView, setAuthView] = useState<"login" | "signup">(initialAuthView);
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState("dashboard");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketsListPreset, setTicketsListPreset] = useState<{
    status?: string;
    priority?: string;
  } | null>(null);
  const [ticketDetailTab, setTicketDetailTab] = useState<
    "overview" | "jobcard" | "logistics" | "sla"
  >("overview");
  const [ticketDetailLogisticsStage, setTicketDetailLogisticsStage] = useState<
    "pickup" | "dispatch"
  >("pickup");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [notification, setNotification] = useState("");
  const [bootError, setBootError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const notify = (msg: string) => setNotification(msg);

  const loadTickets = async () => {
    const list = await apiTicketsList();
    setTickets(list);
  };

  const loadUsers = async () => {
    try {
      const list = await apiUsersList();
      setUsers(list);
    } catch {
      // Non-admin roles may not have `users:view`. Avoid unhandled rejections.
      setUsers([]);
    }
  };

  useEffect(() => {
    apiRolesPublic()
      .then((r) => {
        setRoles(r);
        if (!r.length) setBootError("No roles found in database. Run backend seed.");
      })
      .catch((e) => {
        setRoles([]);
        setBootError(e instanceof Error ? e.message : "Failed to load roles");
      });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setHydrated(true);

      const stored = getStoredAuth();
      if (stored?.user) setUser(stored.user);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated || !user) return;
    const t = setTimeout(() => {
      void loadTickets();
      void loadUsers();
    }, 0);
    return () => clearTimeout(t);
  }, [hydrated, user]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [sidebarOpen]);

  const handleLogin = async (email: string, password: string) => {
    const { user: u } = await apiLogin({ email, password });
    setUser(u);
    setPage("dashboard");
    setSelectedTicket(null);
    setSidebarOpen(false);
    notify(`Welcome back, ${u.name.split(" ")[0]}!`);
    await Promise.allSettled([loadTickets(), loadUsers()]);
    router.push("/erp");
  };

  const handleLogout = () => {
    clearAuthStorage();
    setUser(null);
    setPage("dashboard");
    setSelectedTicket(null);
    setAuthView("login");
    setSidebarOpen(false);
    router.push("/login");
    setTickets([]);
    setUsers([]);
  };

  const handleCreateAccount = async (input: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    company?: string;
  }) => {
    const { user: created } = await apiSignup(input);
    return created;
  };

  const handleFinishSignup = async (u: User) => {
    setUser(u);
    setPage("dashboard");
    setSelectedTicket(null);
    setAuthView("login");
    notify(`Welcome to Sunce ERP, ${u.name.split(" ")[0]}! 🎉`);
    await Promise.allSettled([loadTickets(), loadUsers()]);
    router.push("/erp");
  };

  const handleNewTicket = async (input: TicketCreateInput) => {
    const created = await apiCreateTicket(input);
    setTickets((prev) => [created, ...prev]);
    notify(`Ticket ${created.ticketId} created successfully!`);
  };

  const handleUpdateSelectedTicketStatus = async (status: Ticket["status"]) => {
    if (!selectedTicket) return;
    const updated = await apiUpdateTicketStatus(selectedTicket.id, status);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTicket(updated);
    notify(`Ticket ${updated.ticketId} updated to ${updated.status}`);
  };

  const handleTicketUpdated = (updated: Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTicket(updated);
  };

  const handleSchedulePickup = async (input: {
    ticketId: string;
    pickupDate: string;
    courierName: string;
    lrNumber: string;
    pickupLocation: string;
  }) => {
    await apiSchedulePickup(input);
    notify("Pickup scheduled!");
    try {
      const fresh = await apiTicketGet(input.ticketId);
      setSelectedTicket(fresh);
      setTicketDetailTab("logistics");
      setTicketDetailLogisticsStage("pickup");
      setPage("ticket_detail");
    } catch {
      // ignore navigation if fetch fails; list refresh still happens
    }
    await loadTickets();
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      tickets: "Service Tickets",
      ticket_detail: selectedTicket?.ticketId || "",
      jobcard: "Job Cards",
      logistics: "Logistics",
      sla: "SLA Monitor",
      reports: "Reports",
      users: "User Management",
      settings: "Settings",
    };
    return titles[page] || page;
  };

  return (
    <>
      {!user ? (
        authView === "signup" ? (
          <SignupScreen
            roles={roles}
            onCreateAccount={handleCreateAccount}
            onFinish={handleFinishSignup}
            onGoLogin={() => {
              setAuthView("login");
              router.push("/login");
            }}
          />
        ) : (
          <AuthScreen
            onLogin={handleLogin}
            onGoSignup={() => {
              setAuthView("signup");
              router.push("/signup");
            }}
            roles={roles}
          />
        )
      ) : (
        <div className="erp-root">
          <div
            className={`sidebar-backdrop ${sidebarOpen ? "open" : ""}`}
            onClick={() => setSidebarOpen(false)}
          />
          <Sidebar
            user={user}
            roles={roles}
            active={page}
            open={sidebarOpen}
            onNav={(p) => {
              setPage(p);
              setSelectedTicket(null);
            }}
            onClose={() => setSidebarOpen(false)}
            onLogout={handleLogout}
          />
          <div className="main">
            <div className="topbar">
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <button
                  className="sidebar-toggle"
                  aria-controls="erp-sidebar"
                  aria-expanded={sidebarOpen}
                  aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                  onClick={() => setSidebarOpen((v) => !v)}
                >
                  ☰
                </button>
                <Link href="/" className="topbar-home" aria-label="Go to home">
                  <LuSunMedium />
                </Link>
                <div className="topbar-title">{getPageTitle()}</div>
              </div>
              <div className="topbar-actions">
                {canAccess(roles, user.role, "tickets", "create") &&
                  page !== "ticket_detail" && (
                    <button
                      className="btn btn-accent btn-sm"
                      onClick={() => setShowNewTicket(true)}
                    >
                      + New Ticket
                    </button>
                  )}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, ${roles.find((r) => r.id === user.role)?.color || "#8B4513"}, ${(roles.find((r) => r.id === user.role)?.color || "#a0522d") + "bb"})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {user.name[0]}
                </div>
              </div>
            </div>

            {page === "dashboard" && (
              <Dashboard
                user={user}
                tickets={tickets}
                onNav={setPage}
                onViewTicket={(t) => {
                  setSelectedTicket(t);
                  setTicketDetailTab(user.role === "ENGINEER" ? "jobcard" : "overview");
                  setTicketDetailLogisticsStage(
                    t.status === "DISPATCHED" || t.status === "CLOSED" ? "dispatch" : "pickup",
                  );
                  setPage("ticket_detail");
                }}
                onOpenTickets={(preset) => {
                  setTicketsListPreset(preset || null);
                  setPage("tickets");
                }}
              />
            )}
            {page === "tickets" && (
              <TicketsList
                user={user}
                roles={roles}
                tickets={tickets}
                initialStatusFilter={ticketsListPreset?.status}
                initialPriorityFilter={ticketsListPreset?.priority}
                onView={(t) => {
                  setSelectedTicket(t);
                  setTicketDetailTab(user.role === "ENGINEER" ? "jobcard" : "overview");
                  setTicketDetailLogisticsStage(
                    t.status === "DISPATCHED" || t.status === "CLOSED" ? "dispatch" : "pickup",
                  );
                  setPage("ticket_detail");
                }}
                onNew={() => setShowNewTicket(true)}
              />
            )}
            {page === "ticket_detail" && selectedTicket && (
              <TicketDetail
                key={`${selectedTicket.id}:${ticketDetailTab}`}
                ticket={selectedTicket}
                user={user}
                roles={roles}
                onBack={() => setPage("tickets")}
                onUpdateStatus={handleUpdateSelectedTicketStatus}
                onTicketUpdated={handleTicketUpdated}
                initialTab={ticketDetailTab}
                initialLogisticsStage={ticketDetailLogisticsStage}
              />
            )}
            {page === "jobcard" && (
              <JobCards
                tickets={tickets}
                user={user}
                onOpenTicket={(t) => {
                  setSelectedTicket(t);
                  setTicketDetailTab("jobcard");
                  setPage("ticket_detail");
                }}
              />
            )}
            {page === "logistics" && (
              <Logistics
                tickets={tickets}
                onSchedulePickup={
                  canAccess(roles, user.role, "logistics", "edit") ||
                  canAccess(roles, user.role, "logistics", "create")
                    ? handleSchedulePickup
                    : undefined
                }
              />
            )}
            {page === "sla" && <SLAMonitor tickets={tickets} user={user} roles={roles} />}
            {page === "reports" && <Reports tickets={tickets} />}
            {page === "users" && (
              <UserManagement
                roles={roles}
                users={users}
                userRole={user.role}
                onRolesChange={(r) => {
                  setRoles(r);
                  notify("Role permissions updated!");
                }}
                onUsersChange={(u) => setUsers(u)}
              />
            )}
            {page === "settings" && <Settings onNotify={notify} />}
          </div>
        </div>
      )}

      {showNewTicket && (
        <NewTicketModal
          onClose={() => setShowNewTicket(false)}
          onSubmit={handleNewTicket}
          userRole={user?.role}
        />
      )}
      {notification && (
        <Notification msg={notification} onDone={() => setNotification("")} />
      )}
      {bootError && !user && (
        <div style={{ position: "fixed", left: 16, bottom: 16, fontSize: 12, color: "var(--text3)" }}>
          Backend warning: {bootError}
        </div>
      )}
    </>
  );
}
