import React, { useEffect, useRef } from 'react';

const GlobalMap = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Approximate map points for a "World Map" shape (simplified dots)
        const mapPoints = [];
        const numPoints = 600;

        // Generate points in a rough world map distribution (very simplified visual simulation)
        // In a real app, we'd use GeoJSON. For this visual hack, we just randomly cluster dots
        // to Simulated Continents
        const continents = [
            { x: 0.2, y: 0.3, w: 0.2, h: 0.3 }, // North America
            { x: 0.25, y: 0.65, w: 0.1, h: 0.25 }, // South America
            { x: 0.45, y: 0.25, w: 0.15, h: 0.2 }, // Europe
            { x: 0.5, y: 0.4, w: 0.2, h: 0.3 }, // Africa
            { x: 0.7, y: 0.25, w: 0.25, h: 0.25 }, // Asia
            { x: 0.8, y: 0.65, w: 0.15, h: 0.15 }, // Australia
        ];

        for (let i = 0; i < numPoints; i++) {
            const continent = continents[Math.floor(Math.random() * continents.length)];
            const x = (continent.x + Math.random() * continent.w) * canvas.width;
            const y = (continent.y + Math.random() * continent.h) * canvas.height;
            mapPoints.push({ x, y, size: Math.random() * 1.5 + 0.5 });
        }

        const attacks = [];

        const draw = () => {
            ctx.fillStyle = 'rgba(5, 5, 5, 0.2)'; // Fade effect
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Map Points (World Base)
            ctx.fillStyle = 'rgba(0, 243, 255, 0.15)';
            mapPoints.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Randomly spawn attack
            if (Math.random() < 0.05) {
                const start = mapPoints[Math.floor(Math.random() * mapPoints.length)];
                // Target is roughly center (server)
                const end = { x: canvas.width * 0.5 + (Math.random() * 20 - 10), y: canvas.height * 0.4 + (Math.random() * 20 - 10) };
                attacks.push({
                    x: start.x,
                    y: start.y,
                    targetX: end.x,
                    targetY: end.y,
                    progress: 0,
                    speed: Math.random() * 0.02 + 0.01,
                    color: Math.random() > 0.8 ? '#ff003c' : '#00f3ff'
                });
            }

            // Draw Attacks
            for (let i = attacks.length - 1; i >= 0; i--) {
                const atk = attacks[i];
                atk.progress += atk.speed;

                const currentX = atk.x + (atk.targetX - atk.x) * atk.progress;
                const currentY = atk.y + (atk.targetY - atk.y) * atk.progress;

                // Draw line
                ctx.strokeStyle = atk.color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(atk.x, atk.y);
                ctx.lineTo(currentX, currentY);
                ctx.stroke();

                // Draw head
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(currentX, currentY, 2, 0, Math.PI * 2);
                ctx.fill();

                if (atk.progress >= 1) {
                    // Impact ripple
                    ctx.strokeStyle = atk.color;
                    ctx.beginPath();
                    ctx.arc(atk.targetX, atk.targetY, 10 * (atk.progress - 0.9) * 10, 0, Math.PI * 2);
                    ctx.stroke();
                    attacks.splice(i, 1);
                }
            }

            // Draw Central Server
            ctx.fillStyle = '#00ff9d';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ff9d';
            ctx.beginPath();
            ctx.arc(canvas.width * 0.5, canvas.height * 0.4, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="w-full h-full relative glass-panel overflow-hidden">
            <div className="absolute top-2 left-4 text-xs font-mono text-cyan-500 tracking-widest z-10 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                GLOBAL THREAT MAP
            </div>
            <canvas ref={canvasRef} className="w-full h-full opacity-80" />
            {/* Hex Overlay */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, transparent 20%, #000 150%), repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(0, 255, 255, 0.05) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(0, 255, 255, 0.05) 20px)',
                    backgroundSize: '100% 100%, 20px 20px, 20px 20px'
                }}>
            </div>
        </div>
    );
};

export default GlobalMap;
