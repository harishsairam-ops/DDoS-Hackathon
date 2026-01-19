import React from 'react';
import { Skull, Ban, CheckCircle, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BotList = ({ bots, onBlock, onUnblock, blockedIps }) => {
    return (
        <div className="glass-panel h-full relative overflow-hidden">
            {/* Background grunge/stripes */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #222 25%, #222 75%, #000 75%, #000)', backgroundSize: '10px 10px' }}>
            </div>

            <div className="flex items-center gap-3 mb-6 relative z-10 border-b border-red-900/50 pb-4">
                <Skull size={24} color="var(--accent-red)" className="animate-pulse" />
                <h2 className="text-xl font-bold text-red-500 tracking-widest font-display">THREAT_VAULT</h2>
                <div className="ml-auto bg-red-900/30 px-3 py-1 rounded border border-red-500/30 text-xs text-red-400 font-mono">
                    {bots.length} RECS
                </div>
            </div>

            <div className="list-container relative z-10 pr-2">
                <AnimatePresence>
                    {bots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-600">
                            <Fingerprint size={48} className="mb-2 opacity-20" />
                            <span className="font-mono text-sm">NO ACTIVE WARRANTS</span>
                        </div>
                    ) : (
                        bots.map((bot, index) => {
                            const isBlocked = blockedIps.includes(bot.ip);
                            return (
                                <motion.div
                                    key={`${bot.ip}-${index}`}
                                    initial={{ opacity: 0, x: 50, rotateX: 90 }}
                                    animate={{ opacity: 1, x: 0, rotateX: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="mb-4 relative group"
                                >
                                    {/* Card Container */}
                                    <div className={`bg-black/40 border-l-4 ${isBlocked ? 'border-green-500' : 'border-red-500'} p-4 relative overflow-hidden backdrop-blur-sm`}>

                                        {/* Holographic shimmer */}
                                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-green-500' : 'bg-red-500 animate-ping'} `}></div>
                                                    <div className="font-mono text-xl font-bold text-white tracking-wider">{bot.ip}</div>
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono mt-1">
                                                    CASE_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                                                </div>
                                            </div>

                                            {isBlocked ? (
                                                <button onClick={() => onUnblock(bot.ip)} className="hover:bg-green-500/20 p-2 rounded transition-colors text-green-400 border border-transparent hover:border-green-500/50">
                                                    <CheckCircle size={18} />
                                                </button>
                                            ) : (
                                                <button onClick={() => onBlock(bot.ip)} className="hover:bg-red-500/20 p-2 rounded transition-colors text-red-500 border border-transparent hover:border-red-500/50">
                                                    <Ban size={18} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="mt-2 bg-black/50 p-2 rounded border border-white/5 flex gap-2 items-center">
                                            <span className="text-red-400 text-xs font-bold uppercase">CHARGE:</span>
                                            <span className="text-gray-300 text-xs font-mono">{bot.reason}</span>
                                        </div>

                                        <div className="mt-2 flex justify-between items-end">
                                            <div className="text-[10px] text-gray-600 font-mono">
                                                DETECTED: {new Date(bot.timestamp * 1000).toLocaleTimeString()}
                                            </div>
                                            {isBlocked && (
                                                <div className="wanted-stamp text-xs border-2 border-green-500 text-green-500 px-2 py-1 rotate-[-10deg] opacity-80">
                                                    NEUTRALIZED
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BotList;
