import React, { useState, useEffect } from 'react';
import './App.css';

const HOST = 'http://localhost:5000';

const App = () => {
  const [time, setTime] = useState(new Date());
  const [securityLevel, setSecurityLevel] = useState('NORMAL'); // NORMAL | CRITICAL
  const [stats, setStats] = useState({
    total_requests: 0,
    blocked_ips: 0,
    detected_bots: 0,
    logs: [],
    detections: []
  });

  // Live Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Logic
  const fetchStats = async () => {
    try {
      const res = await fetch(`${HOST}/api/stats`);
      const data = await res.json();
      setStats(data);

      // Auto-set security level if blocked IPs > 0 (for visual flair)
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

      {/* Visual Overlay Effects */}
      <div className="scanline"></div>
      <div className="vignette"></div>

      {/* --- HEADER --- */}
      <header className="top-bar">
        <div className="logo-section">
          <div className="logo-icon glitch-effect">NW</div>
          <div>
            <h1 className="text-gradient">NET-WATCH</h1>
            <span className="subtitle">SYSTEM v2.5.0 // LIVE_FEED</span>
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

      {/* --- MAIN GRID --- */}
      <main className="dashboard-grid">

        {/* LEFT COL: Stats */}
        <section className="glass-panel stats-panel">
          <h3>Network Analytics</h3>
          <div className="stat-group">
            <span className="stat-label">Total Requests</span>
            <div className="stat-value glow-cyan">{stats.total_requests.toLocaleString()}</div>
          </div>
          <div className="stat-group">
            <span className="stat-label">Neutralized Threats</span>
            <div className="stat-value glow-green" style={{ color: 'var(--accent-red)' }}>{stats.blocked_ips}</div>
          </div>
          <div className="stat-group">
            <span className="stat-label">ML Confidence Avg</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: stats.logs.length > 0 ? `${(stats.logs.reduce((acc, l) => acc + (l.ml_score || 0), 0) / stats.logs.length) * 100}%` : '0%' }}></div>
            </div>
          </div>

          <div className="divider" style={{ marginTop: 'auto' }}></div>
          <div className="stat-group">
            <span className="stat-label">Active Bot Entities</span>
            <div className="stat-value">{stats.detected_bots}</div>
          </div>
        </section>

        {/* CENTER COL: Live Traffic */}
        <section className="glass-panel main-panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Live Packet Stream</h3>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>REAL-TIME MONITORING</span>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table className="traffic-table">
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>ORIGIN IP</th>
                  <th>PATH</th>
                  <th>STATUS</th>
                  <th>ML_SCORE</th>
                </tr>
              </thead>
              <tbody>
                {stats.logs.map((row, idx) => (
                  <tr key={idx}>
                    <td className="mono" style={{ fontSize: '0.7rem' }}>{new Date(row.timestamp * 1000).toLocaleTimeString()}</td>
                    <td className="mono" style={{ color: 'var(--accent-cyan)' }}>{row.ip}</td>
                    <td>{row.path}</td>
                    <td>
                      <span className={`badge ${row.status === 200 ? 'badge-allow' : 'badge-block'}`}>
                        {row.status === 200 ? 'ALLOW' : 'BSOD'}
                      </span>
                    </td>
                    <td className="mono">{((row.ml_score || 0) * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* RIGHT COL: Controls & Threat Vault */}
        <section className="glass-panel control-panel">
          <h3>Security Vault</h3>

          <div className="action-list" style={{ flex: 1, overflowY: 'auto' }}>
            <p className="cmd-text"> IDENTIFIED TARGETS:</p>
            {stats.detections.length === 0 ? (
              <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SCANNING FOR THREATS...</p>
            ) : (
              stats.detections.map((bot, idx) => (
                <div key={idx} style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>{bot.ip}</span>
                    <button
                      className={`btn ${(stats.blocked_ips_list || []).includes(bot.ip) ? 'btn-danger' : ''}`}
                      style={{ padding: '2px 8px', fontSize: '0.6rem' }}
                      onClick={() => (stats.blocked_ips_list || []).includes(bot.ip) ? handleUnblock(bot.ip) : handleBlock(bot.ip)}
                    >
                      {(stats.blocked_ips_list || []).includes(bot.ip) ? 'UNBLOCK' : 'BLOCK'}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{bot.reason}</div>
                </div>
              ))
            )}

            <div className="divider" style={{ marginTop: '10px' }}></div>

            <p className="cmd-text text-danger"> SYSTEM OVERRIDE:</p>
            <button
              className="btn btn-danger btn-full"
              onClick={() => setSecurityLevel(securityLevel === 'NORMAL' ? 'CRITICAL' : 'NORMAL')}
            >
              {securityLevel === 'NORMAL' ? 'EMERGENCY LOCKDOWN' : 'RESET SECURITY PROTOCOL'}
            </button>
          </div>

          <div className="terminal-output">
            <p> System [NET-WATCH] initialized...</p>
            <p>ML-Engine: {stats.logs.length > 0 ? 'ACTIVE' : 'IDLE'}</p>
            <p className="text-success"> Nodes secure. Monitoring traffic...</p>
            <p className="blinking-cursor">_</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
