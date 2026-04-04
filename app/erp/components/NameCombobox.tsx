"use client";


import { useEffect, useMemo, useRef, useState } from "react";

export default function NameCombobox({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState(() => value);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setOpen(false);
    };
    const onPointerDown = (ev: MouseEvent | TouchEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const target = ev.target as Node | null;
      if (target && !el.contains(target)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const src = (options || []).map((x) => String(x || "").trim()).filter(Boolean);
    const q = String(filterText || "").trim().toLowerCase();
    if (!q) return src;
    return src.filter((x) => x.toLowerCase().includes(q));
  }, [options, filterText]);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <input
        ref={inputRef}
        className="form-input"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={() => {
          if (disabled) return;
          setOpen(true);
          // Show all options when opening, even if current value doesn't match.
          setFilterText("");
        }}
        onClick={() => {
          if (disabled) return;
          setOpen(true);
          setFilterText("");
        }}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v);
          setOpen(true);
          setFilterText(v);
        }}
        autoComplete="off"
      />

      {open ? (
        <div
          role="listbox"
          aria-label="Name options"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "calc(100% + 6px)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "var(--shadow-md)",
            overflow: "hidden",
            zIndex: 20,
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {filtered.length ? (
            filtered.map((name) => (
              <button
                key={name}
                type="button"
                role="option"
                aria-selected={String(value || "").trim() === name}
                onMouseDown={(e) => {
                  // Prevent input blur before click selection.
                  e.preventDefault();
                }}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                  // keep input focused for quick next action
                  queueMicrotask(() => inputRef.current?.focus());
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--text)",
                }}
              >
                {name}
              </button>
            ))
          ) : (
            <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--text3)" }}>
              No matches
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
