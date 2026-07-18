"use client";

import { useUIStore } from "@/store/useUIStore";
import { useAuth } from "@/lib/auth/AuthContext";
import GameAvatar from "./GameAvatar";

export default function ProfileHeader() {
  const { user } = useAuth();
  const selectedAvatarId = useUIStore((state) => state.selectedAvatarId);

  // Role based on email or user metadata. Defaults to Citizen for demo.
  const isMP = user?.email?.includes("mp") || user?.role === "mp";
  const roleName = isMP ? "MP — Visakhapatnam East" : "Citizen";
  
  return (
    <div className="flex flex-col items-center justify-center p-6 border-b border-border">
      <div 
        className="relative w-24 h-24 bg-secondary dark:bg-slate-800 overflow-hidden mb-4 transition-all"
        style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
      >
        <GameAvatar avatarId={selectedAvatarId} size="profile" />
      </div>
      
      <h2 className="text-xl font-bold text-foreground mb-1">
        {user?.name || "Anonymous User"}
      </h2>
      
      <div className={`text-xs font-semibold px-3 py-1 rounded-full mb-3 ${
        isMP 
          ? "bg-brand-accent/15 text-brand-accent" 
          : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
      }`}>
        {roleName}
      </div>
      
      <button className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
        Edit Profile
      </button>
    </div>
  );
}
