import React, { useRef, useEffect, useMemo, useState } from "react";
import { Circle, Text, Group, Transformer } from "react-konva";
import Konva from "konva";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  selectedShapeIdAtom,
  guestsAtom,
  isPanningAtom,
  isDraggingAtom,
  hoveredTableIdAtom,
  venueSpaceLockedAtom,
  editModeAtom
} from "@/lib/atoms";
import { PrimitiveAtom } from "jotai";
import { Table } from "../types/seatingChart";
import { Shape } from "@/lib/atoms";
import { ChairCircle } from "./ChairCircle";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/ui/use-toast";

interface TableCircleProps {
  shapeAtom: PrimitiveAtom<Shape>;
  highlightedGuestId?: string | null;
  registerRef: (guestId: string | null, node: Konva.Group | null) => void;
}

const MIN_CAPACITY = 6;
const MAX_CAPACITY = 12;
const CHAIR_RADIUS = 8;
const PADDING = 5;
const MIN_TABLE_RADIUS = 30;
const MAX_TABLE_RADIUS = 150;

// Colors for light and dark mode
const LIGHT_COLORS = {
  tableFill: "#E1D4C0", // Warm beige
  tableStroke: "#8A6E4B", // Darker brown for contrast
  highlightedTableStroke: "#FFBF00", // Brighter Gold/Amber for highlight
  highlightedTableStrokeWidth: 4, // Thicker border for highlight (was 3)
  tableTextPrimary: "#3C3226", // Rich dark brown for text
  tableTextSecondary: "#665A4D", // Darker soft brown
  minusButtonFill: "#F0E4EA", // Soft pink
  minusButtonHoverFill: "#F8D7E6", // Lighter pink for hover
  minusButtonStroke: "#A15E7A", // Muted plum
  minusButtonHoverStroke: "#C2779A", // Brighter plum for hover
  minusButtonText: "#5E3345", // Deep plum
  plusButtonFill: "#E3EAE0", // Soft sage
  plusButtonHoverFill: "#D6E9CB", // Lighter sage for hover
  plusButtonStroke: "#7E8F75", // Sage green
  plusButtonHoverStroke: "#98AB8C", // Brighter sage for hover
  plusButtonText: "#5A684C", // Deep moss
  shadowColor: "rgba(121, 85, 72, 0.7)", // Brown shadow with transparency
  countBadgeFill: "rgba(145, 170, 157, 0.8)", // Sage green with transparency
  countBadgeStroke: "#66755C", // Darker green
  countBadgeText: "#FFFFFF", // White text
};

const DARK_COLORS = {
  tableFill: "#4C5864", // Lighter blue-grey
  tableStroke: "#BE9467", // Softer gold/ochre
  highlightedTableStroke: "#FFD700", // Kept previous dark mode gold, but might be overridden by LIGHT_COLORS logic
  highlightedTableStrokeWidth: 4, // Thicker border for highlight (was 3)
  tableTextPrimary: "#EAE3D4", // Soft warm beige
  tableTextSecondary: "#D5C9B7", // Slightly darker beige
  minusButtonFill: "#6F4757", // Deep plum background
  minusButtonHoverFill: "#8B5B6D", // Lighter plum for hover
  minusButtonStroke: "#BB7C96", // Lighter plum
  minusButtonHoverStroke: "#D594AF", // Brighter plum for hover
  minusButtonText: "#EAE3D4", // Soft warm beige
  plusButtonFill: "#4D5647", // Deep moss
  plusButtonHoverFill: "#5F6B58", // Lighter moss for hover
  plusButtonStroke: "#8A9880", // Lighter sage
  plusButtonHoverStroke: "#A6B49B", // Brighter sage for hover
  plusButtonText: "#EAE3D4", // Soft warm beige
  shadowColor: "rgba(121, 85, 72, 0.7)", // Brown shadow with transparency
  countBadgeFill: "rgba(145, 170, 157, 0.7)", // Sage green with transparency
  countBadgeStroke: "#A3B097", // Lighter green
  countBadgeText: "#EAE3D4", // Soft warm beige
};

