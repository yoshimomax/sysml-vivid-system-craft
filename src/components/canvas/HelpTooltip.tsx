
import React from 'react';

interface HelpTooltipProps {
  visible: boolean;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs p-2 rounded z-50 max-w-xs">
      <p className="mb-1 font-bold">Quick Tips:</p>
      <ul className="space-y-1 list-disc pl-4">
        <li>Mouse wheel to zoom in/out</li>
        <li>Right-click on element to create relationship</li>
        <li>Drag mouse on canvas to select multiple elements</li>
        <li>With multiple elements selected, use the alignment panel</li>
      </ul>
    </div>
  );
};
