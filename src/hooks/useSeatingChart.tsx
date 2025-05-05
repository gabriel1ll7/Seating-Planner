
import { useState, useCallback, useEffect } from "react";
import { Canvas } from "fabric";
import { Table, VenueElement, Guest } from "@/types/seatingChart";
import { useVenueElements } from "./useVenueElements";
import { useTables } from "./useTables";
import { useGuestManagement } from "./useGuestManagement";
import { useLocalStorage } from "./useLocalStorage";

export type { Guest, Table, VenueElement };

export const useSeatingChart = () => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [venueElements, setVenueElements] = useState<VenueElement[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tableCounter, setTableCounter] = useState(1);

  // Calculate total guests
  const totalGuests = guests.length;

  // Set up venue elements management
  const { addVenueElement } = useVenueElements(
    venueElements,
    setVenueElements,
    canvas
  );

  // Set up table management
  const { addTable } = useTables(
    tables,
    setTables,
    tableCounter,
    setTableCounter,
    canvas
  );

  // Set up guest management
  const { updateGuest, removeGuest } = useGuestManagement(guests, setGuests);

  // Set up localStorage management
  const { saveToLocalStorage, loadFromLocalStorage, resetCanvas } = useLocalStorage(
    canvas,
    tables,
    venueElements,
    guests,
    tableCounter,
    addVenueElement
  );

  // Override the loadFromLocalStorage to properly update state
  const handleLoadFromLocalStorage = useCallback(() => {
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
                  fabricObject: obj as any,
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
                fabricObject: obj as any,
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

  // Override resetCanvas to properly update state
  const handleResetCanvas = useCallback(() => {
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
    loadFromLocalStorage: handleLoadFromLocalStorage,
    resetCanvas: handleResetCanvas,
  };
};
