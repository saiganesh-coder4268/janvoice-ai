"use client";

import { useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import GameAvatar, { GAME_AVATAR_IDS } from "./GameAvatar";

const FEATURED_AVATAR_IDS = [
  "game-avatar-01",
  "game-avatar-03",
  "game-avatar-05",
  "game-avatar-10",
  "game-avatar-17",
  "game-avatar-25",
];

export default function AvatarPicker() {
  const { selectedAvatarId, setAvatar } = useUIStore();
  const [showAllAvatars, setShowAllAvatars] = useState(false);
  const visibleAvatarIds = showAllAvatars ? GAME_AVATAR_IDS : FEATURED_AVATAR_IDS;

  return (
    <div className="p-6 border-b border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">Choose your avatar</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {visibleAvatarIds.map((avatarId) => {
          const isSelected = selectedAvatarId === avatarId;
          const avatarNumber = Number.parseInt(avatarId.slice(-2), 10);
          
          return (
            <motion.button
              key={avatarId}
              onClick={() => setAvatar(avatarId)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className={`relative overflow-hidden aspect-square transition-all ${
                isSelected ? "ring-2 ring-brand-accent ring-offset-2 ring-offset-background" : "hover:brightness-110"
              }`}
              style={{
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
              }}
            >
              <GameAvatar avatarId={avatarId} size="picker" />
              
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 bg-brand-accent/20 flex items-center justify-center backdrop-blur-[1px]"
                >
                  <div className="bg-brand-accent text-brand-accent-foreground rounded-full p-1 shadow-sm">
                    <Check className="w-4 h-4" />
                  </div>
                </motion.div>
              )}
              <span className="sr-only">Choose avatar {avatarNumber}</span>
            </motion.button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setShowAllAvatars((isVisible) => !isVisible)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        aria-expanded={showAllAvatars}
      >
        {showAllAvatars ? "Show fewer avatars" : "More avatars"}
        <ChevronDown className={`h-4 w-4 transition-transform ${showAllAvatars ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}
