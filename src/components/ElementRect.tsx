import React, { useRef, useEffect, useMemo } from "react";
import { Rect, Text, Group, Transformer } from "react-konva";
import Konva from "konva";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { selectedShapeIdAtom, venueSpaceLockedAtom, isPanningAtom, renameModalStateAtom } from "@/lib/atoms";
import { PrimitiveAtom } from "jotai";
import { VenueElement } from "../types/seatingChart";
import { Shape } from "@/lib/atoms";

interface ElementRectProps {
  shapeAtom: PrimitiveAtom<Shape>; // Accept the specific atom for this shape
}

const ElementRectContent: React.FC<{ shapeAtom: PrimitiveAtom<VenueElement> }> = ({ shapeAtom }) => {
  const [shape, setShape] = useAtom(shapeAtom);
  const [selectedShapeId, setSelectedShapeId] = useAtom(selectedShapeIdAtom);
  const isPanning = useAtomValue(isPanningAtom);
  const isVenueLocked = useAtomValue(venueSpaceLockedAtom);
  const setRenameModalState = useSetAtom(renameModalStateAtom);
  const shapeRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const isSelected = shape.id === selectedShapeId;
  const isVenueSpace = shape.title === "Venue Space";

  // Draggability depends on type, panning state, and global lock state
  const isDraggable = isVenueSpace ? 
    !isVenueLocked && !isPanning : // Venue space only draggable if unlocked AND not panning
    !isPanning; // Other elements only non-draggable if panning
    
  // Calculate resize enabled state for Transformer
  const isResizeEnabled = !isVenueSpace || !isVenueLocked;

  // Add console log for debugging lock state propagation
  if (isVenueSpace) {
      console.log(`ElementRect (${shape.id}): isVenueSpace=${isVenueSpace}, isVenueLocked=${isVenueLocked}, calculated_isDraggable=${isDraggable}, calculated_isResizeEnabled=${isResizeEnabled}`);
  }

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleSelect = () => {
    setSelectedShapeId(shape.id);
  };

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    // Prevent stage drag if Alt is pressed when starting shape drag
    if (e.evt.altKey) {
        e.target.getStage()?.stopDrag();
    }
    // Also stop standard event bubbling
    e.evt.cancelBubble = true; 
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    // Update shape position only if it was intended to be draggable
    const baseDraggable = isVenueSpace ? !isVenueLocked : true;
    if(baseDraggable) {
        setShape((prev) => ({ ...prev, x: e.target.x(), y: e.target.y() }));
    }
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = shapeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    setShape((prev) => ({
        ...prev,
        x: node.x(),
        y: node.y(),
        width: Math.max(5, prev.width * scaleX),
        height: Math.max(5, prev.height * scaleY),
    }));
  };

  const handleTextDoubleClick = () => {
    console.log(`Text dbl clicked for ${shape.id}`);
    setRenameModalState({ 
        isOpen: true, 
        elementId: shape.id, 
        currentTitle: shape.title 
    });
  };

  const handleTextClick = () => {
    // Only open rename modal on single click if already selected
    if (isSelected) {
      console.log(`Text single clicked for selected element ${shape.id}`); // Debug log
      setRenameModalState({ 
          isOpen: true, 
          elementId: shape.id, 
          currentTitle: shape.title 
      });
    }
  };

  return (
    <React.Fragment>
      <Group
        ref={shapeRef}
        id={shape.id}
        x={shape.x}
        y={shape.y}
        draggable={isDraggable}
        onClick={handleSelect}
        onTap={handleSelect}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        listening={!isVenueSpace || isSelected}
      >
        <Rect
          width={shape.width}
          height={shape.height}
          fill={shape.color || "rgba(211, 211, 211, 0.1)"} 
          stroke={shape.stroke || "transparent"} 
          strokeWidth={shape.strokeWidth || 0} 
          cornerRadius={4}
          perfectDrawEnabled={false}
          listening={!isVenueSpace || isSelected}
          shadowBlur={isSelected ? 10 : 5}
          shadowOpacity={isSelected ? 0.6 : 0.3}
        />
        {!isVenueSpace && (
          <Text
            text={shape.title}
            fontSize={14}
            fontFamily="Arial"
            fill="#333"
            align="center"
            verticalAlign="middle"
            width={shape.width}
            height={shape.height}
            listening={true}
            perfectDrawEnabled={false}
            onClick={handleTextClick}
            onDblClick={handleTextDoubleClick}
            onDblTap={handleTextDoubleClick}
          />
        )}
      </Group>
      {isSelected && (
        <Transformer
           ref={trRef}
           resizeEnabled={isResizeEnabled}
           rotateEnabled={false}
           boundBoxFunc={(oldBox, newBox) => { 
              if (newBox.width < 10 || newBox.height < 10) {
                  return oldBox;
              } 
              return newBox; 
           }}
           keepRatio={false}
        />
      )}
    </React.Fragment>
  );
}

// Wrapper component that performs the type check *before* rendering the content
export const ElementRect: React.FC<ElementRectProps> = ({ shapeAtom }) => {
  // Read the value once here for the type check
  const shapeValue = useAtom(shapeAtom)[0]; 

  if (shapeValue.type !== 'venue') {
    return null; 
  }

  // If it's the correct type, render the content component, casting the atom type
  return <ElementRectContent shapeAtom={shapeAtom as PrimitiveAtom<VenueElement>} />;
};
