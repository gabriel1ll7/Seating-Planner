
import { useCallback } from "react";
import { Canvas } from "fabric";
import { Guest, Table, VenueElement } from "../types/seatingChart";

export const useLocalStorage = (
  canvas: Canvas | null,
  tables: Table[],
  venueElements: VenueElement[],
  guests: Guest[],
  tableCounter: number,
  addVenueElement: (isMainVenue?: boolean) => void
) => {
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
          
          return { loadedTables, loadedVenueElements, guests: state.guests || [], tableCounter: state.tableCounter || 1 };
        });
      } else if (canvas && !savedState) {
        // If no saved state, add a main venue element
        addVenueElement(true);
        return null;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      if (canvas) {
        // If error loading, add a main venue element
        addVenueElement(true);
      }
      return null;
    }
  }, [canvas, addVenueElement]);

  // Reset the canvas
  const resetCanvas = useCallback(() => {
    if (canvas) {
      canvas.clear();
      
      // Add a main venue element
      addVenueElement(true);
      
      // Clear localStorage
      localStorage.removeItem('seatingChartState');
    }
  }, [canvas, addVenueElement]);

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    resetCanvas
  };
};
