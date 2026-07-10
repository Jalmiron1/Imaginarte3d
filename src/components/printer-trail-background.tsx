'use client';

import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  width: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export function PrinterTrailBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, active: false, speed: 0 });
  const pointsRef = useRef<Point[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    // Generar el cursor de Mario Bros usando un canvas secundario
    const createMarioCursor = () => {
      const cursorCanvas = document.createElement('canvas');
      cursorCanvas.width = 32;
      cursorCanvas.height = 32;
      const cursorCtx = cursorCanvas.getContext('2d');
      if (!cursorCtx) return null;

      // Matriz clásica de 12x9 píxeles para la cabeza de Mario
      const grid = [
        [0,0,0,1,1,1,1,1,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,0,0],
        [0,3,3,3,2,2,4,2,0,0,0,0],
        [3,2,3,2,2,2,4,2,2,2,0,0],
        [3,2,3,3,2,2,2,4,2,2,2,0],
        [3,3,2,2,2,2,4,4,4,4,0,0],
        [0,0,2,2,2,2,2,2,2,0,0,0],
        [0,0,0,1,1,1,1,1,0,0,0,0],
        [0,0,1,1,1,1,1,1,1,0,0,0]
      ];

      const colors: { [key: number]: string } = {
        0: 'transparent',
        1: '#E52521', // Rojo
        2: '#FCD1A1', // Piel/Peach
        3: '#865125', // Marrón
        4: '#000000'  // Negro
      };

      const scale = 2.4; // Escala para ajustar la cabeza a ~28x22px
      const offsetX = Math.floor((32 - (12 * scale)) / 2);
      const offsetY = Math.floor((32 - (9 * scale)) / 2);

      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          const colorCode = grid[r][c];
          if (colorCode !== 0) {
            cursorCtx.fillStyle = colors[colorCode];
            cursorCtx.fillRect(
              offsetX + c * scale,
              offsetY + r * scale,
              scale,
              scale
            );
          }
        }
      }

      return cursorCanvas.toDataURL();
    };

    const cursorDataUrl = createMarioCursor();
    let styleTag: HTMLStyleElement | null = null;

    if (cursorDataUrl) {
      styleTag = document.createElement('style');
      styleTag.id = 'mario-cursor-style';
      styleTag.innerHTML = `
        html, body, a, button, select, input, textarea, [role="button"] {
          cursor: url(${cursorDataUrl}) 12 2, auto !important;
        }
      `;
      document.head.appendChild(styleTag);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar resolución del canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Trackear el mouse
    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;

      // Calcular velocidad del cursor
      const dx = mouse.x - mouse.lastX;
      const dy = mouse.y - mouse.lastY;
      mouse.speed = Math.sqrt(dx * dx + dy * dy);

      // Si el cursor se está moviendo, extruir filamento (agregar puntos)
      if (mouse.speed > 1) {
        pointsRef.current.push({
          x: mouse.x,
          y: mouse.y,
          age: 0,
          maxAge: 80, // Duración del filamento en fotogramas
          width: Math.min(6, Math.max(2, mouse.speed / 4)), // Grosor según velocidad
        });

        // Crear "chispas" o partículas de filamento fundido según la velocidad
        if (Math.random() < 0.4) {
          const particleCount = Math.min(3, Math.floor(mouse.speed / 5) + 1);
          for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 0.5;
            // Tonos de filamento fundido caliente: amarillo, naranja, rosa
            const colors = ['#FFD39A', '#FF9F6A', '#FF6FA5'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            particlesRef.current.push({
              x: mouse.x,
              y: mouse.y,
              vx: Math.cos(angle) * speed + (dx * 0.1),
              vy: Math.sin(angle) * speed + (dy * 0.1) + 0.5, // Leve gravedad
              size: Math.random() * 2.5 + 1,
              color,
              life: 0,
              maxLife: Math.random() * 40 + 20,
            });
          }
        }
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    let animationId: number;

    // Loop de renderizado
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const points = pointsRef.current;
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // 1. Dibujar el "filamento extruido" (el trazo)
      if (points.length > 1) {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Dibujar el trazo segmento por segmento para variar grosor y color (enfriamiento)
        for (let i = 1; i < points.length; i++) {
          const p1 = points[i - 1];
          const p2 = points[i];

          // Actualizar edad
          p1.age++;

          // Calcular ratio de enfriamiento (0 = recién salido / caliente, 1 = frío / a punto de desaparecer)
          const ratio = p1.age / p1.maxAge;
          if (ratio >= 1) continue;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);

          // Estilo según enfriamiento: empieza amarillo brillante y se enfría a rosa traslúcido
          const alpha = 1 - ratio;
          ctx.lineWidth = p1.width * (1 - ratio * 0.5);

          // Crear degradado para emular plástico fundido enfriándose
          let color = '#FF6FA5';
          if (ratio < 0.2) {
            color = `rgba(255, 211, 154, ${alpha})`; // Amarillo caliente
          } else if (ratio < 0.5) {
            color = `rgba(255, 159, 106, ${alpha})`; // Naranja caliente
          } else {
            color = `rgba(255, 111, 165, ${alpha})`; // Rosa firma cooling
          }

          ctx.strokeStyle = color;
          
          // Efecto de brillo de extrusión para los puntos muy calientes
          if (ratio < 0.3) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#FF9F6A';
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.stroke();
        }

        // Eliminar puntos totalmente fríos/viejos
        pointsRef.current = points.filter((p) => p.age < p.maxAge);
      }

      // Resetear shadowBlur para las partículas y el resto del canvas
      ctx.shadowBlur = 0;

      // 2. Dibujar y actualizar partículas (chispitas de filamento)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        // Mover partícula
        p.x += p.vx;
        p.y += p.vy;
        // Gravedad suave
        p.vy += 0.05;

        const ratio = p.life / p.maxLife;
        const alpha = 1 - ratio;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - ratio * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0; // Resetear opacidad global

      // Eliminar partículas sin vida
      particlesRef.current = particles.filter((p) => p.life < p.maxLife);

      // 3. Dibujar "Boquilla de Impresora" (si el mouse está activo)
      if (mouse.active) {
        // Círculo central (boquilla caliente de bronce)
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#FFD39A';
        ctx.fillStyle = '#FFD39A';
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Anillo de calor exterior
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 111, 165, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
        ctx.stroke();

        // Cruz de ejes de impresión 3D (ejes X e Y tenues)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 0.5;
        
        ctx.beginPath();
        // Eje Horizontal
        ctx.moveTo(mouse.x - 15, mouse.y);
        ctx.lineTo(mouse.x + 15, mouse.y);
        // Eje Vertical
        ctx.moveTo(mouse.x, mouse.y - 15);
        ctx.lineTo(mouse.x, mouse.y + 15);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (styleTag) styleTag.remove();
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
