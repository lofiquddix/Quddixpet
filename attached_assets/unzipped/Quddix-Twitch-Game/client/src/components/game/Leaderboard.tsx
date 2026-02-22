import { Trophy, Medal, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Pet } from "@shared/schema";

interface LeaderboardProps {
  pets: Pet[];
}

export function Leaderboard({ pets }: LeaderboardProps) {
  // Sort by score descending and take top 5
  const topPets = [...pets].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <motion.div 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="w-64 glass-panel rounded-3xl p-5 m-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-2 mb-2 border-b border-foreground/10 pb-3">
        <div className="bg-accent text-accent-foreground p-2 rounded-xl shadow-inner">
          <Trophy size={20} className="fill-current" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground">Top Pets</h2>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {topPets.length === 0 ? (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-sm text-muted-foreground text-center italic py-4"
            >
              Waiting for players...
            </motion.p>
          ) : (
            topPets.map((pet, idx) => (
              <motion.div
                key={pet.username}
                layout
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between bg-white/50 p-2 rounded-2xl border border-white/50 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    #{idx + 1}
                  </div>
                  <span className="font-semibold font-display text-sm truncate max-w-[80px]">
                    {pet.username}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-bold text-accent-foreground bg-accent/20 px-2 py-1 rounded-lg text-sm">
                  {pet.score} <Star size={12} className="fill-accent text-accent" />
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
