import React, { useRef, useEffect, useMemo } from "react";
import { Circle, Text, Group, Transformer } from "react-konva";
import Konva from "konva";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { selectedShapeIdAtom, guestsAtom, isPanningAtom } from "@/lib/atoms";
import { PrimitiveAtom } from "jotai";
import { Table } from "../types/seatingChart";
import { Shape } from "@/lib/atoms";
import { ChairCircle } from "./ChairCircle";

interface TableCircleProps {
  shapeAtom: PrimitiveAtom<Shape>;
}

const MIN_CAPACITY = 6;
const MAX_CAPACITY = 12;
const CHAIR_RADIUS = 8;
const PADDING = 5;
const MIN_TABLE_RADIUS = 30;
const MAX_TABLE_RADIUS = 150;

// Inner component assumes shapeAtom is for a Table
const TableCircleContent: React.FC<{ shapeAtom: PrimitiveAtom<Table> }> = ({ shapeAtom }) => {
  const [shape, setShape] = useAtom(shapeAtom);
  const [selectedShapeId, setSelectedShapeId] = useAtom(selectedShapeIdAtom);
  const guests = useAtomValue(guestsAtom);
  const isPanning = useAtomValue(isPanningAtom);
  const shapeRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const isSelected = shape.id === selectedShapeId;

  // Draggability depends on shape prop AND not panning
  const isDraggable = (shape.draggable !== false) && !isPanning;

  // Hooks are now safe
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Chair position calculation
  const chairPositions = useMemo(() => {
    const positions = [];
    const angleStep = (2 * Math.PI) / shape.capacity;
    const distance = shape.radius + CHAIR_RADIUS + PADDING;
    for (let i = 0; i < shape.capacity; i++) {
      const angle = i * angleStep - Math.PI / 2;
      positions.push({ x: distance * Math.cos(angle), y: distance * Math.sin(angle) });
    }
    return positions;
  }, [shape.capacity, shape.radius]);

  // Guest lookup map
  const guestMap = useMemo(() => {
    const map = new Map<string, string>();
    guests.forEach(guest => { map.set(`${guest.tableId}---${guest.chairIndex}`, guest.id); });
    return map;
  }, [guests]);

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
    // Update shape position only if it was actually draggable
    if(shape.draggable !== false) {
        setShape((prev) => ({ ...prev, x: e.target.x(), y: e.target.y() }));
    }
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = shapeRef.current;
    if (!node) return;
    const scale = (node.scaleX() + node.scaleY()) / 2;
    node.scaleX(1);
    node.scaleY(1);
    setShape((prev) => {
        const newRadius = prev.radius * scale;
        const clampedRadius = Math.max(MIN_TABLE_RADIUS, Math.min(newRadius, MAX_TABLE_RADIUS));
        return {
        ...prev,
        x: node.x(),
        y: node.y(),
            radius: clampedRadius,
        };
    });
  };

  const handleCapacityChange = (change: number) => {
    setShape(prev => {
        const newCapacity = prev.capacity + change;
        const clampedCapacity = Math.max(MIN_CAPACITY, Math.min(newCapacity, MAX_CAPACITY));
        return { ...prev, capacity: clampedCapacity };
    });
  };

  // Constants for layout
  const FONT_SIZE_LARGE = 16;
  const FONT_SIZE_SMALL = 12;
  const BUTTON_RADIUS = 10;

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
        offsetX={0} 
        offsetY={0}
      >
        {/* Main Circle */}
        <Circle radius={shape.radius} fill="#ffffff" stroke="#cccccc" strokeWidth={1} shadowBlur={isSelected ? 10 : 5} shadowOpacity={isSelected ? 0.4 : 0.2} perfectDrawEnabled={false} />
        {/* Table Number */}
        <Text text={`Table ${shape.number}`} fontSize={FONT_SIZE_LARGE} fontFamily='Arial' fill="#333" align="center" verticalAlign="middle" width={shape.radius * 2} height={FONT_SIZE_LARGE} offsetX={shape.radius} offsetY={FONT_SIZE_LARGE + PADDING} listening={false} perfectDrawEnabled={false} />
        {/* Capacity Text */}
        <Text text={`${shape.capacity} Guests`} fontSize={FONT_SIZE_SMALL} fontFamily='Arial' fill="#666" align="center" verticalAlign="middle" width={shape.radius * 2} height={FONT_SIZE_SMALL} offsetX={shape.radius} offsetY={0} listening={false} perfectDrawEnabled={false} />
        {/* Minus Button */}
        <Group x={-BUTTON_RADIUS * 2} y={FONT_SIZE_SMALL + PADDING * 3} onClick={() => handleCapacityChange(-1)} onTap={() => handleCapacityChange(-1)} opacity={shape.capacity > MIN_CAPACITY ? 1 : 0.5}>
            <Circle radius={BUTTON_RADIUS} fill="#fdecec" stroke="#fca5a5" strokeWidth={1} />
            <Text text="-" fontSize={14} fill="#ef4444" width={BUTTON_RADIUS*2} height={BUTTON_RADIUS*2} align="center" verticalAlign="middle" offsetX={BUTTON_RADIUS} offsetY={BUTTON_RADIUS} listening={false}/>
        </Group>
        {/* Plus Button */}
        <Group x={BUTTON_RADIUS * 2} y={FONT_SIZE_SMALL + PADDING * 3} onClick={() => handleCapacityChange(1)} onTap={() => handleCapacityChange(1)} opacity={shape.capacity < MAX_CAPACITY ? 1 : 0.5}>
            <Circle radius={BUTTON_RADIUS} fill="#dcfce7" stroke="#86efac" strokeWidth={1} />
            <Text text="+" fontSize={14} fill="#22c55e" width={BUTTON_RADIUS*2} height={BUTTON_RADIUS*2} align="center" verticalAlign="middle" offsetX={BUTTON_RADIUS} offsetY={BUTTON_RADIUS} listening={false}/>
        </Group>
        {/* Chairs */}
        {chairPositions.map((pos, index) => {
          const guestId = guestMap.get(`${shape.id}---${index}`) || null;
          return (
            <ChairCircle key={`chair-${shape.id}-${index}`} tableId={shape.id} chairIndex={index} x={pos.x} y={pos.y} radius={CHAIR_RADIUS} guestId={guestId} />
          );
        })}
      </Group>
      {isSelected && (
        <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => {
            const newRadius = Math.max(newBox.width, newBox.height) / 2;
            if (newRadius < 10) return oldBox;
            return { ...oldBox, width: newRadius * 2, height: newRadius * 2 };
          }} enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']} rotateEnabled={false} />
      )}
    </React.Fragment>
  );
}

// Wrapper component
export const TableCircle: React.FC<TableCircleProps> = ({ shapeAtom }) => {
  const shapeValue = useAtomValue(shapeAtom);

  if (shapeValue.type !== 'table') {
    return null;
  }

  return <TableCircleContent shapeAtom={shapeAtom as PrimitiveAtom<Table>} />;
};
