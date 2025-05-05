
import { Button } from "@/components/ui/button";

export const Header = ({ totalGuests, onReset }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Seating Chart Creator</h1>
          <p className="text-gray-600">Design your perfect event layout</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-50 rounded-lg px-4 py-2">
            <span className="font-semibold text-blue-700">Total Guests: {totalGuests}</span>
          </div>
          <Button variant="destructive" onClick={onReset}>
            Reset Canvas
          </Button>
        </div>
      </div>
    </header>
  );
};
