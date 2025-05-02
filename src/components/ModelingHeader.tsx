
import { Save, FileSymlink, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const ModelingHeader = () => {
  return (
    <header className="flex items-center justify-between border-b border-border p-2 bg-background">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-bold text-primary">SysML v2 Modeler</h1>
        <nav className="hidden md:flex">
          <ul className="flex space-x-4 text-sm">
            <li><a href="#" className="hover:text-primary transition-colors">File</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Edit</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">View</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Tools</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Help</a></li>
          </ul>
        </nav>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button size="sm" variant="outline" className="text-xs">
          <FileSymlink className="w-4 h-4 mr-1" />
          New
        </Button>
        <Button size="sm" variant="outline" className="text-xs">
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        <Button size="sm" variant="ghost" className="text-xs">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};

export default ModelingHeader;
