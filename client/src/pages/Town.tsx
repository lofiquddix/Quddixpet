import { useEffect, useState } from "react";
import { useGameWs } from "@/hooks/use-game-ws";
import { PetEntity } from "@/components/game/PetEntity";
import { Leaderboard } from "@/components/game/Leaderboard";
import { EventBanner } from "@/components/game/EventBanner";
import { ConnectionStatus } from "@/components/game/ConnectionStatus";
import { motion } from "framer-motion";

export default function Town() {
  const { pets, events, isConnected } = useGameWs();
  const [isTransparent, setIsTransparent] = useState(false);

  // Check URL params for OBS mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("transparent") === "true") {
      setIsTransparent(true);
      // Ensure body is also transparent if required by OBS setup
      document.body.style.backgroundColor = "transparent";
    }
  }, []);

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${isTransparent ? 'bg-transparent' : 'bg-meadow'}`}>
      
      {/* Background Decor (Only if not transparent) */}
      {!isTransparent && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Sun/Light source */}
          <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-yellow-100 rounded-full blur-[100px] opacity-70" />
          
          {/* Subtle rolling hills created with gradients */}
          <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-green-600/20 to-transparent blur-xl" />
          
          {/* Decorative floating particles */}
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-30"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight 
              }}
              animate={{ 
                y: [null, Math.random() * window.innerHeight - 100],
                opacity: [0.1, 0.4, 0.1]
              }}
              transition={{ 
                duration: 10 + Math.random() * 20, 
                repeat: Infinity,
                ease: "linear" 
              }}
            />
          ))}
        </div>
      )}

      {/* Global Event Banner */}
      <EventBanner events={events} />

      {/* UI Overlay Container */}
      <div className="absolute inset-0 pointer-events-none flex z-40">
        <Leaderboard pets={pets} />
      </div>

      {/* Pets Layer - Z-index is handled per pet inside PetEntity to create depth */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {pets.map(pet => (
          <PetEntity key={pet.username} pet={pet} />
        ))}
        
        {/* Empty State Fallback if no pets connected yet */}
        {pets.length === 0 && isConnected && !isTransparent && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="glass-panel px-8 py-6 rounded-3xl text-center flex flex-col items-center gap-4">
              <span className="text-4xl">🎮</span>
              <div>
                <h3 className="font-display font-bold text-2xl text-foreground mb-2">Город пуст!</h3>
                <p className="text-muted-foreground text-lg">Напишите <span className="font-mono bg-white/50 px-2 py-1 rounded-md text-primary font-bold">!spawn</span> в чате, чтобы начать.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Connection Status Widget */}
      <ConnectionStatus isConnected={isConnected} />
    </div>
  );
}
