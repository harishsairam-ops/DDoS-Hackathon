import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const serverIcon = new L.DivIcon({
    className: 'custom-server-icon',
    html: '<div style="background:#00ff9d; width:12px; height:12px; border-radius:50%; box-shadow:0 0 10px #00ff9d; border:2px solid #fff;"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

const getAttackerIcon = (threatLevel) => new L.DivIcon({
    className: 'custom-attacker-icon',
    html: `<div style="background:${threatLevel === 'HIGH' ? '#ff003c' : '#00f3ff'}; width:8px; height:8px; border-radius:50%; box-shadow:0 0 5px ${threatLevel === 'HIGH' ? '#ff003c' : '#00f3ff'};"></div>`,
    iconSize: [8, 8],
    iconAnchor: [4, 4]
});

// Map Controller for Dynamic Zoom/Pan if needed
const MapController = () => {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
    }, [map]);
    return null;
};

const GlobalMap = ({ logs = [] }) => {
    const [attacks, setAttacks] = useState([]);
    // Server Location: Ashburn, VA (Major Tech Hub)
    const SERVER_POS = [39.0438, -77.4874];

    // Limit logs tracking to recent ones to prevent map clutter
    useEffect(() => {
        // Filter for logs that are "active" (e.g. last 10 seconds)
        const now = Date.now() / 1000;
        const activeLogs = logs.filter(l => (now - l.timestamp) < 10);

        // Transform logs to attacks
        const newAttacks = activeLogs.map(log => ({
            id: log.timestamp + log.ip, // unique key
            pos: [log.geo?.lat || 10, log.geo?.lng || 10],
            ip: log.ip,
            threat_level: log.threat_level,
            location: log.geo?.name || 'Unknown'
        }));
        setAttacks(newAttacks);
    }, [logs]);

    return (
        <div className="w-full h-full relative overflow-hidden min-h-0">

            <div className="absolute top-2 left-10 text-xs font-mono text-cyan-500 tracking-widest z-[1000] flex items-center gap-2 pointer-events-none"
                style={{ textShadow: '0 0 5px #000' }}>
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                LIVE THREAT INTELLIGENCE MAP
            </div>

            <MapContainer
                center={[30, 0]}
                zoom={2}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', background: '#0a0f14' }}
                zoomControl={false}
                attributionControl={false}
            >
                <MapController />

                {/* Premium Dark Tech Map Style */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                    opacity={0.8}
                />
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
                    opacity={1}
                />

                {/* Central Server - Clean Hexagon/Shield */}
                <Marker position={SERVER_POS} icon={serverIcon}>
                    <Popup className="cyber-popup" autoPan={false}>
                        <div className="text-center font-bold text-accent-green">CORE SYSTEM</div>
                        <div className="text-xs text-gray-400">Secure Node</div>
                    </Popup>
                </Marker>

                {/* Attacks */}
                {attacks.map(attack => (
                    <React.Fragment key={attack.id}>
                        <Marker position={attack.pos} icon={getAttackerIcon(attack.threat_level)}>
                            <Tooltip permanent direction="top" className="cyber-tooltip">
                                <span style={{ color: attack.threat_level === 'HIGH' ? '#ff003c' : '#00f0ff' }}>
                                    {attack.ip} [{attack.location}]
                                </span>
                            </Tooltip>
                            <Popup className="cyber-popup" autoPan={false}>
                                <div style={{ minWidth: '120px' }}>
                                    <div style={{ color: attack.threat_level === 'HIGH' ? '#ff003c' : '#00f3ff', fontWeight: 'bold' }}>
                                        {attack.ip}
                                    </div>
                                    <div className="text-xs text-gray-300 mb-1">{attack.location}</div>
                                    <div className="text-xs border-t border-gray-700 pt-1 mt-1">
                                        ACTION: <span className="text-white">{attack.threat_level} BLOCK</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Precision Attack Trajectory */}
                        <Polyline
                            positions={[attack.pos, SERVER_POS]}
                            pathOptions={{
                                color: attack.threat_level === 'HIGH' ? '#ff003c' : '#00f3ff',
                                weight: 1.5,
                                opacity: 0.8,
                                dashArray: '0', // Solid lines for clarity
                            }}
                        />
                    </React.Fragment>
                ))}

            </MapContainer>
        </div>
    );
};

export default GlobalMap;
