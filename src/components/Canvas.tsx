
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Table, Guest } from "@/types/seatingChart";
import { GuestDialog } from "./GuestDialog";
import { setupCanvas, createTableOnCanvas, createVenueElementOnCanvas } from "@/utils/canvasUtils";

export const Canvas = ({
  canvas,
  setCanvas,
  tables,
  setTables,
  guests,
  setGuests,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [activeChair, setActiveChair] = useState<{
    tableId: string;
    chairIndex: number;
  } | null>(null);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const fabricCanvas = setupCanvas(canvasRef.current);
      setCanvas(fabricCanvas);
    }
  }, [setCanvas, canvas]);

  // Handle table interactions (chair clicks, button clicks, or moving)
  const handleTableInteraction = (
    table: Table, 
    chairIndex: number, 
    isChair: boolean, 
    isButton: boolean,
    buttonType?: string
  ) => {
    if (isButton) {
      // Handle button clicks (+ or -)
      const change = buttonType === "plus" ? 1 : -1;
      handleCapacityChange(table, change);
    } else if (isChair) {
      // Handle chair clicks
      setActiveChair({ tableId: table.id, chairIndex });
      setActiveTable(table);
      
      // Find if there's a guest already assigned
      const existingGuest = guests.find(
        (g) => g.tableId === table.id && g.chairIndex === chairIndex
      );
      
      if (existingGuest) {
        setGuestFirstName(existingGuest.firstName);
        setGuestLastName(existingGuest.lastName);
      } else {
        setGuestFirstName("");
        setGuestLastName("");
      }
      
      setGuestDialogOpen(true);
    } else {
      // Handle table move
      const updatedTables = tables.map((t) => {
        if (t.id === table.id) {
          return {
            ...t,
            left: table.left,
            top: table.top,
          };
        }
        return t;
      });
      setTables(updatedTables);
    }
  };

  // Handle venue element update
  const handleVenueElementUpdate = (updatedElement) => {
    const updatedElements = tables.map((el) => {
      if (el.id === updatedElement.id) {
        return updatedElement;
      }
      return el;
    });
    setTables(updatedElements);
  };

  // Handle adding/removing chairs when capacity changes
  const handleCapacityChange = (table: Table, change: number) => {
    const newCapacity = Math.min(Math.max(table.capacity + change, 6), 12);
    
    if (newCapacity === table.capacity) return;

    // Update table capacity
    const updatedTables = tables.map((t) => {
      if (t.id === table.id) {
        return {
          ...t,
          capacity: newCapacity,
        };
      }
      return t;
    });
    
    setTables(updatedTables);
    
    // If capacity is reduced, remove guests from removed chairs
    if (change < 0) {
      const updatedGuests = guests.filter(
        (g) => !(g.tableId === table.id && g.chairIndex >= newCapacity)
      );
      setGuests(updatedGuests);
    }
  };

  // Handle guest assignment dialog submission
  const handleGuestDialogSubmit = (firstName: string, lastName: string) => {
    if (!activeChair || !activeTable) return;
    
    // If name is empty, remove the guest
    if (!firstName.trim() && !lastName.trim()) {
      const updatedGuests = guests.filter(
        (g) =>
          !(
            g.tableId === activeChair.tableId &&
            g.chairIndex === activeChair.chairIndex
          )
      );
      setGuests(updatedGuests);
    } else {
      // Update or add guest
      const existingGuestIndex = guests.findIndex(
        (g) =>
          g.tableId === activeChair.tableId &&
          g.chairIndex === activeChair.chairIndex
      );
      
      if (existingGuestIndex >= 0) {
        // Update existing guest
        const updatedGuests = [...guests];
        updatedGuests[existingGuestIndex] = {
          ...updatedGuests[existingGuestIndex],
          firstName,
          lastName,
        };
        setGuests(updatedGuests);
      } else {
        // Add new guest
        setGuests([
          ...guests,
          {
            id: `guest-${Date.now()}`,
            firstName,
            lastName,
            tableId: activeChair.tableId,
            chairIndex: activeChair.chairIndex,
          },
        ]);
      }
    }
    
    // Reset state
    setActiveChair(null);
    setGuestFirstName("");
    setGuestLastName("");
  };

  // Render elements whenever data changes
  useEffect(() => {
    if (!canvas) return;
    
    // Debug information
    console.log('Tables length:', tables.length);
    console.log('Tables:', tables);
    console.log('Canvas:', canvas);
    
    // Clear the canvas first
    canvas.clear();
    
    // First, draw venue elements (so they're behind tables)
    const venueElements = tables.filter(el => el.title !== undefined);
    venueElements.forEach(element => {
      createVenueElementOnCanvas(
        canvas, 
        element, 
        handleVenueElementUpdate
      );
    });
    
    // Then draw tables
    const tableElements = tables.filter(el => el.title === undefined);
    tableElements.forEach(table => {
      createTableOnCanvas(
        canvas, 
        table, 
        guests,
        handleTableInteraction
      );
    });
    
    // Make sure to render after all objects are added
    canvas.renderAll();
    
  }, [canvas, tables, guests]);

  return (
    <div className="relative w-full h-full overflow-hidden border border-gray-200 rounded-lg">
      <canvas ref={canvasRef} className="fabric-canvas" />
      
      <GuestDialog
        isOpen={guestDialogOpen}
        onOpenChange={setGuestDialogOpen}
        onSubmit={handleGuestDialogSubmit}
        initialFirstName={guestFirstName}
        initialLastName={guestLastName}
      />
    </div>
  );
};
