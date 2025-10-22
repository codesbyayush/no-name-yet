import { create } from 'zustand';
import type { Status } from '@/mock-data/status';

interface StatusState {
  // Data
  statuses: Status[];
  statusesById: Record<string, Status>;

  // Getters
  getAllStatuses: () => Status[];
  getStatusById: (id: string) => Status | undefined;
  searchStatuses: (query: string) => Status[];

  // Actions
  addStatus: (status: Status) => void;
  addStatuses: (statuses: Status[]) => void;
  updateStatus: (id: string, updatedStatus: Partial<Status>) => void;
  deleteStatus: (id: string) => void;
}

export const useStatusesStore = create<StatusState>((set, get) => ({
  // Initial state
  statuses: [],
  statusesById: {},

  // Getters
  getAllStatuses: () => get().statuses,

  getStatusById: (id: string) => get().statusesById[id],

  searchStatuses: (query: string) => {
    const lowerCaseQuery = query.toLowerCase();
    return get().statuses.filter((status) =>
      status.name.toLowerCase().includes(lowerCaseQuery)
    );
  },

  // Actions
  addStatus: (status: Status) => {
    set((state) => {
      const newStatuses = [...state.statuses, status];
      const newStatusesById = { ...state.statusesById, [status.id]: status };
      return {
        statuses: newStatuses,
        statusesById: newStatusesById,
      };
    });
  },

  addStatuses: (newStatuses: Status[]) => {
    set((state) => {
      // Merge new statuses with existing ones, avoiding duplicates by ID
      const existingIds = new Set(state.statuses.map((status) => status.id));
      const uniqueNewStatuses = newStatuses.filter(
        (status) => !existingIds.has(status.id)
      );
      const allStatuses = [...state.statuses, ...uniqueNewStatuses];

      // Create statusesById mapping
      const newStatusesById = { ...state.statusesById };
      for (const status of uniqueNewStatuses) {
        newStatusesById[status.id] = status;
      }

      return {
        statuses: allStatuses,
        statusesById: newStatusesById,
      };
    });
  },

  updateStatus: (id: string, updatedStatus: Partial<Status>) => {
    set((state) => {
      const newStatuses = state.statuses.map((status) =>
        status.id === id ? { ...status, ...updatedStatus } : status
      );

      const newStatusesById = { ...state.statusesById };
      if (newStatusesById[id]) {
        newStatusesById[id] = { ...newStatusesById[id], ...updatedStatus };
      }

      return {
        statuses: newStatuses,
        statusesById: newStatusesById,
      };
    });
  },

  deleteStatus: (id: string) => {
    set((state) => {
      const newStatuses = state.statuses.filter((status) => status.id !== id);
      const newStatusesById = { ...state.statusesById };
      delete newStatusesById[id];

      return {
        statuses: newStatuses,
        statusesById: newStatusesById,
      };
    });
  },
}));
