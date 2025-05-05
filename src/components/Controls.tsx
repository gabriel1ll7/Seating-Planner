
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ControlsProps {
  onAddTable: () => void;
  onAddVenueElement: () => void;
}

export const Controls = ({ onAddTable, onAddVenueElement }: ControlsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 p-4 flex items-center justify-start space-x-4">
      <Button onClick={onAddTable}>
        <PlusCircle className="mr-1" size={16} />
        Add Table
      </Button>
      <Button variant="outline" onClick={onAddVenueElement}>
        <PlusCircle className="mr-1" size={16} />
        Add Venue Element
      </Button>
      <div className="text-sm text-gray-500 ml-4">
        <p>Tip: Use Alt + Mouse to pan, scroll to zoom</p>
      </div>
    </div>
  );
};
