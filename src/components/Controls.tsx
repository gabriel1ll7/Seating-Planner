import { Button } from "@/components/ui/button";
import { PlusCircle, Square, Lock, Unlock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ControlsProps {
  onAddTable: () => void;
  onAddVenueElement: () => void;
  onAddVenueSpace: () => void;
  isVenueSpacePresent: boolean;
  isVenueSpaceLocked: boolean;
  onToggleVenueLock: () => void;
  onShowDisabledInfo: () => void;
}

export const Controls = ({
  onAddTable,
  onAddVenueElement,
  onAddVenueSpace,
  isVenueSpacePresent,
  isVenueSpaceLocked,
  onToggleVenueLock,
  onShowDisabledInfo,
}: ControlsProps) => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="bg-white rounded-lg shadow-sm mb-4 p-4 flex items-center justify-start space-x-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} onClick={!isVenueSpacePresent ? onShowDisabledInfo : undefined}>
              <Button onClick={onAddTable} disabled={!isVenueSpacePresent}>
                <PlusCircle className="mr-1" size={16} />
                Add Table
              </Button>
            </span>
          </TooltipTrigger>
          {!isVenueSpacePresent && (
             <TooltipContent>
               <p>Add a Venue Space first to define the area.</p>
             </TooltipContent>
           )}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
             <span tabIndex={0} onClick={!isVenueSpacePresent ? onShowDisabledInfo : undefined}>
               <Button variant="outline" onClick={onAddVenueElement} disabled={!isVenueSpacePresent}>
                 <PlusCircle className="mr-1" size={16} />
                 Add Venue Element
               </Button>
             </span>
          </TooltipTrigger>
           {!isVenueSpacePresent && (
             <TooltipContent>
               <p>Add a Venue Space first to define the area.</p>
             </TooltipContent>
           )}
        </Tooltip>
        
        {!isVenueSpacePresent ? (
          <Button variant="outline" onClick={onAddVenueSpace}>
            <Square className="mr-1" size={16} />
            Add Venue Space
          </Button>
        ) : (
          <Button variant="secondary" onClick={onToggleVenueLock}>
            {isVenueSpaceLocked ? (
              <><Unlock className="mr-1" size={16} /> Unlock Venue</>
            ) : (
              <><Lock className="mr-1" size={16} /> Lock Venue</>
            )}
          </Button>
        )}

        <div className="text-sm text-gray-500 ml-4 space-y-1">
          <p>Tip: Use Alt + Mouse to pan, scroll to zoom.</p>
          <p>Tip: Double-click (or select then click) a Venue Element's text to rename it.</p>
        </div>
      </div>
    </TooltipProvider>
  );
};
