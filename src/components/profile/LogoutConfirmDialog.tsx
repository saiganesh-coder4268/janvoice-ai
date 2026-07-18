import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmDialog({ isOpen, onClose, onConfirm }: LogoutConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
            className="relative w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Sign out of JanVoice</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Are you sure you want to sign out? You will need to sign back in to submit complaints or vote on issues.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                Sign out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
