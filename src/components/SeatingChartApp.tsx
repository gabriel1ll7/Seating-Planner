import React, { useEffect, useMemo } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Controls } from "./Controls";
import { useToast } from "@/components/ui/use-toast";
import { CanvasStage } from "./CanvasStage";
import { useAtom, useSetAtom, useAtomValue } from "jotai";
import {
  baseShapesAtom,
  guestsAtom,
  tableCounterAtom,
  totalGuestsAtom,
  shapeAtomsAtom,
  venueSpaceLockedAtom,
  selectedShapeIdAtom,
  isPanningAtom
} from "@/lib/atoms";
import { Shape } from "@/lib/atoms";
import { Table, VenueElement } from "../types/seatingChart";
import { GuestAssignmentModal } from "./GuestAssignmentModal";
import { RenameElementModal } from "./RenameElementModal";

export const SeatingChartApp = () => {
  const { toast } = useToast();

  const setBaseShapes = useSetAtom(baseShapesAtom);
  const setGuests = useSetAtom(guestsAtom);
  const [tableCounterValue, setTableCounter] = useAtom(tableCounterAtom);
  const [totalGuests] = useAtom(totalGuestsAtom);
  const [guestsValue] = useAtom(guestsAtom);
  const [shapeAtoms] = useAtom(shapeAtomsAtom);
  const [baseShapesValue] = useAtom(baseShapesAtom);
  const [isVenueLocked, setIsVenueLocked] = useAtom(venueSpaceLockedAtom);
  const [selectedShapeIdValue, setSelectedShapeId] = useAtom(selectedShapeIdAtom);

  const venueSpaceExists = useMemo(() => 
    baseShapesValue.some(shape => shape.type === 'venue' && shape.title === 'Venue Space'),
    [baseShapesValue]
  );

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to clear the entire canvas and start fresh?",
      )
    ) {
      setBaseShapes([]);
      setGuests([]);
      setTableCounter(1);
      toast({
        title: "Canvas Reset",
        description: "Your seating chart has been cleared.",
      });
    }
  };

  const handleAddTable = () => {
    const currentTableCounter = tableCounterValue;
    const newTable: Table = {
      id: `table-${Date.now()}`,
      type: "table",
      number: currentTableCounter,
      x: 200 + Math.random() * 200,
      y: 150 + Math.random() * 150,
      radius: 60,
      capacity: 8,
    };
    setBaseShapes((prevShapes) => [...prevShapes, newTable]);
    setTableCounter((prev) => prev + 1);

    toast({
      title: "Table Added",
      description: `Table ${newTable.number} added.`,
    });
  };

  const handleAddVenueElement = () => {
    // Generate random HSL color: Hue (0-360), Saturation (low-ish), Lightness (high), Alpha (low)
    const randomHue = Math.floor(Math.random() * 360);
    const randomSaturation = 30 + Math.floor(Math.random() * 30); // 30-60%
    const randomLightness = 75 + Math.floor(Math.random() * 15); // 75-90%
    const alpha = 0.3; // Make slightly less transparent (more opaque)
    const randomColor = `hsla(${randomHue}, ${randomSaturation}%, ${randomLightness}%, ${alpha})`;

    const newElement: VenueElement = {
      id: `venue-${Date.now()}`,
      type: "venue",
      title: "New Element",
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      width: 200,
      height: 150,
      color: randomColor, // Assign the generated pale color
    };
    setBaseShapes((prevShapes) => [...prevShapes, newElement]);

    toast({
      title: "Venue Element Added",
      description: "A new venue element has been added.",
    });
  };

  const handleAddVenueSpace = () => {
    if (venueSpaceExists) {
      toast({ title: "Action Denied", description: "A Venue Space element already exists.", variant: "destructive" });
      return;
    }

    const newId = `venuespace-${Date.now()}`;
    const newVenueSpace: VenueElement = {
      id: newId,
      type: "venue",
      title: "Venue Space",
      x: 50,
      y: 50,
      width: 800,
      height: 600,
      color: "rgba(0, 0, 0, 0)",
      stroke: "#333333",
      strokeWidth: 2,
    };
    
    setBaseShapes((prevShapes) => [...prevShapes, newVenueSpace]);
    
    setIsVenueLocked(false);
    setSelectedShapeId(newId);

    toast({
      title: "Venue Space Added",
      description: "The main venue area has been defined and selected. It is currently unlocked.",
    });
  };

  const handleToggleVenueLock = () => {
    const nextLockedState = !isVenueLocked;
    setIsVenueLocked(nextLockedState);
    
    // Find the venue space element ID if it exists
    const venueSpaceElement = baseShapesValue.find(shape => shape.type === 'venue' && shape.title === 'Venue Space');
    const venueSpaceId = venueSpaceElement?.id;

    if (!nextLockedState && venueSpaceId) { // If unlocking and exists
      setSelectedShapeId(venueSpaceId); // Select it
    } else if (nextLockedState && venueSpaceId && selectedShapeIdValue === venueSpaceId) {
        // If locking AND it was the selected shape, deselect it
        setSelectedShapeId(null); // Use null or RESET
    }

    toast({
        title: `Venue Space ${nextLockedState ? "Locked" : "Unlocked"}`,
        description: `The Venue Space element is now ${nextLockedState ? "locked and cannot be moved/resized" : "unlocked for editing"}.`,
    });
  };

  // Function to show info toast when disabled buttons are clicked
  const showAddVenueSpaceRequiredToast = () => {
      toast({
          title: "Action Unavailable",
          description: "Please add and define the Venue Space first before adding tables or other elements.",
          variant: "destructive", // Use a more noticeable variant
          duration: 3000, // Shorter duration
      });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header totalGuests={totalGuests} onReset={handleReset} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          guests={guestsValue}
          tables={baseShapesValue.filter((s): s is Table => s.type === "table")}
        />
        <div className="flex-1 flex flex-col p-4">
          <Controls
            onAddTable={handleAddTable}
            onAddVenueElement={handleAddVenueElement}
            onAddVenueSpace={handleAddVenueSpace}
            isVenueSpacePresent={venueSpaceExists}
            isVenueSpaceLocked={isVenueLocked}
            onToggleVenueLock={handleToggleVenueLock}
            onShowDisabledInfo={showAddVenueSpaceRequiredToast}
          />
          <div className="flex-1 relative" tabIndex={1}>
            <CanvasStage shapeAtoms={shapeAtoms} />
          </div>
        </div>
      </div>
      <GuestAssignmentModal />
      <RenameElementModal />
    </div>
  );
};
