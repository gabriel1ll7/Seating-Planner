
import { Button } from "@/components/ui/button";

export const Controls = ({ onAddTable, onAddVenueElement }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 p-4 flex items-center justify-start space-x-4">
      <Button onClick={onAddTable}>
        Add Table
      </Button>
      <Button variant="outline" onClick={onAddVenueElement}>
        Add Venue Element
      </Button>
      <div className="text-sm text-gray-500 ml-4">
        <p>Tip: Use Alt + Mouse to pan, scroll to zoom</p>
      </div>
    </div>
  );
};
