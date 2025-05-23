
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  ArrowDown,
  ArrowUp,
  Trash2
} from "lucide-react";

interface SelectionActionPanelProps {
  selectedIds: string[];
  onDelete: () => void;
  onAlign: (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
}

export const SelectionActionPanel: React.FC<SelectionActionPanelProps> = ({
  selectedIds,
  onDelete,
  onAlign
}) => {
  // 選択された要素が2つ未満の場合は表示しない
  if (!selectedIds || selectedIds.length <= 1) return null;
  
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-card shadow-lg rounded-lg border flex items-center gap-1 p-1 z-50">
      <div className="px-2 border-r">
        <span className="text-xs font-medium">{selectedIds.length} selected</span>
      </div>
      
      <div className="flex items-center border-r pr-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onAlign('left')}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onAlign('center')}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onAlign('right')}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center border-r pr-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onAlign('top')}
          title="Align Top"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onAlign('middle')}
          title="Align Middle"
        >
          <AlignCenter className="h-4 w-4 rotate-90" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onAlign('bottom')}
          title="Align Bottom"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={onDelete}
        title="Delete Selected"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
