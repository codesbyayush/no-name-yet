import { create } from 'zustand';

interface CreateIssueState {
  isOpen: boolean;
  defaultStatusKey: string;

  // Actions
  openModal: (statusKey?: string) => void;
  closeModal: () => void;
  setDefaultStatus: (statusKey: string) => void;
}

export const useCreateIssueStore = create<CreateIssueState>((set) => ({
  // Initial state
  isOpen: false,
  defaultStatusKey: 'to-do',
  // Actions
  openModal: (statusKey) =>
    set({ isOpen: true, defaultStatusKey: statusKey || 'to-do' }),
  closeModal: () => set({ isOpen: false }),
  setDefaultStatus: (statusKey) => set({ defaultStatusKey: statusKey }),
}));
