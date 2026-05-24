// app/components/FireworksFinale.jsx
"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function FireworksFinale({ onComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationFrameId;
    let particles = [];
    let rockets = [];
    let startTime = Date.now();
    const duration = 4500; // 4.5 seconds of fireworks

    const COLORS = [
      "#ff6eb4", "#a78bfa", "#60a5fa", "#34d399",
      "#facc15", "#fb923c", "#f472b6", "#c084fc",
      "#ffffff", "#fde68a"
    ];

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = Math.random() * 0.018 + 0.008;
        this.radius = Math.random() * 2.5 + 1;
        this.gravity = 0.08;
      }
      update() {
        this.vx *= 0.97;
        this.vy *= 0.97;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.beginPath();
        // Glow effect
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class Rocket {
      constructor() {
        this.x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
        this.y = canvas.height;
        const targetX = canvas.width * 0.1 + Math.random() * canvas.width * 0.8;
        const targetY = canvas.height * 0.1 + Math.random() * canvas.height * 0.45;
        const dist = Math.hypot(targetX - this.x, targetY - this.y);
        const speed = 12 + Math.random() * 6;
        this.vx = ((targetX - this.x) / dist) * speed;
        this.vy = ((targetY - this.y) / dist) * speed;
        this.targetY = targetY;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.exploded = false;
        this.trail = [];
      }
      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 8) this.trail.shift();
        this.x += this.vx;
        this.y += this.vy;
        if (this.y <= this.targetY) this.explode();
      }
      explode() {
        this.exploded = true;
        const count = 120 + Math.floor(Math.random() * 60);
        for (let i = 0; i < count; i++) {
          particles.push(new Particle(this.x, this.y, this.color));
        }
      }
      draw() {
        // Trail
        this.trail.forEach((pos, i) => {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 2 * (i / this.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = (i / this.trail.length) * 0.6;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        // Head
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
    }

    let launchCount = 0;
    const launchRocket = () => {
      rockets.push(new Rocket());
      launchCount++;
    };

    // Staggered launches
    const launchTimers = [];
    for (let i = 0; i < 10; i++) {
      launchTimers.push(setTimeout(launchRocket, i * 380 + 100));
    }

    const animate = () => {
      const elapsed = Date.now() - startTime;

      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rockets = rockets.filter(r => !r.exploded);
      rockets.forEach(r => { r.update(); r.draw(); });

      particles = particles.filter(p => p.alpha > 0);
      particles.forEach(p => { p.update(); p.draw(); });

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete && onComplete();
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      launchTimers.forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1, type: "spring", bounce: 0.4 }}
        className="relative z-10 text-center pointer-events-none px-4"
      >
        <h2 className="text-4xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-300 to-purple-300 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)] leading-tight">
          Happy 70th<br />Birthday! 🎂
        </h2>
        <p className="mt-4 text-lg md:text-2xl text-white/70 font-light tracking-widest">
          With all our love ❤️
        </p>
      </motion.div>
    </motion.div>
  );
}
