import { Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-6 right-6 pointer-events-auto"
    >
      <div className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-full glass-panel transition-all duration-300",
        isConnected ? "border-green-400/50 shadow-[0_0_15px_rgba(74,222,128,0.2)]" : "border-red-400/50 bg-red-500/10"
      )}>
        <div className="relative">
          {isConnected ? (
            <Wifi size={16} className="text-green-500" />
          ) : (
            <WifiOff size={16} className="text-red-500 animate-pulse" />
          )}
          {isConnected && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
          )}
        </div>
        <span className={clsx(
          "text-xs font-bold font-display uppercase tracking-wider",
          isConnected ? "text-green-700" : "text-red-600"
        )}>
          {isConnected ? "В сети" : "Переподключение..."}
        </span>
      </div>
    </motion.div>
  );
}
