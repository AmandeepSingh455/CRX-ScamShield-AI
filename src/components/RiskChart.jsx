import React from "react";
import { useApp } from "../context/AppContext";
import { motion } from "framer-motion";

export default function RiskChart() {
  const { history } = useApp();

  // Get last 6 scans, reversed to show chronological order (oldest to newest)
  const recentScans = [...history].slice(0, 6).reverse();

  const maxRisk = 100;
  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  if (recentScans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border-color rounded-xl bg-app-bg text-center p-4">
        <p className="text-sm font-bold text-accent-color">
          No Analysis History Found
        </p>
        <p className="text-xs text-text-secondary mt-1 max-w-50">
          Perform your first file or text scan to visualize risk trends.
        </p>
      </div>
    );
  }

  // Calculate coordinates
  const points = recentScans.map((scan, index) => {
    const x =
      paddingLeft + (index / Math.max(1, recentScans.length - 1)) * chartWidth;
    const y =
      paddingTop +
      chartHeight -
      (scan.result.riskScore / maxRisk) * chartHeight;
    return { x, y, ...scan };
  });

  // Create path data for line
  let pathD = "";
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Add a slight curve or straight connection
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  // Create area path data for gradient fill
  let areaD = "";
  if (points.length > 0) {
    areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  return (
    <div className="w-full relative select-none">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
          Threat History (Recent Scans)
        </h4>
        <span className="text-[10px] text-text-secondary">
          0 = Safe | 100 = Critical
        </span>
      </div>

      <div className="w-full overflow-x-auto scrollbar-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-accent-color)"
                stopOpacity="0.4"
              />
              <stop
                offset="100%"
                stopColor="var(--color-accent-color)"
                stopOpacity="0.0"
              />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((level) => {
            const y = paddingTop + chartHeight - (level / 100) * chartHeight;
            return (
              <g key={level}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  className="stroke-border-color/30"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-text-secondary text-[9px] font-mono"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {points.length > 1 && (
            <>
              <motion.path
                d={areaD}
                fill="url(#chartGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              />
              <motion.path
                d={pathD}
                fill="none"
                stroke="var(--color-accent-color)"
                strokeWidth={2}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </>
          )}

          {points.map((pt, _i) => {
            let color = "var(--color-accent-color)"; 
            if (pt.result.riskScore >= 50) {
              color = "var(--color-danger-color)"; 
            } else if (pt.result.riskScore >= 20) {
              color = "var(--color-warning-color)"; 
            }

            return (
              <g key={pt.id}>
                <motion.circle
                  cx={pt.x}
                  cy={pt.y}
                  r={7}
                  fill={color}
                  className="opacity-30"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: _i * 0.2,
                  }}
                />
                {/* Core Point */}
                <motion.circle
                  cx={pt.x}
                  cy={pt.y}
                  r={4}
                  fill={color}
                  stroke="var(--color-card-bg)"
                  strokeWidth={1}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, delay: _i * 0.1 }}
                  className="cursor-pointer hover:r-5 transition-all"
                />

                {/* Point Label / Risk Value */}
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  className="fill-text-primary font-mono text-[9px] font-bold"
                >
                  {pt.result.riskScore}%
                </text>
                
                <text
                  x={pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-text-secondary/50 text-[8px] font-mono"
                >
                  Scan {history.length - recentScans.length + _i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex gap-4 mt-3 flex-wrap justify-center border-t border-border-color pt-2 text-[10px]">
        {recentScans.map((scan, _i) => (
          <div key={scan.id} className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  scan.result.riskScore >= 50
                    ? "var(--color-danger-color)"
                    : scan.result.riskScore >= 20
                      ? "var(--color-warning-color)"
                      : "var(--color-accent-color)",
              }}
            />
            <span className="text-text-secondary max-w-20 truncate">
              {scan.filename}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
