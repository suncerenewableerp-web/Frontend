"use client";

import { useEffect, useMemo, useState } from "react";
import { apiJobCardsList, type JobCardListRow } from "../api";
import type { Ticket, User } from "../types";
import { StatusBadge } from "./Badges";
import { LuWrench } from "react-icons/lu";

export default function JobCards({
  tickets,
  user,
  onOpenTicket,
}: {
  tickets: Ticket[];
  user: User;
  onOpenTicket?: (t: Ticket) => void;
}) {
  const isEngineer = user.role === "ENGINEER";

  const [jobCards, setJobCards] = useState<JobCardListRow[]>([]);
  const [jobCardsLoading, setJobCardsLoading] = useState(false);
  const [jobCardsError, setJobCardsError] = useState("");

  useEffect(() => {
    if (isEngineer) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setJobCardsLoading(true);
      setJobCardsError("");
    });
    apiJobCardsList()
      .then((rows) => {
        if (cancelled) return;
        setJobCards(rows);
      })
      .catch((e) => {
        if (cancelled) return;
        setJobCardsError(e instanceof Error ? e.message : "Failed to load job cards");
        setJobCards([]);
      })
      .finally(() => {
        if (cancelled) return;
        setJobCardsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isEngineer]);

  const myTickets = useMemo(() => {
    if (!isEngineer) return [];
    return tickets.filter(
      (t) => t.assignedEngineer === user.name && t.status === "UNDER_REPAIRED",
    );
  }, [isEngineer, tickets, user.name]);

  const visibleJobCards = useMemo(() => {
    if (isEngineer) return [];
    return jobCards;
  }, [isEngineer, jobCards]);

  return (
    <div className="content">
      <div className="page-header">
        <div className="page-title">Job Cards</div>
        <div className="page-sub">
          {isEngineer ? `${myTickets.length} active jobs` : `${visibleJobCards.length} job cards`}
        </div>
      </div>
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">{isEngineer ? "Active Job Cards" : "Job Cards"}</div>
        </div>
        <div className="scroll-x">
          <table>
            <thead>
              <tr>
                <th>Job Card</th>
                <th>Ticket</th>
                <th>Customer</th>
                <th>Ticket Status</th>
                <th>Engineer</th>
                {!isEngineer ? <th>Repairability</th> : null}
                {!isEngineer ? <th>Updated</th> : null}
              </tr>
            </thead>
            <tbody>
              {!isEngineer && jobCardsError ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-icon" aria-hidden>
                        <LuWrench />
                      </div>
                      <div className="empty-text">{jobCardsError}</div>
                    </div>
                  </td>
                </tr>
              ) : !isEngineer && jobCardsLoading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-icon" aria-hidden>
                        <LuWrench />
                      </div>
                      <div className="empty-text">Loading job cards…</div>
                    </div>
                  </td>
                </tr>
              ) : isEngineer && myTickets.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-icon" aria-hidden>
                        <LuWrench />
                      </div>
                      <div className="empty-text">No active job cards</div>
                    </div>
                  </td>
                </tr>
              ) : !isEngineer && visibleJobCards.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-icon" aria-hidden>
                        <LuWrench />
                      </div>
                      <div className="empty-text">No job cards found</div>
                    </div>
                  </td>
                </tr>
              ) : isEngineer ? (
                myTickets.map((t) => (
                  <tr key={t.id}>
                    <td>
                      {onOpenTicket ? (
                        <button
                          type="button"
                          className="td-mono table-link"
                          onClick={() => onOpenTicket(t)}
                          title="Open job card"
                        >
                          JC-{t.ticketId.replace("SR-", "")}
                        </button>
                      ) : (
                        <span className="td-mono">JC-{t.ticketId.replace("SR-", "")}</span>
                      )}
                    </td>
                    <td>
                      <span className="td-mono">{t.ticketId}</span>
                    </td>
                    <td>{t.customer}</td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td>{t.assignedEngineer}</td>
                  </tr>
                ))
              ) : (
                visibleJobCards.map((row) => {
                  const t = row.ticket;
                  return (
                    <tr key={row.jobCardId || t.id}>
                      <td>
                        {onOpenTicket ? (
                          <button
                            type="button"
                            className="td-mono table-link"
                            onClick={() => onOpenTicket(t)}
                            title="Open job card"
                          >
                            JC-{t.ticketId.replace("SR-", "")}
                          </button>
                        ) : (
                          <span className="td-mono">JC-{t.ticketId.replace("SR-", "")}</span>
                        )}
                      </td>
                      <td>
                        <span className="td-mono">{t.ticketId}</span>
                      </td>
                      <td>{t.customer}</td>
                      <td>
                        <StatusBadge status={t.status} />
                      </td>
                      <td>{t.assignedEngineer}</td>
                      <td>
                        {String(row.jobStatus || "").trim() ? (
                          <span className="tag">{String(row.jobStatus || "").toUpperCase()}</span>
                        ) : (
                          <span style={{ color: "var(--text3)" }}>—</span>
                        )}
                      </td>
                      <td style={{ fontFamily: "var(--mono)", color: "var(--text3)" }}>
                        {row.updatedAt || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
