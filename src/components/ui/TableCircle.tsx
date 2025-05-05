import React, { useRef, useEffect } from 'react';
import { Circle, Transformer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva'; // Import Konva namespace for useRef types if needed
import { ShapeProps } from '@/types/types'; // Keep this for now
// import { ShapeProps } from '../../types/types'; // Alternative relative path if needed
import { useSetAtom } from 'jotai';
import { stageDraggableAtom } from '../../lib/atoms'; // Corrected relative path

interface TableCircleProps extends ShapeProps {
  id: string; // Ensure id is part of the props
  x: number;
  y: number;
  radius: number;
  fill?: string;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (newAttrs: Partial<ShapeProps>) => void;
  draggable: boolean; // Ensure draggable is used
}

const TableCircle: React.FC<TableCircleProps> = ({
  id, // Use id prop
  x,
  y,
  radius,
  fill = 'rgba(0, 0, 255, 0.5)', // Default fill if needed
  isSelected,
  onSelect,
  onChange,
  draggable, // Use draggable prop
}) => {
  const shapeRef = useRef<Konva.Circle>(null); // More specific type
  const trRef = useRef<Konva.Transformer>(null); // More specific type
  const setStageDraggable = useSetAtom(stageDraggableAtom); // Get setter

  const minRadius = 10;
  const maxRadius = 200;


  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleTransform = (e: KonvaEventObject<Event>) => {
    const node = shapeRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    // Assuming uniform scaling for circles, use scaleX for radius calculation
    const newRadius = Math.max(minRadius, Math.min(maxRadius, node.radius() * scaleX));


    // Recalculate scale based on clamped radius if necessary
    // This might not be directly needed if boundBoxFunc handles clamping,
    // but good for updating state if needed separately.
    const adjustedScale = newRadius / node.radius();


    node.scaleX(1); // Reset scale before applying new attributes
    node.scaleY(1);
    onChange({
      id: id, // Pass id back
      x: node.x(),
      y: node.y(),
      radius: newRadius, // Send the clamped radius
      // keepRatio aspect is handled by boundBoxFunc or transformer config
    });
  };

  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    e.evt.cancelBubble = true; // Keep stopping propagation
    // const stage = e.target.getStage(); // Remove direct manipulation
    // if (stage) { stage.draggable(false); }
    setStageDraggable(false); // Set atom state
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
     onChange({
       id: id,
       x: e.target.x(),
       y: e.target.y(),
     });
     // const stage = e.target.getStage(); // Remove direct manipulation
     // if (stage) { stage.draggable(true); }
     setStageDraggable(true); // Set atom state
  };

  const handleTransformEnd = (e: KonvaEventObject<Event>) => {
      const node = shapeRef.current;
      if (!node) return;

      const scaleX = node.scaleX();
      // Assuming uniform scaling for circles, use scaleX for radius calculation
      const newRadius = Math.max(minRadius, Math.min(maxRadius, node.radius() * scaleX));


      // Recalculate scale based on clamped radius if necessary
      // This might not be directly needed if boundBoxFunc handles clamping,
      // but good for updating state if needed separately.
      const adjustedScale = newRadius / node.radius();


      node.scaleX(1); // Reset scale before applying new attributes
      node.scaleY(1);
      onChange({
        id: id, // Pass id back
        x: node.x(),
        y: node.y(),
        radius: newRadius, // Send the clamped radius
        // keepRatio aspect is handled by boundBoxFunc or transformer config
      });
      
      // const stage = e.target.getStage(); // Remove direct manipulation
      // if (stage) { stage.draggable(true); }
      setStageDraggable(true); // Set atom state
  };

  const boundBoxFunc = (oldBox: any, newBox: any) => {
    // Calculate the radius from the new bounding box width (assuming uniform scaling)
    const newRadius = newBox.width / 2;


    // Enforce minimum radius
    if (newRadius < minRadius) {
      const scale = minRadius / (oldBox.width / 2);
      newBox.width = minRadius * 2;
      newBox.height = minRadius * 2;
      // Adjust position if necessary to keep center fixed (optional, depends on desired anchor)
       // Example: Centered scaling adjustment
      newBox.x = oldBox.x + oldBox.width / 2 - newBox.width / 2;
      newBox.y = oldBox.y + oldBox.height / 2 - newBox.height / 2;
      return newBox; // Return adjusted box for min size
    }


    // Enforce maximum radius
    if (newRadius > maxRadius) {
        const scale = maxRadius / (oldBox.width / 2);
        newBox.width = maxRadius * 2;
        newBox.height = maxRadius * 2;
        // Adjust position if necessary
        newBox.x = oldBox.x + oldBox.width / 2 - newBox.width / 2;
        newBox.y = oldBox.y + oldBox.height / 2 - newBox.height / 2;
        return newBox; // Return adjusted box for max size
    }


    // If within bounds, return the proposed new box
    return newBox;
  };


  return (
    <>
      <Circle
        ref={shapeRef}
        id={id} // Use id prop
        x={x}
        y={y}
        radius={radius}
        fill={fill}
        draggable={draggable} // Use draggable prop
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={handleDragStart} // Add drag start handler
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd} // Use onTransformEnd for final update
        // onTransform={handleTransform} // Remove live transform update
        // Ensure dragBoundFunc is applied if needed, maybe from props or context
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false} // Typically disable rotation for tables
          keepRatio={true} // Keep aspect ratio for circles
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']} // Use corner anchors
          boundBoxFunc={boundBoxFunc} // Apply the bounding function
        />
      )}
    </>
  );
};

export default TableCircle; 