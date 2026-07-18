"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Bell, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import ProfilePanel from "../profile/ProfilePanel";
import GameAvatar from "../profile/GameAvatar";
import { useUIStore } from "@/store/useUIStore";

export interface Tab {
  name: string;
  href: string;
}

interface TopBarProps {
  tabs?: Tab[];
}

export default function TopBar({ tabs = [] }: TopBarProps) {
  const pathname = usePathname();
  const { user, signInWithGoogle } = useAuth();
  const { toggleProfilePanel, selectedAvatarId } = useUIStore();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
        <div className="flex h-[72px] items-center pl-7 md:pl-8 pr-4 md:pr-6">
          {/* Logo Section */}
          <Link href="/" className="flex items-center shrink-0 mr-12 md:mr-[60px] h-[48px] md:h-[56px]">
            {/* Mobile view: crop the wordmark */}
            <div className="sm:hidden h-full w-[48px] overflow-hidden">
              <img 
                src="/janvoice-logo-sticker.png" 
                alt="JanVoice Logo" 
                className="h-full max-w-none object-left"
              />
            </div>
            {/* Desktop view: full logo */}
            <div className="hidden sm:flex h-full items-center justify-start">
              <img 
                src="/janvoice-logo-sticker.png" 
                alt="JanVoice Logo" 
                className="h-full w-auto object-contain object-left"
              />
            </div>
          </Link>

          {/* Tabs Section */}
          <nav className="flex flex-1 items-center gap-1 h-full overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  onMouseEnter={() => setHoveredTab(tab.name)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`relative px-4 flex items-center h-full text-sm font-medium transition-colors ${
                    isActive ? "text-brand-accent" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.name}
                  {isActive && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  {hoveredTab === tab.name && !isActive && (
                    <motion.div
                      layoutId="hover-tab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4 ml-auto">
            <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
              <Search className="h-5 w-5" />
            </Link>
            
            <Link href="/notifications" className="text-muted-foreground hover:text-foreground transition-colors relative flex items-center justify-center">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
            </Link>
            
            <div className="flex items-center gap-2 border-l border-border pl-4 ml-2">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground hidden sm:block">{user.name}</span>
                  <button 
                  onClick={toggleProfilePanel}
                  className="flex items-center justify-center h-10 w-10 overflow-hidden bg-secondary dark:bg-slate-800 text-brand-accent hover:brightness-110 transition-all"
                  title="Profile"
                  style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                >
                  <GameAvatar avatarId={selectedAvatarId} size="topbar" />
                </button>
                </div>
              ) : (
                <button 
                  onClick={() => signInWithGoogle()}
                  className="text-sm font-medium text-brand-accent hover:opacity-80 transition-opacity bg-brand-accent/10 px-3 py-1.5 rounded-md"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <ProfilePanel />
    </>
  );
}
