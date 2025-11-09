import { create } from 'zustand';

export interface FilterState {
  // Filter options
  filters: {
    status: string[];
    assignee: string[];
    priority: string[];
    labels: string[];
    board: string[];
  };

  // Actions
  setFilter: (
    type: 'status' | 'assignee' | 'priority' | 'labels' | 'board',
    ids: string[],
  ) => void;
  toggleFilter: (
    type: 'status' | 'assignee' | 'priority' | 'labels' | 'board',
    id: string,
  ) => void;
  clearFilters: () => void;
  clearFilterType: (
    type: 'status' | 'assignee' | 'priority' | 'labels' | 'board',
  ) => void;

  // Utility
  hasActiveFilters: () => boolean;
  getActiveFiltersCount: () => number;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  // Initial state
  filters: {
    status: [],
    assignee: [],
    priority: [],
    labels: [],
    board: [],
  },

  // Actions
  setFilter: (type, ids) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [type]: ids,
      },
    }));
  },

  toggleFilter: (type, id) => {
    set((state) => {
      const currentFilters = state.filters[type];
      const newFilters = currentFilters.includes(id)
        ? currentFilters.filter((item) => item !== id)
        : [...currentFilters, id];

      return {
        filters: {
          ...state.filters,
          [type]: newFilters,
        },
      };
    });
  },

  clearFilters: () => {
    set({
      filters: {
        status: [],
        assignee: [],
        priority: [],
        labels: [],
        board: [],
      },
    });
  },

  clearFilterType: (type) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [type]: [],
      },
    }));
  },

  // Utility
  hasActiveFilters: () => {
    const { filters } = get();
    return Object.values(filters).some((filterArray) => filterArray.length > 0);
  },

  getActiveFiltersCount: () => {
    const { filters } = get();
    return Object.values(filters).reduce((acc, curr) => acc + curr.length, 0);
  },
}));
