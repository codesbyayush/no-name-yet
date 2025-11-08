import { create } from 'zustand';

interface CreateIssueState {
  isOpen: boolean;
  // Default status key here is so that if we click the add icon from any other status we can set the status key in modal directly from here
  defaultStatusKey: string;

  // Actions
  openModal: (statusKey?: string) => void;
  closeModal: () => void;
}

export const useCreateIssueStore = create<CreateIssueState>((set) => ({
  // Initial state
  isOpen: false,
  defaultStatusKey: 'to-do',
  // Actions
  openModal: (statusKey) =>
    set({ isOpen: true, defaultStatusKey: statusKey || 'to-do' }),
  closeModal: () => set({ isOpen: false }),
}));
