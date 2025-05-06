
import { useState, useCallback } from "react";
import { Element, Position, Size } from "../model/types";
import { useModelingStore } from "../store/modelingStore";

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'se' | 'sw' | 'nw';

export const useElementResize = () => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [initialElement, setInitialElement] = useState<{position: Position, size: Size} | null>(null);
  const [initialMousePos, setInitialMousePos] = useState<Position | null>(null);

  const updateElement = useModelingStore(state => state.updateElement);
  const scale = useModelingStore(state => state.scale);

  // Start resizing process
  const startResize = useCallback((
    e: React.MouseEvent, 
    element: Element, 
    handle: ResizeHandle,
    canvasRef: React.RefObject<HTMLDivElement>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const mouseX = (e.clientX - canvasRect.left + (canvasRef.current?.scrollLeft || 0)) / scale;
    const mouseY = (e.clientY - canvasRect.top + (canvasRef.current?.scrollTop || 0)) / scale;

    setIsResizing(true);
    setResizeHandle(handle);
    setInitialElement({
      position: { ...element.position },
      size: { ...element.size }
    });
    setInitialMousePos({ x: mouseX, y: mouseY });
  }, [scale]);

  // Handle resizing
  const handleResize = useCallback((
    e: MouseEvent,
    elementId: string,
    canvasRef: React.RefObject<HTMLDivElement>
  ) => {
    if (!isResizing || !initialElement || !initialMousePos || !resizeHandle) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const mouseX = (e.clientX - canvasRect.left + (canvasRef.current?.scrollLeft || 0)) / scale;
    const mouseY = (e.clientY - canvasRect.top + (canvasRef.current?.scrollTop || 0)) / scale;

    const deltaX = mouseX - initialMousePos.x;
    const deltaY = mouseY - initialMousePos.y;

    let newPosition = { ...initialElement.position };
    let newSize = { ...initialElement.size };

    // Handle resizing based on which handle was dragged
    if (resizeHandle.includes('n')) {
      newPosition.y = initialElement.position.y + deltaY;
      newSize.height = initialElement.size.height - deltaY;
    }
    if (resizeHandle.includes('s')) {
      newSize.height = initialElement.size.height + deltaY;
    }
    if (resizeHandle.includes('w')) {
      newPosition.x = initialElement.position.x + deltaX;
      newSize.width = initialElement.size.width - deltaX;
    }
    if (resizeHandle.includes('e')) {
      newSize.width = initialElement.size.width + deltaX;
    }

    // Ensure minimum size
    const minSize = 50;
    if (newSize.width < minSize) {
      if (resizeHandle.includes('w')) {
        newPosition.x = initialElement.position.x + initialElement.size.width - minSize;
      }
      newSize.width = minSize;
    }
    if (newSize.height < minSize) {
      if (resizeHandle.includes('n')) {
        newPosition.y = initialElement.position.y + initialElement.size.height - minSize;
      }
      newSize.height = minSize;
    }

    updateElement(elementId, { position: newPosition, size: newSize });
  }, [isResizing, initialElement, initialMousePos, resizeHandle, scale, updateElement]);

  // End resizing process
  const endResize = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      setInitialElement(null);
      setInitialMousePos(null);
    }
  }, [isResizing]);

  // Check if the clicked target is a resize handle
  const isResizeHandleClick = useCallback((target: EventTarget) => {
    const element = target as HTMLElement;
    return element.hasAttribute('data-handle');
  }, []);

  return {
    isResizing,
    startResize,
    handleResize,
    endResize,
    isResizeHandleClick
  };
};
