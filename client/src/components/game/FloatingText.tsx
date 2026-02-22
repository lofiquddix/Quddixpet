import { motion } from "framer-motion";
import { useEffect } from "react";
import { clsx } from "clsx";

interface FloatingTextProps {
  id: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral';
  onComplete: (id: string) => void;
}

export function FloatingText({ id, text, type, onComplete }: FloatingTextProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(id);
    }, 2000);
    return () => clearTimeout(timer);
  }, [id, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 1, 0], y: -60, scale: [0.5, 1.2, 1, 1] }}
      transition={{ duration: 2, times: [0, 0.2, 0.8, 1], ease: "easeOut" }}
      className={clsx(
        "absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap font-display font-bold text-lg pointer-events-none z-50 text-shadow-outline",
        {
          'text-green-500': type === 'positive',
          'text-red-500': type === 'negative',
          'text-blue-500': type === 'neutral',
        }
      )}
    >
      {text}
    </motion.div>
  );
}
