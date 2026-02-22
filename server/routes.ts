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
          const expGain = 20;
          let newExp = pet.experience + expGain;
          let newLevel = pet.level;
          let levelUp = false;
          
          const expNeeded = newLevel * 100;
          if (newExp >= expNeeded) {
            newExp -= expNeeded;
            newLevel += 1;
            levelUp = true;
          }

          const newScore = pet.score + 10;
          await storage.updatePet(pet.id, { score: newScore, experience: newExp, level: newLevel });
          
          broadcast({ 
            type: 'action', 
            payload: { 
              username, 
              action: 'work', 
              result: levelUp ? `Уровень UP! (${newLevel})` : `+10 монет, +${expGain} опыта`, 
              newScore,
              newLevel,
              newExp
            } 
          });
        }
      } else if (command === '!heal') {
        if (pet) {
          const cost = 50;
          if (pet.score >= cost) {
            const newHealth = 100;
            const newScore = pet.score - cost;
            await storage.updatePet(pet.id, { score: newScore, health: newHealth });
            broadcast({ 
              type: 'action', 
              payload: { username, action: 'heal', result: 'Полностью здоров!', newScore, newHealth } 
            });
          } else {
             broadcast({ type: 'event', payload: { message: `@${username}, недостаточно монет для лечения (нужно 50)` } });
          }
        }
      } else if (command === '!top') {
        const topPets = await storage.getPets();
        const topList = topPets
          .sort((a, b) => b.level - a.level || b.score - a.score)
          .slice(0, 5)
          .map((p, i) => `${i+1}. ${p.username} (Ур. ${p.level})`)
          .join(', ');
        broadcast({ type: 'event', payload: { message: `Топ игроков: ${topList}` } });
      } else if (command === '!dance') {
         if (pet) {
            broadcast({ 
              type: 'action', 
              payload: { username, action: 'dance', result: 'Танцует!', newScore: pet.score } 
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
              await storage.updatePet(pet.id, { score: newScore });
              broadcast({ 
                type: 'action', 
                payload: { username, action: 'attack_win', result: `победил ${targetUsername}! +20`, newScore } 
              });
              const targetNewScore = Math.max(0, targetPet.score - 10);
              const targetNewHealth = Math.max(0, targetPet.health - 20);
              await storage.updatePet(targetPet.id, { score: targetNewScore, health: targetNewHealth });
              broadcast({ 
                type: 'action', 
                payload: { username: targetUsername, action: 'attack_lose', result: `проиграл ${username}! -10`, newScore: targetNewScore, newHealth: targetNewHealth } 
              });
            } else {
              const newScore = Math.max(0, pet.score - 10);
              const newHealth = Math.max(0, pet.health - 10);
              await storage.updatePet(pet.id, { score: newScore, health: newHealth });
              broadcast({ 
                type: 'action', 
                payload: { username, action: 'attack_fail', result: `неудачно напал на ${targetUsername}! -10`, newScore, newHealth } 
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
