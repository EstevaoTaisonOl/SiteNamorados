"use client";

import { motion } from "framer-motion";
import { User, Sparkles, Heart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();

  if (pathname === "/experience") return null;

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-center"
    >
      <div className="max-w-5xl w-full bg-cream/70 backdrop-blur-xl border border-charcoal/5 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-charcoal/5">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-charcoal rounded-full flex items-center justify-center transition-transform group-hover:rotate-12">
                <Heart className="w-4 h-4 text-sunset fill-current" />
            </div>
            <span className="font-serif italic text-lg hidden sm:block">eterno.</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-6">
            <Link 
                href="/minhas-memorias"
                className={cn(
                    "text-[10px] uppercase tracking-[0.2em] font-black px-4 py-2 rounded-full transition-all flex items-center gap-2",
                    pathname === "/minhas-memorias" 
                        ? "bg-charcoal text-cream" 
                        : "text-charcoal/40 hover:text-charcoal hover:bg-charcoal/5"
                )}
            >
                <User className="w-3 h-3" />
                <span>Meus Sites</span>
            </Link>

            <Link 
                href="/create"
                className="bg-sunset text-white text-[10px] uppercase tracking-[0.2em] font-black px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-charcoal transition-all shadow-lg shadow-sunset/10 active:scale-95"
            >
                <Sparkles className="w-3 h-3" />
                <span>Criar Novo</span>
            </Link>
        </div>

      </div>
    </motion.nav>
  );
}
