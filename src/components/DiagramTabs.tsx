
import { Diagram } from "@/types/sysml";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface DiagramTabsProps {
  diagrams: Diagram[];
  activeDiagramId: string;
  onDiagramSelect: (diagramId: string) => void;
  onAddDiagram: () => void;
  onCloseDiagram?: (diagramId: string) => void;
}

const DiagramTabs = ({
  diagrams,
  activeDiagramId,
  onDiagramSelect,
  onAddDiagram,
  onCloseDiagram,
}: DiagramTabsProps) => {
  return (
    <div className="flex items-center border-b border-border bg-muted/30 overflow-x-auto">
      {diagrams.map((diagram) => (
        <button
          key={diagram.id}
          onClick={() => onDiagramSelect(diagram.id)}
          className={`flex items-center gap-2 px-4 py-2 border-r border-border min-w-[120px] max-w-[180px] ${
            diagram.id === activeDiagramId
              ? "bg-background border-b-2 border-b-primary"
              : "hover:bg-muted/50"
          }`}
        >
          <span className="truncate text-sm">{diagram.name}</span>
          {onCloseDiagram && (
            <X
              className="h-3 w-3 opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onCloseDiagram(diagram.id);
              }}
            />
          )}
        </button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="ml-1 px-2"
        onClick={onAddDiagram}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DiagramTabs;
