import { Moon, Sun, RotateCcw, Users, Square, BookOpen, Lock, Unlock, Save, Check, Armchair, Utensils } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useAtom } from "jotai";
import { eventTitleAtom } from "@/lib/atoms";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleTheme}
            className="border-accent/30 bg-accent/5 hover:bg-accent/15 hover:border-accent/50 relative h-10 w-10 shadow-sm transition-all duration-300"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {theme === "dark" ? "light" : "dark"} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

interface HeaderProps {
  totalGuests: number;
  onReset: () => void;
  onAddTable: () => void;
  onAddVenueElement: () => void;
  onAddVenueSpace: () => void;
  isVenueSpacePresent: boolean;
  isVenueSpaceLocked: boolean;
  onToggleVenueLock: () => void;
  onShowDisabledInfo: () => void;
  saveStatus: SaveStatus;
}

export const Header: React.FC<HeaderProps> = ({ 
  totalGuests, 
  onReset,
  onAddTable,
  onAddVenueElement,
  onAddVenueSpace,
  isVenueSpacePresent,
  isVenueSpaceLocked,
  onToggleVenueLock,
  onShowDisabledInfo,
  saveStatus
}) => {
  // Use the persisted atom instead of local state
  const [eventTitle, setEventTitle] = useAtom(eventTitleAtom);

  // Update document title when eventTitle changes
  useEffect(() => {
    document.title = `${eventTitle} - Seating Chart`;
  }, [eventTitle]);

  return (
    <header className="relative bg-gradient-to-r from-card to-card/95 border-b border-border/40 shadow-sm px-7 py-4 overflow-hidden">
      {/* Refined texture overlay */}
      <div className="absolute inset-0 texture-elegant pointer-events-none"></div>
      <div className="relative z-10 flex flex-wrap items-center justify-between">
        {/* Item 1: Logo and app name */}
        <div className="flex-shrink-0 mr-4">
          <h1 className="text-2xl font-medium text-card-foreground flex items-center">
            <span className="hidden sm:inline-flex items-center justify-center mr-2.5 text-primary/80">
              {/* Seat/Chair icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21V19C19 17.9 18.1 17 17 17H7C5.9 17 5 17.9 5 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 8V6C17 4.9 16.1 4 15 4H9C7.9 4 7 4.9 7 6V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 8H6C4.9 8 4 8.9 4 10V13C4 14.1 4.9 15 6 15H18C19.1 15 20 14.1 20 13V10C20 8.9 19.1 8 18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="tracking-wide">Seating Chart</span>
          </h1>
        </div>
        
        {/* Item 2: Controls (Add Buttons) */}
        <div className="flex items-center gap-3 mr-2">
          <TooltipProvider delayDuration={300}>
            {!isVenueSpacePresent ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm"
                    variant="outline" 
                    onClick={onAddVenueSpace} 
                    className="border-secondary/40 bg-secondary/5 hover:bg-secondary/15 text-secondary-foreground transition-all font-medium shadow-sm"
                  >
                    <BookOpen className="mr-2" size={16} strokeWidth={1.5} />
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
                        size="sm"
                        onClick={onAddTable} 
                        disabled={!isVenueSpacePresent}
                        className="bg-primary/90 hover:bg-primary text-primary-foreground transition-all shadow-sm font-medium dark:glow-subtle"
                      >
                        <Utensils className="mr-2" size={16} strokeWidth={1.5} />
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
                        size="sm"
                        variant="outline" 
                        onClick={onAddVenueElement} 
                        disabled={!isVenueSpacePresent}
                        className="border-accent/40 bg-accent/5 hover:bg-accent/15 text-accent-foreground transition-all font-medium shadow-sm"
                      >
                        <Armchair className="mr-2" size={16} strokeWidth={1.5} />
                        Add Venue Element
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-card text-card-foreground border-border">
                    <p>Add decorative elements like dance floors, bars, or other venue features</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm"
                      variant="secondary" 
                      onClick={onToggleVenueLock} 
                      className="bg-secondary/80 hover:bg-secondary text-secondary-foreground transition-all font-medium shadow-sm"
                    >
                      {isVenueSpaceLocked ? (
                        <><Unlock className="mr-2" size={16} strokeWidth={1.5} /> Unlock Venue</>
                      ) : (
                        <><Lock className="mr-2" size={16} strokeWidth={1.5} /> Lock Venue</>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-card text-card-foreground border-border">
                    <p>{isVenueSpaceLocked ? "Allow editing of the venue space" : "Prevent accidental changes to venue space"}</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </TooltipProvider>
        </div>

        {/* Item 3: Middle section - Event Title */}
        <div className="flex-grow max-w-[18rem] mr-6 ml-0 hidden sm:block">
          <Input
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            className="h-10 bg-card/60 border-border/30 focus:border-primary/50 focus:bg-card/80 text-xl font-bold text-center"
            placeholder="Enter Event Title"
            aria-label="Event Title"
          />
        </div>
        
        {/* Right section - Stats and actions */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          {/* Save Status Indicator */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                    "flex items-center rounded-md px-4 py-1.5 min-w-24 text-sm font-medium shadow-sm",
                    saveStatus === 'saved' && "bg-muted/30 text-muted-foreground border border-muted",
                    saveStatus === 'saving' && "bg-accent/40 text-accent-foreground",
                    saveStatus === 'unsaved' && "bg-secondary/20 text-secondary-foreground"
                  )}
                >
                  {saveStatus === 'saved' ? (
                    <><Check className="mr-1.5" size={16} strokeWidth={2} /> Saved</>
                  ) : saveStatus === 'saving' ? (
                    <>
                      <svg className="mr-1.5 animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <><Save className="mr-1.5" size={16} strokeWidth={1.5} /> Unsaved</>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-card text-card-foreground border-border">
                <p>{saveStatus === 'saved' ? 'All changes are saved to localStorage' : saveStatus === 'saving' ? 'Saving changes...' : 'Changes will be auto-saved soon'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-lg px-4 py-2.5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center">
              <Users size={18} className="mr-2 text-primary/80" strokeWidth={1.5} />
              <span className="font-medium text-foreground/90">
                {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'}
              </span>
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="destructive" 
                  onClick={onReset}
                  className="bg-destructive/90 hover:bg-destructive text-destructive-foreground py-2.5 font-medium shadow-sm transition-all duration-300"
                >
                  <RotateCcw size={16} className="mr-2" strokeWidth={1.5} />
                  Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear the canvas and start fresh</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <ThemeToggle />
        </div>

        {/* Event Title for smaller screens */}
        <div className="w-full mt-3 sm:hidden">
          <Input
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            className="h-10 bg-card/60 border-border/30 focus:border-primary/50 focus:bg-card/80 text-xl font-bold text-center"
            placeholder="Enter Event Title"
            aria-label="Event Title"
          />
        </div>
      </div>
    </header>
  );
};
