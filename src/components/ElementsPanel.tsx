
import { useState } from "react";
import { ChevronDown, ChevronRight, Box, FileBarChart, Layout, Activity, LayoutGrid } from "lucide-react";
import { ElementType } from "@/types/sysml";

interface ElementGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const ElementGroup = ({ title, children, defaultOpen = false }: ElementGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        className="w-full flex items-center justify-between p-2 hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium">{title}</span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {isOpen && (
        <div className="grid grid-cols-2 gap-1 p-2 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

interface ElementItemProps {
  type: ElementType;
  icon: React.ReactNode;
  label: string;
  onDragStart: (type: ElementType) => void;
}

const ElementItem = ({ type, icon, label, onDragStart }: ElementItemProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    console.log(`Started dragging a ${type} element`);
    e.dataTransfer.setData("application/sysml-element", type);
    e.dataTransfer.effectAllowed = "copy";
    onDragStart(type);
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-2 border border-border rounded-sm hover:bg-muted/50 hover:border-primary/30 cursor-grab transition-colors"
      draggable="true"
      onDragStart={handleDragStart}
    >
      <div className="h-8 w-8 flex items-center justify-center text-primary/80">
        {icon}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </div>
  );
};

interface ElementsPanelProps {
  onElementDragStart: (type: ElementType) => void;
}

const ElementsPanel = ({ onElementDragStart }: ElementsPanelProps) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="sidebar-group-title">SysML v2 Elements</div>
      
      <ElementGroup title="Structure" defaultOpen={true}>
        <ElementItem
          type="Part"
          icon={<Box className="h-6 w-6" />}
          label="Part"
          onDragStart={onElementDragStart}
        />
        <ElementItem
          type="Package"
          icon={<FileBarChart className="h-6 w-6" />}
          label="Package"
          onDragStart={onElementDragStart}
        />
        <ElementItem
          type="PortDefinition"
          icon={<Layout className="h-6 w-6" />}
          label="Port Definition"
          onDragStart={onElementDragStart}
        />
        <ElementItem
          type="InterfaceDefinition"
          icon={<LayoutGrid className="h-6 w-6" />}
          label="Interface Definition"
          onDragStart={onElementDragStart}
        />
      </ElementGroup>
      
      <ElementGroup title="Behavior">
        <ElementItem
          type="Action"
          icon={<Activity className="h-6 w-6" />}
          label="Action"
          onDragStart={onElementDragStart}
        />
        <ElementItem
          type="State"
          icon={<LayoutGrid className="h-6 w-6" />}
          label="State"
          onDragStart={onElementDragStart}
        />
      </ElementGroup>
      
      <ElementGroup title="Requirements">
        <ElementItem
          type="Requirement"
          icon={<FileBarChart className="h-6 w-6" />}
          label="Requirement"
          onDragStart={onElementDragStart}
        />
      </ElementGroup>

      <ElementGroup title="KerML Core">
        <ElementItem
          type="Feature"
          icon={<Box className="h-6 w-6" />}
          label="Feature"
          onDragStart={onElementDragStart}
        />
        <ElementItem
          type="Class"
          icon={<Layout className="h-6 w-6" />}
          label="Class"
          onDragStart={onElementDragStart}
        />
        <ElementItem
          type="Association"
          icon={<LayoutGrid className="h-6 w-6" />}
          label="Association"
          onDragStart={onElementDragStart}
        />
      </ElementGroup>
    </div>
  );
};

export default ElementsPanel;
