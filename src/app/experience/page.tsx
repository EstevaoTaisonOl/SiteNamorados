"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useGift } from "@/context/GiftContext";
import { Play, Volume2, ArrowDown, Heart, ShieldCheck, Lock, Sparkles, CreditCard, ExternalLink, Music } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Experience() {
  const { giftData, updateGiftData } = useGift();
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Safe Hydration for Dynamic Values
  const [sessionID, setSessionID] = useState("");
  useEffect(() => { setSessionID(Math.floor(Date.now()/1000).toString()); }, []);

  // Cover Transforms
  const coverOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const coverScale = useTransform(scrollYProgress, [0, 0.05], [1, 0.98]);
  const coverPointerEvents = useTransform(scrollYProgress, (v: number) => (!isPlaying || v < 0.05) ? "auto" : "none");

  // The Force-Play Function (Triggered by real user click)
  const startExperience = () => {
    setIsPlaying(true);
    if (audioRef.current) {
        audioRef.current.play().catch(err => {
            console.error("Autoplay failed even with click", err);
            // This happens on some iOS versions, we handle it via the overlay indicator
        });
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
        if (isPlaying) {
            if (audioRef.current.paused) audioRef.current.play();
            else audioRef.current.pause();
            setIsMuted(audioRef.current.paused);
        }
    }
  };

  const handlePurchase = () => {
    alert("Iniciando checkout seguro... (Simulação)");
    setTimeout(() => { updateGiftData({ isPaid: true }); }, 1500);
  };

  if (!giftData.stories.length && !giftData.journey.length) {
    return (
      <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center p-6 text-center text-cream">
        <Heart className="w-12 h-12 text-sunset opacity-20 mb-8 animate-pulse" />
        <h2 className="font-serif text-3xl mb-4 lowercase italic opacity-80 italic lowercase tracking-tight">"A história ainda não começou."</h2>
        <Link href="/create" className="text-xs uppercase tracking-[0.4em] text-sunset font-bold border-b-[1px] border-sunset/30 pb-2 hover:border-sunset">voltar ao editor</Link>
      </div>
    );
  }

  return (
    <main 
      ref={containerRef} 
      className={cn(
        "bg-charcoal text-cream selection:bg-sunset selection:text-white relative",
        isPlaying ? "overflow-y-auto min-h-[500vh]" : "h-screen overflow-hidden"
      )}
    >
      
      {/* 0. Dedicated Audio Motor (Always in DOM) */}
      <audio 
        ref={audioRef}
        src={giftData.musicPreviewUrl} 
        loop 
        preload="auto"
        className="hidden"
      />

      {/* 1. Intro Cover (Locked until Play) */}
      <motion.section 
        style={{ opacity: coverOpacity, scale: coverScale, pointerEvents: coverPointerEvents as any }}
        className={cn("h-screen flex flex-col items-center justify-center p-6 bg-charcoal", isPlaying ? "sticky top-0 z-[60]" : "fixed inset-0 z-[100]")}
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="flex flex-col items-center justify-center text-center max-w-4xl relative">
          {!isPlaying && (
             <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }} className="w-24 h-24 border-[1.5px] border-cream/20 rounded-full mb-12 relative group">
              <div className="absolute inset-0 bg-sunset blur-[40px] opacity-20" />
              <button 
                onClick={startExperience} 
                className="absolute inset-0 flex items-center justify-center text-cream hover:text-sunset transition-colors z-20"
              >
                <Play className="w-8 h-8 fill-current translate-x-1" />
              </button>
            </motion.div>
          )}
          <span className="text-[10px] uppercase tracking-[0.5em] font-medium opacity-40 mb-8 block font-mono">vol. {sessionID || "---"}</span>
          <h1 className="text-4xl md:text-7xl font-serif mb-4 lowercase tracking-tight leading-[0.9]">
            {giftData.introMessage || <>uma pequena jornada <br /> <span className="italic opacity-60">dedicada a você</span>.</>}
          </h1>
          <p className="text-xs uppercase tracking-widest opacity-40 mt-12 italic tracking-tighter">para {giftData.recipientName} • de {giftData.senderName}</p>
          {isPlaying && <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity }} className="mt-20 opacity-20"><ArrowDown className="w-5 h-5" /></motion.div>}
        </motion.div>
      </motion.section>

      {/* 2. Audio Control Overlay (With Sync Button) */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: isPlaying ? 1 : 0 }} className="fixed top-8 right-8 z-[100] flex items-center gap-4 bg-charcoal/40 backdrop-blur-md px-4 py-3 border-[1px] border-cream/10 rounded-lg">
        <button onClick={toggleMute} className="flex items-center gap-4 group">
            <div className="flex flex-col items-end mr-2">
                <span className="text-[7px] uppercase tracking-[0.2em] opacity-40">ouvindo agora</span>
                <span className={cn("text-[9px] font-serif lowercase italic truncate max-w-[120px] transition-colors", isMuted ? "text-cream/20" : "text-sunset")}>
                    {giftData.theme || "trilha eterna"}
                </span>
            </div>
            <div className="flex gap-1 h-6 items-center">
                {[1, 2, 3, 4].map(i => (
                    <motion.div 
                        key={i} 
                        animate={{ height: (isPlaying && !isMuted) ? [8, 20, 12, 18, 8] : 2 }} 
                        transition={{ duration: 0.8 + (i * 0.1), repeat: Infinity, ease: "easeInOut" }} 
                        className={cn("w-[2.5px] rounded-full", (isPlaying && !isMuted) ? "bg-sunset/60" : "bg-cream/10")} 
                    />
                ))}
            </div>
            <div className="ml-2 w-8 h-8 rounded-full border-[1px] border-cream/5 flex items-center justify-center group-hover:border-sunset/40 transition-colors">
                {isMuted ? <Music className="w-3 h-3 opacity-20" /> : <Music className="w-3 h-3 text-sunset animate-bounce" />}
            </div>
        </button>
      </motion.div>

      {/* 3. Monetization Overlay (if not paid) */}
      {!giftData.isPaid && isPlaying && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 inset-x-0 z-[120] p-4 md:p-6 pointer-events-none">
          <div className="max-w-md mx-auto bg-cream text-charcoal p-6 shadow-2xl flex flex-col gap-6 pointer-events-auto border-t-[4px] border-sunset rounded-[12px]">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-sunset/10 text-sunset"><Sparkles className="w-6 h-6" /></div>
                <div>
                   <h5 className="font-serif text-lg leading-none italic">esta é uma visualização.</h5>
                   <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Eternize este presente por apenas R$ 19,90</p>
                </div>
             </div>
             <button onClick={handlePurchase} className="w-full py-4 bg-charcoal text-white text-[10px] uppercase tracking-[0.4em] font-black hover:bg-sunset transition-all flex items-center justify-center gap-4 shadow-xl active:scale-[0.98]">
                Desbloquear Link Eterno <CreditCard className="w-4 h-4" />
             </button>
             <p className="text-[8px] opacity-40 text-center uppercase tracking-widest">Acesso vitalício • Alta resolução • Sem anúncios</p>
          </div>
        </motion.div>
      )}

      {/* 4. The Timeline Journey */}
      <div className={cn("relative transition-opacity duration-1000", isPlaying ? "opacity-100" : "opacity-0 pointer-events-none")}>
        <motion.div style={{ scaleY: scrollYProgress }} className="fixed left-1/2 top-0 bottom-0 w-[1px] bg-sunset/30 origin-top -translate-x-1/2 hidden md:block" />
        
        {giftData.stories.length > 0 && <StorySegment recipientName={giftData.recipientName} memories={giftData.stories} />}

        {(giftData.journey || []).map((m, idx) => {
          if (idx > 0 && idx % 2 === 0) {
            return <CollageSection key={m.id} memory={m} index={idx} total={giftData.journey.length} prevMemory={giftData.journey[idx-1]} isPaid={giftData.isPaid} />;
          }
          return <MemorySection key={m.id} memory={m} index={idx} total={giftData.journey.length} isPaid={giftData.isPaid} />;
        })}

        {/* Closing Note */}
        <section className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative z-50 bg-charcoal">
          {giftData.isPaid ? (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="space-y-8">
              <ShieldCheck className="w-12 h-12 text-sunset mx-auto" />
              <h2 className="text-4xl md:text-6xl font-serif lowercase italic">com todo o meu amor.</h2>
              <div className="flex flex-col items-center gap-4">
                <p className="text-xs uppercase tracking-widest opacity-40">Seu presente está pronto para brilhar.</p>
                <button onClick={() => alert("Link copiado!")} className="px-12 py-5 bg-cream text-charcoal text-[10px] uppercase tracking-[0.4em] font-black hover:bg-sunset hover:text-white transition-all">Copiar Link Eterno</button>
              </div>
            </motion.div>
          ) : (
             <div className="space-y-4 max-w-sm">
                <Lock className="w-12 h-12 text-sunset mx-auto opacity-20" />
                <h2 className="text-3xl font-serif italic italic text-sunset">"Quase lá..."</h2>
                <p className="text-xs opacity-40 leading-relaxed uppercase tracking-widest">para liberar o compartilhamento, você precisa finalizar a compra.</p>
                <button onClick={handlePurchase} className="mt-8 px-12 py-5 border-[1px] border-cream/20 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-cream hover:text-charcoal transition-all">Eternizar Agora</button>
             </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MemorySection({ memory, index, total, isPaid }: { memory: any, index: number, total: number, isPaid: boolean }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="min-h-screen md:h-[150vh] flex flex-col md:flex-row items-center justify-center relative px-6 md:px-20 py-32 md:py-0 overflow-hidden">
      <motion.div style={{ opacity, y }} className="relative w-full max-w-4xl aspect-square md:aspect-[16/9] shadow-2xl overflow-hidden border-[1px] border-cream/10 bg-charcoal/40 z-0 mb-12 md:mb-0">
        <img src={memory.imageUrl} alt="Memory" className="w-full h-full object-cover grayscale brightness-50 md:brightness-75" />
        {!isPaid && <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-[-15deg]"><span className="text-[60px] md:text-[120px] font-black uppercase text-white tracking-widest">PREVIEW</span></div>}
      </motion.div>
      <motion.div style={{ opacity, y: textY }} className={cn("z-20 w-full max-w-md relative md:absolute", index % 2 === 0 ? "md:left-32" : "md:right-32")}>
        <div className="bg-charcoal/60 backdrop-blur-3xl border-[0.5px] border-cream/10 p-8 md:p-12 shadow-2xl text-white">
          <p className="text-xl md:text-2xl font-serif lowercase leading-tight italic">"{memory.message}"</p>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-[1px] w-8 bg-sunset" />
            <span className="text-[10px] uppercase tracking-widest text-cream/40">momento 0{index+1}</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function CollageSection({ memory, index, total, prevMemory, isPaid }: { memory: any, index: number, total: number, prevMemory: any, isPaid: boolean }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="min-h-screen md:h-[180vh] flex flex-col items-center justify-center relative px-6 py-20 md:py-0 overflow-hidden">
      <div className="relative w-full max-w-6xl h-[500px] md:h-[600px]">
        <motion.div style={{ opacity, rotate: -5, x: useTransform(scrollYProgress, [0, 1], [-20, 20]), y: useTransform(scrollYProgress, [0, 1], [0, -20]) }} className="absolute top-0 left-0 w-40 md:w-80 aspect-[3/4] border-[4px] md:border-[8px] border-white shadow-2xl z-20 overflow-hidden">
          <img src={prevMemory.imageUrl} className="w-full h-full object-cover grayscale" />
          {!isPaid && <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-charcoal/80 py-1 text-center scale-[2] rotate-[-25deg]"><span className="text-[8px] text-white/40 uppercase font-black tracking-widest leading-none">PREVIEW</span></div>}
        </motion.div>
        <motion.div style={{ opacity, rotate: 8, x: useTransform(scrollYProgress, [0, 1], [20, -20]), y: useTransform(scrollYProgress, [0, 1], [10, -40]) }} className="absolute top-12 right-0 w-44 md:w-96 aspect-[4/3] border-[4px] md:border-[8px] border-white shadow-2xl z-10 overflow-hidden">
          <img src={memory.imageUrl} className="w-full h-full object-cover" />
          {!isPaid && <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-charcoal/80 py-1 text-center scale-[2] rotate-[25deg]"><span className="text-[8px] text-white/40 uppercase font-black tracking-widest leading-none">PREVIEW</span></div>}
        </motion.div>
        <motion.div style={{ opacity, y: useTransform(scrollYProgress, [0, 1], [60, -60]) }} className="absolute bottom-1/4 md:bottom-1/4 left-0 right-0 md:left-1/3 z-30 max-w-[280px] md:max-w-sm mx-auto md:mx-0 text-center">
          <p className="text-xl md:text-4xl font-serif lowercase italic leading-tight bg-charcoal/60 backdrop-blur-md p-6 border-[1px] border-cream/10">momentos que se fundem em um só.</p>
        </motion.div>
      </div>
    </section>
  );
}

function StorySegment({ recipientName, memories }: { recipientName: string, memories: any[] }) {
  const [activeStory, setActiveStory] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => { setActiveStory((s) => (s + 1) % memories.length); }, 4000);
    return () => clearInterval(timer);
  }, [memories.length]);
  return (
    <section className="h-screen flex items-center justify-center relative bg-black/40 px-4 overflow-hidden py-12 md:py-0">
      <div className="absolute inset-0 z-0">{memories[activeStory] && <img src={memories[activeStory].imageUrl} className="w-full h-full object-cover opacity-30 blur-xl scale-110" />}</div>
      <div className="relative w-full md:w-[400px] max-w-[90vw] md:max-w-none aspect-[9/16] max-h-[85vh] bg-charcoal shadow-[0_0_100px_rgba(0,0,0,0.8)] border-[1px] border-cream/10 z-10 flex flex-col rounded-[20px] md:rounded-0 overflow-hidden">
        <div className="p-3 md:p-4 flex gap-1 z-20">
          {memories.map((_, i) => (
            <div key={i} className="flex-1 h-[1.5px] bg-cream/20 overflow-hidden rounded-full">
              <motion.div initial={{ width: 0 }} animate={{ width: i === activeStory ? "100%" : i < activeStory ? "100%" : "0%" }} transition={{ duration: i === activeStory ? 4 : 0, ease: "linear" }} className="h-full bg-cream" />
            </div>
          ))}
        </div>
        <div className="px-4 flex items-center gap-3 z-20 mb-3 md:mb-4">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-sunset flex items-center justify-center text-[10px] font-bold">{recipientName[0]}</div>
          <span className="text-[10px] md:text-xs font-medium text-cream/80">{recipientName} • agora</span>
        </div>
        <div className="flex-1 relative overflow-hidden bg-charcoal">
          <AnimatePresence mode="wait">
            {memories[activeStory] && (
              <motion.div key={activeStory} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                <motion.img src={memories[activeStory].imageUrl} initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 0.8 }} className="absolute inset-0 w-full h-full object-cover" />
                {memories[activeStory].message && (
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="absolute bottom-6 left-4 max-w-[85%] bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl z-30">
                    <p className="text-sm font-medium text-white italic">"{memories[activeStory].message}"</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-4 z-20">
          <div className="flex-1 h-10 border-[1px] border-cream/20 rounded-full flex items-center px-4 text-[10px] text-cream/40 italic">escreva um comentário...</div>
          <Heart className="w-5 h-5 text-sunset fill-sunset animate-pulse" />
        </div>
      </div>
    </section>
  );
}
