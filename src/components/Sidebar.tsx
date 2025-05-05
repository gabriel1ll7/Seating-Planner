import React, { useMemo } from "react";
import { useSetAtom } from "jotai";
import { hoveredGuestIdAtom } from "@/lib/atoms";
import { Guest, Table } from "../types/seatingChart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  guests: Guest[];
  tables: Table[];
}

interface GroupedGuests {
  [tableId: string]: {
    tableNumber: number | null;
    guests: Guest[];
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ guests, tables }) => {
  const setHoveredGuestId = useSetAtom(hoveredGuestIdAtom);
  const tableMap = useMemo(() => {
    const map = new Map<string, Table>();
    tables.forEach((table) => map.set(table.id, table));
    return map;
  }, [tables]);

  // Group guests by tableId, handling unassigned guests
  const groupedGuests = useMemo(() => {
    const groups: GroupedGuests = {};
    const unassigned: Guest[] = [];

    // Sort guests alphabetically first for consistent order within groups
    const sortedGuests = [...guests].sort((a, b) => {
       const nameA = `${a.lastName}, ${a.firstName}`.toLowerCase();
       const nameB = `${b.lastName}, ${b.firstName}`.toLowerCase();
       return nameA.localeCompare(nameB);
    });

    sortedGuests.forEach((guest) => {
      if (guest.tableId && tableMap.has(guest.tableId)) {
        if (!groups[guest.tableId]) {
          groups[guest.tableId] = {
            tableNumber: tableMap.get(guest.tableId)?.number ?? null,
            guests: [],
          };
        }
        groups[guest.tableId].guests.push(guest);
      } else {
        unassigned.push(guest);
      }
    });

    // Add unassigned guests as a separate group if any exist
    if (unassigned.length > 0) {
      groups["unassigned"] = { tableNumber: null, guests: unassigned };
    }

    // Sort the groups by table number (unassigned last)
    const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
        const numA = groups[a].tableNumber ?? Infinity;
        const numB = groups[b].tableNumber ?? Infinity;
        return numA - numB;
    });

    // Return sorted groups in desired structure (or use sorted keys directly)
    const sortedGroups: GroupedGuests = {};
    sortedGroupKeys.forEach(key => { sortedGroups[key] = groups[key]; });
    return sortedGroups;

  }, [guests, tableMap]);

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">Guest List</h2>
      </div>

      {Object.keys(groupedGuests).length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-center px-4">
          <div>
            <p>No guests assigned yet.</p>
            <p className="text-sm mt-2">
              Click chairs on tables to assign guests.
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {Object.entries(groupedGuests).map(([tableId, groupData]) => (
              <div key={tableId}>
                <h3 className="text-md font-semibold mb-1">
                  {groupData.tableNumber !== null 
                    ? `Table ${groupData.tableNumber}` 
                    : "Unassigned Guests"}
                </h3>
                <Separator className="mb-2" />
                <ul className="space-y-1 pl-2">
                  {groupData.guests.map((guest) => (
                    <li
                      key={guest.id}
                      className="flex items-center px-2 py-1 text-sm hover:bg-gray-100 rounded cursor-default"
                      onMouseEnter={() => setHoveredGuestId(guest.id)}
                      onMouseLeave={() => setHoveredGuestId(null)}
                    >
                      <span>
                        {guest.firstName} {guest.lastName}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
