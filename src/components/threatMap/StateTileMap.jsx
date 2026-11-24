import React, { useMemo, useState } from 'react';
import { Map, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/** Interpolate successSoft (mint) → warning (amber) → danger (crimson red). */
function scale(t) {
  const stops = [
    [0, [236, 253, 245]],
    [0.5, [245, 158, 11]],
    [1, [239, 68, 68]],
  ];
  const i = t <= 0.5 ? 0 : 1;
  const [a, ca] = stops[i];
  const [b, cb] = stops[i + 1];
  const k = (t - a) / (b - a);
  const rgb = ca.map((v, j) => Math.round(v + (cb[j] - v) * k));
  return { fill: `rgb(${rgb.join(',')})`, text: t > 0.42 ? '#ffffff' : '#0f172a' };
}

/**
 * India heatmap as a tile-grid cartogram: every state is an equal tile placed roughly
 * where it sits on the map, so small states stay readable on mobile.
 * states: [{ code, name, x, y, count }]
 */
export default function StateTileMap({ states = [], topCities = [] }) {
  const { theme } = useApp();
  const [hover, setHover] = useState(null);
  const max = useMemo(() => Math.max(1, ...states.map((s) => s.count)), [states]);

  const SIZE = 52;
  const GAP = 6;
  const cols = 9;
  const rows = 8;

  return (
    <div className="bg-card-bg rounded-2xl border border-border-color shadow-xs p-5 flex flex-col justify-between h-full transition-colors">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-color">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Map className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary tracking-tight">
              Scam reports by state
            </h3>
            <span className="text-[11px] text-text-secondary font-medium">
              Last 7 days
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-text-secondary font-medium">
          <span className="text-[11px] text-text-secondary">Low</span>
          <span
            className="h-2 w-28 rounded-full"
            style={{ background: 'linear-gradient(90deg,#ecfdf5,#f59e0b,#ef4444)' }}
            aria-hidden
          />
          <span className="text-[11px] text-text-secondary">High</span>
        </div>
      </div>

      {/* Main Split Row: SVG Cartogram Heatmap on Left, Top Cities on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
        {/* Left: SVG Cartogram Map */}
        <div className="lg:col-span-8 flex flex-col items-center sm:items-start relative">
          <div className="relative w-full max-w-[460px]">
            <svg
              viewBox={`0 0 ${cols * (SIZE + GAP)} ${rows * (SIZE + GAP)}`}
              className="w-full h-auto max-h-[440px]"
              role="img"
              aria-label="India Scam Reports Map"
            >
              {states.map((s) => {
                const c = scale(s.count / max);
                const x = s.x * (SIZE + GAP);
                const y = s.y * (SIZE + GAP);
                const active = hover?.code === s.code;

                return (
                  <g
                    key={s.code}
                    tabIndex={0}
                    role="button"
                    aria-label={`${s.name}: ${s.count.toLocaleString()}`}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(s)}
                    onBlur={() => setHover(null)}
                    className="cursor-pointer outline-none transition-transform"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={SIZE}
                      height={SIZE}
                      rx={8}
                      fill={c.fill}
                      stroke={active ? '#3b82f6' : (theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.08)')}
                      strokeWidth={active ? 3 : 1}
                      className="transition-all duration-200"
                    />
                    <text
                      x={x + SIZE / 2}
                      y={y + 22}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="700"
                      fill={c.text}
                      fontFamily="Inter, system-ui, sans-serif"
                    >
                      {s.code}
                    </text>
                    <text
                      x={x + SIZE / 2}
                      y={y + 38}
                      textAnchor="middle"
                      fontSize="10"
                      fill={c.text}
                      opacity=".85"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {s.count}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hover && (
              <div
                className="absolute top-2 left-2 rounded-lg bg-slate-900 dark:bg-slate-950 text-white px-3 py-2 text-xs shadow-xl pointer-events-none border border-slate-700 z-30"
                role="status"
              >
                <p className="font-semibold text-emerald-400">{hover.name} ({hover.code})</p>
                <p className="opacity-90 font-mono text-[11px] mt-0.5">{hover.count.toLocaleString()} reports</p>
              </div>
            )}
          </div>

          {/* Bottom Gradient Bar on Mobile/Small Screen */}
          <div className="flex sm:hidden items-center gap-2 mt-3 text-xs text-text-secondary w-full justify-center">
            <span className="text-[10px]">Low</span>
            <span
              className="h-2 flex-1 max-w-[160px] rounded-full"
              style={{ background: 'linear-gradient(90deg,#ecfdf5,#f59e0b,#ef4444)' }}
              aria-hidden
            />
            <span className="text-[10px]">High</span>
          </div>
        </div>

        {/* Right: TOP CITIES */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-border-color lg:pl-6 pt-4 lg:pt-0 w-full">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Top Cities
            </h4>
            <span className="text-[10px] text-text-secondary font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#ef4444] dark:text-red-400" />
              Live reports
            </span>
          </div>

          <div className="space-y-2">
            {topCities.map((city) => (
              <div
                key={city.rank}
                className="flex items-center justify-between py-1 px-1.5 rounded-md hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-text-secondary font-mono text-xs w-3 text-right">
                    {city.rank}
                  </span>
                  <span className="font-semibold text-text-primary truncate">
                    {city.name}
                  </span>
                </div>
                <span className="font-bold font-mono text-[#ef4444] dark:text-red-400 text-xs shrink-0">
                  {city.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
