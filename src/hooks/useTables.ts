
import { useCallback } from "react";
import { Canvas } from "fabric";
import { Table } from "../types/seatingChart";

export const useTables = (
  tables: Table[],
  setTables: React.Dispatch<React.SetStateAction<Table[]>>,
  tableCounter: number,
  setTableCounter: React.Dispatch<React.SetStateAction<number>>,
  canvas: Canvas | null
) => {
  // Add a new table to the canvas
  const addTable = useCallback(() => {
    if (!canvas) {
      console.error("Cannot add table: Canvas is null");
      return;
    }

    console.log("Adding table to canvas", canvas);
    
    // Get canvas dimensions for positioning
    const canvasWidth = canvas.width || 1000;
    const canvasHeight = canvas.height || 800;
    
    // Create the new table object
    const newTable: Table = {
      id: `table-${Date.now()}`,
      number: tableCounter,
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      radius: 60,
      capacity: 8, // Default capacity
    };

    console.log("Created new table:", newTable);
    
    // Update state with the new table
    setTables(prev => [...prev, newTable]);
    setTableCounter(prev => prev + 1);
    
    console.log("Table added successfully");
  }, [canvas, tableCounter, setTables, setTableCounter]);

  return { addTable };
};
