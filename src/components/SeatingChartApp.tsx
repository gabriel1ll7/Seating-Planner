
import { useState, useEffect } from "react";
import { Canvas } from "./Canvas";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Controls } from "./Controls";
import { useToast } from "@/components/ui/use-toast";
import { useSeatingChart } from "@/hooks/useSeatingChart";

export const SeatingChartApp = () => {
  const { toast } = useToast();
  const {
    canvas,
    setCanvas,
    tables,
    setTables,
    guests,
    setGuests,
    totalGuests,
    addTable,
    addVenueElement,
    loadFromLocalStorage,
    saveToLocalStorage,
    resetCanvas,
  } = useSeatingChart();

  // Initial load from localStorage
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (canvas) {
      saveToLocalStorage();
    }
  }, [canvas, tables, guests, saveToLocalStorage]);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear the entire canvas and start fresh?")) {
      resetCanvas();
      toast({
        title: "Canvas Reset",
        description: "Your seating chart has been cleared.",
      });
    }
  };

  const handleAddTable = () => {
    addTable();
    toast({
      title: "Table Added",
      description: "A new table has been added to your seating chart.",
    });
  };

  const handleAddVenueElement = () => {
    addVenueElement();
    toast({
      title: "Venue Element Added",
      description: "A new venue element has been added to your seating chart.",
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header totalGuests={totalGuests} onReset={handleReset} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar guests={guests} tables={tables} />
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <Controls 
            onAddTable={handleAddTable}
            onAddVenueElement={handleAddVenueElement}
          />
          <Canvas 
            canvas={canvas}
            setCanvas={setCanvas}
            tables={tables}
            setTables={setTables}
            guests={guests}
            setGuests={setGuests}
          />
        </div>
      </div>
    </div>
  );
};