// Inner component assumes shapeAtom is for a Table
const TableCircleContent: React.FC<{
  shapeAtom: PrimitiveAtom<Table>;
  highlightedGuestId?: string | null;
  registerRef: (guestId: string | null, node: Konva.Group | null) => void;
}> = ({ shapeAtom, highlightedGuestId, registerRef }) => {
  const [shape, setShape] = useAtom(shapeAtom);
  const [selectedShapeId, setSelectedShapeId] = useAtom(selectedShapeIdAtom);
  const currentlyHoveredTableId = useAtomValue(hoveredTableIdAtom);
  const guests = useAtomValue(guestsAtom);
  const isPanning = useAtomValue(isPanningAtom);
  const setIsDragging = useSetAtom(isDraggingAtom);
  const currentVenueLockState = useAtomValue(venueSpaceLockedAtom);
  const editMode = useAtomValue(editModeAtom);
  const shapeRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const isSelected = shape.id === selectedShapeId;
  const { theme } = useTheme();
  const { toast } = useToast();

  // State for button hover effects (these are for the buttons themselves, not the table)
  const [isMinusHovered, setIsMinusHovered] = useState(false);
  const [isPlusHovered, setIsPlusHovered] = useState(false);
  const [isMinusPressed, setIsMinusPressed] = useState(false);
  const [isPlusPressed, setIsPlusPressed] = useState(false);
  const [isTableHovered, setIsTableHovered] = useState(false); // <-- New state for table hover

  // Choose colors based on theme
  const COLORS = LIGHT_COLORS;

  // Draggability depends on shape prop, not panning, AND edit mode
  const isDraggable = shape.draggable !== false && !isPanning && editMode;

  // Hooks are now safe
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Effect to ensure the table color is correctly set initially and after any theme changes
  useEffect(() => {
    // Force redraw to ensure theme colors are properly applied
    // Also ensures redraw if highlight state changes
    if (shapeRef.current) {
      shapeRef.current.getLayer()?.batchDraw();
    }
  }, [theme, currentlyHoveredTableId]); // Re-run when theme or hoveredTableId changes

  // Chair position calculation
  const chairPositions = useMemo(() => {
    const positions = [];
    const angleStep = (2 * Math.PI) / shape.capacity;
    const distance = shape.radius + CHAIR_RADIUS + PADDING;
    for (let i = 0; i < shape.capacity; i++) {
      const angle = i * angleStep - Math.PI / 2;
      positions.push({
        x: distance * Math.cos(angle),
        y: distance * Math.sin(angle),
        angle, // Store the angle for tooltip positioning
      });
    }
    return positions;
  }, [shape.capacity, shape.radius]);

  // Guest lookup map
  const guestMap = useMemo(() => {
    const map = new Map<string, string>();
    guests.forEach((guest) => {
      map.set(`${guest.tableId}---${guest.chairIndex}`, guest.id);
    });
    return map;
  }, [guests]);

  // Count occupied seats at this table
  const occupiedSeatCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < shape.capacity; i++) {
      if (guestMap.has(`${shape.id}---${i}`)) {
        count++;
      }
    }
    return count;
  }, [shape.id, shape.capacity, guestMap]);

  // Find the highest occupied chair index (to prevent reducing capacity below this)
  const highestOccupiedChairIndex = useMemo(() => {
    let highest = -1;

    // Check which chairs are occupied
    for (let i = 0; i < shape.capacity; i++) {
      if (guestMap.has(`${shape.id}---${i}`)) {
        highest = Math.max(highest, i);
      }
    }

    return highest;
  }, [shape.id, shape.capacity, guestMap]);

  const handleSelect = () => {
    // Allow selection only when in edit mode
    if (!editMode) {
      return;
    }
    setSelectedShapeId(shape.id);
  };

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(true);
    // Prevent stage drag if Alt is pressed when starting shape drag
    if (e.evt.altKey) {
      e.target.getStage()?.stopDrag();
    }
    // Also stop standard event bubbling
    e.evt.cancelBubble = true;
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    // Update shape position only if it was actually draggable
    if (shape.draggable !== false) {
      setShape((prev) => ({ ...prev, x: e.target.x(), y: e.target.y() }));
    }
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    // Transformation implies editing
    if (!editMode) return; 
    const node = shapeRef.current;
    if (!node) return;
    const scale = (node.scaleX() + node.scaleY()) / 2;
    node.scaleX(1);
    node.scaleY(1);
    setShape((prev) => {
      const newRadius = prev.radius * scale;
      const clampedRadius = Math.max(
        MIN_TABLE_RADIUS,
        Math.min(newRadius, MAX_TABLE_RADIUS),
      );
      return {
        ...prev,
        x: node.x(),
        y: node.y(),
        radius: clampedRadius,
      };
    });
  };

  const handleCapacityChange = (change: number) => {
    if (!editMode) {
      // Optionally show a toast here if desired
      return;
    }
    // For animation effect
    if (change < 0) {
      // Prevent reducing capacity below the number of occupied chairs
      const minimumRequiredCapacity = highestOccupiedChairIndex + 1;
      if (shape.capacity + change < minimumRequiredCapacity) {
        setIsMinusPressed(true);
        setTimeout(() => setIsMinusPressed(false), 200);

        // Show toast notification
        toast({
          title: "Cannot Reduce Capacity",
          description: `Please remove guests from seats ${minimumRequiredCapacity} to ${shape.capacity} first.`,
          variant: "destructive",
        });
        return;
      }

      setIsMinusPressed(true);
      setTimeout(() => setIsMinusPressed(false), 200);
    } else {
      setIsPlusPressed(true);
      setTimeout(() => setIsPlusPressed(false), 200);
    }

    setShape((prev) => {
      const newCapacity = prev.capacity + change;
      const clampedCapacity = Math.max(
        MIN_CAPACITY,
        Math.min(newCapacity, MAX_CAPACITY),
      );
      return { ...prev, capacity: clampedCapacity };
    });
  };

  // Handle button hover effects
  const handleMinusMouseEnter = () => setIsMinusHovered(true);
  const handleMinusMouseLeave = () => setIsMinusHovered(false);
  const handlePlusMouseEnter = () => setIsPlusHovered(true);
  const handlePlusMouseLeave = () => setIsPlusHovered(false);

  // Updated font sizes for better readability
  const FONT_SIZE_LARGE = 18; // Increased from 16
  const FONT_SIZE_SMALL = 14; // Increased from 12
  const BUTTON_RADIUS = 12; // Slightly larger buttons
  // Bring buttons closer together
  const BUTTON_SPACING = 1.25; // Reduced from 2 (default)

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
        onMouseEnter={() => {
          setIsTableHovered(true);
          // Optional: Change cursor, though Konva shapes can have their own cursor style on hover via CSS on container if needed
          const stage = shapeRef.current?.getStage();
          if (stage) stage.container().style.cursor = "pointer";
        }}
        onMouseLeave={() => {
          setIsTableHovered(false);
          const stage = shapeRef.current?.getStage();
          if (stage) stage.container().style.cursor = "default";
        }}
      >
        {/* Main Circle - Table */}
        <Circle
          radius={shape.radius}
          fill={COLORS.tableFill}
          stroke={
            shape.id === currentlyHoveredTableId
              ? COLORS.highlightedTableStroke
              : COLORS.tableStroke
          }
          strokeWidth={
            shape.id === currentlyHoveredTableId
              ? COLORS.highlightedTableStrokeWidth
              : 2
          }
          shadowBlur={isSelected ? 12 : 6}
          shadowColor={COLORS.shadowColor}
          shadowOpacity={isSelected ? 0.4 : 0.2}
          shadowOffset={{ x: 2, y: 2 }}
          perfectDrawEnabled={false}
          listening={true}
        />

        {/* Table Number - Improved contrast and visibility */}
        <Text
          text={`Table ${shape.number}`}
          fontSize={FONT_SIZE_LARGE}
          fontFamily="'Libre Baskerville', serif"
          fill={COLORS.tableTextPrimary}
          fontStyle="bold"
          align="center"
          verticalAlign="middle"
          width={shape.radius * 2}
          offsetX={shape.radius}
          offsetY={FONT_SIZE_LARGE + PADDING}
          listening={false}
          perfectDrawEnabled={false}
        />

        {/* Capacity Text - Enhanced visibility */}
        <Text
          text={`${shape.capacity} Guests`}
          fontSize={FONT_SIZE_SMALL}
          fontFamily="'Source Sans Pro', sans-serif"
          fontStyle="bold"
          fill={COLORS.tableTextSecondary}
          align="center"
          verticalAlign="middle"
          width={shape.radius * 2}
          offsetX={shape.radius}
          offsetY={0}
          listening={false}
          perfectDrawEnabled={false}
        />

        {/* Chairs */}
        {chairPositions.map((pos, index) => {
          const guestId = guestMap.get(`${shape.id}---${index}`) || null;

          return (
            <ChairCircle
              key={`chair-${shape.id}-${index}`}
              tableId={shape.id}
              chairIndex={index}
              x={pos.x}
              y={pos.y}
              radius={CHAIR_RADIUS}
              guestId={guestId}
              registerRef={registerRef}
            />
          );
        })}

        {/* Seat Occupancy Badge - START COMMENTING OUT */}
        {/* 
        <Group x={0} y={-shape.radius - 12}>
          <Circle 
            radius={16}
            fill={COLORS.countBadgeFill}
            stroke={COLORS.countBadgeStroke}
            strokeWidth={1}
            shadowBlur={4}
            shadowOpacity={0.15}
            shadowOffset={{ x: 1, y: 1 }}
            perfectDrawEnabled={false}
            listening={false}
          />
          <Text 
            text={`${occupiedSeatCount}/${shape.capacity}`}
            fontSize={10}
            fontFamily="'Source Sans Pro', sans-serif"
            fontStyle="bold"
            fill={COLORS.countBadgeText}
            align="center"
            verticalAlign="middle"
            width={32}
            height={10}
            offsetX={16}
            offsetY={5}
            listening={false}
            perfectDrawEnabled={false}
          />
        </Group>
        */}
        {/* Seat Occupancy Badge - END COMMENTING OUT */}

        {/* Buttons container for centering the controls */}
        <Group
          x={0}
          y={FONT_SIZE_SMALL + PADDING * 3}
          visible={isTableHovered || isSelected}
        >
          {/* Minus Button */}
          <Group
            x={-BUTTON_RADIUS * BUTTON_SPACING}
            y={0}
            onClick={() => handleCapacityChange(-1)}
            onTap={() => handleCapacityChange(-1)}
            opacity={shape.capacity > MIN_CAPACITY ? 1 : 0.5}
            onMouseEnter={handleMinusMouseEnter}
            onMouseLeave={handleMinusMouseLeave}
            scaleX={isMinusPressed ? 0.9 : 1}
            scaleY={isMinusPressed ? 0.9 : 1}
          >
            <Circle
              radius={BUTTON_RADIUS}
              fill={
                isMinusHovered
                  ? COLORS.minusButtonHoverFill
                  : COLORS.minusButtonFill
              }
              stroke={
                isMinusHovered
                  ? COLORS.minusButtonHoverStroke
                  : COLORS.minusButtonStroke
              }
              strokeWidth={1.5} // Restored original strokeWidth
              shadowBlur={isMinusHovered ? 5 : 3}
              shadowOpacity={isMinusHovered ? 0.3 : 0.2}
              shadowOffset={{ x: 1, y: 1 }}
            />
            <Text
              text="-"
              fontSize={16} // Restored original fontSize
              fontStyle="bold"
              fill={COLORS.minusButtonText} // Restored original fill logic
              width={BUTTON_RADIUS * 2}
              height={BUTTON_RADIUS * 2} // Restored original height
              align="center"
              verticalAlign="middle"
              offsetX={BUTTON_RADIUS}
              offsetY={BUTTON_RADIUS}
              listening={false}
            />
          </Group>

          {/* Plus Button */}
          <Group
            x={BUTTON_RADIUS * BUTTON_SPACING}
            y={0}
            // Only allow capacity change if in edit mode
            onClick={editMode ? () => handleCapacityChange(1) : undefined}
            onTap={editMode ? () => handleCapacityChange(1) : undefined}
            opacity={shape.capacity < MAX_CAPACITY ? 1 : 0.5}
            onMouseEnter={handlePlusMouseEnter}
            onMouseLeave={handlePlusMouseLeave}
            scaleX={isPlusPressed ? 0.9 : 1}
            scaleY={isPlusPressed ? 0.9 : 1}
          >
            <Circle
              radius={BUTTON_RADIUS}
              fill={
                isPlusHovered
                  ? COLORS.plusButtonHoverFill
                  : COLORS.plusButtonFill
              }
              stroke={
                isPlusHovered
                  ? COLORS.plusButtonHoverStroke
                  : COLORS.plusButtonStroke
              }
              strokeWidth={1.5} // Restored original strokeWidth
              shadowBlur={isPlusHovered ? 5 : 3}
              shadowOpacity={isPlusHovered ? 0.3 : 0.2}
              shadowOffset={{ x: 1, y: 1 }}
            />
            <Text
              text="+"
              fontSize={16} // Restored original fontSize
              fontStyle="bold"
              fill={COLORS.plusButtonText} // Restored original fill logic
              width={BUTTON_RADIUS * 2}
              height={BUTTON_RADIUS * 2} // Restored original height
              align="center"
              verticalAlign="middle"
              offsetX={BUTTON_RADIUS}
              offsetY={BUTTON_RADIUS}
              listening={false}
            />
          </Group>
        </Group>
      </Group>
      {/* Only show Transformer if selected AND in edit mode */}
      {isSelected && editMode && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            const newRadius = Math.max(newBox.width, newBox.height) / 2;
            if (newRadius < 10) return oldBox;
            return { ...oldBox, width: newRadius * 2, height: newRadius * 2 };
          }}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          rotateEnabled={false}
          borderStroke={COLORS.tableStroke}
          anchorFill={COLORS.tableFill}
          anchorStroke={COLORS.tableStroke}
          anchorCornerRadius={5}
        />
      )}
    </React.Fragment>
  );
};

// Wrapper component
export const TableCircle: React.FC<TableCircleProps> = ({
  shapeAtom,
  highlightedGuestId,
  registerRef,
}) => {
  const shapeValue = useAtomValue(shapeAtom);

  if (shapeValue.type !== "table") {
    return null;
  }

  return (
    <TableCircleContent
      shapeAtom={shapeAtom as PrimitiveAtom<Table>}
      highlightedGuestId={highlightedGuestId}
      registerRef={registerRef}
    />
  );
};
