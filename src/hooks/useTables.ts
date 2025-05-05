
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
    if (!canvas) return;

    const newTable: Table = {
      id: `table-${Date.now()}`,
      number: tableCounter,
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      radius: 60,
      capacity: 8, // Default capacity
    };

    // Create table on canvas first
    const tableWithFabricObject = createTableOnCanvas(
      canvas,
      newTable,
      [],
      () => {} // Temporary empty handler
    );

    // Then add to state
    setTables((prev) => [...prev, tableWithFabricObject]);
    setTableCounter((prev) => prev + 1);
  }, [canvas, tableCounter, setTables, setTableCounter]);

  return { addTable };
};
