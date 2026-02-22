import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BellRing } from "lucide-react";

interface EventBannerProps {
  events: { id: string; message: string }[];
}

export function EventBanner({ events }: EventBannerProps) {
  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-50 pointer-events-auto w-full max-w-2xl px-4">
      <AnimatePresence mode="popLayout">
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full"
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-2xl shadow-2xl">
              {/* Shimmer effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center justify-center gap-4 border border-white/20">
                <div className="bg-white/20 p-2 rounded-full animate-bounce">
                  <BellRing className="text-white" size={24} />
                </div>
                
                <h3 className="font-display font-bold text-xl md:text-2xl text-white text-center text-shadow-md tracking-wide">
                  {event.message}
                </h3>
                
                <Sparkles className="text-yellow-300 animate-pulse hidden sm:block" size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
