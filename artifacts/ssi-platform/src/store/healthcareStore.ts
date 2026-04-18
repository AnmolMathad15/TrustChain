import { create } from "zustand";
import type { RecordFilter, MedicalRecord } from "../types/healthcare";

interface HealthcareStore {
  activeFilter: RecordFilter;
  expandedRecordId: string | null;
  isShareModalOpen: boolean;
  aiExplainingId: string | null;
  aiExplanations: Record<string, string>;

  setFilter: (f: RecordFilter) => void;
  toggleRecord: (id: string) => void;
  openShareModal: () => void;
  closeShareModal: () => void;
  setAiExplaining: (id: string | null) => void;
  setAiExplanation: (id: string, text: string) => void;
}

export const useHealthcareStore = create<HealthcareStore>((set) => ({
  activeFilter: "all",
  expandedRecordId: null,
  isShareModalOpen: false,
  aiExplainingId: null,
  aiExplanations: {},

  setFilter: (activeFilter) => set({ activeFilter }),
  toggleRecord: (id) =>
    set((s) => ({
      expandedRecordId: s.expandedRecordId === id ? null : id,
    })),
  openShareModal: () => set({ isShareModalOpen: true }),
  closeShareModal: () => set({ isShareModalOpen: false }),
  setAiExplaining: (aiExplainingId) => set({ aiExplainingId }),
  setAiExplanation: (id, text) =>
    set((s) => ({ aiExplanations: { ...s.aiExplanations, [id]: text } })),
}));
