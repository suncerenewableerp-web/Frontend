"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LuCalendar, LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";

function clampToStartOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseYmd(value: string): Date | null {
  const v = String(value || "").trim();
  if (!v) return null;
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const da = Number(m[3]);
  const d = new Date(y, mo, da);
  if (Number.isNaN(d.getTime())) return null;
  // Guard against rollover (e.g. 2026-02-31)
  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== da) return null;
  return d;
}

function toYmd(d: Date) {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplay(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetweenYmd(value: string, min?: string, max?: string) {
  const v = String(value || "").trim();
  if (!v) return true;
  if (min && v < min) return false;
  if (max && v > max) return false;
  return true;
}

export default function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Select date",
  inputClassName = "form-input",
  min,
  max,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  placeholder?: string;
  inputClassName?: string;
  min?: string; // YYYY-MM-DD
  max?: string; // YYYY-MM-DD
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties | null>(null);

  const selectedDate = useMemo(() => parseYmd(value), [value]);
  const today = useMemo(() => clampToStartOfDay(new Date()), []);

  const [view, setView] = useState<Date>(() => selectedDate || today);
  const openPicker = () => {
    setView(selectedDate || today);
    setOpen(true);
    const inputEl = inputRef.current;
    if (inputEl) {
      const rect = inputEl.getBoundingClientRect();
      const gap = 8;
      const estWidth = 280;
      const estHeight = 360;

      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      let left = rect.left;
      const maxLeft = Math.max(8, viewportW - estWidth - 8);
      left = Math.min(Math.max(8, left), maxLeft);

      const spaceBelow = viewportH - rect.bottom;
      const openUp = spaceBelow < estHeight + gap && rect.top > estHeight + gap;
      const top = openUp ? rect.top - estHeight - gap : rect.bottom + gap;

      setPopoverStyle({ position: "fixed", top, left, zIndex: 1000 });
    }

    requestAnimationFrame(() => {
      const popEl = popoverRef.current;
      if (!inputEl || !popEl) return;

      const rect = inputEl.getBoundingClientRect();
      const popRect = popEl.getBoundingClientRect();

      const gap = 8;
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      let left = rect.left;
      const maxLeft = Math.max(8, viewportW - popRect.width - 8);
      left = Math.min(Math.max(8, left), maxLeft);

      const spaceBelow = viewportH - rect.bottom;
      const openUp = spaceBelow < popRect.height + gap && rect.top > popRect.height + gap;
      const top = openUp ? rect.top - popRect.height - gap : rect.bottom + gap;

      setPopoverStyle({
        position: "fixed",
        top,
        left,
        zIndex: 1000,
      });
    });
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = rootRef.current;
      const pop = popoverRef.current;
      if (!el) return;
      if (e.target instanceof Node) {
        if (el.contains(e.target)) return;
        if (pop && pop.contains(e.target)) return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc, true);
    return () => document.removeEventListener("mousedown", onDoc, true);
  }, [open]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(view);
  }, [view]);

  const cursor = useMemo(() => selectedDate || view || today, [selectedDate, view, today]);
  const cursorYear = cursor.getFullYear();
  const cursorMonth = cursor.getMonth();
  const cursorDay = cursor.getDate();

  const yearOptions = useMemo(() => {
    const minDate = min ? parseYmd(min) : null;
    const maxDate = max ? parseYmd(max) : null;
    const minYear = minDate?.getFullYear() ?? 2000;
    const maxYear = maxDate?.getFullYear() ?? 2050;
    const start = Math.min(minYear, cursorYear);
    const end = Math.max(maxYear, cursorYear);
    const out: number[] = [];
    for (let y = start; y <= end; y += 1) out.push(y);
    return out;
  }, [min, max, cursorYear]);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(new Date(2020, i, 1)),
    }));
  }, []);

  const daysInCursorMonth = useMemo(() => {
    return new Date(cursorYear, cursorMonth + 1, 0).getDate();
  }, [cursorYear, cursorMonth]);

  const commitCursor = (next: { year?: number; month?: number; day?: number }) => {
    const year = next.year ?? cursorYear;
    const month = next.month ?? cursorMonth;
    const dim = new Date(year, month + 1, 0).getDate();
    const day = Math.min(next.day ?? cursorDay, dim);
    const d = new Date(year, month, day);
    const ymd = toYmd(d);
    if (!isBetweenYmd(ymd, min, max)) return;
    onChange(ymd);
    setView(d);
  };

  const cells = useMemo(() => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monday-first index (Mon=0 ... Sun=6)
    const startIdx = (first.getDay() + 6) % 7;
    const out: Array<Date | null> = [];

    for (let i = 0; i < startIdx; i += 1) out.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) out.push(new Date(year, month, d));
    while (out.length % 7 !== 0) out.push(null);
    while (out.length < 42) out.push(null);

    return out;
  }, [view]);

  const display = selectedDate ? formatDisplay(selectedDate) : "";

  const popover = open && !disabled ? (
    <div
      className="date-popover"
      style={popoverStyle || undefined}
      role="dialog"
      aria-label="Choose date"
      ref={popoverRef}
    >
      <div className="date-popover-head">
        <button
          type="button"
          className="date-nav"
          onClick={() => setView((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          aria-label="Previous month"
        >
          <LuChevronLeft size={16} />
        </button>
        <div className="date-month">{monthLabel}</div>
        <button
          type="button"
          className="date-nav"
          onClick={() => setView((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          aria-label="Next month"
        >
          <LuChevronRight size={16} />
        </button>
      </div>

      <div className="date-scroll">
        <select
          className="date-scroll-select"
          value={cursorDay}
          onChange={(e) => commitCursor({ day: Number(e.target.value) })}
        >
          {Array.from({ length: daysInCursorMonth }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {String(d).padStart(2, "0")}
            </option>
          ))}
        </select>
        <select
          className="date-scroll-select"
          value={cursorMonth}
          onChange={(e) => commitCursor({ month: Number(e.target.value) })}
        >
          {monthOptions.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          className="date-scroll-select"
          value={cursorYear}
          onChange={(e) => commitCursor({ year: Number(e.target.value) })}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="date-dow">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={`${d}-${i}`} className="date-dow-cell">
            {d}
          </div>
        ))}
      </div>

      <div className="date-grid">
        {cells.map((d, idx) => {
          if (!d) return <div key={`e-${idx}`} className="date-cell empty" />;
          const ymd = toYmd(d);
          const selected = selectedDate ? sameDay(d, selectedDate) : false;
          const isToday = sameDay(d, today);
          const allowed = isBetweenYmd(ymd, min, max);
          return (
            <button
              key={ymd}
              type="button"
              className={`date-cell ${selected ? "selected" : ""} ${isToday ? "today" : ""}`}
              disabled={!allowed}
              onClick={() => {
                onChange(ymd);
                setView(d);
                setOpen(false);
              }}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <div className="date-actions">
        <button
          type="button"
          className="date-action"
          onClick={() => {
            const ymd = toYmd(today);
            if (!isBetweenYmd(ymd, min, max)) return;
            onChange(ymd);
            setView(today);
            setOpen(false);
          }}
        >
          Today
        </button>
        <button
          type="button"
          className="date-action"
          onClick={() => {
            onChange("");
            setOpen(false);
          }}
          aria-label="Clear date"
        >
          <LuX size={14} />
          Clear
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className={`date-field ${disabled ? "disabled" : ""}`} ref={rootRef}>
      <div className="date-trigger-row">
        <input
          className={`${inputClassName} date-input`}
          type="text"
          value={display}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          ref={inputRef}
          onClick={() => openPicker()}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPicker();
            }
            if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          aria-haspopup="dialog"
        />
        <button
          type="button"
          className="date-icon-btn"
          onClick={() => {
            if (open) setOpen(false);
            else openPicker();
          }}
          disabled={disabled}
          aria-label={open ? "Close calendar" : "Open calendar"}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <LuCalendar size={16} />
        </button>
      </div>

      {typeof document !== "undefined" && popover ? createPortal(popover, document.body) : null}
    </div>
  );
}
