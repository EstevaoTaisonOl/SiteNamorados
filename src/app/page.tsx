"use client";

import { motion } from "framer-motion";
import Hero from "@/components/Hero";
import Steps from "@/components/Steps";
import InteractiveDemo from "@/components/InteractiveDemo";
import CTA from "@/components/CTA";

export default function Home() {
  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex flex-col min-h-screen bg-cream"
    >
      <Hero />
      <Steps />
      <InteractiveDemo />
      <CTA />
    </motion.main>
  );
}


