import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { WebSocketServer, WebSocket } from "ws";
import tmi from "tmi.js";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', async (ws) => {
    clients.add(ws);
    const allPets = await storage.getPets();
    ws.send(JSON.stringify({ type: 'state', payload: { pets: allPets } }));
    
    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  const broadcast = (message: any) => {
    const msgString = JSON.stringify(message);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msgString);
      }
    }
  };

  app.get(api.pets.list.path, async (req, res) => {
    const pets = await storage.getPets();
    res.json(pets);
  });

  const client = new tmi.Client({
    channels: [ 'quddix' ]
  });

  client.connect().catch(console.error);

  client.on('message', async (channel, tags, message, self) => {
    if (self) return;
    const username = tags.username;
    const displayName = tags['display-name'] || username;
    if (!username) return;

    const args = message.toLowerCase().split(' ');
    const command = args[0];

    try {
      let pet = await storage.getPetByUsername(username);

      if (command === '!spawn') {
        if (!pet) {
          const types = ['cat', 'dog', 'bunny', 'fox'];
          const randomType = types[Math.floor(Math.random() * types.length)];
          pet = await storage.createPet({ username, petType: randomType, score: 0 });
          broadcast({ type: 'spawn', payload: pet });
        }
      } else if (command === '!work') {
        if (pet) {
          const newScore = pet.score + 10;
          await storage.updatePetScore(pet.id, newScore);
          broadcast({ 
            type: 'action', 
            payload: { username, action: 'work', result: '+10', newScore } 
          });
        }
      } else if (command === '!dance') {
         if (pet) {
            broadcast({ 
              type: 'action', 
              payload: { username, action: 'dance', result: 'dancing!', newScore: pet.score } 
            });
         }
      } else if (command === '!attack') {
        if (pet && args[1]) {
          const targetUsername = args[1].replace('@', '');
          const targetPet = await storage.getPetByUsername(targetUsername);
          if (targetPet && targetUsername !== username) {
            const win = Math.random() > 0.5;
            if (win) {
              const newScore = pet.score + 20;
              const targetNewScore = Math.max(0, targetPet.score - 10);
              await storage.updatePetScore(pet.id, newScore);
              await storage.updatePetScore(targetPet.id, targetNewScore);
              broadcast({ 
                type: 'action', 
                payload: { username, action: 'attack_win', result: `победил ${targetUsername}! +20`, newScore } 
              });
              broadcast({ 
                type: 'action', 
                payload: { username: targetUsername, action: 'attack_lose', result: `проиграл ${username}! -10`, newScore: targetNewScore } 
              });
            } else {
              const newScore = Math.max(0, pet.score - 10);
              await storage.updatePetScore(pet.id, newScore);
              broadcast({ 
                type: 'action', 
                payload: { username, action: 'attack_fail', result: `неудачно напал на ${targetUsername}! -10`, newScore } 
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Error processing twitch command", err);
    }
  });

  setInterval(() => {
    const events = ['Идет дождь! Питомцы прячутся.', 'На поляне появился странствующий торговец!', 'Время вечеринки!'];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    broadcast({ type: 'event', payload: { message: randomEvent } });
  }, 120000); // every 2 minutes

  return httpServer;
}
