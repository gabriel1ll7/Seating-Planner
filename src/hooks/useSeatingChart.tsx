
import { useState, useCallback } from "react";
import { Canvas, Circle, Rect } from "fabric";

// Pastel colors for venue elements
const PASTEL_COLORS = [
  "#F2FCE2", // Soft Green
  "#FEF7CD", // Soft Yellow
  "#FEC6A1", // Soft Orange
  "#E5DEFF", // Soft Purple
  "#FFDEE2", // Soft Pink
  "#FDE1D3", // Soft Peach
  "#D3E4FD", // Soft Blue
  "#F1F0FB", // Soft Gray
];

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  tableId: string;
  chairIndex: number;
}

export interface Table {
  id: string;
  number: number;
  left: number;
  top: number;
  radius: number;
  capacity: number;
  fabricObject?: Circle;
}

export interface VenueElement {
  id: string;
  title: string;
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  fabricObject?: Rect;
}

export const useSeatingChart = () => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [venueElements, setVenueElements] = useState<VenueElement[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tableCounter, setTableCounter] = useState(1);

  // Calculate total guests
  const totalGuests = guests.length;

  // Add a new table to the canvas
  const addTable = useCallback(() => {
    if (!canvas) return;

    const newTable: Table = {
      id: `table-${Date.now()}`,
      number: tableCounter,
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      radius: 60,
      capacity: 8, // Default capacity
    };

    setTables((prev) => [...prev, newTable]);
    setTableCounter((prev) => prev + 1);
  }, [canvas, tableCounter]);

  // Add a venue element (rectangle) to the canvas
  const addVenueElement = useCallback(
    (isMainVenue: boolean = false) => {
      if (!canvas) return;

      const colorIndex = Math.floor(Math.random() * PASTEL_COLORS.length);
      const newElement: VenueElement = {
        id: `venue-element-${Date.now()}`,
        title: isMainVenue ? "Main Venue" : "New Element",
        left: isMainVenue ? 50 : canvas.width! / 2,
        top: isMainVenue ? 50 : canvas.height! / 2,
        width: isMainVenue ? canvas.width! - 100 : 150,
        height: isMainVenue ? canvas.height! - 100 : 100,
        color: PASTEL_COLORS[colorIndex],
      };

      setVenueElements((prev) => [...prev, newElement]);
    },
    [canvas]
  );

  // Update a guest's information
  const updateGuest = useCallback(
    (
      tableId: string,
      chairIndex: number,
      firstName: string,
      lastName: string
    ) => {
      const existingGuestIndex = guests.findIndex(
        (g) => g.tableId === tableId && g.chairIndex === chairIndex
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
        setGuests((prev) => [
          ...prev,
          {
            id: `guest-${Date.now()}`,
            firstName,
            lastName,
            tableId,
            chairIndex,
          },
        ]);
      }
    },
    [guests]
  );

  // Remove a guest
  const removeGuest = useCallback(
    (tableId: string, chairIndex: number) => {
      setGuests((prev) =>
        prev.filter(
          (g) => !(g.tableId === tableId && g.chairIndex === chairIndex)
        )
      );
    },
    []
  );

  // Save the current state to localStorage
  const saveToLocalStorage = useCallback(() => {
    if (!canvas) return;

    try {
      // Save canvas JSON
      const canvasJSON = canvas.toJSON(['id', 'tableId', 'chairIndex', 'tableNumber', 'capacity', 'elementTitle']);
      
      // Create a state object with all our data
      const state = {
        canvasJSON,
        tables: tables.map(({ id, number, capacity }) => ({ id, number, capacity })),
        guests,
        tableCounter,
      };
      
      localStorage.setItem('seatingChartState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [canvas, tables, guests, tableCounter]);

  // Load state from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedState = localStorage.getItem('seatingChartState');
      if (savedState && canvas) {
        const state = JSON.parse(savedState);
        
        // Load canvas objects
        canvas.loadFromJSON(state.canvasJSON, () => {
          canvas.renderAll();
          
          // Reconnect fabric objects with our state objects
          const loadedTables: Table[] = [];
          const loadedVenueElements: VenueElement[] = [];
          
          canvas.getObjects().forEach(obj => {
            if (obj.type === 'circle' && obj.tableId) {
              const tableData = state.tables.find((t: any) => t.id === obj.tableId);
              if (tableData) {
                loadedTables.push({
                  id: obj.tableId as string,
                  number: tableData.number,
                  left: obj.left || 0,
                  top: obj.top || 0,
                  radius: obj.radius || 60,
                  capacity: tableData.capacity,
                  fabricObject: obj as Circle,
                });
              }
            } else if (obj.type === 'rect' && obj.id) {
              loadedVenueElements.push({
                id: obj.id as string,
                title: obj.elementTitle as string || 'Element',
                left: obj.left || 0,
                top: obj.top || 0,
                width: obj.width || 100,
                height: obj.height || 100,
                color: obj.fill as string,
                fabricObject: obj as Rect,
              });
            }
          });
          
          setTables(loadedTables);
          setVenueElements(loadedVenueElements);
          setGuests(state.guests || []);
          setTableCounter(state.tableCounter || 1);
        });
      } else if (canvas && !savedState) {
        // If no saved state, add a main venue element
        addVenueElement(true);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      if (canvas) {
        // If error loading, add a main venue element
        addVenueElement(true);
      }
    }
  }, [canvas, addVenueElement]);

  // Reset the canvas
  const resetCanvas = useCallback(() => {
    if (canvas) {
      canvas.clear();
      setTables([]);
      setVenueElements([]);
      setGuests([]);
      setTableCounter(1);
      
      // Add a main venue element
      addVenueElement(true);
      
      // Clear localStorage
      localStorage.removeItem('seatingChartState');
    }
  }, [canvas, addVenueElement]);

  return {
    canvas,
    setCanvas,
    tables,
    setTables,
    venueElements,
    setVenueElements,
    guests,
    setGuests,
    totalGuests,
    tableCounter,
    addTable,
    addVenueElement,
    updateGuest,
    removeGuest,
    saveToLocalStorage,
    loadFromLocalStorage,
    resetCanvas,
  };
};
