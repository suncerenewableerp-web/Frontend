"use client";

import { useMemo, useRef } from "react";
import { useElementSize } from "../hooks/useElementSize";

export type ComboBar = {
  id: string;
  label: string;
  value: number;
  color: string;
};

export type ComboPoint = {
  id: string;
  xLabel: string;
  xTooltip?: string;
  bars: ComboBar[];
  lineValue?: number;
};

function niceCeil(maxValue: number): number {
  const v = Math.max(0, Number(maxValue) || 0);
  if (v <= 10) return Math.ceil(v);
  const exp = Math.floor(Math.log10(v));
  const base = 10 ** exp;
  const f = v / base;
  const niceF = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return niceF * base;
}

export default function ComboBarLineChart({
  points,
  selectedId,
  onSelect,
  height = 220,
  yTicks = 5,
  yLabel = "",
  showBarValues = false,
  ariaLabel = "Chart",
}: {
  points: ComboPoint[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  height?: number;
  yTicks?: number;
  yLabel?: string;
  showBarValues?: boolean;
  ariaLabel?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { width } = useElementSize(containerRef);

  const metrics = useMemo(() => {
    const safePoints = Array.isArray(points) ? points : [];
    const n = safePoints.length;
    const maxRaw = safePoints.reduce((best, p) => {
      const barsMax = (p.bars || []).reduce((b, bar) => Math.max(b, Number(bar.value) || 0), 0);
      const lineV = Number(p.lineValue ?? (p.bars?.[0]?.value ?? 0)) || 0;
      return Math.max(best, barsMax, lineV);
    }, 0);
    const yMax = Math.max(1, niceCeil(maxRaw));
    const ticks = Math.max(2, Math.trunc(yTicks || 5));
    const tickStep = yMax / (ticks - 1);
    // Keep raw values to avoid duplicate tick keys after rounding.
    const tickValues = Array.from({ length: ticks }, (_, i) => i * tickStep);
    const labelStep = n ? Math.max(1, Math.ceil(n / 7)) : 1;
    return { n, yMax, tickValues, labelStep };
  }, [points, yTicks]);

  const dims = useMemo(() => {
    const w = Math.max(0, Math.floor(width));
    const h = Math.max(160, Math.floor(height));
    const padL = 38;
    const padR = 10;
    const padT = 18;
    const padB = 34;
    const innerW = Math.max(1, w - padL - padR);
    const innerH = Math.max(1, h - padT - padB);
    return { w, h, padL, padR, padT, padB, innerW, innerH };
  }, [width, height]);

  const scaleY = (value: number) => {
    const v = Math.max(0, Number(value) || 0);
    return dims.padT + dims.innerH - (v / metrics.yMax) * dims.innerH;
  };

  const xCenter = (idx: number) => {
    const step = dims.innerW / Math.max(1, metrics.n);
    return dims.padL + idx * step + step / 2;
  };

  const selected = selectedId ? points.find((p) => p.id === selectedId) : null;

  if (!dims.w) {
    return <div ref={containerRef} style={{ height }} aria-label={ariaLabel} />;
  }

  const n = metrics.n || 1;
  const groupW = dims.innerW / n;
  const barGroupW = Math.max(10, Math.min(groupW * 0.72, 56));
  const barsPerPoint = Math.max(1, Math.max(...points.map((p) => p.bars?.length || 0)));
  const barGap = 4;
  const barW = Math.max(3, (barGroupW - barGap * (barsPerPoint - 1)) / barsPerPoint);

  const linePts = points.map((p, idx) => {
    const lineV = Number(p.lineValue ?? (p.bars?.[0]?.value ?? 0)) || 0;
    const tip = p.xTooltip || p.xLabel;
    const bars = Array.isArray(p.bars) ? p.bars : [];
    const barStr = bars.map((b) => `${b.label} ${Number(b.value) || 0}`).join(" · ");
    return { id: p.id, x: xCenter(idx), y: scaleY(lineV), value: lineV, title: `${tip} • ${barStr}` };
  });
  const lineD = linePts
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`)
    .join(" ");

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: dims.h,
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--bg2)",
        border: "1px solid var(--border)",
      }}
      aria-label={ariaLabel}
      role="group"
    >
      <svg
        width={dims.w}
        height={dims.h}
        role="img"
        aria-label={ariaLabel}
        style={{ display: "block" }}
      >
        {yLabel ? (
          <text
            x={10}
            y={12}
            fill="var(--text3)"
            fontSize={11}
            fontFamily="var(--mono)"
          >
            {yLabel}
          </text>
        ) : null}

        {/* grid + y ticks */}
        {metrics.tickValues.map((tv, i) => {
          const y = scaleY(tv);
          const label = Math.round(tv);
          const isZero = i === 0 || label === 0;
          return (
            <g key={i}>
              <line
                x1={dims.padL}
                x2={dims.w - dims.padR}
                y1={y}
                y2={y}
                stroke={isZero ? "var(--border2)" : "var(--border)"}
                strokeWidth={1}
              />
              <text
                x={dims.padL - 8}
                y={y + 4}
                textAnchor="end"
                fill="var(--text3)"
                fontSize={11}
                fontFamily="var(--mono)"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* axes */}
        <line
          x1={dims.padL}
          x2={dims.padL}
          y1={dims.padT}
          y2={dims.padT + dims.innerH}
          stroke="var(--border2)"
          strokeWidth={1}
        />
        <line
          x1={dims.padL}
          x2={dims.w - dims.padR}
          y1={dims.padT + dims.innerH}
          y2={dims.padT + dims.innerH}
          stroke="var(--border2)"
          strokeWidth={1}
        />

        {/* bars */}
        {points.map((p, idx) => {
          const bars = Array.isArray(p.bars) ? p.bars : [];
          const groupX = dims.padL + idx * groupW + (groupW - barGroupW) / 2;
          const baseY = dims.padT + dims.innerH;
          const isSelected = selectedId === p.id;
          const title = p.xTooltip
            ? `${p.xTooltip} • ${bars.map((b) => `${b.label} ${Number(b.value) || 0}`).join(" · ")}`
            : `${p.xLabel} • ${bars.map((b) => `${b.label} ${Number(b.value) || 0}`).join(" · ")}`;

          return (
            <g key={p.id}>
              <title>{title}</title>
              <rect
                x={dims.padL + idx * groupW}
                y={dims.padT}
                width={groupW}
                height={dims.innerH}
                fill="transparent"
                onClick={() => onSelect?.(p.id)}
                onKeyDown={(e) => {
                  if (!onSelect) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(p.id);
                  }
                }}
                tabIndex={onSelect ? 0 : undefined}
                role={onSelect ? "button" : undefined}
                aria-label={onSelect ? title : undefined}
                style={{ cursor: onSelect ? "pointer" : "default" }}
              />
              {isSelected ? (
                <rect
                  x={dims.padL + idx * groupW + 2}
                  y={dims.padT + 2}
                  width={groupW - 4}
                  height={dims.innerH - 4}
                  rx={10}
                  fill="var(--surface)"
                  stroke="var(--accent-mid)"
                  strokeWidth={1}
                  opacity={0.9}
                />
              ) : null}
              {bars.map((b, j) => {
                const v = Math.max(0, Number(b.value) || 0);
                const h = Math.max(2, Math.round((v / metrics.yMax) * dims.innerH));
                const x = groupX + j * (barW + barGap);
                const y = baseY - h;
                const showLabel = showBarValues && v > 0 && (barW >= 10 || isSelected);
                const labelY = Math.max(dims.padT + 12, y - 4);
                return (
                  <g key={b.id}>
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={h}
                      rx={5}
                      fill={v ? b.color : "var(--surface3)"}
                      opacity={isSelected ? 1 : 0.95}
                    />
                    {showLabel ? (
                      <text
                        x={x + barW / 2}
                        y={labelY}
                        textAnchor="middle"
                        fill="var(--text2)"
                        fontSize={10}
                        fontFamily="var(--mono)"
                        pointerEvents="none"
                      >
                        {v}
                      </text>
                    ) : null}
                  </g>
                );
              })}
              <text
                x={xCenter(idx)}
                y={dims.padT + dims.innerH + 22}
                textAnchor="middle"
                fill="var(--text3)"
                fontSize={11}
                fontFamily="var(--mono)"
              >
                {idx === 0 || idx === points.length - 1 || idx % metrics.labelStep === 0 || p.id === selectedId
                  ? p.xLabel
                  : ""}
              </text>
            </g>
          );
        })}

        {/* line */}
        <path
          d={lineD}
          fill="none"
          stroke="#111827"
          strokeWidth={2}
          opacity={0.9}
          vectorEffect="non-scaling-stroke"
        />
        {linePts.map((pt) => {
          const isSelected = pt.id === selectedId;
          return (
            <g
              key={pt.id}
              onClick={() => onSelect?.(pt.id)}
              onKeyDown={(e) => {
                if (!onSelect) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(pt.id);
                }
              }}
              tabIndex={onSelect ? 0 : undefined}
              role={onSelect ? "button" : undefined}
              aria-label={onSelect ? pt.title : undefined}
              style={{ cursor: onSelect ? "pointer" : "default" }}
            >
              <title>{pt.title}</title>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? 5.5 : 4.5}
                fill="white"
                stroke="#111827"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}
      </svg>

      {selected ? (
        <div
          style={{
            position: "absolute",
            right: 10,
            top: 10,
            fontSize: 12,
            color: "var(--text3)",
            fontFamily: "var(--mono)",
            background: "rgba(255,255,255,0.6)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "6px 10px",
            backdropFilter: "blur(8px)",
          }}
        >
          {selected.xTooltip || selected.xLabel}
        </div>
      ) : null}
    </div>
  );
}
