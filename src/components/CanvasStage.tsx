import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva"; // Import Konva namespace
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { 
    selectedShapeIdAtom, 
    venueSpaceShapeAtomsAtom,
    otherShapeAtomsAtom,
    isPanningAtom,
    baseShapesAtom,
    hoveredGuestIdAtom,
    guestsAtom,
    stageScaleAtom,
    venueSpaceLockedAtom,
} from "../lib/atoms";
import { PrimitiveAtom } from "jotai"; // Import atom types
import { RESET } from "jotai/utils"; // Import RESET
import { ElementRect } from "./ElementRect"; // Import ElementRect
import { TableCircle } from "./TableCircle"; // Import TableCircle
import { Shape } from "../lib/atoms"; // Correct path
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChairCircle } from "./ChairCircle"; // Assuming ChairCircle exports the group ref or similar

// Define props if needed later
interface CanvasStageProps {
  // Accept the array of individual shape atoms
  shapeAtoms: PrimitiveAtom<Shape>[];
  // Add registerRef function signature to props if passing down from parent
  // registerRef: (guestId: string | null, node: Konva.Group | null) => void;
}

// Type-safe atom renderer component
const AtomRenderer: React.FC<{
  shapeAtom: PrimitiveAtom<Shape>;
  highlightedGuestId: string | null;
  registerRef: (guestId: string | null, node: Konva.Group | null) => void; // Add prop
}> = ({ shapeAtom, highlightedGuestId, registerRef }) => {
  const shape = useAtomValue(shapeAtom);

  if (shape.type === "venue") {
    return (
      <ElementRect 
        key={`venue-${shape.id}`} 
        shapeAtom={shapeAtom} 
      />
    );
  }
  
  if (shape.type === "table") {
    return (
      <TableCircle 
        key={`table-${shape.id}`} 
        shapeAtom={shapeAtom} 
        highlightedGuestId={highlightedGuestId} 
        registerRef={registerRef} // Pass down
      />
    );
  }
  
  return null;
};

// Venue filter component
const VenueElementRenderer: React.FC<{
  shapeAtom: PrimitiveAtom<Shape>;
}> = ({ shapeAtom }) => {
  const shape = useAtomValue(shapeAtom);
  
  if (shape.type !== "venue" || shape.title === "Venue Space") {
    return null;
  }
  
  return (
    <ElementRect 
      key={`venue-element-${shape.id}`} 
      shapeAtom={shapeAtom} 
    />
  );
};

