"use client";

import { useState, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Gift, Coffee, Utensils, Camera, MapPin, Stars } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIZES = [
  { id: 1, label: "Massagem Relaxante", icon: Heart, color: "bg-sunset" },
  { id: 2, label: "Jantar Especial", icon: Utensils, color: "bg-charcoal" },
  { id: 3, label: "Café na Cama", icon: Coffee, color: "bg-sunset" },
  { id: 4, label: "Ensaio Fotográfico", icon: Camera, color: "bg-charcoal" },
  { id: 5, label: "Piquenique no Parque", icon: MapPin, color: "bg-sunset" },
  { id: 6, label: "Noite de Estrelas", icon: Stars, color: "bg-charcoal" },
];

export default function SurpriseRoulette() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<typeof PRIZES[0] | null>(null);
  const controls = useAnimation();
  const wheelRef = useRef<HTMLDivElement>(null);

  const spin = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setWinner(null);

    // Random rotation: 5-8 full spins + random offset
    const randomSpins = 5 + Math.floor(Math.random() * 3);
    const randomOffset = Math.floor(Math.random() * 360);
    const totalRotation = randomSpins * 360 + randomOffset;

    await controls.start({
      rotate: totalRotation,
      transition: { duration: 4, ease: [0.25, 0.1, 0.25, 1] }
    });

    // Calculate winner based on final angle
    const finalAngle = totalRotation % 360;
    const sectionSize = 360 / PRIZES.length;
    // The arrow is at the top (270deg or 90deg depending on orientation, let's assume 0 is right)
    // For our layout, let's say the needle is at the top (index adjusted)
    const normalizedAngle = (360 - finalAngle + sectionSize / 2) % 360;
    const winningIndex = Math.floor(normalizedAngle / sectionSize) % PRIZES.length;
    
    setWinner(PRIZES[winningIndex]);
    setIsSpinning(false);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-12 py-20 px-6">
      <div className="text-center space-y-4 max-w-md">
        <span className="text-[10px] uppercase tracking-[0.5em] text-sunset font-black italic">Sorte ou Destino?</span>
        <h2 className="text-4xl md:text-5xl font-serif text-white lowercase italic leading-none">Roleta de Mimos.</h2>
        <p className="text-[10px] uppercase tracking-widest opacity-40 leading-relaxed">Gire para descobrir qual surpresa espera por você hoje.</p>
      </div>

      <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px]">
        {/* The Needle / Indicator */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-50">
          <motion.div 
            animate={isSpinning ? { y: [0, -5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.2 }}
            className="w-8 h-12 bg-sunset rounded-t-full shadow-2xl flex items-center justify-center p-1 border-[2px] border-white/20"
          >
             <div className="w-full h-full bg-white/20 rounded-full" />
          </motion.div>
        </div>

        {/* The Wheel */}
        <motion.div 
          animate={controls}
          className="w-full h-full rounded-full border-[8px] border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative bg-charcoal"
        >
          {PRIZES.map((prize, i) => {
            const angle = (360 / PRIZES.length) * i;
            return (
              <div 
                key={prize.id}
                className={cn(
                  "absolute inset-0 origin-center flex flex-col items-center pt-8 md:pt-12 border-l-[1px] border-white/5",
                  prize.color
                )}
                style={{ 
                  transform: `rotate(${angle}deg)`,
                  clipPath: `polygon(50% 50%, 0 0, 100% 0)`
                }}
              >
                <prize.icon className={cn("w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-4 -rotate-45 md:translate-y-4", 
                  prize.color === 'bg-sunset' ? 'text-charcoal' : 'text-sunset'
                )} />
              </div>
            );
          })}
          
          {/* Inner Circle Decoration */}
          <div className="absolute inset-[35%] rounded-full bg-charcoal border-[4px] border-white/10 shadow-inner flex items-center justify-center z-20">
             <div className="p-4 bg-white/5 rounded-full backdrop-blur-sm">
                <Heart className="w-6 h-6 text-sunset fill-current" />
             </div>
          </div>
        </motion.div>

        {/* Center Button */}
        <button 
          onClick={spin}
          disabled={isSpinning}
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-20 h-20 md:w-28 md:h-28 rounded-full bg-cream text-charcoal font-black text-[10px] md:text-xs uppercase tracking-widest shadow-2xl border-[4px] border-charcoal hover:scale-105 active:scale-95 transition-all",
            isSpinning && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSpinning ? "Girando..." : "Girar"}
        </button>
      </div>

      {/* Result Backdrop/Modal */}
      <AnimatePresence>
        {winner && !isSpinning && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-cream p-8 rounded-3xl shadow-2xl text-charcoal flex flex-col items-center gap-6 border-t-[6px] border-sunset mt-4"
          >
            <div className="w-16 h-16 bg-sunset/10 rounded-full flex items-center justify-center text-sunset">
              <winner.icon className="w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-black">Você ganhou:</span>
              <h3 className="text-3xl font-serif italic lowercase">{winner.label}</h3>
            </div>
            <p className="text-[10px] uppercase tracking-widest leading-relaxed opacity-60 text-center">Tire um print e envie para seu amor para resgatar!</p>
            <button 
              onClick={() => setWinner(null)}
              className="mt-4 px-8 py-3 bg-charcoal text-cream text-[10px] uppercase tracking-[0.4em] font-black rounded-full hover:bg-sunset transition-colors"
            >
              Uau, amei!
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
