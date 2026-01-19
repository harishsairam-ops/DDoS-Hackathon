import React, { useEffect, useRef } from 'react';

const CyberBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const drops = [];
        const numDrops = 100;

        for (let i = 0; i < numDrops; i++) {
            drops.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                length: Math.random() * 20 + 10,
                speed: Math.random() * 5 + 2
            });
        }

        const draw = () => {
            ctx.fillStyle = 'rgba(5, 5, 5, 0.3)'; // Trail effect
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Grid
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
            ctx.lineWidth = 1;

            // Perspective Grid Horizontal
            const horizon = canvas.height * 0.4;
            const gap = 40;

            // Vertical lines
            for (let x = 0; x < canvas.width; x += gap * 2) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            // Horizontal lines (perspective)
            for (let y = 0; y < canvas.height; y += gap) {
                const alpha = (y / canvas.height) * 0.1;
                ctx.strokeStyle = `rgba(0, 243, 255, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Draw Particles/Drops
            ctx.strokeStyle = 'rgba(0, 255, 157, 0.5)';
            ctx.lineWidth = 1.5;

            drops.forEach(drop => {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x, drop.y + drop.length);
                ctx.stroke();

                drop.y += drop.speed;

                if (drop.y > canvas.height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                background: '#050505',
                pointerEvents: 'none'
            }}
        />
    );
};

export default CyberBackground;
