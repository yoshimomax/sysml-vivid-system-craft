
import { useState, useCallback, RefObject } from "react";

interface UseZoomProps {
  minScale?: number;
  maxScale?: number;
  scaleStep?: number;
}

export const useZoom = ({
  minScale = 0.5,
  maxScale = 2,
  scaleStep = 0.1
}: UseZoomProps = {}) => {
  const [scale, setScale] = useState<number>(1);
  
  const zoomIn = useCallback(() => {
    setScale(prevScale => {
      const newScale = prevScale + scaleStep;
      return newScale > maxScale ? maxScale : newScale;
    });
  }, [scaleStep, maxScale]);
  
  const zoomOut = useCallback(() => {
    setScale(prevScale => {
      const newScale = prevScale - scaleStep;
      return newScale < minScale ? minScale : newScale;
    });
  }, [scaleStep, minScale]);
  
  const resetZoom = useCallback(() => {
    setScale(1);
  }, []);
  
  const handleWheelZoom = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  }, [zoomIn, zoomOut]);
  
  return {
    scale,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheelZoom,
    setScale
  };
};
