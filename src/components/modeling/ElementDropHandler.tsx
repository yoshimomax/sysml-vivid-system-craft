
import { Element, ElementType } from "@/types/sysml";
import { v4 as uuidv4 } from "uuid";
import { getDefaultSizeForType } from "@/utils/elementUtils";
import { useToast } from "@/components/ui/use-toast";

interface ElementDropHandlerProps {
  onElementDrop: (newElement: Element) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

export const ElementDropHandler = ({ 
  onElementDrop,
  canvasRef,
  children 
}: ElementDropHandlerProps) => {
  const { toast } = useToast();
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const elementType = e.dataTransfer.getData("application/sysml-element") as ElementType;
    
    if (!elementType) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // Get correct position relative to the canvas, accounting for scroll
    const x = e.clientX - canvasRect.left + (canvasRef.current?.scrollLeft || 0);
    const y = e.clientY - canvasRect.top + (canvasRef.current?.scrollTop || 0);
    
    const newElement: Element = {
      id: uuidv4(),
      type: elementType,
      name: `New ${elementType}`,
      position: { x, y },
      size: getDefaultSizeForType(elementType),
    };
    
    onElementDrop(newElement);
    
    toast({
      title: "Element added",
      description: `Added new ${elementType} element to the diagram`,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Show allowed cursor
    e.dataTransfer.dropEffect = "copy";
  };
  
  return (
    <div
      className="w-full h-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {children}
    </div>
  );
};
