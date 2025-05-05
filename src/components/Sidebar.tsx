
import { Guest, Table } from "@/types/seatingChart";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Sidebar = ({ guests, tables }) => {
  // Sort guests by table number and then by name
  const sortedGuests = [...guests].sort((a, b) => {
    const tableA = tables.find(t => t.id === a.tableId);
    const tableB = tables.find(t => t.id === b.tableId);
    
    if (!tableA || !tableB) return 0;
    
    // First sort by table number
    if (tableA.number !== tableB.number) {
      return tableA.number - tableB.number;
    }
    
    // Then sort by last name
    return a.lastName.localeCompare(b.lastName);
  });

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 h-full">
      <h2 className="text-lg font-bold mb-4">Guest List</h2>
      
      {sortedGuests.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          <p>No guests assigned yet.</p>
          <p className="text-sm mt-2">
            Add tables and assign guests by clicking on the chairs.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-4">
            {tables
              .sort((a, b) => a.number - b.number)
              .map((table) => {
                const tableGuests = sortedGuests.filter(
                  (g) => g.tableId === table.id
                );
                
                if (tableGuests.length === 0) return null;
                
                return (
                  <div key={table.id} className="mb-4">
                    <h3 className="font-medium text-gray-700 mb-2 bg-gray-100 p-2 rounded">
                      Table {table.number} - {tableGuests.length} guests
                    </h3>
                    <ul className="space-y-1">
                      {tableGuests
                        .sort((a, b) => a.lastName.localeCompare(b.lastName))
                        .map((guest) => (
                          <li
                            key={guest.id}
                            className="flex items-center px-2 py-1 hover:bg-gray-100 rounded"
                          >
                            <span>
                              {guest.lastName}, {guest.firstName}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                );
              })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
