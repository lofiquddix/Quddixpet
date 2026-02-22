import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cat, Dog, Rabbit, Bird, Turtle, Sparkles, Star } from "lucide-react";
import { PetWithAction } from "@/hooks/use-game-ws";
import { FloatingText } from "./FloatingText";

interface PetEntityProps {
  pet: PetWithAction;
}

// Maps pet strings to beautiful styled icons
const getPetIcon = (type: string) => {
  const iconProps = { size: 64, strokeWidth: 2.5 };
  switch (type.toLowerCase()) {
    case 'dog': 
      return <Dog {...iconProps} className="text-amber-700 drop-shadow-md" fill="#fde68a" />;
    case 'bunny': 
      return <Rabbit {...iconProps} className="text-pink-700 drop-shadow-md" fill="#fbcfe8" />;
    case 'fox': 
      // Using a warm colored cat as a fox alternative since standard icons don't have fox
      return <Cat {...iconProps} className="text-orange-900 drop-shadow-md" fill="#fdba74" />;
    case 'bird': 
      return <Bird {...iconProps} className="text-sky-800 drop-shadow-md" fill="#bae6fd" />;
    case 'turtle': 
      return <Turtle {...iconProps} className="text-emerald-900 drop-shadow-md" fill="#a7f3d0" />;
    case 'cat':
    default: 
      return <Cat {...iconProps} className="text-slate-800 drop-shadow-md" fill="#e2e8f0" />;
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

  // Random wandering logic - bound to screen safe areas
  useEffect(() => {
    // Initial safe random position
    setPosition({
      x: 10 + Math.random() * 80, // Keep away from left/right edges
      y: 20 + Math.random() * 70, // Keep away from top/bottom edges
    });

    const moveInterval = setInterval(() => {
      setPosition(prev => {
        // Move by -15vw to +15vw
        const dx = (Math.random() - 0.5) * 30;
        const dy = (Math.random() - 0.5) * 20;
        
        let newX = prev.x + dx;
        let newY = prev.y + dy;
        
        // Clamp bounds securely within the viewport percentage
        newX = Math.max(5, Math.min(95, newX));
        newY = Math.max(15, Math.min(90, newY));
        
        // Flip avatar direction based on movement
        if (dx > 0) setIsFlipped(false);
        else if (dx < 0) setIsFlipped(true);

        return { x: newX, y: newY };
      });
    }, 3000 + Math.random() * 5000); // Random interval between 3-8 seconds

    return () => clearInterval(moveInterval);
  }, []);

  // Handle incoming actions (triggers jump animations & floating text)
  useEffect(() => {
    if (pet.lastActionData && pet.lastActionData.timestamp > lastActionTimestamp.current) {
      lastActionTimestamp.current = pet.lastActionData.timestamp;
      
      // Trigger expressive jump
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 600);

      // Construct floating text
      const id = Math.random().toString(36).substring(2, 9);
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

  // Z-index based on Y position creates fake isometric depth
  const zIndex = Math.floor(position.y * 10);

  return (
    <motion.div
      className="absolute flex flex-col items-center justify-end pointer-events-auto"
      initial={{ x: `${position.x}vw`, y: `${position.y}vh`, opacity: 0, scale: 0 }}
      animate={{ 
        x: `${position.x}vw`, 
        y: `${position.y}vh`, 
        opacity: 1, 
        scale: 1 
      }}
      transition={{ 
        x: { duration: 4, ease: "easeInOut" },
        y: { duration: 4, ease: "easeInOut" },
        opacity: { duration: 0.8 },
        scale: { duration: 0.6, type: "spring", bounce: 0.4 }
      }}
      style={{ 
        transform: 'translate(-50%, -100%)',
        zIndex 
      }}
    >
      {/* Container for Floating Texts */}
      <div className="relative w-full">
        <AnimatePresence>
          {floatingTexts.map(ft => (
            <FloatingText key={ft.id} id={ft.id} text={ft.text} type={ft.type} onComplete={removeFloatingText} />
          ))}
        </AnimatePresence>
      </div>

      {/* Nickname Tag */}
      <div className="mb-3 px-4 py-1.5 rounded-2xl glass-panel border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform hover:scale-110">
        <span className="font-display font-bold text-base text-foreground tracking-wide">
          {pet.username}
        </span>
      </div>

      {/* Pet Avatar with Jump & Flip Animation */}
      <motion.div
        animate={{ 
          scaleX: isFlipped ? -1 : 1,
          y: isJumping ? -40 : 0,
          rotate: isJumping ? (isFlipped ? 10 : -10) : 0
        }}
        transition={{ 
          y: { type: "spring", stiffness: 400, damping: 12 },
          rotate: { type: "spring", stiffness: 300, damping: 10 },
          scaleX: { duration: 0.3 }
        }}
        className="relative group cursor-pointer"
        whileHover={{ scale: 1.1 }}
      >
        {getPetIcon(pet.petType)}
        
        {/* Ground shadow that shrinks when jumping */}
        <motion.div 
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/20 rounded-[100%] blur-[3px] -z-10"
          animate={{
            scale: isJumping ? 0.4 : 1,
            opacity: isJumping ? 0.3 : 1
          }}
        />
      </motion.div>

      {/* Score Badge */}
      <motion.div 
        className="mt-2 flex items-center gap-1.5 bg-gradient-to-r from-amber-300 to-yellow-500 text-yellow-950 px-3 py-1 rounded-full shadow-lg border-2 border-yellow-200"
        whileHover={{ y: -2 }}
      >
        <Star size={14} className="fill-yellow-100 text-yellow-100" />
        <span className="font-bold text-sm font-display leading-none pb-0.5">{pet.score}</span>
      </motion.div>
    </motion.div>
  );
}
