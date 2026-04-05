"use client";

import { motion } from "framer-motion";
import { Camera, Music, Send } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Upload",
    description: "escolha as fotos que melhor contam sua história.",
    align: "start",
  },
  {
    icon: Music,
    title: "Atmosfera",
    description: "selecione uma trilha sonora que traga a emoção certa.",
    align: "end",
  },
  {
    icon: Send,
    title: "Compartilhe",
    description: "gere um link único e surpreenda quem você ama.",
    align: "center",
  },
];

export default function Steps() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="mb-20"
      >
        <span className="text-sm font-medium tracking-[0.2em] text-sunset uppercase mb-4 block">
          como funciona
        </span>
        <h2 className="text-4xl md:text-5xl font-serif text-charcoal max-w-2xl leading-tight">
          Crie em minutos. <br />
          Transforme para sempre.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
        {/* Connection Line (Visual Fragment) */}
        <div className="hidden md:block absolute top-[40%] left-0 w-full h-[1px] bg-charcoal/5 -z-10" />

        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1, 
              delay: idx * 0.2,
              type: "spring",
              stiffness: 70,
              damping: 20
            }}
            viewport={{ once: true }}
            className={`flex flex-col gap-8 ${
              step.align === "end" ? "md:translate-y-12" : 
              step.align === "start" ? "md:-translate-y-8" : ""
            }`}
          >
            <div className="relative w-16 h-16 flex items-center justify-center bg-cream border-[0.5px] shadow-sm border-charcoal/10 group overflow-hidden">
              <motion.div 
                className="absolute inset-x-0 bottom-0 h-0 bg-sunset/10 transition-all duration-700 group-hover:h-full"
              />
              <step.icon className="w-6 h-6 text-charcoal/80 group-hover:text-sunset transition-colors" />
            </div>

            <div>
              <span className="text-4xl font-serif text-charcoal/10 block mb-2 leading-none tracking-tighter">
                0{idx + 1}
              </span>
              <h3 className="text-2xl font-serif text-charcoal mb-4 lowercase italic">{step.title}</h3>
              <p className="text-charcoal/60 leading-relaxed max-w-[240px] lowercase font-light">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
