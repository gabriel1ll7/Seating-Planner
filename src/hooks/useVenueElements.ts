
import { useCallback } from "react";
import { Canvas } from "fabric";
import { VenueElement } from "../types/seatingChart";
import { getRandomPastelColor } from "../utils/venueUtils";
import { createVenueElementOnCanvas } from "../utils/canvasUtils";

export const useVenueElements = (
  venueElements: VenueElement[],
  setVenueElements: React.Dispatch<React.SetStateAction<VenueElement[]>>,
  canvas: Canvas | null
) => {
  // Add a venue element (rectangle) to the canvas
  const addVenueElement = useCallback(
    (isMainVenue: boolean = false) => {
      if (!canvas) return;

      const newElement: VenueElement = {
        id: `venue-element-${Date.now()}`,
        title: isMainVenue ? "Main Venue" : "New Element",
        left: isMainVenue ? 50 : canvas.width! / 2,
        top: isMainVenue ? 50 : canvas.height! / 2,
        width: isMainVenue ? canvas.width! - 100 : 150,
        height: isMainVenue ? canvas.height! - 100 : 100,
        color: getRandomPastelColor(),
      };

      // Create element on canvas first
      const elementWithFabricObject = createVenueElementOnCanvas(
        canvas,
        newElement,
        () => {} // Temporary empty handler
      );

      // Then add to state
      setVenueElements((prev) => [...prev, elementWithFabricObject]);
    },
    [canvas, setVenueElements]
  );

  return { addVenueElement };
};
