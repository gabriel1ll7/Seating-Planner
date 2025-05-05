import React, { useRef, useState, useEffect, useMemo } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva"; // Import Konva namespace
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { 
    selectedShapeIdAtom, 
    venueSpaceShapeAtomsAtom,
    otherShapeAtomsAtom,
    isPanningAtom,
    baseShapesAtom
} from "../lib/atoms";
import { WritableAtom, PrimitiveAtom } from "jotai"; // Import atom types
import { RESET } from "jotai/utils"; // Import RESET
import { ElementRect } from "./ElementRect"; // Import ElementRect
import { TableCircle } from "./TableCircle"; // Import TableCircle
import { Shape } from "../lib/atoms"; // Correct path

// Define props if needed later
interface CanvasStageProps {
  // Accept the array of individual shape atoms
  shapeAtoms: PrimitiveAtom<Shape>[];
}

export const CanvasStage: React.FC<CanvasStageProps> = ({ shapeAtoms }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [selectedShapeId, setSelectedShapeId] = useAtom(selectedShapeIdAtom);
  const [isPanning, setIsPanning] = useAtom(isPanningAtom);
  const [isAltPressed, setIsAltPressed] = useState(false);
  
  const setBaseShapes = useSetAtom(baseShapesAtom); // Get setter for base shapes

  // Effect to listen for Alt keydown/keyup globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setIsAltPressed(true);
        e.preventDefault(); // Prevent browser menu focus
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setIsAltPressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    // Add blur listener to reset alt state if window loses focus
    const handleBlur = () => setIsAltPressed(false);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const scaleBy = 1.05;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // How to scale? Zoom in? Or zoom out?
    const direction = e.evt.deltaY > 0 ? -1 : 1;

    // Apply scaling
    let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Clamp scale
    newScale = Math.max(0.1, Math.min(newScale, 10)); // Min 0.1x, Max 10x zoom

    setStageScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setStagePos(newPos);
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target !== stageRef.current) return; 
    setSelectedShapeId(RESET); 
    if (isAltPressed) {
      setIsPanning(true); // Set panning state
      stageRef.current?.startDrag(); 
      e.evt.preventDefault();
    } 
  };

  const handleStageMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning) {
      setIsPanning(false); // Reset panning state
      stageRef.current?.stopDrag();
      const finalPos = stageRef.current?.position();
      if (finalPos) setStagePos(finalPos);
    }
  };
  
  const handleStageMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (isPanning) {
          setIsPanning(false); // Reset panning state
          stageRef.current?.stopDrag();
          const finalPos = stageRef.current?.position();
          if (finalPos) setStagePos(finalPos);
      }
  };

  // Get the derived atom values
  const venueSpaceAtoms = useAtomValue(venueSpaceShapeAtomsAtom);
  const otherShapeAtoms = useAtomValue(otherShapeAtomsAtom);
  
  // Need access to setShape for the specific atom, which is tricky here.
  // Let's just log for now to see if delegation works.
  // const setShape = useSetAtom(...); // Need to figure out how to get the right atom setter
  
  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth - 300} // Adjust width (example: account for sidebar)
      height={window.innerHeight - 100} // Adjust height (example: account for header)
      onWheel={handleWheel}
      onMouseDown={handleStageMouseDown} 
      onMouseUp={handleStageMouseUp}     
      onMouseLeave={handleStageMouseLeave} 
      x={stagePos.x} 
      y={stagePos.y}
      scaleX={stageScale}
      scaleY={stageScale}
      style={{
          backgroundColor: "#f8f9fa",
          // Cursor hint based only on Alt key now
          cursor: isAltPressed ? 'grab' : 'default' 
      }}
    >
      <Layer 
        // Remove layer click handlers
        // onClick={handleLayerClick} 
        // onTap={handleLayerClick}
      >
        {/* Render other shapes first */}
        {otherShapeAtoms.map((shapeAtom) => (
          <ShapeRenderer key={shapeAtom.toString()} shapeAtom={shapeAtom} />
        ))}
        {/* Render Venue Space shapes last (on top) */}
        {venueSpaceAtoms.map((shapeAtom) => (
          <ShapeRenderer key={shapeAtom.toString()} shapeAtom={shapeAtom} />
        ))}
      </Layer>
    </Stage>
  );
};

// Helper component to read the atom value and render the correct shape type
const ShapeRenderer: React.FC<{ shapeAtom: PrimitiveAtom<Shape> }> = ({
  shapeAtom,
}) => {
  const shape = useAtomValue(shapeAtom);

  if (shape.type === "venue") {
    return <ElementRect shapeAtom={shapeAtom} />;
  }

  if (shape.type === "table") {
    return <TableCircle shapeAtom={shapeAtom} />;
  }

  return null; // Or some error/placeholder component
};
