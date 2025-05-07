
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
  
  // 画面上の位置を調整（画面外にはみ出さないよう）
  const adjustPosition = (pos: Position): Position => {
    // メニューのサイズを推定（実際のサイズは動的に変わるため推定値）
    const estimatedWidth = 200;
    const estimatedHeight = 300;
    
    // 画面のサイズを取得
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 右端または下端に近い場合は位置を調整
    let adjustedX = pos.x;
    let adjustedY = pos.y;
    
    if (pos.x + estimatedWidth > viewportWidth) {
      adjustedX = viewportWidth - estimatedWidth;
    }
    
    if (pos.y + estimatedHeight > viewportHeight) {
      adjustedY = viewportHeight - estimatedHeight;
    }
    
    return { x: adjustedX, y: adjustedY };
  };
  
  // 位置を調整
  const adjustedPosition = adjustPosition(contextMenuPosition);
  
  return (
    <div 
      className="fixed z-50 pointer-events-auto relationship-context-menu" 
      style={{ 
        left: `${adjustedPosition.x}px`, 
        top: `${adjustedPosition.y}px` 
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
