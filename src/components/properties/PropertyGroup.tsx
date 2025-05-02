
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface PropertyGroupProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const PropertyGroup = ({ title, defaultOpen = true, children }: PropertyGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        className="w-full flex items-center justify-between p-2 hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium">{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && (
        <div className="p-3 space-y-3 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

export default PropertyGroup;
