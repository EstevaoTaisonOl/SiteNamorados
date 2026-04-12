"use client";

import { motion } from "framer-motion";
import { Play, Music, Heart, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function InteractiveDemo() {
  return (
    <section id="demo" className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="mb-20 text-center">
        <span className="text-xs uppercase tracking-[0.3em] font-medium text-sunset mb-2 block">
          demonstração
        </span>
        <h2 className="text-4xl md:text-5xl font-serif text-charcoal">
          Veja o que você pode criar.
        </h2>
      </div>

      <div className="relative max-w-lg mx-auto md:max-w-4xl grid md:grid-cols-12 gap-12 items-center">
        {/* Floating Controls Overlay (Fragmented Layout) */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="hidden md:flex md:col-span-4 flex-col gap-8 items-end text-right z-10"
        >
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="p-6 bg-white shadow-xl border-[0.5px] border-charcoal/5 -translate-y-8 max-w-[200px]"
          >
            <Heart className="w-5 h-5 text-sunset mb-4 animate-pulse" />
            <span className="text-xs font-serif italic text-charcoal/40 block mb-2 leading-none">
              vibe do presente
            </span>
            <p className="text-sm font-light leading-relaxed text-charcoal/80">
              uma mistura de nostalgia e amor.
            </p>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity }}
            className="p-6 bg-cream shadow-lg border-[0.5px] border-charcoal/5 translate-x-12 max-w-[200px]"
          >
            <Music className="w-5 h-5 text-charcoal mb-4" />
            <span className="text-xs font-serif italic text-charcoal/40 block mb-2 leading-none">
              trilha sonora
            </span>
            <p className="text-sm font-light leading-relaxed text-charcoal/80">
              o som daquela viagem.
            </p>
          </motion.div>
        </motion.div>


        <Link
          href="/experience?giftId=ebf43ef0-b977-4f95-b048-4887fa8472a6&"
          className="md:col-span-8 relative aspect-[4/5] bg-charcoal group overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] block"
        >
          <motion.div 
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="w-full h-full"
          >
          {/* Background Image (Mock) */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518199266791-739d6ff24ed7?auto=format&fit=crop&q=80')] bg-cover bg-center grayscale group-hover:scale-110 transition-transform duration-[3s] ease-linear" />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />
          
          {/* Internal Content */}
          <div className="absolute inset-0 p-8 flex flex-col justify-between text-cream">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-sans uppercase tracking-[0.4em] opacity-40">
                eternal volume.01
              </span>
              <div className="w-8 h-[1px] bg-cream/20 mt-1" />
            </div>

            <div className="text-center">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-cream/10 backdrop-blur-md rounded-full border-[1px] border-cream/20 group-hover:bg-sunset/80 transition-colors"
              >
                <Play className="w-6 h-6 fill-cream" />
              </motion.div>
              <h3 className="text-3xl md:text-4xl font-serif mb-2 lowercase">Nossa Galeria de Lentes</h3>
              <p className="text-cream/50 text-xs uppercase tracking-[0.2em] font-sans">
                Para: Helena • De: Gabriel
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="w-full h-[1px] bg-cream/10 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "35%" }}
                  transition={{ duration: 2, delay: 1 }}
                  className="absolute left-0 h-full bg-sunset shadow-[0_0_10px_#FF6B4A]"
                />
              </div>
              <ChevronDown className="w-5 h-5 opacity-40 animate-bounce" />
            </div>
          </div>
        </motion.div>
        </Link>
      </div>

      <div className="mt-16 text-center">
        <p className="text-charcoal/40 font-light italic max-w-sm mx-auto lowercase mb-8">
          cada presente é uma jornada visual imersiva e interativa. sua história merece um palco digital.
        </p>
        <Link 
          href="/experience?giftId=ebf43ef0-b977-4f95-b048-4887fa8472a6&"
          className="text-sunset text-sm font-medium tracking-[0.2em] uppercase flex items-center justify-center gap-2 mx-auto hover:gap-4 transition-all"
        >
          Ver exemplo completo <Play className="w-3 h-3 fill-sunset" />
        </Link>
      </div>
    </section>
  );
}
