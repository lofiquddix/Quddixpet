import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Crown } from "lucide-react";
import { PetWithAction } from "@/hooks/use-game-ws";

interface LeaderboardProps {
  pets: PetWithAction[];
}

export function Leaderboard({ pets }: LeaderboardProps) {
  // Sort pets by score descending and take top 5
  const topPets = [...pets].sort((a, b) => b.score - a.score).slice(0, 5);

  if (topPets.length === 0) return null;

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="absolute top-6 left-6 w-72 glass-panel rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.15)] pointer-events-auto"
    >
      <div className="bg-gradient-to-r from-primary/90 to-rose-400 p-4 border-b border-white/20 flex items-center gap-3">
        <Trophy className="text-yellow-300 fill-yellow-300 drop-shadow-md" size={24} />
        <h2 className="font-display font-bold text-xl text-white text-shadow-sm">Таблица лидеров</h2>
      </div>
      
      <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {topPets.map((pet, index) => (
            <motion.div
              key={pet.username}
              layout
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/50 hover:bg-white/70 transition-colors border border-white/40 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-white to-gray-100 shadow-inner font-bold text-slate-700">
                  {index === 0 && <Crown size={18} className="text-yellow-500 fill-yellow-400" />}
                  {index === 1 && <Medal size={18} className="text-slate-400 fill-slate-300" />}
                  {index === 2 && <Medal size={18} className="text-amber-600 fill-amber-500" />}
                  {index > 2 && <span className="text-sm font-display">{index + 1}</span>}
                </div>
                <span className="font-bold text-foreground font-display truncate max-w-[100px]" title={pet.username}>
                  {pet.username}
                </span>
              </div>
              
              <div className="font-black text-primary bg-primary/10 px-3 py-1 rounded-full text-sm">
                {pet.score}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
