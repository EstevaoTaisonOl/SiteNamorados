"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, Clock, Sparkles } from "lucide-react";

interface AestheticStatsProps {
  startDate: string | Date;
}

export default function AestheticStats({ startDate }: AestheticStatsProps) {
  const d1 = new Date(startDate);
  const now = new Date();

  const stats = useMemo(() => {
    const diffMs = Math.abs(now.getTime() - d1.getTime());
    const totalDays = Math.floor(diffMs / (1000 * 24 * 3600));
    const totalHours = Math.floor(diffMs / (1000 * 3600));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    
    // Fun "Couple Stats"
    const estimatedKisses = totalDays * 5; 
    const estimatedLaughs = totalDays * 12;
    const heartbeatsMap = totalMinutes * 70; // Avg heart rate

    return [
      { 
        id: "days",
        label: "Dias de cumplicidade",
        value: totalDays.toLocaleString('pt-BR'),
        sub: "e contando cada um.",
        icon: Heart,
        accent: "text-sunset"
      },
      { 
        id: "hours",
        label: "Horas de conversas",
        value: totalHours.toLocaleString('pt-BR'),
        sub: "momentos que não voltam.",
        icon: Clock,
        accent: "text-white"
      },
      { 
        id: "memories",
        label: "Risadas compartilhadas",
        value: `~${estimatedLaughs.toLocaleString('pt-BR')}`,
        sub: "estimativa de pura alegria.",
        icon: Sparkles,
        accent: "text-sunset"
      }
    ];
  }, [startDate]);

  return (
    <section className="min-h-screen py-32 px-6 flex flex-col items-center justify-center bg-charcoal overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sunset/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="text-center mb-24 space-y-4 relative z-10">
        <span className="text-[10px] uppercase tracking-[0.6em] text-sunset font-black italic">Wrapped: Nossa História</span>
        <h2 className="text-4xl md:text-7xl font-serif text-white lowercase italic tracking-tighter leading-none">
          O amor em números.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="group relative"
          >
            <div className="bg-white/5 backdrop-blur-3xl border-[1px] border-white/10 p-10 md:p-12 rounded-[40px] hover:border-sunset/30 transition-all duration-500 flex flex-col items-center text-center gap-6">
               <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                  <stat.icon className={`w-8 h-8 ${stat.accent}`} strokeWidth={1.5} />
               </div>
               
               <div className="space-y-2">
                 <h4 className="text-5xl md:text-6xl font-serif italic text-white tracking-tighter transition-all group-hover:text-sunset">
                    {stat.value}
                 </h4>
                 <div className="h-[1px] w-8 bg-sunset/40 mx-auto" />
               </div>

               <div className="space-y-1">
                 <p className="text-[10px] uppercase tracking-[0.4em] font-black text-white/60">{stat.label}</p>
                 <p className="text-[9px] uppercase tracking-widest opacity-30 italic">{stat.sub}</p>
               </div>
            </div>
            
            {/* Number background decoration */}
            <span className="absolute -top-12 -right-4 text-[120px] font-serif italic opacity-[0.02] pointer-events-none select-none">
              0{i+1}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.2 }}
        className="mt-24 text-[10px] uppercase tracking-[0.8em] font-black text-white"
      >
        Eterno • Infinito • Nosso
      </motion.div>
    </section>
  );
}
