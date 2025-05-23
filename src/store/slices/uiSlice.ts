
import { StateCreator } from 'zustand';
import { ModelingState, UIState } from '../types/storeTypes';

// UI state slice
export const createUISlice: StateCreator<
  ModelingState,
  [],
  [],
  UIState
> = (set) => ({
  // State
  isDragging: false,
  scale: 1,
  
  // Actions
  startDragging: () => set({ isDragging: true }),
  stopDragging: () => set({ isDragging: false }),
  setScale: (scale) => set({ scale })
});
