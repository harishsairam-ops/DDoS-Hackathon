import React, { useState, useEffect } from 'react';
import { Shield, Zap, Activity, Globe, Lock, Unlock, Cpu } from 'lucide-react';
import TrafficTable from './TrafficTable';
import BotList from './BotList';
import CyberBackground from './CyberBackground'; // Import new bg
import GlobalMap from './GlobalMap'; // Import GlobalMap
import { motion } from 'framer-motion';

const HOST = 'http://localhost:5000';

function Dashboard() {
    const [stats, setStats] = useState({
        total_requests: 0,
        blocked_ips: 0,
        detected_bots: 0,
        logs: [],
        detections: []
    });

    const fetchStats = async () => {
        try {
            const res = await fetch(`${HOST}/api/stats`);
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error("Failed to fetch stats", err);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleBlock = async (ip) => {
        try {
            await fetch(`${HOST}/api/block`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip })
            });
            fetchStats();
        } catch (err) {
            console.error("Block failed", err);
        }
    };

    const handleUnblock = async (ip) => {
        try {
            await fetch(`${HOST}/api/unblock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip })
            });
            fetchStats();
        } catch (err) {
            console.error("Unblock failed", err);
        }
    };

    return (
        <div className="h-screen w-full relative overflow-hidden flex flex-col p-4 bg-black text-white">
            <CyberBackground />
            <div className="hex-grid"></div>
            <div className="scanline"></div>

            {/* Header HUD */}
            <header className="mb-4 flex justify-between items-end border-b border-cyan-500/30 pb-2 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2 border border-cyan-500/50 bg-cyan-900/20 rounded">
                        <Shield size={32} className="text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white glitch"
                            data-text="DEFENSE OS v4.0"
                            style={{ fontFamily: 'Orbitron', letterSpacing: '2px', textShadow: '0 0 10px rgba(0, 243, 255, 0.5)' }}>
                            DEFENSE OS <span className="text-lg text-cyan-700">v4.0</span>
                        </h1>
                        <div className="flex items-center gap-2 text-cyan-400/60 font-mono text-xs mt-1">
                            <span>SECURE CONNECTION ESTABLISHED</span>
                            <span className="animate-pulse">_</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="glass-panel px-6 py-2 flex flex-col items-end border-r-4 border-r-green-500" style={{ borderRight: '4px solid var(--accent-green)' }}>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse box-shadow-green"></div>
                            <span className="text-sm font-bold text-green-400 tracking-widest">SYSTEM ONLINE</span>
                        </div>
                        <span className="text-xs text-green-800 font-mono">LATENCY: 12ms</span>
                    </div>
                </div>
            </header>

            {/* Layout Grid */}
            <div className="flex-1 grid grid-cols-12 grid-rows-12 gap-4 min-h-0 relative z-10">

                {/* Left Column: Stats & Map */}
                <div className="col-span-8 row-span-12 flex flex-col gap-4">

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 h-32">
                        <StatCard
                            icon={<Activity size={24} />}
                            label="TRAFFIC VOLUME"
                            value={stats.total_requests.toLocaleString()}
                            color="cyan"
                        />
                        <StatCard
                            icon={<Lock size={24} />}
                            label="THREATS BLOCKED"
                            value={stats.blocked_ips}
                            color="red"
                        />
                        <StatCard
                            icon={<Cpu size={24} />}
                            label="ACTIVE BOTS"
                            value={stats.detected_bots}
                            color="green"
                        />
                    </div>

                    {/* Content Split: Map & Table */}
                    <div className="flex-1 grid grid-cols-1 gap-4 overflow-hidden relative min-h-0" style={{ gridTemplateRows: '1fr 1fr' }}>
                        {/* Global Map Panel */}
                        <div className="relative overflow-hidden group border-t-2 border-cyan-500 min-h-0">
                            <GlobalMap logs={stats.logs} />
                        </div>

                        {/* Traffic Table Panel */}
                        <div className="relative overflow-hidden border-b-2 border-cyan-500 min-h-0">
                            <TrafficTable logs={stats.logs} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Threat Vault */}
                <div className="col-span-4 row-span-12 glass-panel relative border-r-2 border-red-500" style={{ borderRight: '2px solid var(--accent-red)' }}>
                    <BotList
                        bots={stats.detections}
                        blockedIps={stats.blocked_ips_list || []}
                        onBlock={handleBlock}
                        onUnblock={handleUnblock}
                    />
                </div>

            </div>
        </div>
    );
}

const StatCard = ({ icon, label, value, color }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`glass-panel p-4 flex flex-row items-center gap-4 glow-${color} relative overflow-hidden group`}
        >
            <div className={`absolute -right-4 -top-4 opacity-10 bg-${color}-500 w-24 h-24 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>

            <div
                style={{
                    color: `var(--accent-${color})`,
                    background: `rgba(var(--accent-${color}), 0.1)`,
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid var(--accent-${color})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 10px rgba(var(--accent-${color}), 0.2)`
                }}>
                {icon}
            </div>
            <div className="z-10">
                <div className="stat-value text-3xl">{value}</div>
                <div className="stat-label text-xs tracking-widest opacity-80">{label}</div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
