
import { Element } from "@/types/sysml";

interface ElementRendererProps {
  elements: Element[];
  selectedElement: Element | null;
  onElementMouseDown: (e: React.MouseEvent, element: Element) => void;
  onElementContextMenu: (e: React.MouseEvent, element: Element) => void;
}

export const ElementRenderer = ({
  elements,
  selectedElement,
  onElementMouseDown,
  onElementContextMenu
}: ElementRendererProps) => {
  // Make sure elements is an array
  const elementArray = Array.isArray(elements) ? elements : [];
  
  if (elementArray.length === 0) {
    return null; // Nothing to render
  }
  
  return (
    <>
      {elementArray.map((element) => (
        <div
          key={element.id}
          className={`element-block absolute ${selectedElement?.id === element.id ? 'element-selected' : ''}`}
          style={{
            left: `${element.position.x}px`,
            top: `${element.position.y}px`,
            width: `${element.size.width}px`,
            height: `${element.size.height}px`,
          }}
          data-type={element.type}
          onMouseDown={(e) => onElementMouseDown(e, element)}
          onContextMenu={(e) => {
            e.preventDefault();
            onElementContextMenu(e, element);
          }}
        >
          <div className="header">
            {element.stereotype && <div className="text-xs text-muted-foreground">{`<<${element.stereotype}>>`}</div>}
            {element.type}: {element.name}
          </div>
          <div className="content">
            {element.description || "No description"}
          </div>
          
          {/* Connection handles */}
          {selectedElement?.id === element.id && (
            <>
              <div className="element-handle n" />
              <div className="element-handle e" />
              <div className="element-handle s" />
              <div className="element-handle w" />
            </>
          )}
        </div>
      ))}
    </>
  );
};
