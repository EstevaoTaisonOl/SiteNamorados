"use client";

import React, { useEffect, useRef, useMemo } from "react";
import starsData from "@/data/stars.json";

interface StarMapProps {
  date: string | Date;
  lat: number;
  lng: number;
  size?: number;
}

export default function StarMap({ date, lat, lng, size = 400 }: StarMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const d = typeof date === "string" ? new Date(date) : date;

  // Astronomical Constants & Calculations
  const calculations = useMemo(() => {
    const getJulianDate = (date: Date) => {
      return (date.getTime() / 86400000) + 2440587.5;
    };

    const getLST = (date: Date, lng: number) => {
      const jd = getJulianDate(date);
      const d = jd - 2451545.0;
      let gst = 18.697374558 + 24.06570982441908 * d;
      gst = gst % 24;
      if (gst < 0) gst += 24;
      let lst = gst + lng / 15;
      lst = lst % 24;
      if (lst < 0) lst += 24;
      return lst;
    };

    const raDecToAltAz = (ra: number, dec: number, lat: number, lst: number) => {
      const ha = (lst - ra) * 15 * (Math.PI / 180);
      const latRad = lat * (Math.PI / 180);
      const decRad = dec * (Math.PI / 180);

      const sinAlt = Math.sin(decRad) * Math.sin(latRad) + 
                     Math.cos(decRad) * Math.cos(latRad) * Math.cos(ha);
      const alt = Math.asin(sinAlt);

      const cosAz = (Math.sin(decRad) - Math.sin(alt) * Math.sin(latRad)) / 
                    (Math.cos(alt) * Math.cos(latRad));
      let az = Math.acos(Math.max(-1, Math.min(1, cosAz)));

      if (Math.sin(ha) > 0) az = 2 * Math.PI - az;

      return { alt: alt * (180 / Math.PI), az: az * (180 / Math.PI) };
    };

    const lst = getLST(d, lng);
    return starsData.map(star => {
      const pos = raDecToAltAz(star.ra, star.dec, lat, lst);
      return { ...star, ...pos };
    }).filter(star => star.alt > 0); // Only stars above horizon
  }, [date, lat, lng]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear Canvas
    ctx.clearRect(0, 0, size, size);
    const center = size / 2;
    const radius = size * 0.45;

    // Background Gradient (Deep Space)
    const grad = ctx.createRadialGradient(center, center, 0, center, center, radius);
    grad.addColorStop(0, "#1a1a2e");
    grad.addColorStop(1, "#0a0a14");
    
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 107, 74, 0.2)"; // Sunset accent
    ctx.lineWidth = 1;
    ctx.stroke();

    // Subtle Grid (Azimuthal)
    ctx.beginPath();
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    for (let r = 0.2; r < 1; r += 0.2) {
      ctx.moveTo(center + radius * r, center);
      ctx.arc(center, center, radius * r, 0, Math.PI * 2);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Stars
    calculations.forEach(star => {
      // Stereographic projection for a circular sky
      // r = R * tan((90 - alt) / 2)
      // but simpler linear projection for aesthetic: r = R * (90 - alt) / 90
      const r = radius * (90 - star.alt) / 90;
      const theta = (star.az - 90) * (Math.PI / 180);
      
      const x = center + r * Math.cos(theta);
      const y = center + r * Math.sin(theta);

      const magSize = Math.max(0.5, (4 - star.mag) * 0.8);
      
      // Star Glow
      const starGrad = ctx.createRadialGradient(x, y, 0, x, y, magSize * 2);
      starGrad.addColorStop(0, "rgba(255, 255, 255, 0.8)");
      starGrad.addColorStop(0.5, "rgba(255, 107, 74, 0.2)");
      starGrad.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(x, y, magSize * 2, 0, Math.PI * 2);
      ctx.fillStyle = starGrad;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(x, y, magSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();

      // Label (only very bright stars)
      if (star.mag < 1.0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.font = "italic 8px serif";
        ctx.fillText(star.name.toLowerCase(), x + 5, y + 5);
      }
    });

    // Compass Labels
    ctx.fillStyle = "rgba(255, 107, 74, 0.5)";
    ctx.font = "900 8px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("N", center, center - radius - 8);
    ctx.fillText("S", center, center + radius + 15);
    ctx.fillText("E", center + radius + 12, center + 3);
    ctx.fillText("W", center - radius - 12, center + 3);

  }, [calculations, size]);

  return (
    <div className="relative inline-block group">
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size} 
        className="rounded-full shadow-2xl transition-all duration-1000 group-hover:scale-[1.02]"
      />
      
      {/* Decorative Outer Ring */}
      <div className="absolute inset-[-10px] border border-sunset/10 rounded-full pointer-events-none" />
      <div className="absolute inset-[-20px] border border-sunset/5 rounded-full pointer-events-none animate-spin-slow" />
    </div>
  );
}
