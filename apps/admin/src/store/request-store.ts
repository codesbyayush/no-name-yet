import { create } from 'zustand';

export type RequestSortBy = 'newest' | 'oldest' | 'votes';

interface RequestState {
  // Search
  isSearchOpen: boolean;
  searchQuery: string;

  // Sorting
  sortBy: RequestSortBy;

  // Search actions
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
  resetSearch: () => void;

  // Sort actions
  setSortBy: (sortBy: RequestSortBy) => void;
}

export const useRequestStore = create<RequestState>((set) => ({
  // Initial state
  isSearchOpen: false,
  searchQuery: '',
  sortBy: 'newest',

  // Search actions
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  resetSearch: () => set({ isSearchOpen: false, searchQuery: '' }),

  // Sort actions
  setSortBy: (sortBy: RequestSortBy) => set({ sortBy }),
}));
