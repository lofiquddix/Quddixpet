import { useState, useEffect, useRef, useCallback } from "react";
import type { Pet, WsMessage } from "@shared/schema";

export interface PetWithAction extends Pet {
  lastActionData?: {
    action: string;
    result: string;
    timestamp: number;
    scoreDelta: number;
  };
}

export interface GameEvent {
  id: string;
  message: string;
  timestamp: number;
}

export function useGameWs() {
  const [pets, setPets] = useState<PetWithAction[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    // Determine WS protocol based on current location
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[Game WS] Connected");
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log("[Game WS] Disconnected. Reconnecting in 3s...");
      setIsConnected(false);
      setTimeout(connect, 3000);
    };

    ws.onerror = (error) => {
      console.error("[Game WS] Error:", error);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WsMessage;
        
        switch (data.type) {
          case 'state':
            setPets(data.payload.pets);
            break;
            
          case 'spawn':
            setPets((prev) => {
              // Ensure no duplicates
              if (prev.some(p => p.username === data.payload.username)) return prev;
              return [...prev, data.payload];
            });
            break;
            
          case 'action':
            setPets((prev) => 
              prev.map(pet => {
                if (pet.username === data.payload.username) {
                  const scoreDelta = data.payload.newScore - pet.score;
                  return {
                    ...pet,
                    score: data.payload.newScore,
                    lastActionData: {
                      action: data.payload.action,
                      result: data.payload.result,
                      scoreDelta,
                      timestamp: Date.now()
                    }
                  };
                }
                return pet;
              })
            );
            break;
            
          case 'event':
            setEvents((prev) => [
              ...prev, 
              { id: Math.random().toString(36).substring(7), message: data.payload.message, timestamp: Date.now() }
            ]);
            break;
        }
      } catch (err) {
        console.error("[Game WS] Failed to parse message:", err);
      }
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Clean up old events after 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(prev => prev.filter(e => Date.now() - e.timestamp < 8000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return { pets, events, isConnected };
}
