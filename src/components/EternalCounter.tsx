"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EternalCounterProps {
  startDate: string | Date;
}

export default function EternalCounter({ startDate }: EternalCounterProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const d1 = new Date(startDate);
  
  const diff = useMemo(() => {
    let delta = Math.abs(now.getTime() - d1.getTime()) / 1000;

    const years = Math.floor(delta / (365 * 24 * 3600));
    delta -= years * (365 * 24 * 3600);

    const days = Math.floor(delta / (24 * 3600));
    delta -= days * (24 * 3600);

    const hours = Math.floor(delta / 3600);
    delta -= hours * 3600;

    const minutes = Math.floor(delta / 60);
    delta -= minutes * 60;

    const seconds = Math.floor(delta);

    const totalHours = Math.floor(Math.abs(now.getTime() - d1.getTime()) / (1000 * 3600));

    return { years, days, hours, minutes, seconds, totalHours };
  }, [now, d1]);

  const units = [
    { label: "Anos", value: diff.years },
    { label: "Dias", value: diff.days },
    { label: "Horas", value: diff.hours },
    { label: "Mins", value: diff.minutes },
    { label: "Segs", value: diff.seconds },
  ];

  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-4xl mx-auto py-12">
      
      {/* Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 w-full px-4">
        {units.map((unit, i) => (
          <div key={unit.label} className="relative group">
            <div className="text-center space-y-2">
              <div className="relative h-20 md:h-24 flex items-center justify-center overflow-hidden bg-white/5 backdrop-blur-sm border-[1px] border-white/10 rounded-2xl shadow-xl">
                 <AnimatePresence mode="popLayout">
                    <motion.span 
                      key={unit.value}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ type: "spring", damping: 12, stiffness: 100 }}
                      className="text-4xl md:text-5xl font-serif text-white italic tracking-tighter"
                    >
                      {unit.value < 10 ? `0${unit.value}` : unit.value}
                    </motion.span>
                 </AnimatePresence>
              </div>
              <span className="text-[9px] md:text-[11px] uppercase tracking-[0.3em] opacity-40 font-black text-white">{unit.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Phrase */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="h-[1px] w-12 bg-sunset mx-auto opacity-30 mb-6" />
        <p className="text-xl md:text-3xl font-serif italic text-white/80 lowercase leading-tight">
          "{diff.totalHours.toLocaleString('pt-BR')} horas de sorrisos compartilhados."
        </p>
        <p className="text-[10px] uppercase tracking-[0.4em] text-sunset font-black opacity-60">e cada segundo continua valendo a pena.</p>
      </motion.div>

    </div>
  );
}
