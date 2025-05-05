
import { useCallback } from "react";
import { Guest } from "../types/seatingChart";

export const useGuestManagement = (guests: Guest[], setGuests: React.Dispatch<React.SetStateAction<Guest[]>>) => {
  // Update a guest's information
  const updateGuest = useCallback(
    (
      tableId: string,
      chairIndex: number,
      firstName: string,
      lastName: string
    ) => {
      const existingGuestIndex = guests.findIndex(
        (g) => g.tableId === tableId && g.chairIndex === chairIndex
      );

      if (existingGuestIndex >= 0) {
        // Update existing guest
        const updatedGuests = [...guests];
        updatedGuests[existingGuestIndex] = {
          ...updatedGuests[existingGuestIndex],
          firstName,
          lastName,
        };
        setGuests(updatedGuests);
      } else {
        // Add new guest
        setGuests((prev) => [
          ...prev,
          {
            id: `guest-${Date.now()}`,
            firstName,
            lastName,
            tableId,
            chairIndex,
          },
        ]);
      }
    },
    [guests, setGuests]
  );

  // Remove a guest
  const removeGuest = useCallback(
    (tableId: string, chairIndex: number) => {
      setGuests((prev) =>
        prev.filter(
          (g) => !(g.tableId === tableId && g.chairIndex === chairIndex)
        )
      );
    },
    [setGuests]
  );

  return {
    updateGuest,
    removeGuest
  };
};
