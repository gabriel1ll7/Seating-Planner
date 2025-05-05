
import { useCallback } from "react";
import { Canvas } from "fabric";
import { VenueElement } from "../types/seatingChart";
import { getRandomPastelColor } from "../utils/venueUtils";

export const useVenueElements = (
  venueElements: VenueElement[],
  setVenueElements: React.Dispatch<React.SetStateAction<VenueElement[]>>,
  canvas: Canvas | null
) => {
  // Add a venue element (rectangle) to the canvas
  const addVenueElement = useCallback(
    (isMainVenue: boolean = false) => {
      if (!canvas) {
        console.error("Cannot add venue element: Canvas is null");
        return;
      }

      console.log("Adding venue element to canvas", canvas);
      
      // Get canvas dimensions for positioning
      const canvasWidth = canvas.width || 1000;
      const canvasHeight = canvas.height || 800;
      
      // Get viewport transform to position in the visible area
      const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      const zoom = canvas.getZoom();
      
      // Calculate center of the visible viewport
      const visibleCenterX = (-vpt[4] / zoom) + (canvasWidth / (2 * zoom));
      const visibleCenterY = (-vpt[5] / zoom) + (canvasHeight / (2 * zoom));
      
      // Create the new venue element
      const newElement: VenueElement = {
        id: `venue-element-${Date.now()}`,
        title: isMainVenue ? "Main Venue" : "New Element",
        left: isMainVenue ? 100 : visibleCenterX - 150,
        top: isMainVenue ? 100 : visibleCenterY - 100,
        width: isMainVenue ? canvasWidth - 200 : 300,
        height: isMainVenue ? canvasHeight - 200 : 200,
        color: getRandomPastelColor(),
      };

      console.log("Created new venue element:", newElement);
      
      // Update state with the new venue element
      setVenueElements(prev => [...prev, newElement]);
      
      console.log("Venue element added successfully");
    },
    [canvas, setVenueElements]
  );

  return { addVenueElement };
};
