import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, ShieldCheck, Terminal } from 'lucide-react';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

const DecryptText = ({ text }) => {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplay(text.split('').map((char, index) => {
        if (index < iterations) return char;
        return characters[Math.floor(Math.random() * characters.length)];
      }).join(''));

      if (iterations >= text.length) clearInterval(interval);
      iterations += 1 / 2; // Speed
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span className="font-mono">{display}</span>;
}

const TrafficTable = ({ logs }) => {
  return (
    <div className="glass-panel h-full relative terminal-scan">
      <div className="flex items-center gap-3 mb-4 z-10 relative">
        <Terminal size={20} color="var(--accent-cyan)" />
        <h2 className="text-xl font-bold tracking-widest text-cyan-400">DATA_STREAM_V4.0</h2>
      </div>

      <div className="list-container relative z-10">
        <table className="traffic-table w-full">
          <thead>
            <tr className="text-xs text-cyan-500/50 border-b border-cyan-500/20">
              <th>TIMESTAMP</th>
              <th>ORIGIN_IP</th>
              <th>PROTOCOL</th>
              <th>PAYLOAD</th>
              <th>STATUS</th>
              <th>THREAT_SIG</th>
              <th>ML_CONF</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {logs.map((log, index) => {
                const timeStr = new Date(log.timestamp * 1000).toLocaleTimeString();

                // Mock Data for "Hyper" feel
                const protocol = ['HTTP/1.1', 'HTTP/2', 'TCP', 'UDP'][Math.floor(Math.random() * 4)];
                const payload = Math.floor(Math.random() * 500 + 200) + 'B';

                const mlScore = log.ml_score || 0;
                let mlColor = 'var(--text-secondary)';
                if (mlScore > 0.8) mlColor = 'var(--accent-red)';
                else if (mlScore > 0.4) mlColor = 'orange';

                return (
                  <motion.tr
                    key={`${index}-${log.timestamp}`}
                    initial={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    className="hover:bg-cyan-500/5 group"
                  >
                    <td className="font-mono text-gray-500 text-xs">{timeStr}</td>
                    <td className="font-mono font-bold text-cyan-300">
                      <DecryptText text={log.ip} />
                    </td>
                    <td className="text-xs text-gray-400">{protocol}</td>
                    <td className="text-xs text-gray-400">{payload}</td>
                    <td>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${log.status === 200 ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'}`}>
                        {log.status === 200 ? 'ALLOW' : 'BSOD'}
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs ${
                        log.threat_level === 'HIGH' ? 'text-red-500 animate-pulse' : 
                        log.threat_level === 'MEDIUM' ? 'text-orange-500' : 
                        'text-green-500'}`}
                      >
                        {log.threat_level}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-gray-700/50 rounded overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${mlScore * 100}%` }}
                            className="h-full"
                            style={{ background: mlColor }}
                          />
                        </div>
                        <span style={{ color: mlColor, fontSize: '0.7rem' }}>{(mlScore * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrafficTable;