export const CanvasStage: React.FC<CanvasStageProps> = ({ shapeAtoms }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the container div
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 }); // State for dynamic size
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageInternalScale, setStageInternalScale] = useState(1); // Renamed to avoid conflict, used for local calculations
  const setGlobalStageScale = useSetAtom(stageScaleAtom); // Setter for the global atom
  const [selectedShapeId, setSelectedShapeId] = useAtom(selectedShapeIdAtom);
  const [isPanning, setIsPanning] = useAtom(isPanningAtom);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [isDeletePressed, setIsDeletePressed] = useState(false);
  const [isMouseDownOnStage, setIsMouseDownOnStage] = useState(false);
  const hoveredGuestId = useAtomValue(hoveredGuestIdAtom);
  const guests = useAtomValue(guestsAtom);
  const [initialFitDone, setInitialFitDone] = useState(false);
  const isVenueLocked = useAtomValue(venueSpaceLockedAtom); // Get venue lock state
  
  const setBaseShapes = useSetAtom(baseShapesAtom); // Get setter for base shapes
  
  // Ref map for chair groups, keyed by guestId
  const chairRefs = useRef<Record<string, Konva.Group>>({});

  // Callback to register/unregister chair refs
  const registerChairRef = useCallback((guestId: string | null, node: Konva.Group | null) => {
    if (guestId) { // Only register if guestId is present
      if (node) {
        chairRefs.current[guestId] = node;
      } else {
        // Node unmounted, remove from refs
        delete chairRefs.current[guestId];
      }
    }
  }, []); // Empty dependency array as it doesn't depend on component state/props
  
  // Get the derived atom values
  const venueSpaceAtoms = useAtomValue(venueSpaceShapeAtomsAtom);
  const baseShapes = useAtomValue(baseShapesAtom);

  // Guest map for quick name lookup
  const guestNameMap = useMemo(() => {
    const map = new Map<string, string>();
    guests.forEach(guest => {
      if (guest.id && guest.firstName && guest.lastName) {
        map.set(guest.id, `${guest.firstName} ${guest.lastName}`);
      } else if (guest.id && guest.firstName) {
        map.set(guest.id, guest.firstName);
      }
    });
    return map;
  }, [guests]);

  // Function to fit all content in view
  const fitContentToView = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Skip if no shapes
    if (baseShapes.length === 0) return;

    // Calculate bounding box of all shapes
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Check each shape to find the overall bounding box
    baseShapes.forEach(shape => {
      if (shape.type === 'venue') {
        // For venue elements (rectangles)
        const left = shape.x;
        const top = shape.y;
        const right = shape.x + shape.width;
        const bottom = shape.y + shape.height;

        minX = Math.min(minX, left);
        minY = Math.min(minY, top);
        maxX = Math.max(maxX, right);
        maxY = Math.max(maxY, bottom);
      } else if (shape.type === 'table') {
        // For tables (circles)
        const left = shape.x - shape.radius;
        const top = shape.y - shape.radius;
        const right = shape.x + shape.radius;
        const bottom = shape.y + shape.radius;

        minX = Math.min(minX, left);
        minY = Math.min(minY, top);
        maxX = Math.max(maxX, right);
        maxY = Math.max(maxY, bottom);
      }
    });

    // Add padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Calculate content dimensions
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // Calculate available viewport dimensions
    const stageWidth = stage.width();
    const stageHeight = stage.height();

    // Calculate scale to fit content
    const scaleX = stageWidth / contentWidth;
    const scaleY = stageHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

    // Calculate position to center content
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const newPos = {
      x: stageWidth / 2 - centerX * scale,
      y: stageHeight / 2 - centerY * scale,
    };

    // Apply new scale and position
    setStageInternalScale(scale);
    setGlobalStageScale(scale);
    setStagePos(newPos);
  }, [baseShapes, setGlobalStageScale]);

  // Effect to fit content on initial load
  useEffect(() => {
    if (!initialFitDone && baseShapes.length > 0) {
      // Wait a bit for the stage to be fully rendered
      const timer = setTimeout(() => {
        fitContentToView();
        setInitialFitDone(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [baseShapes, initialFitDone, fitContentToView]);

  // Effect to handle window resizing and set initial stage size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setStageSize({ width: clientWidth, height: clientHeight });
        // Optional: Re-fit content after resize, maybe throttled/debounced
        if (baseShapes.length > 0) {
            // Delay the fit slightly to ensure dimensions have updated
            setTimeout(() => fitContentToView(), 100); 
        }
      }
    };

    // Initial size measurement
    updateSize(); 

    // Use ResizeObserver for more efficient container resize detection
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
        resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(containerRef.current);
    }

    // Fallback: window resize listener (less performant but safer)
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      if (resizeObserver && containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
    // Add fitContentToView and baseShapes.length as dependencies if re-fitting on resize
  }, [fitContentToView, baseShapes.length]); 

  // Effect to listen for key presses (Alt and Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setIsAltPressed(true);
        e.preventDefault(); // Prevent browser menu focus
      } else if (e.key === 'Delete' && selectedShapeId) {
        // Delete the selected shape when Delete key is pressed
        setBaseShapes(prevShapes => 
          prevShapes.filter(shape => shape.id !== selectedShapeId)
        );
        setSelectedShapeId(RESET);
        e.preventDefault();
      } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        // Ctrl+0 (or Cmd+0 on Mac) to fit content to view
        e.preventDefault();
        fitContentToView();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setIsAltPressed(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Add blur listener to reset alt state if window loses focus
    const handleBlur = () => setIsAltPressed(false);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [selectedShapeId, setBaseShapes, setSelectedShapeId]);

  // Effect to update cursor styles based on interaction state
  useEffect(() => {
    const container = stageRef.current?.container();
    if (!container) return;
    
    if (isPanning) {
      container.style.cursor = 'grabbing';
    } else if (isAltPressed) {
      container.style.cursor = 'grab';
    } else if (isMouseDownOnStage) {
      container.style.cursor = 'move';
    } else {
      container.style.cursor = 'default';
    }
  }, [isPanning, isAltPressed, isMouseDownOnStage]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const scaleBy = 1.05;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // How to scale? Zoom in? Or zoom out?
    const direction = e.evt.deltaY > 0 ? -1 : 1;

    // Apply scaling
    let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Clamp scale
    newScale = Math.max(0.1, Math.min(newScale, 10)); // Min 0.1x, Max 10x zoom

    setStageInternalScale(newScale);
    setGlobalStageScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setStagePos(newPos);
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target !== stageRef.current) return; 
    
    setIsMouseDownOnStage(true);

    if (!isVenueLocked) { // If venue space is UNLOCKED
      // Do not deselect. If alt is pressed, allow panning.
      if (isAltPressed) {
        setIsPanning(true);
        stageRef.current?.startDrag(); 
        e.evt.preventDefault();
      }
      return; 
    }
    
    // Original logic for when venue space is LOCKED:
    setSelectedShapeId(RESET); 
    
    if (isAltPressed) {
      setIsPanning(true);
      stageRef.current?.startDrag(); 
      e.evt.preventDefault();
    } 
  };

  const handleStageMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    setIsMouseDownOnStage(false);
    
    if (isPanning) {
      setIsPanning(false);
      stageRef.current?.stopDrag();
      const finalPos = stageRef.current?.position();
      if (finalPos) setStagePos(finalPos);
    }
  };
  
  const handleStageMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
    setIsMouseDownOnStage(false);
    
    if (isPanning) {
      setIsPanning(false);
      stageRef.current?.stopDrag();
      const finalPos = stageRef.current?.position();
      if (finalPos) setStagePos(finalPos);
    }
  };

  return (
    <div ref={containerRef} className="relative rounded-lg overflow-hidden border border-border/40 shadow-md h-full">
      {/* Canvas background with texture */}
      <div className="absolute inset-0 bg-background texture-paper-light texture-paper-dark opacity-90 pointer-events-none"></div>
      
      {/* Help indicator */}
      {isAltPressed && (
        <div className="absolute top-3 right-3 bg-card/90 text-foreground/80 text-xs py-1 px-3 rounded-full shadow-md z-20 flex items-center border border-border/40">
          <span className="mr-1">🖱️</span> Panning Mode
        </div>
      )}
      
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown} 
        onMouseUp={handleStageMouseUp}     
        onMouseLeave={handleStageMouseLeave} 
        x={stagePos.x} 
        y={stagePos.y}
        scaleX={stageInternalScale}
        scaleY={stageInternalScale}
        style={{
          backgroundColor: "transparent",
          position: "relative",
          zIndex: 10
        }}
      >
        {/* First layer: Venue elements (background) */}
        <Layer name="venue-layer">
          {/* Render venue space shapes */}
          {venueSpaceAtoms.map((shapeAtom) => (
            <ElementRect 
              key={`venue-space-${shapeAtom.toString()}`} 
              shapeAtom={shapeAtom}
            />
          ))}
          
          {/* Render other venue elements using the specialized component */}
          {shapeAtoms.map((shapeAtom) => (
            <VenueElementRenderer 
              key={`venue-filter-${shapeAtom.toString()}`}
              shapeAtom={shapeAtom}
            />
          ))}
        </Layer>
        
        {/* Second layer: Tables and chairs (always on top) */}
        <Layer 
          name="tables-layer"
        >
          {shapeAtoms.map((shapeAtom) => (
            <React.Fragment key={`table-check-${shapeAtom.toString()}`}>
              {/* This will only render TableCircle if the atom is a table type */}
              <AtomRenderer 
                shapeAtom={shapeAtom}
                highlightedGuestId={hoveredGuestId}
                registerRef={registerChairRef} // Pass down register function
              />
            </React.Fragment>
          ))}
        </Layer>

        {/* Third Layer: Tooltip (always on top) */}
        {/* <TooltipLayer /> */}

      </Stage>
      
      {/* Subtle border decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-accent/30 to-primary/20 pointer-events-none"></div>
      
      {/* Zoom controls */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-8 h-8 bg-card/80 border-border/40 hover:bg-card shadow-sm"
                onClick={fitContentToView}
              >
                <Maximize size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fit all content to view <span className="text-xs opacity-75 ml-1">(Ctrl+0)</span></p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 bg-card/80 text-foreground/80 text-xs py-1 px-2 rounded shadow-sm z-20 border border-border/30">
        {Math.round(stageInternalScale * 100)}%
      </div>
      
      {/* Delete key help indicator */}
      {selectedShapeId && (
        <div className="absolute bottom-3 left-3 bg-card/80 text-foreground/80 text-xs py-1 px-3 rounded shadow-sm z-20 border border-border/30 flex items-center">
          <span className="mr-1.5">Press</span> 
          <kbd className="px-1.5 py-0.5 rounded bg-muted/80 text-xs shadow-sm mx-1">Delete</kbd> 
          <span>to remove selected element</span>
        </div>
      )}
    </div>
  );
};
