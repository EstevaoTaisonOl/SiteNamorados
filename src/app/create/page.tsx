"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGift } from "@/context/GiftContext";
import { ArrowRight, Heart, Sparkles, Plus, Trash2, Camera, Map, CheckCircle2, Search, Play } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CreateGift() {
  const { giftData, updateGiftData, addStory, removeStory, addJourneyItem, removeJourneyItem } = useGift();
  const [currentStep, setCurrentStep] = useState(1);
  const [input, setInput] = useState({ photo: "", message: "" });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      
      const mappedResults = (data.results || []).map((song: any) => ({
        url: song.trackViewUrl, // Unique Link
        previewUrl: song.previewUrl || "", // THE MISSING LINK: The actual audio file
        title: song.trackName,
        uploaderName: song.artistName,
        thumbnail: song.artworkUrl100.replace("100x100", "600x600"), // High-end art
        id: song.trackId.toString()
      }));

      setSearchResults(mappedResults);
    } catch (e) {
      console.error("iTunes Search failed", e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddItem = () => {
    if (input.photo && (currentStep === 2 || input.message)) {
      if (currentStep === 2) {
        addStory({ imageUrl: input.photo, message: input.message });
      } else {
        addJourneyItem({ imageUrl: input.photo, message: input.message });
      }
      setInput({ photo: "", message: "" });
    }
  };

  return (
    <main className="min-h-screen bg-cream text-charcoal flex flex-col lowercase selection:bg-sunset selection:text-white relative overflow-x-hidden">
      <div className="noise-overlay" />
      
      <nav className="p-6 flex justify-between items-center z-50">
        <Link href="/" className="font-serif text-xl tracking-tight">eternal memories</Link>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={cn("w-8 h-[2px] transition-colors", i <= currentStep ? "bg-sunset" : "bg-charcoal/10")} />
            ))}
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">0{currentStep} / 04</span>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 grid lg:grid-cols-12 gap-12 pb-24 items-start">
        
        {/* LEFT: Section Editors */}
        <div className="lg:col-span-7 space-y-12">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <StepContainer key="step1" title="Para quem?" subtitle="o início da nossa pequena jornada digital.">
                <div className="grid md:grid-cols-2 gap-8">
                  <InputGroup label="destinatário" value={giftData.recipientName} onChange={(v) => updateGiftData({ recipientName: v })} placeholder="ex: Helena" />
                  <InputGroup label="de (seu nome)" value={giftData.senderName} onChange={(v) => updateGiftData({ senderName: v })} placeholder="ex: Gabriel" />
                </div>
                <div className="space-y-4 pt-4">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal/60 ml-1 font-medium italic">Mensagem de Abertura</label>
                  <textarea 
                    rows={3}
                    placeholder="ex: para o amor da minha vida, um pequeno lembrete do que somos."
                    value={giftData.introMessage}
                    onChange={(e) => updateGiftData({ introMessage: e.target.value })}
                    className="w-full bg-white border-[1px] border-charcoal/20 focus:border-sunset focus:shadow-[0_0_20px_-5px_rgba(255,107,74,0.2)] outline-none p-6 font-serif text-xl md:text-2xl lowercase placeholder:text-charcoal/30 transition-all shadow-sm resize-none"
                  />
                  <p className="text-[10px] text-charcoal/30 italic">este texto aparecerá logo na primeira tela do seu presente.</p>
                </div>
              </StepContainer>
            )}


            {currentStep === 2 && (
              <StepContainer key="step2" title="Introdução: Stories" subtitle="selecione as fotos de abertura e adicione comentários estilo instagram.">
                 <div className="bg-white border-[1px] border-charcoal/20 p-4 md:p-8 space-y-6 shadow-xl relative mt-8">
                   <div className="grid gap-4">
                     <div className="space-y-1">
                       <label className="text-[9px] uppercase tracking-widest text-charcoal/40 italic">Link da Foto</label>
                       <input 
                        type="text" 
                        value={input.photo}
                        onChange={(e) => setInput({...input, photo: e.target.value})}
                        placeholder="cole o link da imagem..."
                        className="w-full bg-cream/30 border-[1px] border-charcoal/10 p-4 md:p-4 text-sm font-light outline-none focus:border-sunset transition-all rounded-none"
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[9px] uppercase tracking-widest text-charcoal/40 italic">Comentário (IG style)</label>
                       <input 
                        type="text" 
                        value={input.message}
                        onChange={(e) => setInput({...input, message: e.target.value})}
                        placeholder="legenda do story..."
                        className="w-full bg-cream/30 border-[1px] border-charcoal/10 p-4 md:p-4 text-sm font-light outline-none focus:border-sunset transition-all rounded-none"
                       />
                     </div>
                   </div>
                   <button 
                    onClick={handleAddItem}
                    disabled={!input.photo}
                    className="w-full py-5 bg-charcoal text-white hover:bg-sunset disabled:opacity-20 transition-all font-bold uppercase text-[9px] tracking-[0.2em] shadow-lg active:scale-95"
                   >
                     Adicionar Story
                   </button>

                   {/* Stories List - Responsive Grid */}
                   <div className="grid grid-cols-3 sm:grid-cols-4 md:flex md:gap-3 gap-2 pt-4">
                     {giftData.stories.map(s => (
                       <div key={s.id} className="relative aspect-[3/4] md:w-24 md:h-32 flex-shrink-0 group overflow-hidden bg-charcoal/5">
                         <img src={s.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                         {s.message && <div className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-sm text-[5px] text-white p-1 truncate leading-tight">"{s.message}"</div>}
                         <button onClick={() => removeStory(s.id)} className="absolute top-1 right-1 bg-white/90 text-sunset rounded-full p-1 shadow-md transition-opacity">
                           <Trash2 className="w-3 h-3" />
                         </button>
                       </div>
                     ))}
                   </div>
                 </div>
              </StepContainer>
            )}


            {currentStep === 3 && (
              <StepContainer key="step3" title="A Linha do Tempo" subtitle="agora, conte a história. fotos e mensagens que formam a jornada.">
                <div className="bg-white border-[1px] border-charcoal/20 p-8 space-y-6 shadow-xl relative mt-8">
                  <div className="grid md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest text-charcoal/40 italic">Foto</label>
                       <input type="text" value={input.photo} onChange={(e) => setInput({...input, photo: e.target.value})} placeholder="URL..." className="w-full bg-cream/30 border-[1px] border-charcoal/10 p-4 text-sm outline-none focus:border-sunset" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest text-charcoal/40 italic">Mensagem</label>
                       <input type="text" value={input.message} onChange={(e) => setInput({...input, message: e.target.value})} placeholder="uma legenda..." className="w-full bg-cream/30 border-[1px] border-charcoal/10 p-4 text-sm outline-none focus:border-sunset" />
                     </div>
                  </div>
                  <button onClick={handleAddItem} disabled={!input.photo || !input.message} className="w-full py-4 bg-charcoal text-cream hover:bg-sunset disabled:opacity-20 transition-all font-bold uppercase text-[10px] tracking-widest">
                    Adicionar à Linha do Tempo
                  </button>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                   {giftData.journey.map(j => (
                     <div key={j.id} className="flex items-center gap-4 p-4 bg-white border-charcoal/5 border-[1px] shadow-sm">
                       <img src={j.imageUrl} className="w-12 h-12 object-cover grayscale" />
                       <p className="flex-1 text-xs italic opacity-60">"{j.message}"</p>
                       <button onClick={() => removeJourneyItem(j.id)} className="text-charcoal/20 hover:text-sunset transition-colors"><Trash2 className="w-4 h-4" /></button>
                     </div>
                   ))}
                </div>
              </StepContainer>
            )}

            {currentStep === 4 && (
              <StepContainer key="step4" title="Sua Trilha Sonora" subtitle="procure por qualquer música do catálogo oficial para ser o fundo do seu presente.">
                <div className="space-y-6">
                  {/* Search Bar */}
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2">
                      {isSearching ? <Sparkles className="w-5 h-5 text-sunset animate-spin" /> : <Search className="w-5 h-5 text-charcoal/20 group-focus-within:text-sunset transition-colors" />}
                    </div>
                    <input 
                      type="text" 
                      placeholder="pesquise artista, música..." 
                      className="w-full bg-white border-[1px] border-charcoal/10 focus:border-sunset p-6 pl-16 text-xl font-serif lowercase outline-none shadow-sm transition-all"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Real Search Results - Premium Gallery */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar pt-2">
                    {searchResults.length > 0 ? searchResults.map(song => (
                      <button 
                        key={song.id}
                        onClick={() => updateGiftData({ 
                          musicId: song.url, 
                          musicPreviewUrl: song.previewUrl,
                          theme: song.title 
                        })} 
                        className={cn(
                          "group relative p-4 border-[1px] transition-all duration-300 flex items-center gap-5 text-left rounded-xl overflow-hidden",
                          giftData.musicId === song.url 
                            ? "bg-sunset text-white border-sunset shadow-[0_15px_30px_-10px_rgba(255,107,74,0.4)] scale-[1.02] z-10" 
                            : "bg-white border-charcoal/5 hover:border-sunset/30 hover:shadow-md hover:-translate-y-1"
                        )}
                      >
                        {/* Thumbnail Container */}
                        <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden relative shadow-lg">
                          <img src={song.thumbnail} className={cn("w-full h-full object-cover transition-all duration-700", giftData.musicId === song.url ? "scale-110 rotate-3" : "group-hover:scale-110")} />
                          <div className={cn("absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity", giftData.musicId === song.url && "opacity-100 bg-sunset/20")}>
                            <Play className={cn("w-6 h-6 fill-white", giftData.musicId === song.url ? "animate-pulse" : "")} />
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0 pr-6">
                          <h6 className={cn("font-serif text-lg leading-tight truncate mb-1 lowercase", giftData.musicId === song.url ? "text-white" : "text-charcoal")}>{song.title}</h6>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-[9px] uppercase tracking-widest font-black inline-block px-2 py-0.5 rounded-full", giftData.musicId === song.url ? "bg-white/20 text-white" : "bg-charcoal/5 text-charcoal/40")}>Artist</span>
                          </div>
                          <p className={cn("text-[10px] uppercase tracking-wide font-sans mt-2 truncate opacity-80", giftData.musicId === song.url ? "text-white/80" : "text-charcoal/60")}>{song.uploaderName}</p>
                        </div>

                        {/* Status Icon */}
                        {giftData.musicId === song.url && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-4 right-4">
                            <CheckCircle2 className="w-6 h-6 text-white/40" />
                          </motion.div>
                        )}
                      </button>
                    )) : (
                       <div className="md:col-span-2 p-20 text-center border-[2px] border-dashed border-charcoal/5 rounded-3xl opacity-30 flex flex-col items-center justify-center">
                          <Sparkles className="w-12 h-12 mb-6 text-sunset animate-pulse" />
                          <h3 className="font-serif text-2xl lowercase">Pesquise sua trilha</h3>
                          <p className="text-[10px] uppercase tracking-[0.3em] mt-3">digite o nome de uma música acima...</p>
                       </div>
                    )}
                  </div>
                </div>

                <div className="pt-8">
                  <Link href="/experience" className="block w-full py-10 bg-charcoal text-cream text-center text-[10px] uppercase tracking-[0.5em] font-black hover:bg-sunset hover:shadow-[0_20px_40px_rgba(255,107,74,0.3)] transition-all active:scale-[0.98]">
                    Finalizar e Receber Presente
                  </Link>
                </div>
              </StepContainer>
            )}


          </AnimatePresence>

          <div className="flex pt-12 items-center gap-12 sticky bottom-0 bg-cream/80 backdrop-blur-xl py-6 border-t-[1px] border-charcoal/5 z-40">
            <button onClick={() => setCurrentStep(p => Math.max(1, p-1))} disabled={currentStep === 1} className="text-[10px] uppercase tracking-widest font-bold disabled:opacity-10 hover:text-sunset transition-colors">voltar</button>
            <div className="flex-1" />
            {currentStep < 4 && (
              <button onClick={() => setCurrentStep(p => p + 1)} className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-black text-sunset hover:gap-6 transition-all">
                próximo passo <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="lg:col-span-5 relative hidden lg:block pt-12">
          <div className="sticky top-24">
             <div className="relative bg-charcoal aspect-[9/16] w-full max-w-[320px] mx-auto shadow-2xl rounded-[12px] border-[1px] border-cream/10 overflow-hidden">
                {currentStep <= 2 ? (
                  <div className="h-full flex flex-col p-4 text-cream">
                     <div className="flex gap-1 mb-4">
                        {(giftData.stories.length > 0 ? giftData.stories : [1,2,3]).map((_, i) => (
                           <div key={i} className="flex-1 h-[1.5px] bg-cream/20 overflow-hidden">
                              <motion.div animate={{ width: i === 0 ? "100%" : "0%" }} transition={{ duration: 4, repeat: Infinity }} className="h-full bg-cream" />
                           </div>
                        ))}
                     </div>
                     <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-sunset flex items-center justify-center text-[8px] font-bold">{giftData.recipientName[0] || "?"}</div>
                        <span className="text-[10px] font-medium opacity-80">{giftData.recipientName || "destinatário"}</span>
                     </div>
                     <div className="flex-1 relative bg-charcoal-light rounded-[4px] overflow-hidden">
                        {giftData.stories.length > 0 ? (
                           <div className="h-full">
                             <img src={giftData.stories[giftData.stories.length - 1].imageUrl} className="w-full h-full object-cover" />
                             {giftData.stories[giftData.stories.length - 1].message && (
                               <div className="absolute bottom-4 left-4 max-w-[85%] bg-white/20 backdrop-blur-md p-3 rounded-lg border border-white/10">
                                  <p className="text-[10px] leading-tight font-medium text-white italic">"{giftData.stories[giftData.stories.length - 1].message}"</p>
                               </div>
                             )}
                           </div>
                        ) : (
                           <div className="h-full flex flex-col items-center justify-center opacity-10"><Camera className="w-8 h-8 opacity-20" /></div>
                        )}
                     </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col p-4 text-cream overflow-hidden">
                     <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-sunset/20 -translate-x-1/2" />
                     <div className="z-10 bg-charcoal/80 backdrop-blur-md p-4 border-[1px] border-cream/10 mb-8 mt-12 text-center">
                        <span className="text-[8px] uppercase tracking-widest opacity-20 block mb-2">capa: intro</span>
                        <p className="text-[10px] italic font-serif leading-tight">
                          {giftData.introMessage || "uma pequena jornada dedicada a você."}
                        </p>
                     </div>
                     <div className="flex-1 relative z-10 flex flex-col items-center gap-4">
                        {giftData.journey.length > 0 && (
                          <>
                            <img src={giftData.journey[giftData.journey.length-1].imageUrl} className="w-full aspect-[4/5] object-cover grayscale shadow-2xl border-[4px] border-white/10" />
                            <p className="text-[8px] opacity-40 italic">"{giftData.journey[giftData.journey.length-1].message}"</p>
                          </>
                        )}
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>

      </div>
    </main>
  );
}

function StepContainer({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-8">
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-5xl font-serif text-charcoal leading-none lowercase tracking-tighter">{title}</h2>
        <p className="text-charcoal/40 font-light italic text-lg leading-relaxed">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
}

function InputGroup({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal/60 ml-1 font-medium italic">{label}</label>
      <input type="text" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white border-[1px] border-charcoal/20 focus:border-sunset focus:shadow-[0_0_20px_-5px_rgba(255,107,74,0.2)] outline-none p-6 font-serif text-2xl lowercase placeholder:text-charcoal/30 transition-all shadow-sm" />
    </div>
  );
}
