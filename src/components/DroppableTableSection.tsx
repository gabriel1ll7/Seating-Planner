import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Guest } from "../types/seatingChart";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DraggableGuestListItem } from "./DraggableGuestListItem";
import { Users, Coffee, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GroupData {
  // Define locally or import if exported from Sidebar
  tableNumber: number | null;
  tableCapacity?: number;
  guests: Guest[];
}

interface DroppableTableSectionProps {
  tableId: string;
  groupData: GroupData;
  isUnassigned: boolean;
  hoveredGuestId: string | null;
  newGuestName: string; // For the input field
  onNewGuestNameChange: (tableId: string, value: string) => void;
  onNewGuestSubmit: (
    event: React.KeyboardEvent<HTMLInputElement>,
    tableId: string,
  ) => void;
  onTableMouseEnter: (tableId: string) => void;
  onTableMouseLeave: () => void;
  onGuestMouseEnter: (guestId: string) => void;
  onGuestMouseLeave: () => void;
  onGuestRemove: (guestId: string) => void;
  isFlashingError: boolean;
  isInputVisible?: boolean;
  onToggleInput?: () => void;
}

export const DroppableTableSection: React.FC<DroppableTableSectionProps> = ({
  tableId,
  groupData,
  isUnassigned,
  hoveredGuestId,
  newGuestName,
  onNewGuestNameChange,
  onNewGuestSubmit,
  onTableMouseEnter,
  onTableMouseLeave,
  onGuestMouseEnter,
  onGuestMouseLeave,
  onGuestRemove,
  isFlashingError,
  isInputVisible,
  onToggleInput,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: tableId });
  const totalSeats = groupData.tableCapacity || 0;
  const occupiedSeats = groupData.guests.length;

  const outlineClass = isFlashingError
    ? "outline outline-2 outline-destructive outline-offset-2 ring-destructive"
    : isOver
      ? "outline outline-2 outline-primary outline-offset-2"
      : "";

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg px-5 py-4 shadow-sm transition-all ${
        isUnassigned
          ? "bg-sidebar-accent/5 border border-sidebar-border/30"
          : "bg-sidebar-accent/10"
      } ${outlineClass}`}
      onMouseEnter={() => onTableMouseEnter(tableId)}
      onMouseLeave={onTableMouseLeave}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="font-medium text-sidebar-primary flex items-center">
          {groupData.tableNumber !== null ? (
            <>
              <span className="inline-flex items-center justify-center bg-sidebar-primary/10 text-sidebar-primary w-7 h-7 rounded-full mr-2 text-sm shadow-sm">
                {groupData.tableNumber}
              </span>
              <span>Table {groupData.tableNumber}</span>
            </>
          ) : (
            <span className="text-sidebar-foreground/80 flex items-center">
              <Coffee size={16} className="mr-1.5" strokeWidth={1.5} />
              Unassigned Guests
            </span>
          )}
        </h3>
        {isUnassigned ? (
          <Badge
            variant="outline"
            className="text-xs bg-sidebar-accent/10 text-sidebar-foreground/80 shadow-sm border-sidebar-border/40"
          >
            {occupiedSeats}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs bg-sidebar-accent/10 text-sidebar-foreground/80 shadow-sm border-sidebar-border/40 px-2"
          >
            <Users size={12} className="mr-1.5" strokeWidth={1.5} />
            {occupiedSeats}/{totalSeats}
          </Badge>
        )}
      </div>
      <Separator className="mb-3 bg-sidebar-accent/20" />

      {/* Guest List */}
      <ul className="space-y-1">
        {groupData.guests.map((guest) => (
          <DraggableGuestListItem
            key={guest.id}
            guest={guest}
            isHighlighted={guest.id === hoveredGuestId}
            onMouseEnter={onGuestMouseEnter}
            onMouseLeave={onGuestMouseLeave}
            onRemove={onGuestRemove}
          />
        ))}
      </ul>

      {/* Add Guest Input / Button */}
      {isUnassigned ? (
        <div className="mt-3 text-center">
          {isInputVisible ? (
            <Input
              type="text"
              placeholder="Add Unassigned Guest..."
              className="h-8 text-sm bg-sidebar-accent/20 border-sidebar-border/30 focus:border-primary/50 focus:bg-sidebar-accent/40 placeholder:text-sidebar-foreground/50"
              value={newGuestName || ""}
              onChange={(e) => onNewGuestNameChange(tableId, e.target.value)}
              onKeyDown={(e) => onNewGuestSubmit(e, tableId)}
              autoFocus
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-sidebar-foreground/80 border-sidebar-border/50 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
              onClick={onToggleInput}
            >
              <PlusCircle size={16} className="mr-2" />
              Add Unassigned Guest
            </Button>
          )}
        </div>
      ) : (
        occupiedSeats < totalSeats && (
          <div className="mt-2 pl-3 pr-1 relative">
            <Input
              type="text"
              placeholder="Add Guest..."
              className="h-8 text-sm bg-sidebar-accent/20 border-sidebar-border/30 focus:border-primary/50 focus:bg-sidebar-accent/40 placeholder:text-sidebar-foreground/50 pr-2"
              value={newGuestName || ""}
              onChange={(e) => onNewGuestNameChange(tableId, e.target.value)}
              onKeyDown={(e) => onNewGuestSubmit(e, tableId)}
            />
          </div>
        )
      )}
    </div>
  );
};
