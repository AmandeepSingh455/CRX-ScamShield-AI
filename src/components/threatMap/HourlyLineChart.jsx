import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { generateSplinePath } from '../../services/threatDataService';

export default function HourlyLineChart({ hourlyData = [] }) {
  const [activePoint, setActivePoint] = useState(null);

  const width = 640;
  const height = 180;
  const paddingX = 35;
  const paddingY = 25;

  const yTicks = [36, 27, 18, 9, 0];
  const { path, area, points } = generateSplinePath(hourlyData, width, height, 30);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Scams detected per hour
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Last 24 hours
            </span>
          </div>
        </div>

        {activePoint && (
          <div className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg border border-blue-100 font-mono">
            {activePoint.label}: {activePoint.val} scams
          </div>
        )}
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full overflow-hidden pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 sm:h-48 overflow-visible"
        >
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Dashed Gridlines & Y-Axis Labels */}
          {yTicks.map((tick) => {
            const y = paddingY + ((36 - tick) / 36) * (height - paddingY * 2);
            return (
              <g key={tick}>
                <text
                  x={15}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono select-none"
                >
                  {tick}
                </text>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - 15}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Area Fill */}
          {area && <path d={area} fill="url(#blueGradient)" />}

          {/* Spline Curve Stroke */}
          {path && (
            <path
              d={path}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Data Points */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={activePoint?.label === pt.label ? 5 : 3.5}
                className="fill-white stroke-[#2563eb] stroke-2 cursor-pointer transition-all duration-150"
                onMouseEnter={() => setActivePoint(pt)}
                onMouseLeave={() => setActivePoint(null)}
              />
            </g>
          ))}
        </svg>

        {/* X-Axis Time Labels */}
        <div className="flex justify-between items-center px-6 pt-1 text-[10px] text-slate-500 font-mono select-none">
          {hourlyData.map((d, i) => (
            <span
              key={i}
              className={`transition-colors ${
                activePoint?.label === d.time ? 'text-blue-600 font-bold' : ''
              }`}
            >
              {d.time}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
