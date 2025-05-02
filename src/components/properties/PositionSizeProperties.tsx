
import { Element } from "@/types/sysml";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PositionSizePropertiesProps {
  element: Element;
}

const PositionSizeProperties = ({ element }: PositionSizePropertiesProps) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label htmlFor="elementPosX">Position X</Label>
        <Input
          id="elementPosX"
          type="number"
          value={element.position.x.toFixed(0)}
          disabled
          className="bg-muted/50"
        />
      </div>
      <div>
        <Label htmlFor="elementPosY">Position Y</Label>
        <Input
          id="elementPosY"
          type="number"
          value={element.position.y.toFixed(0)}
          disabled
          className="bg-muted/50"
        />
      </div>
      <div>
        <Label htmlFor="elementWidth">Width</Label>
        <Input
          id="elementWidth"
          type="number"
          value={element.size.width}
          disabled
          className="bg-muted/50"
        />
      </div>
      <div>
        <Label htmlFor="elementHeight">Height</Label>
        <Input
          id="elementHeight"
          type="number"
          value={element.size.height}
          disabled
          className="bg-muted/50"
        />
      </div>
    </div>
  );
};

export default PositionSizeProperties;
