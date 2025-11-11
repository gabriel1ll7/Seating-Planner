import React, { useMemo } from "react";
import { atom, useAtomValue, PrimitiveAtom } from "jotai";
import { Shape } from "../lib/atoms"; // Corrected import path
import { CanvasStage } from "./CanvasStage"; // Adjust path if needed

interface SortedCanvasStageAdapterProps {
  shapeAtoms: PrimitiveAtom<Shape>[];
}

export const SortedCanvasStageAdapter: React.FC<
  SortedCanvasStageAdapterProps
> = ({ shapeAtoms }) => {
  // Create a memoized derived atom that reads all shape values from the passed atoms.
  const getShapeValuesAtom = useMemo(
    () => atom((get) => shapeAtoms.map((primitiveAtom) => get(primitiveAtom))),
    [shapeAtoms], // Recreate this derived atom only if the shapeAtoms array instance changes
  );
  const shapeValues = useAtomValue(getShapeValuesAtom);

  const sortedAtomsForCanvas = useMemo(() => {
    // Combine atoms with their current values for sorting
    const atomsWithValues = shapeAtoms.map((primitiveAtom, index) => ({
      atom: primitiveAtom,
      value: shapeValues[index] as Shape, // Relies on order preservation from map
    }));

    // Sort: 'venue' types first, then 'table' types.
    // This order ensures venue elements are rendered first (bottom),
    // and tables are rendered later (on top).
    atomsWithValues.sort((itemA, itemB) => {
      const typeA = itemA.value.type;
      const typeB = itemB.value.type;

      const orderPriority: Record<Shape["type"], number> = {
        venue: 1, // Rendered first
        table: 2, // Rendered second (on top of venue)
      };

      const priorityA = orderPriority[typeA] || 99; // Fallback for unknown types
      const priorityB = orderPriority[typeB] || 99;

      return priorityA - priorityB;
    });

    // Return just the sorted atoms
    return atomsWithValues.map((item) => item.atom);
  }, [shapeAtoms, shapeValues]); // Re-sort if atoms array or their values change

  return <CanvasStage shapeAtoms={sortedAtomsForCanvas} />;
};
