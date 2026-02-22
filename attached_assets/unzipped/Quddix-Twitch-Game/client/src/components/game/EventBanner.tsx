import { motion, AnimatePresence } from "framer-motion";
import { Megaphone } from "lucide-react";
import { GameEvent } from "@/hooks/use-game-ws";

interface EventBannerProps {
  events: GameEvent[];
}

export function EventBanner({ events }: EventBannerProps) {
  // Only show the most recent event
  const currentEvent = events.length > 0 ? events[events.length - 1] : null;

  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-2xl flex flex-col items-center">
      <AnimatePresence mode="wait">
        {currentEvent && (
          <motion.div
            key={currentEvent.id}
            initial={{ y: -100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
            className="bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-3xl shadow-xl border-4 border-white/40 flex items-center gap-4"
          >
            <div className="bg-white/20 p-2 rounded-full animate-pulse">
              <Megaphone size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold tracking-wide text-shadow-cute text-stroke-sm">
              {currentEvent.message}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
