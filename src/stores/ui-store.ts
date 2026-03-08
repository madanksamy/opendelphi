import { create } from "zustand";

export type PreviewMode = "desktop" | "tablet" | "mobile";
export type Theme = "light" | "dark" | "system";

interface UIState {
  sidebarOpen: boolean;
  previewMode: PreviewMode;
  theme: Theme;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  previewMode: "desktop",
  theme: "system",

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  setTheme: (theme) => set({ theme }),
}));
