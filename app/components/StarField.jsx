// app/components/StarField.jsx
"use client";
import { useEffect, useRef } from "react";
import { useConfig } from "../context/ConfigContext";
import { getTheme } from "../utils/themes";

export default function StarField() {
  const canvasRef = useRef(null);
  const config = useConfig();
  const theme = getTheme(config?.occasion);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let particles = [];
    const type = theme.particleType;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const createParticles = () => {
      particles = [];
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000));
      
      for (let i = 0; i < count; i++) {
        if (type === "heart") {
          particles.push({
            x: Math.random() * canvas.width,
            y: canvas.height + Math.random() * 100, // rise from bottom
            size: Math.random() * 8 + 4,
            speedY: Math.random() * 0.4 + 0.15,
            speedX: (Math.random() - 0.5) * 0.25,
            alpha: Math.random() * 0.5 + 0.2,
            angle: Math.random() * 360,
            angleSpeed: (Math.random() - 0.5) * 0.5,
            color: Math.random() > 0.5 ? "rgba(244, 63, 94, " : "rgba(236, 72, 153, ", // pink or rose
            shape: "heart"
          });
        } else if (type === "petal" || type === "blossom") {
          particles.push({
            x: Math.random() * canvas.width,
            y: -Math.random() * canvas.height, // fall from top
            size: Math.random() * 10 + 6,
            speedY: Math.random() * 0.6 + 0.4,
            speedX: Math.random() * 0.3 + 0.1,
            alpha: Math.random() * 0.6 + 0.2,
            angle: Math.random() * Math.PI,
            angleSpeed: Math.random() * 0.02 + 0.005,
            swing: Math.random() * 2,
            swingSpeed: Math.random() * 0.02,
            swingPhase: Math.random() * Math.PI * 2,
            color: type === "blossom" ? "#ffb7c5" : "#fff5e6", // cherry blossom pink or cream white
            shape: type === "blossom" ? "blossom" : "petal"
          });
        } else {
          // Classic Stars + Fireflies
          const isFirefly = Math.random() < 0.35;
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: isFirefly ? Math.random() * 2.5 + 1.2 : Math.random() * 1 + 0.4,
            alpha: Math.random() * 0.6 + 0.1,
            alphaDirection: Math.random() > 0.5 ? 1 : -1,
            alphaSpeed: Math.random() * 0.008 + 0.003,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.15,
            isFirefly,
            hue: isFirefly ? (theme.accentColor === "blue" ? 200 : Math.random() * 60 + 320) : 0, // dynamic hues
            shape: "star"
          });
        }
      }
    };

    createParticles();
    window.addEventListener("resize", createParticles);

    // Helpers to draw specific shapes
    const drawHeart = (ctx, x, y, size, alpha, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.moveTo(0, size / 4);
      ctx.quadraticCurveTo(0, 0, size / 2, 0);
      ctx.quadraticCurveTo(size, 0, size, size / 2);
      ctx.quadraticCurveTo(size, (size * 3) / 4, size / 2, size);
      ctx.quadraticCurveTo(0, size * 1.25, -size / 2, size);
      ctx.quadraticCurveTo(-size, (size * 3) / 4, -size, size / 2);
      ctx.quadraticCurveTo(-size, 0, -size / 2, 0);
      ctx.quadraticCurveTo(0, 0, 0, size / 4);
      ctx.fillStyle = `${color}${alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(244, 63, 94, 0.4)";
      ctx.fill();
      ctx.restore();
    };

    const drawPetal = (ctx, p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size / 2, p.size, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowBlur = 4;
      ctx.shadowColor = "rgba(255, 255, 255, 0.2)";
      ctx.fill();
      ctx.restore();
    };

    const drawBlossom = (ctx, p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.beginPath();
      // Cherry blossom petal curve
      ctx.moveTo(0, -p.size);
      ctx.quadraticCurveTo(p.size / 2, -p.size * 0.8, p.size / 2, 0);
      ctx.quadraticCurveTo(p.size / 4, p.size * 0.8, 0, p.size);
      ctx.quadraticCurveTo(-p.size / 4, p.size * 0.8, -p.size / 2, 0);
      ctx.quadraticCurveTo(-p.size / 2, -p.size * 0.8, 0, -p.size);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowBlur = 6;
      ctx.shadowColor = "rgba(244, 114, 182, 0.3)";
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        if (p.shape === "heart") {
          p.y -= p.speedY;
          p.x += p.speedX;
          p.angle += p.angleSpeed;
          if (p.y < -30) {
            p.y = canvas.height + 30;
            p.x = Math.random() * canvas.width;
          }
          drawHeart(ctx, p.x, p.y, p.size, p.alpha, p.color);
        } else if (p.shape === "petal" || p.shape === "blossom") {
          p.y += p.speedY;
          p.x += Math.sin(p.swingPhase) * p.swing;
          p.swingPhase += p.swingSpeed;
          p.angle += p.angleSpeed;
          
          if (p.y > canvas.height + 30) {
            p.y = -30;
            p.x = Math.random() * canvas.width;
          }
          if (p.shape === "blossom") {
            drawBlossom(ctx, p);
          } else {
            drawPetal(ctx, p);
          }
        } else {
          // Twinkling stars & fireflies
          p.alpha += p.alphaSpeed * p.alphaDirection;
          if (p.alpha >= 0.85 || p.alpha <= 0.05) p.alphaDirection *= -1;
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -5) p.x = canvas.width + 5;
          if (p.x > canvas.width + 5) p.x = -5;
          if (p.y < -5) p.y = canvas.height + 5;
          if (p.y > canvas.height + 5) p.y = -5;

          ctx.beginPath();
          if (p.isFirefly) {
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4.5);
            gradient.addColorStop(0, `hsla(${p.hue}, 80%, 75%, ${p.alpha})`);
            gradient.addColorStop(0.5, `hsla(${p.hue}, 70%, 60%, ${p.alpha * 0.4})`);
            gradient.addColorStop(1, `hsla(${p.hue}, 70%, 50%, 0)`);
            ctx.fillStyle = gradient;
            ctx.arc(p.x, p.y, p.radius * 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 0.65, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 100%, 96%, ${p.alpha * 0.95})`;
            ctx.fill();
          } else {
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.45})`;
            ctx.fill();
          }
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
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.55 }}
    />
  );
}
