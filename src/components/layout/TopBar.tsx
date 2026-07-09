"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Bell, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export interface Tab {
  name: string;
  href: string;
}

interface TopBarProps {
  tabs?: Tab[];
}

export default function TopBar({ tabs = [] }: TopBarProps) {
  const pathname = usePathname();
  const { user, signInWithGoogle, logout } = useAuth();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Logo Section */}
        <div className="flex flex-col mr-8 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">J</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-slate-900">
                JanVoice AI
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                Civic Intelligence Platform
              </span>
            </div>
          </Link>
        </div>

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
                  isActive ? "text-blue-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.name}
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                {hoveredTab === tab.name && !isActive && (
                  <motion.div
                    layoutId="hover-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-200"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-4 ml-auto">
          <Link href="/search" className="text-slate-500 hover:text-slate-900 transition-colors">
            <Search className="h-5 w-5" />
          </Link>
          
          <Link href="/notifications" className="text-slate-500 hover:text-slate-900 transition-colors relative flex items-center justify-center">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
          </Link>
          
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-2">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
                <button 
                  onClick={() => logout()}
                  className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                  title="Sign out"
                >
                  <UserIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => signInWithGoogle()}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-md"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
