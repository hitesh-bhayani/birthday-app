// app/components/StarField.jsx
"use client";
import { useEffect, useRef } from "react";

export default function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create stars + fireflies
    const createParticles = () => {
      particles = [];
      const count = Math.min(120, Math.floor((canvas.width * canvas.height) / 8000));
      for (let i = 0; i < count; i++) {
        const isFirefly = Math.random() < 0.3;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: isFirefly ? Math.random() * 2.5 + 1 : Math.random() * 1 + 0.3,
          alpha: Math.random() * 0.6 + 0.1,
          alphaDirection: Math.random() > 0.5 ? 1 : -1,
          alphaSpeed: Math.random() * 0.008 + 0.003,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.15,
          isFirefly,
          hue: isFirefly ? Math.random() * 60 + 280 : 0, // purple-pink for fireflies
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };
    createParticles();
    window.addEventListener("resize", createParticles);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Animate alpha (twinkle)
        p.alpha += p.alphaSpeed * p.alphaDirection;
        if (p.alpha >= 0.8 || p.alpha <= 0.05) p.alphaDirection *= -1;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;
        if (p.y < -5) p.y = canvas.height + 5;
        if (p.y > canvas.height + 5) p.y = -5;

        ctx.beginPath();
        if (p.isFirefly) {
          // Glowing firefly with color
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
          gradient.addColorStop(0, `hsla(${p.hue}, 80%, 75%, ${p.alpha})`);
          gradient.addColorStop(0.5, `hsla(${p.hue}, 70%, 60%, ${p.alpha * 0.4})`);
          gradient.addColorStop(1, `hsla(${p.hue}, 70%, 50%, 0)`);
          ctx.fillStyle = gradient;
          ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
          ctx.fill();

          // Bright center dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 100%, 95%, ${p.alpha * 0.9})`;
          ctx.fill();
        } else {
          // Simple white star
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.5})`;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", createParticles);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
