import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type Accent = 'default' | 'cinematic';

interface UIState {
  isProfilePanelOpen: boolean;
  theme: Theme;
  accent: Accent;
  selectedAvatarId: string;
  
  toggleProfilePanel: () => void;
  closeProfilePanel: () => void;
  openProfilePanel: () => void;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
  setAvatar: (avatarId: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isProfilePanelOpen: false,
      theme: 'system',
      accent: 'default',
      selectedAvatarId: 'game-avatar-01',
      
      toggleProfilePanel: () => set((state) => ({ isProfilePanelOpen: !state.isProfilePanelOpen })),
      closeProfilePanel: () => set({ isProfilePanelOpen: false }),
      openProfilePanel: () => set({ isProfilePanelOpen: true }),
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          if (theme === 'system') {
            document.documentElement.setAttribute('data-theme', 'light');
          } else {
            document.documentElement.setAttribute('data-theme', theme);
          }
        }
      },
      setAccent: (accent) => {
        set({ accent });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-accent', accent);
        }
      },
      setAvatar: (avatarId) => set({ selectedAvatarId: avatarId }),
    }),
    {
      name: 'janvoice_ui_settings',
      partialize: (state) => ({ theme: state.theme, accent: state.accent, selectedAvatarId: state.selectedAvatarId }), // Persist only these
      onRehydrateStorage: () => (state) => {
        // Run after hydration to ensure initial state is synced with DOM
        if (state && typeof document !== 'undefined') {
          state.setTheme(state.theme);
          state.setAccent(state.accent);
        }
      }
    }
  )
);
