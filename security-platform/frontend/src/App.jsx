import React, { useState, useEffect } from 'react';
import './App.css';
import GlobalMap from './components/GlobalMap';
import TrafficTable from './components/TrafficTable';
import BotGraph from './components/BotGraph';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ShieldAlert, BarChart3, Radio } from 'lucide-react';

const HOST = 'http://localhost:5000';

const App = () => {
  const [time, setTime] = useState(new Date());
  const [securityLevel, setSecurityLevel] = useState('NORMAL');
  const [activeTab, setActiveTab] = useState('HOME'); // HOME | BOTS | GRAPH
  const [stats, setStats] = useState({
    total_requests: 0,
    blocked_ips: 0,
    detected_bots: 0,
    logs: [],
    detections: []
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${HOST}/api/stats`);
      const data = await res.json();
      setStats(data);
      if (data.blocked_ips > 0) setSecurityLevel('CRITICAL');
      else setSecurityLevel('NORMAL');
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
    <div className={`app-container ${securityLevel === 'CRITICAL' ? 'alert-mode' : ''}`}>
      <header className="top-bar">
        <div className="logo-section">
          <div className="logo-icon glitch-effect">NW</div>
          <div>
            <h1 className="text-gradient">NET-WATCH</h1>
            <span className="subtitle">SYSTEM v4.0.0 // PROTOCOL_OMEGA</span>
          </div>
        </div>

        <div className="status-section">
          <div className="clock">
            {time.toLocaleTimeString([], { hour12: false })}
          </div>
          <div className={`status-badge ${securityLevel === 'NORMAL' ? 'status-ok' : 'status-err'}`}>
            {securityLevel === 'NORMAL' ? 'SYSTEM SECURE' : 'THREAT DETECTED'}
          </div>
        </div>
      </header>

      <main className="dashboard-grid">
        {/* LEFT COL: Stats & Tabs */}
        <section className="glass-panel stats-panel flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="flex items-center gap-2">
              <Radio size={16} className="text-cyan-400" />
              SYSTEM_ANALYTICS
            </h3>
            <div className="stat-group">
              <span className="stat-label">Total Requests</span>
              <div className="stat-value glow-cyan">{stats.total_requests.toLocaleString()}</div>
            </div>
            <div className="stat-group">
              <span className="stat-label">ML Confidence Avg</span>
              <div className="progress-bar h-2 bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: stats.logs.length > 0 ? `${(stats.logs.reduce((acc, l) => acc + (l.ml_score || 0), 0) / stats.logs.length) * 100}%` : '0%' }}
                  className="progress-fill h-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]"
                ></motion.div>
              </div>
            </div>
          </div>

          <div className="divider opacity-20"></div>

          {/* TAB NAVIGATION */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] text-gray-500 mb-2 font-mono">NAVIGATION_MODULES</h3>
            <NavButton
              active={activeTab === 'HOME'}
              onClick={() => setActiveTab('HOME')}
              icon={<LayoutDashboard size={18} />}
              label="CORE_DASHBOARD"
            />
            <NavButton
              active={activeTab === 'BOTS'}
              onClick={() => setActiveTab('BOTS')}
              icon={<ShieldAlert size={18} />}
              label="CORRECT_IP_BOTS"
            />
            <NavButton
              active={activeTab === 'GRAPH'}
              onClick={() => setActiveTab('GRAPH')}
              icon={<BarChart3 size={18} />}
              label="GRAPH_FOR_BOT"
            />
          </div>

          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="stat-group mb-0">
              <span className="stat-label">Active Bot Entities</span>
              <div className="stat-value text-xl">{stats.detected_bots}</div>
            </div>
          </div>
        </section>

        {/* CENTER CONTENT: Dynamic based on Tab */}
        <section className="glass-panel main-panel relative overflow-hidden" style={{ gridColumn: 'span 2' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'HOME' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col gap-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold font-display text-cyan-400">CORE_NETWORK_VISUALIZER</h2>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Interactive Threat Mapping</span>
                </div>
                <div className="flex-1 rounded border border-white/5 overflow-hidden relative">
                  <GlobalMap logs={stats.logs} />
                  <div className="absolute bottom-4 right-4 z-[1000] glass-panel p-2 text-[10px] font-mono bg-black/60">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span>CORE NODE: ACTIVE</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 h-24">
                  <MiniCard label="NEUTRALIZED" value={stats.blocked_ips} color="red" />
                  <MiniCard label="SYS_LATENCY" value="12ms" color="cyan" />
                  <MiniCard label="TRAFFIC_LOAD" value="84%" color="green" />
                </div>
              </motion.div>
            )}

            {activeTab === 'BOTS' && (
              <motion.div
                key="bots"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="h-full"
              >
                <TrafficTable logs={stats.logs} />
              </motion.div>
            )}

            {activeTab === 'GRAPH' && (
              <motion.div
                key="graph"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full flex flex-col gap-4"
              >
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-xl font-bold font-display text-red-500">THREAT_METRIC_ANALYSIS</h2>
                  <div className="flex gap-2">
                    <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-1 rounded border border-red-500/20 font-mono">LIVE_UPDATE</span>
                  </div>
                </div>
                <div className="flex-1">
                  <BotGraph logs={stats.logs} />
                </div>
                <div className="glass-panel p-4 bg-red-900/5 border-red-500/20">
                  <h4 className="text-xs font-bold text-red-400 mb-2 font-mono">THREAT INTELLIGENCE SUMMARY</h4>
                  <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                    Current heuristic analysis indicates a {stats.detected_bots > 5 ? 'Elevated' : 'Stable'} bot presence.
                    Detection engines are operating at {stats.logs.length > 0 ? 'Peak' : 'Standby'} capacity.
                    Coordinated patterns flagged in {stats.detections.length} instances over current epoch.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* RIGHT COL: Security Vault (Always Visible) */}
        <section className="glass-panel control-panel">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
            <h3 className="m-0">Security Vault</h3>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
          </div>

          <div className="action-list flex-1 overflow-y-auto custom-scrollbar pr-1">
            <p className="cmd-text"> IDENTIFIED TARGETS:</p>
            {stats.detections.length === 0 ? (
              <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SCANNING FOR THREATS...</p>
            ) : (
              stats.detections.map((bot, idx) => (
                <div key={idx} className="p-3 border border-white/5 mb-2 bg-white/[0.02] hover:bg-white/[0.05] transition-colors relative group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="mono text-red-400 font-bold text-sm tracking-tighter">{bot.ip}</span>
                    <button
                      className={`px-3 py-1 text-[9px] font-bold border transition-all ${(stats.blocked_ips_list || []).includes(bot.ip)
                          ? 'border-green-500 text-green-500 hover:bg-green-500 hover:text-black'
                          : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-black'
                        }`}
                      onClick={() => (stats.blocked_ips_list || []).includes(bot.ip) ? handleUnblock(bot.ip) : handleBlock(bot.ip)}
                    >
                      {(stats.blocked_ips_list || []).includes(bot.ip) ? 'NEUTRALIZED' : 'NEUTRALIZE'}
                    </button>
                  </div>
                  <div className="text-[9px] text-gray-500 font-mono uppercase">{bot.reason}</div>
                </div>
              ))
            )}

            <div className="divider mt-4 mb-4"></div>

            <p className="cmd-text text-danger"> SYSTEM OVERRIDE:</p>
            <button
              className={`btn btn-full ${securityLevel === 'NORMAL' ? '' : 'btn-danger animate-pulse'}`}
              onClick={() => setSecurityLevel(securityLevel === 'NORMAL' ? 'CRITICAL' : 'NORMAL')}
            >
              {securityLevel === 'NORMAL' ? 'INITIATE LOCKDOWN' : 'SECURE CONNECT RESET'}
            </button>
          </div>

          <div className="terminal-output mt-4 bg-black/60 border-l border-cyan-500/50">
            <div className="text-[10px] text-cyan-500/50 mb-1 font-mono uppercase">System Log</div>
            <p> [INF] NET-WATCH_v4.0 ACTIVE</p>
            <p> [OK] Nodes: {stats.logs.length > 0 ? 'SYNCED' : 'READY'}</p>
            <p className="text-success"> [SEC] Protocol OMEGA engaged</p>
            <p className="blinking-cursor">_</p>
          </div>
        </section>
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 border transition-all duration-300 group ${active
        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]'
        : 'border-white/5 text-gray-500 hover:border-white/20 hover:text-white'
      }`}
  >
    <div className={`${active ? 'text-cyan-400' : 'text-gray-600 group-hover:text-cyan-400'}`}>
      {icon}
    </div>
    <span className="font-mono text-[10px] tracking-widest font-bold uppercase">{label}</span>
  </button>
);

const MiniCard = ({ label, value, color }) => (
  <div className="glass-panel p-3 flex flex-col justify-center border-white/5 bg-white/[0.02]">
    <div className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-1">{label}</div>
    <div className={`text-xl font-bold font-display text-${color}-400`}>{value}</div>
  </div>
);

export default App;
