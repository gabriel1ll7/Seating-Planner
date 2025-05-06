import { Button } from "@/components/ui/button";
import { PlusCircle, Square, Lock, Unlock, BookOpen, LayoutList, Coffee, Info } from "lucide-react";
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
      <div className="relative bg-card/80 rounded-xl shadow-sm mb-6 py-7 px-6 min-h-20 border border-border/40 overflow-visible backdrop-blur-sm">
        {/* Refined texture overlay */}
        <div className="absolute inset-0 texture-elegant opacity-70 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-wrap items-start justify-start gap-x-6 gap-y-6">
          {/* Left side - Creation Controls Group */}
          <div className="space-y-5">
            <h3 className="text-sm font-medium mb-3 text-foreground/80 flex items-center">
              <Square className="mr-1.5 text-primary/80" size={16} strokeWidth={1.5} />
              Create & Add
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {!isVenueSpacePresent ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="lg"
                      variant="outline" 
                      onClick={onAddVenueSpace} 
                      className="border-secondary/40 bg-secondary/5 hover:bg-secondary/15 text-secondary-foreground transition-all font-medium shadow-sm px-4 py-2.5"
                    >
                      <BookOpen className="mr-2" size={18} strokeWidth={1.5} />
                      Add Venue Space
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-card text-card-foreground border-border">
                    <p>First step: Add a Venue Space to define your event area</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} onClick={!isVenueSpacePresent ? onShowDisabledInfo : undefined}>
                        <Button 
                          size="lg"
                          onClick={onAddTable} 
                          disabled={!isVenueSpacePresent}
                          className="bg-primary/90 hover:bg-primary text-primary-foreground transition-all shadow-sm font-medium px-4 py-2.5 dark:glow-subtle"
                        >
                          <LayoutList className="mr-2" size={18} strokeWidth={1.5} />
                          Add Table
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-card text-card-foreground border-border">
                      <p>Add a new table with seats for guests</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} onClick={!isVenueSpacePresent ? onShowDisabledInfo : undefined}>
                        <Button 
                          size="lg"
                          variant="outline" 
                          onClick={onAddVenueElement} 
                          disabled={!isVenueSpacePresent}
                          className="border-accent/40 bg-accent/5 hover:bg-accent/15 text-accent-foreground transition-all font-medium shadow-sm px-4 py-2.5"
                        >
                          <Coffee className="mr-2" size={18} strokeWidth={1.5} />
                          Add Venue Element
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-card text-card-foreground border-border">
                      <p>Add decorative elements like dance floors, bars, or other venue features</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>

          {/* Middle - Venue Controls Group */}
          {isVenueSpacePresent && (
            <div className="space-y-5">
              <h3 className="text-sm font-medium mb-3 text-foreground/80 flex items-center">
                <BookOpen className="mr-1.5 text-secondary/80" size={16} strokeWidth={1.5} />
                Venue Controls
              </h3>
              <div className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="lg"
                      variant="secondary" 
                      onClick={onToggleVenueLock} 
                      className="bg-secondary/80 hover:bg-secondary text-secondary-foreground transition-all font-medium shadow-sm px-4 py-2.5"
                    >
                      {isVenueSpaceLocked ? (
                        <><Unlock className="mr-2" size={18} strokeWidth={1.5} /> Unlock Venue</>
                      ) : (
                        <><Lock className="mr-2" size={18} strokeWidth={1.5} /> Lock Venue</>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-card text-card-foreground border-border">
                    <p>{isVenueSpaceLocked ? "Allow editing of the venue space" : "Prevent accidental changes to venue space"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Right side - Tips */}
          <div className="bg-card/50 rounded-xl p-5 shadow-sm text-sm text-muted-foreground space-y-3 border border-border/30 w-full sm:w-auto lg:ml-auto">
            <h3 className="text-sm font-medium text-foreground/80 mb-2 flex items-center">
              <Info className="mr-1.5 text-accent/80" size={16} strokeWidth={1.5} />
              Quick Tips
            </h3>
            <p className="flex items-center text-sm leading-relaxed"><span className="text-primary font-semibold mr-2 text-xs opacity-80">➤</span> Use <kbd className="px-1.5 py-0.5 rounded bg-muted/80 mx-1 text-xs shadow-sm">Alt + Mouse</kbd> to pan</p>
            <p className="flex items-center text-sm leading-relaxed"><span className="text-primary font-semibold mr-2 text-xs opacity-80">➤</span> <kbd className="px-1.5 py-0.5 rounded bg-muted/80 mx-1 text-xs shadow-sm">Scroll</kbd> to zoom in/out</p>
            <p className="flex items-center text-sm leading-relaxed"><span className="text-primary font-semibold mr-2 text-xs opacity-80">➤</span> Double-click text to rename elements</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
