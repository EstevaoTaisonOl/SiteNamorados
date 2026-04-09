"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useGift } from "@/context/GiftContext";
import { Play, Volume2, ArrowDown, Heart, ShieldCheck, Lock, Sparkles, CreditCard, ExternalLink, Music, Loader2, Copy, Share2, X, Check, MessageCircle, Send, Download } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { markGiftAsPaid } from "@/lib/gift-service";
import ShareModal from "@/components/ShareModal";
import StarMap from "@/components/StarMap";
import EternalCounter from "@/components/EternalCounter";

function ExperienceContent() {
  const router = useRouter();
  const { giftData, updateGiftData } = useGift();
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [payStatus, setPayStatus] = useState<"idle"|"uploading"|"done">("idle");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Safe Hydration for Dynamic Values
  const [sessionID, setSessionID] = useState("");
  useEffect(() => { setSessionID(Math.floor(Date.now()/1000).toString()); }, []);

  // Fetch Gift from Supabase if giftId is provided
  useEffect(() => {
    const urlStr = window.location.href;
    // Tenta achar o giftId na URL de forma robusta
    const match = urlStr.match(/giftId=([a-f0-9-]{36})/i);
    const giftId = match ? match[1] : searchParams.get("giftId");

    if (giftId) {
      setLoading(true);
      const fetchGift = async () => {
        console.log("Buscando presente no Supabase ID:", giftId);
        const { data, error } = await supabase
          .from('gifts')
          .select('*')
          .eq('id', giftId)
          .single();
        
        if (error) {
          console.error("Erro Supabase:", error);
        }

        if (data && !error) {
          console.log("Presente encontrado!", data.sender_name);
          updateGiftData({
            ...data,
            senderName: data.sender_name,
            recipientName: data.recipient_name,
            introMessage: data.intro_message,
            musicPreviewUrl: data.music_preview_url,
            musicName: data.music_name,
            isPaid: data.is_paid,
            stories: data.stories,
            journey: data.journey,
            eventDate: data.event_date,
            locationName: data.location_name,
            lat: data.lat,
            lng: data.lng
          });
        } else {
          console.warn("Nenhum dado encontrado para esse ID.");
        }
        setLoading(false);
      };
      fetchGift();
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  // Detect Payment Success from Redirect (Mais robusto)
  useEffect(() => {
    const urlStr = window.location.href;
    const isPaidInUrl = urlStr.includes("paid=true");
    
    // Tenta extrair apenas o UUID limpo do giftId
    let giftId = searchParams.get("giftId");
    if (!giftId || giftId.includes("?")) {
       const match = urlStr.match(/giftId=([a-f0-9-]{36})/i);
       giftId = match ? match[1] : null;
    }

    if (isPaidInUrl && giftId) {
      const finalizePurchase = async () => {
        setIsPlaying(true);
        setPayStatus("uploading");
        console.log("Detectado retorno de pagamento. Finalizando...");
        
        try {
          await markGiftAsPaid(giftId as string);
          // Recarregar os dados do banco para garantir status atualizado
          const { data } = await supabase.from('gifts').select('*').eq('id', giftId).single();
          if (data) {
            updateGiftData({
              ...data,
              senderName: data.sender_name,
              recipientName: data.recipient_name,
              introMessage: data.intro_message,
              musicPreviewUrl: data.music_preview_url,
              musicName: data.music_name,
              isPaid: true,
              stories: data.stories,
              journey: data.journey,
              eventDate: data.event_date,
              locationName: data.location_name,
              lat: data.lat,
              lng: data.lng
            });
          }
          setPayStatus("done");
          setShowSuccessModal(true);
        } catch (e) {
          console.error("Erro ao atualizar pagamento:", e);
        }
      };
      finalizePurchase();
    }
  }, [searchParams]);

  // Cover Transforms
  const coverOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const coverScale = useTransform(scrollYProgress, [0, 0.05], [1, 0.98]);
  const coverPointerEvents = useTransform(scrollYProgress, (v: number) => (!isPlaying || v < 0.05) ? "auto" : "none");

  const startExperience = () => {
    setIsPlaying(true);
    if (audioRef.current) {
        audioRef.current.play().catch(err => {
            console.error("Autoplay failed even with click", err);
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
    router.push("/checkout");
  };

  return (
    <main 
      ref={containerRef} 
      className={cn(
        "bg-charcoal text-cream selection:bg-sunset selection:text-white relative",
        isPlaying ? "overflow-y-auto min-h-[500vh]" : "h-screen overflow-hidden"
      )}
    >
      
      {/* 1. Loading State */}
      {loading ? (
        <div className="h-screen bg-charcoal flex flex-col items-center justify-center gap-4 text-cream">
            <Loader2 className="w-8 h-8 animate-spin text-sunset" />
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">Resgatando sua história...</p>
        </div>
      ) : (!giftData.stories.length && !giftData.journey.length) ? (
        /* 2. Suporte visual claro para erro/vazio (Garante que não fique preto) */
        <div className="h-screen bg-cream flex flex-col items-center justify-center p-8 text-center text-charcoal relative z-[200]">
          <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="w-20 h-20 bg-sunset/10 rounded-full flex items-center justify-center mx-auto">
               <Heart className="w-8 h-8 text-sunset opacity-40 animate-pulse" />
            </div>
            <div className="space-y-4">
               <h2 className="font-serif text-4xl italic leading-tight">este presente <br/> ainda está sendo preparado.</h2>
               <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 leading-relaxed max-w-[280px] mx-auto font-bold">
                  verifique se o link está correto ou se o pagamento já foi compensado.
               </p>
            </div>
            <div className="pt-8">
               <Link href="/create" className="px-8 py-4 bg-charcoal text-cream text-[9px] uppercase tracking-[0.3em] font-black hover:bg-sunset transition-all inline-block shadow-xl">voltar ao início</Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 3. Dedicated Audio Motor (Always in DOM) */}
          <audio 
            ref={audioRef}
            src={giftData.musicPreviewUrl} 
            loop 
            preload="auto"
            className="hidden"
          />

          {/* 4. Intro Cover Section (Full Page Slide) */}
          <section className="h-[150vh] relative z-[60]">
            <motion.div 
              style={{ 
                opacity: isPlaying ? coverOpacity : 1, 
                scale: isPlaying ? coverScale : 1, 
                pointerEvents: isPlaying ? (coverPointerEvents as any) : "auto" 
              }}
              className={cn("h-screen flex flex-col items-center justify-start pt-[12vh] p-6 bg-charcoal sticky top-0")}
            >
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="flex flex-col items-center text-center max-w-5xl relative">
                {!isPlaying && (
                    <motion.div animate={{ scale: [1, 1.05, 1], y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="pt-4 relative group mb-12">
                        <div className="absolute inset-0 bg-sunset blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity" />
                        <button 
                            onClick={startExperience} 
                            className="relative w-24 h-24 rounded-full border-[1px] border-cream/10 flex items-center justify-center text-cream hover:text-sunset hover:border-sunset/20 transition-all z-20 bg-cream/5"
                        >
                            <Play className="w-8 h-8 fill-current translate-x-1" />
                        </button>
                    </motion.div>
                )}
                
                <div className="space-y-4">
                    <span className="text-[10px] uppercase tracking-[0.6em] font-black opacity-20 block font-mono">volume {sessionID || "001"}</span>
                    <h1 className="text-5xl md:text-[120px] font-serif text-white lowercase tracking-tighter leading-[0.75] italic drop-shadow-2xl">
                        {giftData.introMessage || <>nossa história <br/> <span className="opacity-40">em quadros.</span></>}
                    </h1>
                    <div className="h-[1px] w-16 bg-sunset mx-auto opacity-30 mt-2" />
                    <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 mt-4 italic font-black text-white px-12">
                        para {giftData.recipientName} • de {giftData.senderName}
                    </p>
                </div>

                {isPlaying && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2, y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-8">
                        <ArrowDown className="w-5 h-5 text-white" />
                    </motion.div>
                )}
              </motion.div>
            </motion.div>
          </section>

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

          {!giftData.isPaid && isPlaying && (
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 inset-x-0 z-[120] p-4 md:p-6 pointer-events-none">
              <div className="max-w-md mx-auto bg-cream text-charcoal p-6 shadow-2xl flex flex-col gap-6 pointer-events-auto border-t-[4px] border-sunset rounded-[12px]">
                 {payStatus === "idle" ? (
                   <>
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
                   </>
                 ) : (
                   <div className="flex items-center gap-6 py-2">
                     <Loader2 className="w-6 h-6 text-sunset animate-spin" />
                     <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">
                        {payStatus === "uploading" ? "Salvando memórias no servidor..." : "Quase lá..."}
                     </p>
                   </div>
                 )}
                 <p className="text-[8px] opacity-40 text-center uppercase tracking-widest">Acesso vitalício • Alta resolução • Sem anúncios</p>
              </div>
            </motion.div>
          )}

          {/* 5. Instagram-Style Stories Viewer */}
          {giftData.stories.length > 0 && (
            <InstagramStories 
              memories={giftData.stories} 
              onComplete={() => console.log('Stories complete!')}
              isPlaying={isPlaying}
            />
          )}
          
          {/* 5.5 Star Map Section */}
          <StarMapSection giftData={giftData} scrollContainer={containerRef} isPlaying={isPlaying} />
          
          {/* 5.6 Eternal Counter Section */}
          <EternalCounterSection giftData={giftData} scrollContainer={containerRef} isPlaying={isPlaying} />

          <div className={cn("relative transition-opacity duration-1000", isPlaying ? "opacity-100" : "opacity-0 pointer-events-none")}>
            <motion.div style={{ scaleY: scrollYProgress }} className="fixed left-1/2 top-0 bottom-0 w-[1px] bg-sunset/30 origin-top -translate-x-1/2 hidden md:block" />
            
            {giftData.stories.length > 0 && <StorySegment recipientName={giftData.recipientName} memories={giftData.stories} scrollContainer={containerRef} />}

            {(giftData.journey || []).map((m, idx) => {
              if (idx > 0 && idx % 2 === 0) {
                return <CollageSection key={m.id} memory={m} index={idx} total={giftData.journey.length} prevMemory={giftData.journey[idx-1]} isPaid={giftData.isPaid} scrollContainer={containerRef} />;
              }
              return <MemorySection key={m.id} memory={m} index={idx} total={giftData.journey.length} isPaid={giftData.isPaid} scrollContainer={containerRef} />;
            })}

            <section className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative z-50 bg-charcoal">
              {giftData.isPaid ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ root: containerRef }}
                  className="space-y-8"
                >
                  <ShieldCheck className="w-12 h-12 text-sunset mx-auto" strokeWidth={1} />
                  <h2 className="text-4xl md:text-6xl font-serif lowercase italic">com todo o meu amor.</h2>
                  
                  {/* Só mostra as ferramentas de compartilhar para quem acabou de pagar */}
                  {searchParams.get("paid") === "true" && (
                    <div className="flex flex-col items-center gap-6 mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                      <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-sunset to-transparent" />
                      
                      <div className="space-y-2 text-center">
                        <p className="text-[10px] uppercase tracking-[0.6em] text-sunset font-black">Presente eterno desbloqueado</p>
                        <p className="text-[8px] uppercase tracking-widest opacity-30 font-bold">Compartilhe este momento especial</p>
                      </div>

                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <button 
                          onClick={() => {
                            const url = window.location.origin + window.location.pathname + "?giftId=" + searchParams.get("giftId");
                            navigator.clipboard.writeText(url);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }} 
                          className="px-10 py-5 bg-cream/5 border-[1px] border-cream/10 text-cream text-[10px] uppercase tracking-[0.4em] font-black hover:bg-cream hover:text-charcoal transition-all flex items-center gap-3 backdrop-blur-md"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? "Link Copiado" : "Copiar Link de Acesso"}
                        </button>

                        <button 
                          onClick={() => {
                             const url = window.location.origin + window.location.pathname + "?giftId=" + searchParams.get("giftId");
                             const text = `Criei algo muito especial para você... ❤️\n\n${url}`;
                             window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
                          }} 
                          className="px-10 py-5 bg-[#25D366]/20 border-[1px] border-[#25D366]/30 text-[#25D366] text-[10px] uppercase tracking-[0.4em] font-black hover:bg-[#25D366] hover:text-white transition-all flex items-center gap-3 backdrop-blur-md"
                        >
                          <Share2 className="w-3 h-3" />
                          Enviar via WhatsApp
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                 <div className="space-y-4 max-w-sm">
                    <Lock className="w-12 h-12 text-sunset mx-auto opacity-20" />
                    <h2 className="text-3xl font-serif italic text-sunset">"Quase lá..."</h2>
                    <p className="text-xs opacity-40 leading-relaxed uppercase tracking-widest">para liberar o compartilhamento, você precisa finalizar a compra.</p>
                    {payStatus === "uploading" ? (
                      <div className="mt-8 flex items-center justify-center gap-4">
                        <Loader2 className="w-4 h-4 animate-spin text-sunset" />
                        <span className="text-[10px] uppercase tracking-widest opacity-40 italic">Salvando memórias...</span>
                      </div>
                    ) : (
                      <button onClick={handlePurchase} className="mt-8 px-12 py-5 border-[1px] border-cream/20 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-cream hover:text-charcoal transition-all">Eternizar Agora</button>
                    )}
                 </div>
              )}
            </section>
          </div>
        </>
      )}

      {/* 6. Success Modal Overlay (The "Eternity Ticket") */}
      {/* Share Modal */}
      <ShareModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        giftData={{
          id: searchParams.get("giftId") || "",
          recipientName: giftData.recipientName,
          senderName: giftData.senderName
        }}
      />
    </main>
  );
}

function StorySegment({ recipientName, memories, scrollContainer }: { recipientName: string, memories: any[], scrollContainer: React.RefObject<any> }) {
  const storyRef = useRef(null);
  const { scrollYProgress } = useScroll({ 
    target: storyRef, 
    container: scrollContainer,
    offset: ["start start", "end end"] 
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 0.8]);

  return (
    <section ref={storyRef} className="relative">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ scale }} className="relative z-10 text-center">
            <span className="text-[10px] uppercase tracking-[0.4em] opacity-40 mb-4 block">começando por...</span>
            <h2 className="text-5xl md:text-8xl font-serif lowercase italic">nossa história em quadros.</h2>
        </motion.div>
        
        <div className="absolute inset-0 z-0">
            {memories.map((m, i) => (
                <motion.div 
                    key={m.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    className="absolute w-64 h-80"
                    style={{ 
                        opacity: useTransform(scrollYProgress, [0, 0.2 + (i * 0.1)], [0, 1]),
                        scale: useTransform(scrollYProgress, [0, 0.2 + (i * 0.1)], [0.8, 1.1]),
                        top: `${20 + (i * 15)}%`, 
                        left: `${10 + (i * 25)}%`,
                        rotate: (i % 2 === 0 ? -10 : 10) * (i + 1)
                    }}
                >
                    <img src={m.imageUrl} alt="" className="w-full h-full object-cover shadow-2xl border-[1px] border-cream/10" />
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}

function MemorySection({ memory, index, total, isPaid, scrollContainer }: { memory: any, index: number, total: number, isPaid: boolean, scrollContainer: React.RefObject<any> }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ 
    target: sectionRef, 
    container: scrollContainer,
    offset: ["start end", "end start"] 
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} className="min-h-screen md:h-[150vh] flex flex-col md:flex-row items-center justify-center relative px-6 md:px-20 py-32 md:py-0 overflow-hidden">
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

function CollageSection({ memory, index, total, prevMemory, isPaid, scrollContainer }: { memory: any, index: number, total: number, prevMemory: any, isPaid: boolean, scrollContainer: React.RefObject<any> }) {
  const collageRef = useRef(null);
  const { scrollYProgress } = useScroll({ 
    target: collageRef, 
    container: scrollContainer,
    offset: ["start end", "end start"] 
  });
  const rotate1 = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [10, -10]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={collageRef} className="min-h-screen py-32 px-6 flex flex-col items-center justify-center bg-charcoal/40 backdrop-blur-sm relative overflow-hidden">
        <motion.div style={{ opacity }} className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl w-full">
            <motion.div style={{ rotate: rotate1 }} className="bg-cream p-4 pb-20 shadow-2xl relative">
                <img src={prevMemory.imageUrl} className="w-full aspect-[4/5] object-cover grayscale" alt=""/>
                <p className="absolute bottom-6 left-0 right-0 text-center font-serif italic text-charcoal/40 text-sm">{prevMemory.message.substring(0, 20)}...</p>
                {!isPaid && <div className="absolute inset-0 bg-charcoal/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">LOCK</div>}
            </motion.div>
            <motion.div style={{ rotate: rotate2 }} className="bg-cream p-4 pb-20 shadow-2xl relative md:translate-y-24">
                <img src={memory.imageUrl} className="w-full aspect-[4/5] object-cover grayscale" alt=""/>
                <p className="absolute bottom-6 left-0 right-0 text-center font-serif italic text-charcoal/40 text-sm">{memory.message.substring(0, 20)}...</p>
                {!isPaid && <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-15deg]"><span className="text-[40px] font-black uppercase text-charcoal tracking-widest">PREVIEW</span></div>}
            </motion.div>
        </motion.div>
        <motion.div style={{ opacity }} className="mt-40 text-center max-w-2xl">
             <h3 className="text-3xl font-serif italic lowercase opacity-60 mb-6">cada detalhe importa.</h3>
             <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 leading-relaxed font-bold">memorias eternas • volume 0{index}</p>
        </motion.div>
    </section>
  );
}

function InstagramStories({ memories, onComplete, isPlaying }: { memories: any[], onComplete: () => void, isPlaying: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const { giftData } = useGift();

  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < memories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            clearInterval(timer);
            onComplete();
            return 100;
          }
        }
        return prev + 1.2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [currentIndex, memories.length, isPlaying, onComplete]);

  const handleTap = (e: React.MouseEvent) => {
    const width = window.innerWidth;
    if (e.clientX > width / 2) {
      if (currentIndex < memories.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setProgress(0);
      }
    } else {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        setProgress(0);
      }
    }
  };

  return (
    <section className="h-screen bg-black sticky top-0 z-[80] overflow-hidden flex items-center justify-center cursor-pointer select-none" onClick={handleTap}>
      
      {/* 1. Background (Blurred Mirror) */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`bg-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0 scale-125 blur-[60px]"
        >
          <img src={memories[currentIndex].imageUrl} className="w-full h-full object-cover brightness-50" alt="" />
        </motion.div>
      </AnimatePresence>

      {/* 2. Main 9:16 Container */}
      <div className="relative h-[100dvh] aspect-[9/16] z-10 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] md:rounded-[20px] overflow-hidden bg-black">
        
        {/* Progress Bars (Top) */}
        <div className="absolute top-2 inset-x-3 flex gap-1 z-[100]">
          {memories.map((_, i) => (
            <div key={i} className="h-[2px] flex-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ 
                  width: i < currentIndex ? "100%" : i === currentIndex ? `${progress}%` : "0%" 
                }}
                transition={{ ease: "linear", duration: 0.1 }}
              />
            </div>
          ))}
        </div>

        {/* Header (Avatar + Name) - Glass Capsule Style */}
        <div className="absolute top-6 inset-x-3 flex items-center justify-between z-[100]">
           <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border-[0.5px] border-white/15 py-1.5 pl-1.5 pr-4 rounded-full shadow-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[1.5px]">
                 <div className="w-full h-full rounded-full bg-black p-[1px]">
                    <div className="w-full h-full rounded-full bg-sunset flex items-center justify-center">
                       <Heart className="w-3.5 h-3.5 text-white fill-current" />
                    </div>
                 </div>
              </div>
              <div className="flex flex-col -space-y-0.5">
                 <span className="text-[12px] font-bold text-white tracking-tight leading-none">{giftData.senderName || "user"}</span>
                 <span className="text-[10px] text-white/50 font-medium opacity-80 leading-none">há 7 horas</span>
              </div>
           </div>
           <div className="flex items-center gap-3 text-white">
              <div className="p-2 bg-white/10 backdrop-blur-md border-[0.5px] border-white/20 rounded-full shadow-lg">
                <div className="flex gap-1 items-center">
                    <div className="w-1 h-1 bg-white rounded-full" />
                    <div className="w-1 h-1 bg-white rounded-full" />
                    <div className="w-1 h-1 bg-white rounded-full" />
                </div>
              </div>
              <div className="p-2 bg-white/10 backdrop-blur-md border-[0.5px] border-white/20 rounded-full shadow-lg">
                <X className="w-4 h-4 stroke-[3]" />
              </div>
           </div>
        </div>

        {/* Content Image (Full Cover within 9:16) */}
        <AnimatePresence mode="wait">
            <motion.div 
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-10"
            >
                <img src={memories[currentIndex].imageUrl} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
            </motion.div>
        </AnimatePresence>

        {/* Story Caption Overlay - Matched with Preview Style */}
        <div className="absolute inset-x-0 bottom-24 z-50 px-6 pointer-events-none">
            <motion.div 
                key={`sticker-${currentIndex}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="max-w-[85%] bg-white/20 backdrop-blur-md border-[1px] border-white/10 p-5 rounded-2xl shadow-2xl"
            >
                <p className="text-[17px] md:text-[19px] font-medium text-white leading-relaxed italic tracking-tight">
                    "{memories[currentIndex].message}"
                </p>
            </motion.div>
        </div>

        {/* Bottom Bar (Reply + Interaction) - Premium Glass Blur */}
        <div className="absolute bottom-6 inset-x-4 flex items-center gap-3 z-[100]">
            <div className="flex-1 h-12 bg-white/10 backdrop-blur-2xl border-[1px] border-white/20 rounded-full flex items-center px-6 shadow-xl">
                <span className="text-[14px] text-white/60 font-medium tracking-tight">Responder...</span>
            </div>
            <div className="flex items-center gap-4 pr-1">
                <div className="p-2.5 bg-white/10 backdrop-blur-md border-[0.5px] border-white/20 rounded-full shadow-lg">
                    <Heart className="w-6 h-6 text-sunset fill-current shadow-[0_0_12px_rgba(255,89,89,0.5)]" />
                </div>
                <div className="p-2.5 bg-white/10 backdrop-blur-md border-[0.5px] border-white/20 rounded-full shadow-lg">
                    <Send className="w-6 h-6 text-white stroke-[2] -rotate-12" />
                </div>
            </div>
        </div>

      </div>

      {/* Navigation Zones */}
      <div className="absolute inset-y-0 left-0 w-1/4 z-30" />
      <div className="absolute inset-y-0 right-0 w-1/4 z-30" />
    </section>
  );
}

function StarMapSection({ giftData, scrollContainer, isPlaying }: { giftData: any, scrollContainer: React.RefObject<any>, isPlaying: boolean }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: scrollContainer,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 0.8], [0.8, 1, 0.95]);

  return (
    <section ref={sectionRef} className="min-h-screen py-32 px-6 flex flex-col items-center justify-center bg-charcoal relative z-50 overflow-hidden">
      <motion.div style={{ opacity, scale }} className="text-center space-y-12">
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.5em] text-sunset font-black">Nosso Céu Especial</span>
          <h2 className="text-4xl md:text-7xl font-serif lowercase italic text-white tracking-tighter">O Universo Conspirou.</h2>
        </div>

        <div className="relative">
          <StarMap 
            date={giftData.eventDate || new Date()} 
            lat={giftData.lat || -23.5505} 
            lng={giftData.lng || -46.6333} 
            size={window.innerWidth < 768 ? 300 : 450} 
          />
        </div>

        <div className="space-y-2">
          <p className="text-xl md:text-2xl font-serif italic lowercase opacity-60">"{giftData.locationName || "Em algum lugar especial"}."</p>
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-30 font-black">
            {new Date(giftData.eventDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </motion.div>
    </section>
  );
}

function EternalCounterSection({ giftData, scrollContainer, isPlaying }: { giftData: any, scrollContainer: React.RefObject<any>, isPlaying: boolean }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: scrollContainer,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="min-h-screen py-32 px-6 flex flex-col items-center justify-center bg-charcoal relative z-50">
      <motion.div style={{ opacity }} className="w-full">
        <div className="text-center mb-16 space-y-4">
           <span className="text-[10px] uppercase tracking-[0.5em] text-sunset font-black italic">Desde aquele momento</span>
           <h2 className="text-4xl md:text-6xl font-serif text-white lowercase italic tracking-tighter">Cada segundo ao seu lado.</h2>
        </div>

        <EternalCounter startDate={giftData.eventDate || new Date()} />
        
        <div className="mt-20 flex justify-center">
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}

export default function Experience() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-charcoal flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-sunset" /></div>}>
      <ExperienceContent />
    </Suspense>
  );
}
