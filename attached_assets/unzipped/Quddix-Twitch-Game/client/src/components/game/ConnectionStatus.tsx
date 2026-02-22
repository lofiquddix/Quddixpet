import { motion } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";

export function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full glass-panel shadow-sm text-sm font-semibold transition-colors duration-300 ${isConnected ? 'text-emerald-600 border-emerald-200' : 'text-destructive border-destructive/20'}`}
    >
      {isConnected ? (
        <>
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          Connected
        </>
      ) : (
        <>
          <WifiOff size={16} />
          Reconnecting...
        </>
      )}
    </motion.div>
  );
}
