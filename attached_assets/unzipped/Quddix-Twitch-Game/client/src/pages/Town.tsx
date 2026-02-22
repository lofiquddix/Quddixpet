import { useEffect, useState } from "react";
import { useGameWs } from "@/hooks/use-game-ws";
import { PetEntity } from "@/components/game/PetEntity";
import { Leaderboard } from "@/components/game/Leaderboard";
import { EventBanner } from "@/components/game/EventBanner";
import { ConnectionStatus } from "@/components/game/ConnectionStatus";

export default function Town() {
  const { pets, events, isConnected } = useGameWs();
  const [isTransparent, setIsTransparent] = useState(false);

  // Check URL params for OBS mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("transparent") === "true") {
      setIsTransparent(true);
    }
  }, []);

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${isTransparent ? 'bg-transparent' : 'bg-meadow'}`}>
      
      {/* Background Decor (Only if not transparent) */}
      {!isTransparent && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-[100px] opacity-60" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] opacity-40" />
        </div>
      )}

      {/* Global Event Banner */}
      <EventBanner events={events} />

      {/* UI Overlay Container */}
      <div className="absolute inset-0 pointer-events-none flex z-40">
        <div className="flex-1">
          <Leaderboard pets={pets} />
        </div>
      </div>

      {/* Pets Layer - z-index is handled per pet for isometric illusion */}
      <div className="absolute inset-0 pointer-events-none">
        {pets.map(pet => (
          <PetEntity key={pet.username} pet={pet} />
        ))}
      </div>

      {/* Connection Status Widget */}
      <ConnectionStatus isConnected={isConnected} />
    </div>
  );
}
