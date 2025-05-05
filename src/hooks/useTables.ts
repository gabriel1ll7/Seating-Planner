
import { useCallback } from "react";
import { Canvas } from "fabric";
import { Table } from "../types/seatingChart";
import { createTableOnCanvas } from "../utils/canvasUtils";

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
    
    // Create the new table object
    const newTable: Table = {
      id: `table-${Date.now()}`,
      number: tableCounter,
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      radius: 60,
      capacity: 8, // Default capacity
    };

    // Create table on canvas and get the table with fabric object
    const tableWithFabricObject = createTableOnCanvas(
      canvas,
      newTable,
      [], // Empty guests array for new table
      () => {} // Temporary empty handler
    );

    // Update state with the new table
    setTables(prev => [...prev, tableWithFabricObject]);
    setTableCounter(prev => prev + 1);
    
    console.log("Table added successfully");
  }, [canvas, tableCounter, setTables, setTableCounter]);

  return { addTable };
};
