import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ModalState {
  isOpen: boolean;
  view: React.ReactNode | null;
  modalId: string | null;
  openModal: (modalId: string, view: React.ReactNode) => void;
  closeModal: () => void;
}

export const useUIStore = create<ModalState>()(
  devtools(
    (set) => ({
      isOpen: false,
      view: null,
      modalId: null,
      openModal: (modalId, view) => set({ isOpen: true, modalId, view }),
      closeModal: () => set({ isOpen: false, modalId: null, view: null }),
    }),
    { name: "ui-store" }
  )
);
