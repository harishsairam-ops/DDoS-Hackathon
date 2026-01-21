import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const BotGraph = ({ logs = [] }) => {
    // Process logs into buckets of 10 seconds for the last 2 minutes
    const data = useMemo(() => {
        const now = Math.floor(Date.now() / 1000);
        const buckets = 12; // 120 seconds / 10s
        const result = new Array(buckets).fill(0).map((_, i) => ({
            time: now - (buckets - 1 - i) * 10,
            count: 0
        }));

        logs.forEach(log => {
            const index = result.findIndex(b => log.timestamp >= b.time && log.timestamp < b.time + 10);
            if (index !== -1) {
                if (log.threat_level === 'HIGH' || log.threat_level === 'MEDIUM') {
                    result[index].count++;
                }
            }
        });

        return result;
    }, [logs]);

    const maxCount = Math.max(...data.map(d => d.count), 5);
    const height = 200;
    const width = 400;
    const padding = 20;

    const points = data.map((d, i) => {
        const x = padding + (i * (width - 2 * padding) / (data.length - 1));
        const y = (height - padding) - (d.count / maxCount * (height - 2 * padding));
        return { x, y };
    });

    const pathData = points.reduce((acc, p, i) =>
        i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`, ''
    );

    const areaData = `${pathData} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

    return (
        <div className="w-full h-full flex flex-col p-4 bg-black/20 rounded border border-cyan-500/10 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-mono text-cyan-400 tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 animate-pulse rounded-full"></span>
                    THREAT_PROPAGATION_METRICS
                </h3>
                <div className="text-[10px] text-cyan-500/50 font-mono">
                    LIVE_WINDOW: 120S
                </div>
            </div>

            <div className="relative flex-1">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                        <line
                            key={i}
                            x1={padding}
                            y1={padding + p * (height - 2 * padding)}
                            x2={width - padding}
                            y2={padding + p * (height - 2 * padding)}
                            stroke="rgba(0, 243, 255, 0.05)"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Area Fill */}
                    <motion.path
                        d={areaData}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        fill="url(#gradient-area)"
                    />

                    {/* Line Path */}
                    <motion.path
                        d={pathData}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        fill="none"
                        stroke="var(--accent-red)"
                        strokeWidth="2"
                        style={{ filter: 'drop-shadow(0 0 5px var(--accent-red))' }}
                    />

                    {/* Data Points */}
                    {points.map((p, i) => (
                        <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="2"
                            fill="var(--accent-red)"
                        />
                    ))}

                    <defs>
                        <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-red)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--accent-red)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 text-[10px] font-mono text-gray-500 border-t border-white/5 pt-2">
                <div>PEAK: <span className="text-white">{Math.max(...data.map(d => d.count))}</span></div>
                <div>AVG: <span className="text-white">{(data.reduce((a, b) => a + b.count, 0) / data.length).toFixed(1)}</span></div>
                <div>FREQ: <span className="text-white">10S</span></div>
                <div className="text-right text-red-500">ACTIVE</div>
            </div>
        </div>
    );
};

export default BotGraph;
