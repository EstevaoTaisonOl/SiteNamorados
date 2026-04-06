"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Sparkles, CreditCard, Copy, Check, Send, Download, Loader2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  giftData: {
    id: string;
    recipientName: string;
    senderName: string;
  };
}

export default function ShareModal({ isOpen, onClose, giftData }: ShareModalProps) {
  const [qrStyle, setQrStyle] = useState<"classic" | "polaroid" | "minimal">("polaroid");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const qrStyles = {
    classic: { 
      color: "222222", 
      bgcolor: "ffffff",
      label: "Premium Card", 
      icon: <CreditCard className="w-3.5 h-3.5" />,
      frameClass: "bg-white p-6 shadow-xl border-[1px] border-charcoal/5 rounded-xl"
    },
    polaroid: { 
      color: "ff5959", 
      bgcolor: "ffffff",
      label: "Polaroid", 
      icon: <Heart className="w-3.5 h-3.5 fill-current" />,
      frameClass: "bg-white p-5 pb-16 shadow-2xl border-[1px] border-charcoal/5 rotate-[-2deg] relative"
    },
    minimal: { 
      color: "F4F1EA", 
      bgcolor: "222222",
      label: "Somente QR", 
      icon: <Sparkles className="w-3.5 h-3.5" />,
      frameClass: "bg-charcoal p-4 shadow-none border-0 rounded-2xl"
    }
  };

  const downloadQRCode = async () => {
    setDownloading(true);
    try {
      const heartIcon = `https://img.icons8.com/ios-filled/150/ff5959/hearts.png`;
      const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(window.location.origin + '/experience?giftId=' + giftData.id)}&dark=${qrStyles[qrStyle].color}&light=${qrStyles[qrStyle].bgcolor}&ecLevel=H&margin=1&size=1000&centerImage=${encodeURIComponent(heartIcon)}`;
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = qrUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      const isPolaroid = qrStyle === "polaroid";
      canvas.width = 1000;
      canvas.height = isPolaroid ? 1350 : 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (isPolaroid) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "#" + qrStyles[qrStyle].bgcolor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const qrSize = isPolaroid ? 860 : 1000;
      const x = (canvas.width - qrSize) / 2;
      const y = isPolaroid ? 70 : 0;
      ctx.drawImage(img, x, y, qrSize, qrSize);

      if (isPolaroid) {
        ctx.fillStyle = "#ff5959";
        ctx.globalAlpha = 0.5;
        ctx.font = "italic 60px serif";
        ctx.textAlign = "center";
        ctx.fillText("nosso momento.", canvas.width / 2, canvas.height - 120);
      }

      const blobUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `presente-${giftData.recipientName.toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-cream max-w-2xl w-full rounded-[40px] overflow-hidden shadow-2xl relative"
          >
            {/* Header / Close */}
            <div className="absolute top-8 right-8 z-50">
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-charcoal/5 hover:bg-sunset hover:text-white rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 md:p-14 space-y-12">
              <header className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sunset/10 text-sunset rounded-full text-[10px] uppercase tracking-[0.2em] font-black">
                   <Share2 className="w-3 h-3" /> Compartilhar Experiência
                </div>
                <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight lowercase">Eternize este momento.</h2>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white/40 p-8 rounded-[32px] border border-charcoal/5">
                
                {/* QR Section */}
                <div className="flex flex-col items-center gap-6">
                    <div className={cn("transition-all duration-700 relative group/qr", qrStyles[qrStyle].frameClass)}>
                        {qrStyle === "polaroid" && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-cream/80 border border-charcoal/5 rotate-[2deg] opacity-60 z-20" />
                        )}
                        <img 
                          src={`https://quickchart.io/qr?text=${encodeURIComponent(window.location.origin + '/experience?giftId=' + giftData.id)}&dark=${qrStyles[qrStyle].color}&light=${qrStyles[qrStyle].bgcolor}&ecLevel=H&margin=2&size=400&centerImage=${encodeURIComponent('https://img.icons8.com/ios-filled/150/ff5959/hearts.png')}`}
                          alt="QR Code" 
                          className="w-36 h-36 grayscale-0"
                        />
                        {qrStyle === "polaroid" && (
                          <p className="absolute bottom-5 left-0 right-0 text-center font-serif italic text-sunset/60 text-[13px] lowercase">nosso momento.</p>
                        )}
                        
                        <button 
                          onClick={downloadQRCode}
                          className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center rounded-inherit z-30 text-white gap-2 text-[10px] uppercase font-black tracking-widest"
                        >
                          {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                          Baixar Arte
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex gap-2 p-1.5 bg-charcoal/5 rounded-full border border-charcoal/10">
                            {(["classic", "polaroid", "minimal"] as const).map(style => (
                                <button
                                    key={style}
                                    onClick={() => setQrStyle(style)}
                                    className={cn(
                                        "p-2.5 rounded-full transition-all group relative",
                                        qrStyle === style ? "bg-white shadow-md text-sunset" : "opacity-40 hover:opacity-100"
                                    )}
                                >
                                    {qrStyles[style].icon}
                                </button>
                            ))}
                        </div>
                        <button onClick={downloadQRCode} className="w-11 h-11 rounded-full bg-charcoal text-cream flex items-center justify-center hover:bg-sunset shadow-lg transition-all">
                             <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                    <div className="space-y-1">
                        <span className="text-[8px] uppercase tracking-widest opacity-40 font-bold">Para</span>
                        <p className="font-serif italic text-lg">{giftData.recipientName}</p>
                    </div>
                    
                    <div className="space-y-2">
                        <span className="text-[8px] uppercase tracking-widest opacity-40 font-bold">Link da Experiência</span>
                        <div className="relative">
                            <div className="bg-charcoal text-cream text-[9px] p-4 pr-10 rounded-xl font-mono overflow-hidden text-ellipsis whitespace-nowrap shadow-lg">
                                {window.location.origin}/experience?giftId={giftData.id}
                            </div>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/experience?giftId=${giftData.id}`);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-sunset/20 text-sunset hover:bg-sunset hover:text-white rounded-lg flex items-center justify-center transition-all"
                            >
                                {copied ? <Check className="w-4 h-4"/> : <Copy className="w-3.5 h-3.5"/>}
                            </button>
                        </div>
                    </div>

                    <button 
                      onClick={() => {
                        const url = `${window.location.origin}/experience?giftId=${giftData.id}`;
                        const text = `Oi ${giftData.recipientName}, eu criei uma coisa muito especial pra nós dois... ❤️\nVeja quando tiver um tempinho:\n\n${url}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
                      }}
                      className="w-full py-5 bg-[#25D366] text-white rounded-2xl flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.4em] font-black hover:opacity-90 transition-all shadow-xl"
                    >
                      Enviar no WhatsApp <Send className="w-4 h-4" />
                    </button>
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
