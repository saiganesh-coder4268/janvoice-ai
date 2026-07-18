"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { useAuth } from "@/lib/auth/AuthContext";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import ThemeSwitcher from "./ThemeSwitcher";
import AvatarPicker from "./AvatarPicker";
import ProfileNavList from "./ProfileNavList";
import LogoutConfirmDialog from "./LogoutConfirmDialog";
import { LogOut } from "lucide-react";

export default function ProfilePanel() {
  const { isProfilePanelOpen, closeProfilePanel } = useUIStore();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isProfilePanelOpen) {
        if (showLogoutConfirm) setShowLogoutConfirm(false);
        else closeProfilePanel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProfilePanelOpen, showLogoutConfirm, closeProfilePanel]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    closeProfilePanel();
    logout();
  };

  return (
    <>
      <AnimatePresence>
        {isProfilePanelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeProfilePanel}
              className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Slide-in Panel */}
            <motion.div
              ref={panelRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 bottom-0 z-[101] flex w-full max-w-[400px] flex-col bg-background shadow-2xl border-l border-border"
              role="dialog"
              aria-modal="true"
              aria-label="User Profile"
            >
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <ProfileHeader />
                <ProfileStats />
                <ThemeSwitcher />
                <AvatarPicker />
                <ProfileNavList />
                
                {/* Logout Action */}
                <div className="p-6">
                  <button
                    onClick={handleLogoutClick}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 dark:border-red-900/30 dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}
