import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cat, Dog, Rabbit, Snail, Bird, Turtle, Sparkles } from "lucide-react";
import { PetWithAction } from "@/hooks/use-game-ws";
import { FloatingText } from "./FloatingText";

interface PetEntityProps {
  pet: PetWithAction;
}

// Maps pet strings to icons
const getPetIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'dog': return <Dog size={48} strokeWidth={1.5} className="text-amber-700" fill="#fcd34d" />;
    case 'bunny': return <Rabbit size={48} strokeWidth={1.5} className="text-pink-700" fill="#fbcfe8" />;
    case 'fox': return <Cat size={48} strokeWidth={1.5} className="text-orange-800" fill="#fb923c" />; // Using cat styled as fox
    case 'bird': return <Bird size={48} strokeWidth={1.5} className="text-sky-800" fill="#7dd3fc" />;
    case 'turtle': return <Turtle size={48} strokeWidth={1.5} className="text-emerald-900" fill="#6ee7b7" />;
    case 'cat':
    default: return <Cat size={48} strokeWidth={1.5} className="text-slate-800" fill="#cbd5e1" />;
  }
};

export function PetEntity({ pet }: PetEntityProps) {
  // Movement State
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  
  // Floating Texts State
  const [floatingTexts, setFloatingTexts] = useState<{id: string, text: string, type: 'positive'|'negative'|'neutral'}[]>([]);
  
  const lastActionTimestamp = useRef<number>(0);

  // Random wandering logic
  useEffect(() => {
    // Initial random position
    setPosition({
      x: 10 + Math.random() * 80, // Keep 10% away from edges
      y: 20 + Math.random() * 70, // Keep away from top/bottom edges
    });

    const moveInterval = setInterval(() => {
      setPosition(prev => {
        // Move by -15% to +15%
        const dx = (Math.random() - 0.5) * 30;
        const dy = (Math.random() - 0.5) * 20;
        
        let newX = prev.x + dx;
        let newY = prev.y + dy;
        
        // Clamp bounds
        newX = Math.max(5, Math.min(95, newX));
        newY = Math.max(15, Math.min(95, newY));
        
        // Flip based on direction
        if (dx > 0) setIsFlipped(false);
        else if (dx < 0) setIsFlipped(true);

        return { x: newX, y: newY };
      });
    }, 4000 + Math.random() * 4000); // Move every 4-8 seconds

    return () => clearInterval(moveInterval);
  }, []);

  // Handle incoming actions (animations & floating text)
  useEffect(() => {
    if (pet.lastActionData && pet.lastActionData.timestamp > lastActionTimestamp.current) {
      lastActionTimestamp.current = pet.lastActionData.timestamp;
      
      // Trigger jump
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500);

      // Add floating text
      const id = Math.random().toString(36).substr(2, 9);
      let type: 'positive' | 'negative' | 'neutral' = 'neutral';
      let text = pet.lastActionData.result;

      if (pet.lastActionData.scoreDelta > 0) {
        type = 'positive';
        text = `+${pet.lastActionData.scoreDelta} ${text}`;
      } else if (pet.lastActionData.scoreDelta < 0) {
        type = 'negative';
        text = `${pet.lastActionData.scoreDelta} ${text}`;
      }

      setFloatingTexts(prev => [...prev, { id, text, type }]);
    }
  }, [pet.lastActionData]);

  const removeFloatingText = (id: string) => {
    setFloatingTexts(prev => prev.filter(t => t.id !== id));
  };

  // Determine Z-index based on Y position for proper isometric sorting
  const zIndex = Math.floor(position.y * 10);

  return (
    <motion.div
      className="absolute flex flex-col items-center justify-end"
      initial={{ x: `${position.x}vw`, y: `${position.y}vh`, opacity: 0, scale: 0 }}
      animate={{ 
        x: `${position.x}vw`, 
        y: `${position.y}vh`, 
        opacity: 1, 
        scale: 1 
      }}
      transition={{ 
        x: { duration: 3, ease: "easeInOut" },
        y: { duration: 3, ease: "easeInOut" },
        opacity: { duration: 0.5 },
        scale: { duration: 0.5, type: "spring", bounce: 0.5 }
      }}
      style={{ 
        transform: 'translate(-50%, -100%)',
        zIndex 
      }}
    >
      {/* Floating Action Texts */}
      <AnimatePresence>
        {floatingTexts.map(ft => (
          <FloatingText key={ft.id} id={ft.id} text={ft.text} type={ft.type} onComplete={removeFloatingText} />
        ))}
      </AnimatePresence>

      {/* Username Tag */}
      <div className="mb-2 px-3 py-1 rounded-full glass-panel shadow-md">
        <span className="font-display font-bold text-sm text-foreground">
          {pet.username}
        </span>
      </div>

      {/* Pet Avatar with Jump & Flip Animation */}
      <motion.div
        animate={{ 
          scaleX: isFlipped ? -1 : 1,
          y: isJumping ? -30 : 0
        }}
        transition={{ 
          y: { type: "spring", stiffness: 300, damping: 10 },
          scaleX: { duration: 0.2 }
        }}
        className="relative group cursor-pointer"
      >
        {getPetIcon(pet.petType)}
        
        {/* Subtle shadow on ground */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-black/10 rounded-[100%] blur-[2px] -z-10" />
      </motion.div>

      {/* Score Tag */}
      <div className="mt-1 flex items-center gap-1 bg-yellow-400/90 text-yellow-950 px-2 py-0.5 rounded-full shadow-sm text-xs font-bold border border-yellow-200">
        <Sparkles size={10} />
        {pet.score}
      </div>
    </motion.div>
  );
}
