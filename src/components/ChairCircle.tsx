import React, { useState, useMemo } from "react";
import { Circle, Group, Label, Tag, Text } from "react-konva";
import Konva from "konva";
import { useSetAtom, useAtomValue } from "jotai";
import { modalStateAtom, guestsAtom, hoveredGuestIdAtom } from "../lib/atoms";
import { Guest } from "../types/seatingChart";

interface ChairCircleProps {
  tableId: string;
  chairIndex: number;
  x: number; // Position relative to the TableCircle group center
  y: number;
  radius: number;
  guestId: string | null; // ID of the guest assigned, if any
}

export const ChairCircle: React.FC<ChairCircleProps> = ({
  tableId,
  chairIndex,
  x,
  y,
  radius,
  guestId,
}) => {
  const setModalState = useSetAtom(modalStateAtom);
  const guests = useAtomValue(guestsAtom);
  const hoveredGuestId = useAtomValue(hoveredGuestIdAtom);
  const [isDirectlyHovered, setIsDirectlyHovered] = useState(false);

  const guestNameMap = useMemo(() => {
    const map = new Map<string, string>();
    guests.forEach(guest => {
      if (guest.id && guest.firstName && guest.lastName) {
        map.set(guest.id, `${guest.firstName} ${guest.lastName}`);
      } else if (guest.id && guest.firstName) {
        map.set(guest.id, guest.firstName);
      }
    });
    return map;
  }, [guests]);

  const handleClick = () => {
    const uniqueChairId = `${tableId}---${chairIndex}`;
    console.log(`Chair clicked: ${uniqueChairId}, Guest ID: ${guestId}`);
    setModalState({
      isOpen: true,
      chairId: uniqueChairId,
      guestId: guestId,
    });
  };

  const handleMouseEnter = (e: Konva.KonvaEventObject<MouseEvent>) => {
    setIsDirectlyHovered(true);
    const stage = e.target.getStage();
    if (stage) {
      stage.container().style.cursor = 'pointer';
    }
  };

  const handleMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
    setIsDirectlyHovered(false);
    const stage = e.target.getStage();
    if (stage) {
      stage.container().style.cursor = 'default';
    }
  };

  const isHighlighted = isDirectlyHovered || (guestId !== null && guestId === hoveredGuestId);

  const baseFill = guestId ? "#bfdbfe" : "#e5e7eb";
  const hoverFill = guestId ? "#93c5fd" : "#d1d5db";
  const baseStroke = guestId ? "#60a5fa" : "#9ca3af";
  const hoverStroke = guestId ? "#3b82f6" : "#6b7280";

  const fillColor = isHighlighted ? hoverFill : baseFill;
  const strokeColor = isHighlighted ? hoverStroke : baseStroke;
  const scale = isHighlighted ? 1.2 : 1;
  const shadowOpacity = isHighlighted ? 0.5 : 0.2;

  const showTooltip = isDirectlyHovered;
  const tooltipText = guestId ? (guestNameMap.get(guestId) || 'Unknown Guest') : 'Empty';

  return (
    <Group x={x} y={y}>
      <Circle
        radius={radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1}
        scaleX={scale}
        scaleY={scale}
        shadowBlur={5}
        shadowColor="black"
        shadowOpacity={shadowOpacity}
        offsetX={0}
        offsetY={0}
        onClick={handleClick}
        onTap={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        perfectDrawEnabled={false}
      />
      {showTooltip && (
        <Label
          x={0}
          y={ -radius * 1.5 - 10}
          opacity={0.9}
          offsetX={0}
          offsetY={0}
        >
          <Tag
            fill={'black'}
            pointerDirection={'down'}
            pointerWidth={10}
            pointerHeight={10}
            lineJoin={'round'}
            shadowColor={'black'}
            shadowBlur={10}
            shadowOffsetX={5}
            shadowOffsetY={5}
            shadowOpacity={0.5}
            cornerRadius={5}
          />
          <Text
            text={tooltipText}
            fontFamily={'Arial'}
            fontSize={12}
            padding={5}
            fill={'white'}
          />
        </Label>
      )}
    </Group>
  );
};
