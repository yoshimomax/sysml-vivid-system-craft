
import React from "react";
import { Position, RelationshipType } from "../../model/types";
import { RelationshipCreator } from "./RelationshipCreator";

interface ContextMenuManagerProps {
  contextMenuPosition: Position | null;
  elementForContextMenu: string | null;
  onSelectRelationshipType: (type: RelationshipType) => void;
  onCancel: () => void;
}

export const ContextMenuManager: React.FC<ContextMenuManagerProps> = ({
  contextMenuPosition,
  elementForContextMenu,
  onSelectRelationshipType,
  onCancel
}) => {
  if (!contextMenuPosition || !elementForContextMenu) return null;
  
  // ホイールスクロールイベントの伝播を停止するハンドラー
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className="absolute z-50 pointer-events-auto relationship-context-menu" 
      style={{ 
        left: `${contextMenuPosition.x}px`, 
        top: `${contextMenuPosition.y}px` 
      }}
      onWheel={handleWheel}
    >
      <RelationshipCreator
        visible={true}
        position={contextMenuPosition}
        onSelectType={onSelectRelationshipType}
        onCancel={onCancel}
      />
    </div>
  );
};
