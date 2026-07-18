"use client";

import { useUIStore } from "@/store/useUIStore";
import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { motion } from "framer-motion";

const THEME_OPTIONS = [
  { id: "light", icon: Sun, label: "Light" },
  { id: "dark", icon: Moon, label: "Dark" },
  { id: "system", icon: Monitor, label: "System" },
] as const;

export default function ThemeSwitcher() {
  const { theme, setTheme } = useUIStore();

  return (
    <div className="p-6 border-b border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">Appearance</h3>
      
      {/* Light / Dark / System Toggle */}
      <div className="flex items-center p-1 bg-secondary rounded-lg mb-4">
        {THEME_OPTIONS.map((t) => {
          const isActive = theme === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors z-10 ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
              {isActive && (
                <motion.div
                  layoutId="theme-bubble"
                  className="absolute inset-0 bg-background shadow-sm rounded-md -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
