import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { hoveredGuestIdAtom, isDraggingAtom, hoveredTableIdAtom, guestsAtom } from "@/lib/atoms";
import { Guest, Table } from "../types/seatingChart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { UserCircle, Users, Coffee, User2, Info, Table2 as TableIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  DndContext, 
  DragOverlay, 
  closestCenter,
  type DragStartEvent,
  type DragEndEvent
} from '@dnd-kit/core';
import { DroppableTableSection } from "./DroppableTableSection";

interface SidebarProps {
  guests: Guest[];
  tables: Table[];
}

export const Sidebar: React.FC<SidebarProps> = ({ guests, tables }) => {
  const [hoveredGuestId, setHoveredGuestId] = useAtom(hoveredGuestIdAtom);
  const setHoveredTableId = useSetAtom(hoveredTableIdAtom);
  const isDragging = useAtomValue(isDraggingAtom);
  const setGlobalGuests = useSetAtom(guestsAtom);
  const [newGuestNames, setNewGuestNames] = useState<Record<string, string>>({});
  const [activeDragData, setActiveDragData] = useState<Guest | null>(null);
  const [flashErrorTableId, setFlashErrorTableId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleGuestMouseEnter = (guestId: string) => {
    if (isDragging) return;
    setHoveredGuestId(guestId);
  };
  
  const handleGuestMouseLeave = () => {
    setHoveredGuestId(null);
  };

  const handleTableMouseEnter = (tableId: string) => {
    if (isDragging || tableId === "unassigned") return;
    setHoveredTableId(tableId);
  };

  const handleTableMouseLeave = () => {
    setHoveredTableId(null);
  };
  
  const tableMap = useMemo(() => {
    const map = new Map<string, Table>();
    tables.forEach((table) => map.set(table.id, table));
    return map;
  }, [tables]);

  const groupedGuests = useMemo(() => {
    const groups: Record<string, { tableNumber: number | null; tableCapacity?: number; guests: Guest[] }> = {};
    const unassigned: Guest[] = [];

    tables.forEach((table) => {
      groups[table.id] = {
        tableNumber: table.number,
        tableCapacity: table.capacity,
        guests: []
      };
    });

    guests.forEach((guest) => {
      if (guest.tableId && tableMap.has(guest.tableId)) {
        if (!groups[guest.tableId]) {
          groups[guest.tableId] = {
            tableNumber: tableMap.get(guest.tableId)?.number ?? null,
            tableCapacity: tableMap.get(guest.tableId)?.capacity,
            guests: [],
          };
        }
        groups[guest.tableId].guests.push(guest);
      } else {
        unassigned.push(guest);
      }
    });

    if (unassigned.length > 0) {
      groups["unassigned"] = { tableNumber: null, guests: unassigned };
    }

    Object.values(groups).forEach(group => {
      if (group.tableNumber !== null) {
        group.guests.sort((a, b) => (a.chairIndex ?? 0) - (b.chairIndex ?? 0));
      } else {
        group.guests.sort((a, b) => {
          const nameA = `${a.lastName}, ${a.firstName}`.toLowerCase();
          const nameB = `${b.lastName}, ${b.firstName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
      }
    });

    const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
        const numA = groups[a].tableNumber ?? Infinity;
        const numB = groups[b].tableNumber ?? Infinity;
        return numA - numB;
    });

    const sortedGroups: Record<string, { tableNumber: number | null; tableCapacity?: number; guests: Guest[] }> = {};
    sortedGroupKeys.forEach(key => { sortedGroups[key] = groups[key]; });
    return sortedGroups;
  }, [guests, tables, tableMap]);

  const totalGuestCount = guests.length;
  const assignedGuestCount = guests.filter(g => g.tableId).length;

  const findNextAvailableSeat = (currentGuests: Guest[], capacity: number): number | null => {
    if (currentGuests.length >= capacity) return null;
    const occupiedSeats = new Set<number>();
    currentGuests.forEach(guest => {
      if (typeof guest.chairIndex === 'number') occupiedSeats.add(guest.chairIndex);
    });
    for (let i = 0; i < capacity; i++) {
      if (!occupiedSeats.has(i)) return i;
    }
    return null;
  };

  const handleAddGuestKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    tableId: string
  ) => {
    const group = groupedGuests[tableId];
    if (!group) return;
    const capacity = group.tableCapacity || 0;
    const currentTableGuests = group.guests;

    if (event.key === 'Enter') {
      event.preventDefault();
      const name = (newGuestNames[tableId] || '').trim();
      if (!name) return;
      const nextSeatIndex = findNextAvailableSeat(currentTableGuests, capacity);
      if (nextSeatIndex === null) {
        console.error("Attempted to add guest to a full table:", tableId);
        return;
      }
      const newGuest: Guest = {
        id: `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        firstName: name,
        lastName: "",
        tableId: tableId,
        chairIndex: nextSeatIndex,
      };
      setGlobalGuests((prev) => [...prev, newGuest]);
      setNewGuestNames((prev) => ({ ...prev, [tableId]: '' }));
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedGuest = guests.find(g => g.id === active.id);
    setActiveDragData(draggedGuest || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragData(null);
    if (over && active.id !== over.id) {
      const guestId = active.id as string;
      const targetTableId = over.id as string;
      const currentGuest = guests.find(g => g.id === guestId);
      if (!currentGuest) return;
      if (currentGuest.tableId === targetTableId) return;
      if (targetTableId === "unassigned") {
        setGlobalGuests(prev => prev.map(g => g.id === guestId ? { ...g, tableId: null, chairIndex: null } : g));
      } else {
        const targetTable = tables.find(t => t.id === targetTableId);
        if (!targetTable) return;
        const guestsAtTargetTable = guests.filter(g => g.tableId === targetTableId);
        const nextSeatIndex = findNextAvailableSeat(guestsAtTargetTable, targetTable.capacity);
        if (nextSeatIndex !== null) {
          setGlobalGuests(prev => prev.map(g => g.id === guestId ? { ...g, tableId: targetTableId, chairIndex: nextSeatIndex } : g));
        } else {
          console.warn(`Table ${targetTable.number} (${targetTableId}) is full. Cannot add guest ${guestId}.`);
          toast({
            title: "Table Full",
            description: `Table ${targetTable.number} has no available seats.`,
            variant: "destructive",
            duration: 2000 
          });
          setFlashErrorTableId(targetTableId);
          setTimeout(() => {
            setFlashErrorTableId(null);
          }, 1000);
        }
      }
    }
  };

  const handleRemoveGuest = (guestIdToRemove: string) => {
    setGlobalGuests((prevGuests) =>
      prevGuests.filter((guest) => guest.id !== guestIdToRemove)
    );
  };

  return (
    <div className="relative w-80 bg-sidebar flex flex-col h-full border-r border-sidebar-border/70 overflow-hidden">
      <div className="absolute inset-0 texture-elegant opacity-90 pointer-events-none"></div>
      <div className="relative z-10 p-5 border-b border-sidebar-border/50 bg-sidebar-accent/5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-sidebar-foreground">Guest List</h2>
          <Badge variant="outline" className="bg-sidebar-accent/10 text-sidebar-foreground shadow-sm border-sidebar-border/40 px-2.5 py-1">
            <TableIcon size={14} className="mr-1.5" strokeWidth={1.5} />
            {tables.length} Table{tables.length === 1 ? '' : 's'}
          </Badge>
        </div>
      </div>

      {Object.keys(groupedGuests).length === 0 ? (
        <div className="relative z-10 flex-1 flex items-center justify-center text-sidebar-foreground/70 text-center px-4">
          <div className="bg-sidebar-accent/5 rounded-lg p-7 border border-sidebar-border/30 max-w-60 shadow-sm">
            <User2 size={36} className="mx-auto mb-4 text-sidebar-primary/60" strokeWidth={1.5} />
            <p className="font-medium text-sidebar-foreground mb-2">No guests assigned yet</p>
            <p className="text-sm leading-relaxed">
              Click chairs on tables to assign guests to your seating chart
            </p>
          </div>
        </div>
      ) : (
        <DndContext 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd} 
          collisionDetection={closestCenter}
        >
          <ScrollArea className="relative flex-1 p-5 z-10">
            <div className="space-y-4">
              {Object.entries(groupedGuests).map(([tableId, groupData]) => {
                const isUnassigned = groupData.tableNumber === null;
                return (
                  <DroppableTableSection
                    key={tableId}
                    tableId={tableId}
                    groupData={groupData}
                    isUnassigned={isUnassigned}
                    hoveredGuestId={hoveredGuestId}
                    newGuestName={newGuestNames[tableId] || ''}
                    onNewGuestNameChange={(id, value) => setNewGuestNames(prev => ({ ...prev, [id]: value }))}
                    onNewGuestSubmit={(e, id) => handleAddGuestKeyDown(e, id)}
                    onTableMouseEnter={handleTableMouseEnter}
                    onTableMouseLeave={handleTableMouseLeave}
                    onGuestMouseEnter={handleGuestMouseEnter}
                    onGuestMouseLeave={handleGuestMouseLeave}
                    onGuestRemove={handleRemoveGuest}
                    isFlashingError={tableId === flashErrorTableId}
                  />
                );
              })}
            </div>
            <div className="h-4"></div>
          </ScrollArea>
          
          <DragOverlay>
            {activeDragData ? (
              <div className="bg-sidebar p-3 rounded-md shadow-xl border border-primary/50 flex items-center opacity-90 cursor-grabbing">
                <UserCircle size={18} className="mr-2 text-primary shrink-0" /> 
                <span className="font-medium text-sidebar-primary truncate">
                  {activeDragData.firstName} {activeDragData.lastName}
                </span> 
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <div className="relative z-10 px-4 py-5 mt-auto border-t border-sidebar-border/50 bg-sidebar-accent/5">
        <div className="bg-sidebar-accent/10 rounded-lg p-4 shadow-sm text-sm text-sidebar-foreground/90 space-y-3 border border-sidebar-border/30">
          <h3 className="text-sm font-medium text-sidebar-foreground flex items-center">
            <Info className="mr-1.5 text-sidebar-primary" size={16} strokeWidth={1.5} />
            Quick Tips
          </h3>
          <p className="flex items-center text-xs leading-relaxed">
            <span className="text-sidebar-primary font-semibold mr-2 text-xs opacity-80">➤</span> 
            Use <kbd className="px-1.5 py-0.5 rounded bg-sidebar-accent/30 mx-1 text-xs shadow-sm">Alt + Mouse</kbd> to pan
          </p>
          <p className="flex items-center text-xs leading-relaxed">
            <span className="text-sidebar-primary font-semibold mr-2 text-xs opacity-80">➤</span> 
            <kbd className="px-1.5 py-0.5 rounded bg-sidebar-accent/30 mx-1 text-xs shadow-sm">Scroll</kbd> to zoom in/out
          </p>
          <p className="flex items-center text-xs leading-relaxed">
            <span className="text-sidebar-primary font-semibold mr-2 text-xs opacity-80">➤</span> 
            <kbd className="px-1.5 py-0.5 rounded bg-sidebar-accent/30 mx-1 text-xs shadow-sm">Delete</kbd> to remove selected elements
          </p>
          <p className="flex items-center text-xs leading-relaxed">
            <span className="text-sidebar-primary font-semibold mr-2 text-xs opacity-80">➤</span> 
            Double-click text to rename elements
          </p>
        </div>
      </div>
    </div>
  );
};
