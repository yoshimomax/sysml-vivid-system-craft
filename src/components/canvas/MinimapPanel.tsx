
import React, { useRef, useEffect } from "react";
import { useModelingStore } from "../../store/modelingStore";
import { MoveIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

interface MinimapPanelProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const MinimapPanel: React.FC<MinimapPanelProps> = ({
  canvasRef,
  scale,
  onZoomIn,
  onZoomOut,
  onReset
}) => {
  const minimapRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const activeDiagram = useModelingStore(state => state.getActiveDiagram());
  const elements = activeDiagram?.elements || [];
  
  useEffect(() => {
    if (!minimapRef.current || !canvasRef.current || !viewportRef.current) return;
    
    // Calculate minimap scale based on the elements' positions
    const minimapWidth = 180; // Fixed minimap width
    const minimapHeight = 120; // Fixed minimap height
    
    // Find the canvas bounds
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    elements.forEach(element => {
      minX = Math.min(minX, element.position.x);
      minY = Math.min(minY, element.position.y);
      maxX = Math.max(maxX, element.position.x + element.size.width);
      maxY = Math.max(maxY, element.position.y + element.size.height);
    });
    
    // Add padding
    minX = Math.max(0, minX - 50);
    minY = Math.max(0, minY - 50);
    maxX = maxX + 50;
    maxY = maxY + 50;
    
    const diagramWidth = Math.max(1000, maxX - minX);
    const diagramHeight = Math.max(800, maxY - minY);
    
    // Calculate scale for minimap
    const scaleX = minimapWidth / diagramWidth;
    const scaleY = minimapHeight / diagramHeight;
    const minimapScale = Math.min(scaleX, scaleY);
    
    // Update viewport indicator
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const viewportLeft = (canvasRef.current.scrollLeft - minX) * minimapScale;
    const viewportTop = (canvasRef.current.scrollTop - minY) * minimapScale;
    const viewportWidth = canvasRect.width * minimapScale;
    const viewportHeight = canvasRect.height * minimapScale;
    
    viewportRef.current.style.left = `${viewportLeft}px`;
    viewportRef.current.style.top = `${viewportTop}px`;
    viewportRef.current.style.width = `${viewportWidth}px`;
    viewportRef.current.style.height = `${viewportHeight}px`;
    
    // Handle click on minimap to navigate
    const handleMinimapClick = (e: MouseEvent) => {
      if (!minimapRef.current || !canvasRef.current) return;
      
      const minimapRect = minimapRef.current.getBoundingClientRect();
      const clickX = e.clientX - minimapRect.left;
      const clickY = e.clientY - minimapRect.top;
      
      // Convert click position to canvas position
      const targetX = (clickX / minimapScale) + minX - (canvasRect.width / 2);
      const targetY = (clickY / minimapScale) + minY - (canvasRect.height / 2);
      
      canvasRef.current.scrollTo({
        left: targetX,
        top: targetY,
        behavior: "smooth"
      });
    };
    
    minimapRef.current.addEventListener('click', handleMinimapClick);
    
    return () => {
      minimapRef.current?.removeEventListener('click', handleMinimapClick);
    };
  }, [elements, canvasRef, scale]);
  
  return (
    <div className="bg-card border rounded-md shadow-sm p-2 space-y-2">
      <div className="text-xs font-medium flex justify-between items-center">
        <span>Minimap</span>
        <span className="text-muted-foreground">{Math.round(scale * 100)}%</span>
      </div>
      
      <div 
        ref={minimapRef}
        className="relative w-[180px] h-[120px] border bg-background overflow-hidden"
      >
        {elements.map(element => (
          <div
            key={element.id}
            className="absolute bg-primary/20 border border-primary/40"
            style={{
              left: `${element.position.x * 0.1}px`,
              top: `${element.position.y * 0.1}px`,
              width: `${element.size.width * 0.1}px`,
              height: `${element.size.height * 0.1}px`,
            }}
          />
        ))}
        
        <div 
          ref={viewportRef}
          className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={onZoomIn} title="Zoom In">
          <ZoomInIcon className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onReset} title="Reset Zoom">
          <MoveIcon className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onZoomOut} title="Zoom Out">
          <ZoomOutIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
