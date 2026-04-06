"use client";

import { useGift } from "@/context/GiftContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Heart, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { uploadFileToSupabase, createGiftInSupabase } from "@/lib/gift-service";

export default function CheckoutPage() {
  const { giftData } = useGift();
  const [payStatus, setPayStatus] = useState<"idle"|"paying">("idle");
  const [customer, setCustomer] = useState({ 
    name: giftData.senderName || "", 
    email: "", 
    taxId: "", 
    cellphone: "" 
  });

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayStatus("paying");

    try {
      // 1. UPLOAD FILES TO SUPABASE
      const updatedStories = [...giftData.stories];
      const updatedJourney = [...giftData.journey];

      // Upload Stories
      for (let i = 0; i < updatedStories.length; i++) {
        const file = giftData.files[updatedStories[i].id];
        if (file) {
          const url = await uploadFileToSupabase(file, 'stories');
          updatedStories[i] = { ...updatedStories[i], imageUrl: url };
        }
      }

      // Upload Journey
      for (let i = 0; i < updatedJourney.length; i++) {
        const file = giftData.files[updatedJourney[i].id];
        if (file) {
          const url = await uploadFileToSupabase(file, 'journey');
          updatedJourney[i] = { ...updatedJourney[i], imageUrl: url };
        }
      }

      // 2. CREATE GIFT IN SUPABASE (UNPAID)
      const record = await createGiftInSupabase({
        ...giftData,
        senderEmail: customer.email,
        stories: updatedStories,
        journey: updatedJourney
      });

      // 3. START ABACATEPAY CHECKOUT
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          returnUrl: window.location.origin + `/experience?giftId=${record.id}&`,
          customer: customer
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Erro ao iniciar checkout");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Erro ao iniciar pagamento. Verifique seus dados ou tente novamente.");
      setPayStatus("idle");
    }
  };

  return (
    <main className="min-h-screen bg-charcoal text-cream flex flex-col md:flex-row">
      
      {/* Visual Side (Summary) */}
      <section className="flex-1 p-8 md:p-16 flex flex-col justify-center items-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sunset/20 via-charcoal to-charcoal border-b-[1px] md:border-b-0 md:border-r-[1px] border-cream/5">
        <Link href="/experience" className="absolute top-8 left-8 text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 hover:opacity-100 flex items-center gap-2 transition-opacity">
          <ArrowLeft className="w-3 h-3" /> voltar ao preview
        </Link>

        <div className="max-w-xs w-full space-y-8 text-center">
            <motion.div 
              initial={{ rotate: -5, y: 20, opacity: 0 }}
              animate={{ rotate: -2, y: 0, opacity: 1 }}
              className="bg-cream p-3 pb-12 shadow-2xl relative"
            >
                <div className="aspect-square bg-charcoal/10 overflow-hidden">
                    {giftData.stories[0]?.imageUrl && (
                        <img src={giftData.stories[0].imageUrl} alt="Summary" className="w-full h-full object-cover grayscale" />
                    )}
                </div>
                <div className="absolute bottom-4 left-0 right-0">
                    <p className="font-serif italic text-charcoal/60 lowercase text-sm">presente para {giftData.recipientName}</p>
                </div>
                <div className="absolute -top-4 -right-4 bg-sunset text-white p-3 rounded-full shadow-lg">
                    <Sparkles className="w-5 h-5" />
                </div>
            </motion.div>

            <div className="space-y-4">
                <h1 className="text-4xl font-serif italic lowercase tracking-tight">quase eterno.</h1>
                <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 leading-relaxed max-w-[280px] mx-auto">
                    ao finalizar, seu presente será salvo para sempre e você receberá um link vitalício para compartilhar.
                </p>
                <div className="flex items-center justify-center gap-8 pt-4">
                    <div className="text-center">
                        <p className="text-2xl font-serif">R$ 19,90</p>
                        <p className="text-[8px] uppercase tracking-widest opacity-30 mt-1">pagamento único</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Form Side */}
      <section className="flex-1 p-8 md:p-16 flex flex-col justify-center items-center bg-cream text-charcoal relative">
        <div className="max-w-md w-full space-y-12">
            <header className="space-y-2">
                <h2 className="text-2xl font-bold uppercase tracking-tight">Finalizar Compra</h2>
                <div className="h-[2px] w-12 bg-sunset" />
            </header>

            <form onSubmit={handlePurchase} className="space-y-6">
                <div className="space-y-4">
                    <div className="group border-b-[1px] border-charcoal/10 focus-within:border-sunset transition-colors pb-2">
                        <label className="text-[8px] uppercase tracking-[0.2em] font-black opacity-30 group-focus-within:opacity-100 transition-opacity">seu nome completo</label>
                        <input 
                          required
                          type="text" 
                          value={customer.name}
                          onChange={e => setCustomer({...customer, name: e.target.value})}
                          placeholder="Como no cartão ou CPF"
                          className="w-full bg-transparent border-none outline-none p-0 text-sm placeholder:text-charcoal/20"
                        />
                    </div>

                    <div className="group border-b-[1px] border-charcoal/10 focus-within:border-sunset transition-colors pb-2">
                        <label className="text-[8px] uppercase tracking-[0.2em] font-black opacity-30 group-focus-within:opacity-100 transition-opacity">e-mail para recebimento</label>
                        <input 
                          required
                          type="email" 
                          value={customer.email}
                          onChange={e => setCustomer({...customer, email: e.target.value})}
                          placeholder="ex: voce@email.com"
                          className="w-full bg-transparent border-none outline-none p-0 text-sm placeholder:text-charcoal/20"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="group border-b-[1px] border-charcoal/10 focus-within:border-sunset transition-colors pb-2">
                            <label className="text-[8px] uppercase tracking-[0.2em] font-black opacity-30 group-focus-within:opacity-100 transition-opacity">cpf</label>
                            <input 
                              required
                              type="text" 
                              value={customer.taxId}
                              onChange={e => setCustomer({...customer, taxId: e.target.value.replace(/\D/g, '').substring(0, 11)})}
                              placeholder="000.000.000-00"
                              className="w-full bg-transparent border-none outline-none p-0 text-sm placeholder:text-charcoal/20"
                            />
                        </div>
                        <div className="group border-b-[1px] border-charcoal/10 focus-within:border-sunset transition-colors pb-2">
                            <label className="text-[8px] uppercase tracking-[0.2em] font-black opacity-30 group-focus-within:opacity-100 transition-opacity">celular / whatsapp</label>
                            <input 
                              required
                              type="text" 
                              value={customer.cellphone}
                              onChange={e => setCustomer({...customer, cellphone: e.target.value.replace(/\D/g, '').substring(0, 11)})}
                              placeholder="(00) 00000-0000"
                              className="w-full bg-transparent border-none outline-none p-0 text-sm placeholder:text-charcoal/20"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-8 space-y-6">
                    <button 
                      disabled={payStatus === "paying"}
                      className="w-full py-6 bg-charcoal text-cream text-[10px] uppercase tracking-[0.5em] font-black hover:bg-sunset transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
                    >
                      {payStatus === "paying" ? (
                        <>Iniciando Pagamento <Loader2 className="w-4 h-4 animate-spin" /></>
                      ) : (
                        <>Pagar agora com PIX <CreditCard className="w-4 h-4" /></>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-8 opacity-40">
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default">
                             <ShieldCheck className="w-4 h-4" />
                             <span className="text-[8px] uppercase tracking-widest font-bold">Compra Segura</span>
                        </div>
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default">
                             <img src="https://static.abacatepay.com/abacatepay-logo-icon.svg" className="w-4 h-4" alt="AbacatePay" />
                             <span className="text-[8px] uppercase tracking-widest font-bold">AbacatePay</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        
        <p className="absolute bottom-8 left-0 right-0 text-center text-[7px] uppercase tracking-[0.4em] opacity-30 font-bold">
            © 2026 Eternal Memories • Todos os direitos reservados
        </p>
      </section>
    </main>
  );
}
