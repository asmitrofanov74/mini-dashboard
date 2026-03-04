import { create } from "zustand";
import {
  persist,
  subscribeWithSelector,
  createJSONStorage,
} from "zustand/middleware";

interface Filters {
  q: string;
  status: "all" | "active" | "paused";
}
interface UiState {
  theme: "light" | "dark";
  filters: Filters;
  page: number;
  pageSize: number;
  setTheme: (theme: "light" | "dark") => void;
  setFilters: (filters: Partial<Filters>) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      theme: "light",
      filters: { q: "", status: "all" },
      page: 1,
      pageSize: 50,
      setTheme: (theme) => set({ theme }),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          page: 1,
        })),
      setPage: (page) => set({ page }),
      setPageSize: (size) => set({ page: 1, pageSize: size }),
    })),
    {
      name: "ui-persist",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme, filters: s.filters }),
    }
  )
);

export const useFilters = () => useUiStore((s) => s.filters);
export const usePagination = () =>
  useUiStore((s) => ({ page: s.page, pageSize: s.pageSize }));
export const useTheme = () => useUiStore((s) => s.theme);
export const useSetFilters = () => useUiStore((s) => s.setFilters);
export const useSetPageSize = () => useUiStore((s) => s.setPageSize);
