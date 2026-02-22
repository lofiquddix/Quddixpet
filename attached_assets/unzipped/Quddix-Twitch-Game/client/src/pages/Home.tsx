import { useLocation } from "wouter";
import { Play, Settings, MonitorPlay } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [_, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-meadow flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="max-w-md w-full glass-panel rounded-3xl p-8 flex flex-col items-center text-center gap-6"
      >
        <div className="bg-primary/10 p-4 rounded-full border border-primary/20">
          <MonitorPlay size={48} className="text-primary" />
        </div>
        
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Stream Town
          </h1>
          <p className="text-muted-foreground font-body">
            Interactive Twitch overlay where your chat becomes pets in a virtual town.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3 mt-4">
          <button
            onClick={() => setLocation('/town')}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Play className="fill-current group-hover:scale-110 transition-transform" />
            Launch Game (Browser)
          </button>
          
          <button
            onClick={() => setLocation('/town?transparent=true')}
            className="w-full bg-white/50 hover:bg-white/80 border border-white text-foreground font-bold py-4 px-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Settings className="group-hover:rotate-90 transition-transform duration-500" />
            Launch for OBS (Transparent)
          </button>
        </div>

        <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-sm text-blue-800 text-left w-full">
          <h3 className="font-bold mb-1 font-display flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> 
            OBS Setup Guide
          </h3>
          <ol className="list-decimal pl-4 space-y-1 mt-2 font-medium">
            <li>Add a "Browser" source in OBS</li>
            <li>Set URL to <code className="bg-white px-1 rounded text-xs">{window.location.origin}/town?transparent=true</code></li>
            <li>Set Width to 1920, Height to 1080</li>
          </ol>
        </div>
      </motion.div>
    </div>
  );
}
