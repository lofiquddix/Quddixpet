import { useState, useEffect, useRef, useCallback } from "react";
import { type Pet, type WsMessage } from "@shared/schema";

export type PetWithAction = Pet & {
  lastActionData?: {
    action: string;
    result: string;
    scoreDelta: number;
    timestamp: number;
  };
};

export function useGameWs() {
  const [pets, setPets] = useState<Map<string, PetWithAction>>(new Map());
  const [events, setEvents] = useState<{ id: string; message: string }[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    // Connect to same host, wss if https, ws if http
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[Game WS] Connected");
      setIsConnected(true);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };

    ws.onclose = () => {
      console.log("[Game WS] Disconnected");
      setIsConnected(false);
      // Attempt reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = (error) => {
      console.error("[Game WS] Error", error);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WsMessage;
        
        switch (msg.type) {
          case 'state':
            setPets(prev => {
              const next = new Map(prev);
              msg.payload.pets.forEach(p => {
                // Keep existing action data if we already had this pet
                const existing = next.get(p.username);
                next.set(p.username, { ...p, lastActionData: existing?.lastActionData });
              });
              return next;
            });
            break;
            
          case 'spawn':
            setPets(prev => {
              const next = new Map(prev);
              next.set(msg.payload.username, msg.payload);
              return next;
            });
            addEvent(`✨ ${msg.payload.username} присоединяется к городу!`);
            break;
            
          case 'action':
            setPets(prev => {
              const next = new Map(prev);
              const pet = next.get(msg.payload.username);
              if (pet) {
                const scoreDelta = msg.payload.newScore - pet.score;
                next.set(msg.payload.username, {
                  ...pet,
                  score: msg.payload.newScore,
                  lastActionData: {
                    action: msg.payload.action,
                    result: msg.payload.result,
                    scoreDelta,
                    timestamp: Date.now()
                  }
                });
              }
              return next;
            });
            break;
            
          case 'event':
            addEvent(`🌟 ${msg.payload.message}`);
            break;
        }
      } catch (err) {
        console.error("[Game WS] Failed to parse message", err);
      }
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  const addEvent = (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setEvents(prev => [...prev, { id, message }]);
    
    // Remove event after 8 seconds
    setTimeout(() => {
      setEvents(prev => prev.filter(e => e.id !== id));
    }, 8000);
  };

  return {
    pets: Array.from(pets.values()),
    events,
    isConnected
  };
}
