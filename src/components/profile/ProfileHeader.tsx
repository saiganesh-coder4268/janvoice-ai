"use client";

import { useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { useAuth } from "@/lib/auth/AuthContext";
import GameAvatar from "./GameAvatar";
import { Check, X, Edit2 } from "lucide-react";

export default function ProfileHeader() {
  const { user, updateName } = useAuth();
  const selectedAvatarId = useUIStore((state) => state.selectedAvatarId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Role based on email or user metadata. Defaults to Citizen for demo.
  const isMP = user?.email?.includes("mp") || user?.role === "mp";
  const roleName = isMP ? "MP — Visakhapatnam East" : "Citizen";
  
  const handleEditClick = () => {
    setEditName(user?.name || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName("");
  };

  const handleSave = async () => {
    if (!editName.trim() || editName === user?.name) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await updateName(editName.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update name", error);
      // Optional: show a toast error here
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-6 border-b border-border">
      <div 
        className="relative w-24 h-24 bg-secondary dark:bg-slate-800 overflow-hidden mb-4 transition-all"
        style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
      >
        <GameAvatar avatarId={selectedAvatarId} size="profile" />
      </div>
      
      {isEditing ? (
        <div className="flex items-center gap-2 mb-2 w-full max-w-[250px]">
          <input 
            type="text" 
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            disabled={isSaving}
            className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm font-semibold text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="p-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors disabled:opacity-50"
            title="Save"
          >
            <Check className="w-4 h-4" />
          </button>
          <button 
            onClick={handleCancel}
            disabled={isSaving}
            className="p-1.5 bg-secondary text-muted-foreground rounded-md hover:bg-secondary/80 hover:text-foreground transition-colors disabled:opacity-50"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2 group">
          {user?.name || "Anonymous User"}
        </h2>
      )}
      
      <div className={`text-xs font-semibold px-3 py-1 rounded-full mb-3 ${
        isMP 
          ? "bg-brand-accent/15 text-brand-accent" 
          : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
      }`}>
        {roleName}
      </div>
      
      {!isEditing && (
        <button 
          onClick={handleEditClick}
          className="text-sm text-muted-foreground flex items-center gap-1.5 hover:text-foreground transition-colors font-medium"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Profile
        </button>
      )}
    </div>
  );
}
