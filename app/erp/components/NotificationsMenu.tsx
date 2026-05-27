"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LuBell, LuCircle } from "react-icons/lu";
import {
  apiNotificationMarkRead,
  apiNotificationsList,
  apiNotificationsReadAll,
} from "../api";
import type { AppNotification } from "../types";

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const sec = Math.max(0, Math.floor(diff / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day === 1 ? "" : "s"} ago`;
}

function pickTicketDbId(n: AppNotification): string | null {
  const m = n?.meta;
  if (!m || typeof m !== "object") return null;
  const id = (m as any).ticketDbId ?? (m as any).ticketIdDb ?? (m as any).ticketId;
  const s = String(id || "").trim();
  return s || null;
}

export default function NotificationsMenu({
  pollMs = 30000,
  onViewAll,
  onOpenTicket,
}: {
  pollMs?: number;
  onViewAll?: () => void;
  onOpenTicket?: (ticketDbId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const hasUnread = unreadCount > 0;

  const visibleItems = useMemo(() => items.slice(0, 8), [items]);

  const refresh = async (limit = 12) => {
    setLoading(true);
    try {
      const next = await apiNotificationsList({ limit });
      setItems(next.items);
      setUnreadCount(next.unreadCount);
    } catch {
      // ignore; keep last known state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh(12);
    const t = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      void refresh(12);
    }, Math.max(8000, pollMs));
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollMs]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    void refresh(12);
    if (!hasUnread) return;
    void apiNotificationsReadAll()
      .then(() => {
        setUnreadCount(0);
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="notif" ref={rootRef}>
      <button
        className="notif-btn"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <LuBell />
        {hasUnread && <span className="notif-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-menu" role="menu" aria-label="Notifications menu">
          <div className="notif-head">
            <div className="notif-head-title">
              {hasUnread ? `You have ${unreadCount} new notification${unreadCount === 1 ? "" : "s"}` : "Notifications"}
            </div>
            {onViewAll && (
              <button className="notif-viewall" onClick={() => { setOpen(false); onViewAll(); }}>
                View all
              </button>
            )}
          </div>

          <div className="notif-list">
            {loading && !visibleItems.length ? (
              <div className="notif-empty">Loading…</div>
            ) : !visibleItems.length ? (
              <div className="notif-empty">No notifications</div>
            ) : (
              visibleItems.map((n) => {
                const ago = timeAgo(n.createdAt);
                const ticketDbId = pickTicketDbId(n);
                const clickable = Boolean(ticketDbId && onOpenTicket);
                return (
                  <button
                    key={n.id}
                    className={`notif-item ${n.read ? "" : "unread"}`}
                    role="menuitem"
                    onClick={async () => {
                      if (!n.read) {
                        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                        void apiNotificationMarkRead(n.id).catch(() => {});
                      }
                      if (clickable && ticketDbId) onOpenTicket?.(ticketDbId);
                      setOpen(false);
                    }}
                    title={clickable ? "Open ticket" : ""}
                  >
                    <span className="notif-ic" aria-hidden>
                      <LuCircle />
                    </span>
                    <span className="notif-item-body">
                      <span className="notif-item-title">{n.title}</span>
                      {n.message ? <span className="notif-item-msg">{n.message}</span> : null}
                      {ago ? <span className="notif-item-time">{ago}</span> : null}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
