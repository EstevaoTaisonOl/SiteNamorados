"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 1.2, 
          type: "spring",
          stiffness: 70,
          damping: 20
        }}
        viewport={{ once: true }}
        className="w-full bg-cream py-24 px-8 border-[1px] border-charcoal/10 relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-20">
          <Star className="w-6 h-6 text-sunset" />
          <div className="h-[1px] w-full mx-8 bg-charcoal/10 mt-3" />
          <Star className="w-6 h-6 text-sunset" />
        </div>

        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-7xl font-serif text-charcoal leading-[0.8] tracking-tighter mb-12">
            Amanhã <br />
            é uma <span className="italic">outra</span> história.
          </h2>
          <p className="text-lg md:text-xl text-charcoal/60 font-light mb-16 lowercase">
            Não guarde seus afetos. Dê a eles o brilho e a trilha sonora que merecem.
          </p>
          
          <div className="relative inline-flex flex-col items-center">
            <Link 
              href="/create"
              className="inline-flex items-center gap-6 px-12 py-8 bg-charcoal text-cream group overflow-hidden transition-all duration-700 hover:scale-[1.05]"
            >
              <span className="text-xl font-medium tracking-wide">
                Criar meu agora
              </span>
              <div className="w-12 h-12 flex items-center justify-center bg-cream/10 rounded-full group-hover:scale-125 transition-transform">
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Float Highlight Trigger */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="absolute -top-6 -right-12 bg-sunset text-cream text-[11px] uppercase tracking-[0.2em] font-bold px-4 py-2 rotate-6 shadow-2xl z-20 pointer-events-none"
            >
              pronto em menos de 5 min
            </motion.div>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-x-12 gap-y-4 opacity-40 uppercase text-[9px] tracking-[0.3em] font-bold text-charcoal">
            <span className="flex items-center gap-2 italic">● 100% digital</span>
            <span className="flex items-center gap-2 italic">● entrega instantânea</span>
            <span className="flex items-center gap-2 italic">● crie pelo celular</span>
          </div>
        </div>

        <div className="mt-32 pt-12 border-t-[0.5px] border-charcoal/10 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-medium text-charcoal/40">
          <span>© 2026 Eternal Memories</span>
          <div className="flex gap-12">
            <Link href="#" className="hover:text-sunset transition-colors">Termos</Link>
            <Link href="#" className="hover:text-sunset transition-colors">Dúvidas</Link>
            <Link href="#" className="hover:text-sunset transition-colors">Privacidade</Link>
          </div>
        </div>

        <div className="absolute top-[10%] left-[5%] text-[200px] font-serif text-charcoal/[0.02] -z-10 leading-none">
          Afeto.
        </div>
      </motion.div>
    </section>
  );
}
