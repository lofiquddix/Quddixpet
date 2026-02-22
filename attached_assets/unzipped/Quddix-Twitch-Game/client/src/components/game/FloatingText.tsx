import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingTextProps {
  id: string;
  text: string;
  type: "positive" | "negative" | "neutral";
  onComplete: (id: string) => void;
}

export function FloatingText({ id, text, type, onComplete }: FloatingTextProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(id);
    }, 2000);
    return () => clearTimeout(timer);
  }, [id, onComplete]);

  const colorClass = 
    type === "positive" ? "text-green-500" : 
    type === "negative" ? "text-red-500" : 
    "text-blue-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: 1, y: -50, scale: 1.2 }}
      exit={{ opacity: 0, y: -80, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap font-display font-bold text-2xl z-50 text-stroke-sm ${colorClass} drop-shadow-md`}
      style={{ pointerEvents: 'none' }}
    >
      {text}
    </motion.div>
  );
}
