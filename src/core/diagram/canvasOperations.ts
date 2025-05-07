
import { useModelingStore } from "../../store/modelingStore";

/**
 * Get the current state
 */
function getState() {
  return useModelingStore.getState();
}

/**
 * Zoom in on the canvas
 */
function zoomIn() {
  const state = useModelingStore.getState();
  const currentScale = state.scale;
  const maxScale = 2;
  const step = 0.1;
  
  const newScale = Math.min(currentScale + step, maxScale);
  state.setScale(newScale);
}

/**
 * Zoom out on the canvas
 */
function zoomOut() {
  const state = useModelingStore.getState();
  const currentScale = state.scale;
  const minScale = 0.5;
  const step = 0.1;
  
  const newScale = Math.max(currentScale - step, minScale);
  state.setScale(newScale);
}

export const canvasOperations = {
  getState,
  zoomIn,
  zoomOut
};
