"use client";

import { motion, Variants, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth mouse movement
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Parallax offsets for different layers
  const driftX1 = useTransform(smoothX, (x) => x * -0.5);
  const driftY1 = useTransform(smoothY, (y) => y * -0.5);
  const driftX2 = useTransform(smoothX, (x) => x * 1.2);
  const driftY2 = useTransform(smoothY, (y) => y * 1.2);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 50;
      const y = (clientY / innerHeight - 0.5) * 50;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      }
    },
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
      {/* Background Reactive Blobs */}
      <motion.div 
        style={{ x: smoothX, y: smoothY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sunset/10 blur-[140px] rounded-full -z-10"
      />
      
      <motion.div 
        style={{ x: driftX2, y: driftY2 }}
        className="absolute top-[10%] right-[15%] w-64 h-64 bg-cream shadow-2xl rounded-full blur-[80px] -z-10 opacity-30"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl w-full text-center z-10"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 mb-8">
          <div className="h-[1px] w-8 bg-charcoal/20" />
          <span className="text-xs uppercase tracking-[0.2em] font-medium text-charcoal/60 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-sunset animate-pulse" />
            onde memórias se tornam presentes
          </span>
          <div className="h-[1px] w-8 bg-charcoal/20" />
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-6xl md:text-8xl lg:text-9xl font-serif text-charcoal leading-[0.9] mb-12"
        >
          Transforme <br />
          <span className="relative inline-block group">
            afeto
            <motion.div 
              style={{ x: smoothX, y: smoothY }}
              className="absolute inset-0 bg-sunset/5 blur-3xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
            />
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1, duration: 0.8, ease: "easeInOut" }}
              className="absolute -bottom-2 left-0 h-[4px] bg-sunset/30 rounded-full"
            />
          </span> em <br />
          experiência.
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="max-w-xl mx-auto text-lg md:text-xl text-charcoal/60 font-light mb-12 lowercase"
        >
          Crie um player de memórias personalizado com fotos, trilha sonora e mensagens. 
          O presente digital mais inesquecível que você já deu.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            href="/create"
            className="group relative px-10 py-5 bg-charcoal text-cream overflow-hidden transition-all duration-500 hover:scale-[1.02]"
          >
            <motion.div 
              className="absolute inset-0 bg-sunset translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out -z-10"
            />
            <span className="flex items-center gap-3 text-lg font-medium">
              Criar meu presente
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          
          <Link 
            href="#demo"
            className="px-10 py-5 border-[1px] border-charcoal/10 hover:border-charcoal/30 transition-colors text-lg font-medium text-charcoal/80"
          >
            Ver um exemplo
          </Link>
        </motion.div>
      </motion.div>

      {/* Floating Elements (Visual Polish) */}
      <motion.div 
        style={{ x: driftX1, y: driftY1 }}
        animate={{ rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="hidden lg:block absolute top-[25%] left-[10%] w-32 h-44 border-[0.5px] border-charcoal/10 bg-white/40 backdrop-blur-sm -rotate-6 shadow-xl overflow-hidden p-2"
      >
        <img src="https://images.unsplash.com/photo-1518199266791-739d6ff24ed7?q=80&w=200" alt="Fragment" className="w-full h-32 object-cover grayscale opacity-50" />
      </motion.div>

      <motion.div 
        style={{ x: driftX2, y: driftY2 }}
        animate={{ rotate: [0, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="hidden lg:block absolute bottom-[20%] right-[12%] w-40 h-52 border-[0.5px] border-charcoal/10 bg-white/40 backdrop-blur-md rotate-12 shadow-2xl overflow-hidden p-3"
      >
        <img src="https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=200" alt="Fragment" className="w-full h-36 object-cover grayscale opacity-40" />
      </motion.div>
    </section>
  );
}
