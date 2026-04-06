"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Heart, Calendar, ArrowLeft, Sparkles, ExternalLink, LogOut, ChevronLeft, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { cn } from "@/lib/utils";

import ShareModal from "@/components/ShareModal";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gifts, setGifts] = useState<any[]>([]);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any>(null);

  // ... (auth state logic)
  
  const handleShare = (gift: any) => {
    setSelectedGift({
        id: gift.id,
        recipientName: gift.recipient_name,
        senderName: gift.sender_name
    });
    setIsShareOpen(true);
  };

  // Auth State
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) fetchGifts(session.user.email);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) fetchGifts(session.user.email);
    });

    checkUser();
    return () => subscription.unsubscribe();
  }, []);

  const fetchGifts = async (email: string | undefined) => {
    if (!email) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .eq('sender_email', email.trim().toLowerCase())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGifts(data || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/minhas-memorias'
      }
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setGifts([]);
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal/20" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cream text-charcoal selection:bg-sunset selection:text-white font-sans overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-sunset/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-charcoal/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 md:py-24 relative">
        
        {/* Navigation / Back Arrow */}
        <nav className="mb-12 flex justify-between items-center">
            <Link 
                href="/" 
                className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-black text-charcoal/40 hover:text-sunset transition-all"
            >
                <div className="w-10 h-10 rounded-full border border-charcoal/10 flex items-center justify-center group-hover:border-sunset transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                </div>
                voltar ao início
            </Link>

            {user && (
                <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-[8px] uppercase tracking-widest font-bold opacity-30 hover:opacity-100 transition-opacity"
                >
                    sair da conta <LogOut className="w-3 h-3" />
                </button>
            )}
        </nav>

        {/* Login State */}
        {!user ? (
            <div className="text-center space-y-12 py-20">
                <header className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-20 h-20 bg-charcoal rounded-3xl mx-auto flex items-center justify-center shadow-2xl rotate-3"
                    >
                        <Heart className="w-8 h-8 text-sunset fill-current" />
                    </motion.div>
                    
                    <div className="space-y-2">
                        <h1 className="text-5xl md:text-7xl font-serif italic tracking-tighter">
                            seu acervo eterno.
                        </h1>
                        <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 leading-relaxed">
                            conecte-se para ver todos os presentes que você já criou.
                        </p>
                    </div>
                </header>

                <button 
                    onClick={signInWithGoogle}
                    className="group relative inline-flex items-center gap-4 bg-charcoal px-10 py-5 rounded-full text-cream hover:bg-sunset transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-xs uppercase tracking-[0.2em] font-black">Entrar com Google</span>
                </button>
            </div>
        ) : (
            <>
                {/* Logged In Header */}
                <header className="mb-24 space-y-4">
                    <div className="flex items-center gap-3 opacity-40 mb-8">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                         <span className="text-[10px] uppercase tracking-widest font-bold">Conectado como {user.email}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif italic tracking-tighter">
                        olá, {user.user_metadata?.full_name?.split(' ')[0] || 'eterno'}.
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 leading-relaxed">
                        aqui estão todas as experiências que você deu vida.
                    </p>
                </header>

                {/* Grid Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gifts.length > 0 ? (
                        gifts.map((gift, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={gift.id}
                                className="group bg-white p-8 rounded-[32px] border border-charcoal/5 shadow-sm hover:shadow-2xl hover:shadow-charcoal/5 transition-all duration-500 hover:-translate-y-2"
                            >
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[8px] uppercase tracking-widest font-black border",
                                            gift.is_paid ? "bg-green-500/5 border-green-500/10 text-green-500" : "bg-sunset/5 border-sunset/10 text-sunset"
                                        )}>
                                            {gift.is_paid ? "✓ Pago" : "⚠ Pendente"}
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-charcoal/5 flex items-center justify-center group-hover:bg-sunset transition-colors">
                                            <Sparkles className="w-4 h-4 text-charcoal group-hover:text-white" />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-serif italic lowercase tracking-tight mb-2">
                                            {gift.recipient_name}
                                        </h3>
                                        <div className="flex items-center gap-2 opacity-30">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-[9px] uppercase tracking-widest font-bold">
                                                {new Date(gift.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link 
                                            href={`/experience?giftId=${gift.id}`}
                                            className="flex-1 py-4 bg-white border border-charcoal/10 text-charcoal rounded-2xl text-[9px] uppercase tracking-[0.3em] font-black hover:bg-charcoal/5 transition-all flex items-center justify-center gap-3"
                                        >
                                            Ver Site <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                        <button 
                                            onClick={() => handleShare(gift)}
                                            className="px-6 py-4 bg-charcoal text-cream rounded-2xl text-[9px] uppercase tracking-[0.3em] font-black hover:bg-sunset transition-all flex items-center justify-center gap-3"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center bg-white/50 border-2 border-dashed border-charcoal/5 rounded-[40px]">
                            <Heart className="w-12 h-12 mx-auto mb-6 opacity-10" />
                            <h3 className="text-xl font-serif italic lowercase text-charcoal/40">nenhum site por aqui ainda.</h3>
                        </div>
                    )}
                </div>
            </>
        )}

      </div>

      {/* Share Modal */}
      {selectedGift && (
        <ShareModal 
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            giftData={selectedGift}
        />
      )}
    </main>
  );
}
