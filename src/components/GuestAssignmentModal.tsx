import React, { useState, useEffect } from "react";
import { useAtom, useSetAtom, useAtomValue } from "jotai";
import { modalStateAtom, guestsAtom } from "../lib/atoms";
import { Guest } from "../types/seatingChart";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const GuestAssignmentModal = () => {
  const [modalState, setModalState] = useAtom(modalStateAtom);
  const [guests, setGuests] = useAtom(guestsAtom);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Effect to load guest data when modal opens with an existing guestId
  useEffect(() => {
    if (modalState.isOpen && modalState.guestId) {
      const existingGuest = guests.find((g) => g.id === modalState.guestId);
      if (existingGuest) {
        setFirstName(existingGuest.firstName);
        setLastName(existingGuest.lastName);
      } else {
        // Guest ID existed but guest not found? Clear fields.
        console.warn(`Guest with ID ${modalState.guestId} not found.`);
        setFirstName("");
        setLastName("");
      }
    } else if (modalState.isOpen) {
      // Modal opened for an empty chair
      setFirstName("");
      setLastName("");
    }
    // Reset fields when modal closes
    if (!modalState.isOpen) {
      setFirstName("");
      setLastName("");
    }
  }, [modalState.isOpen, modalState.guestId, guests]);

  const handleClose = () => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
      chairId: null,
      guestId: null,
    }));
  };

  const handleSave = () => {
    if (!modalState.chairId) return; // Should not happen if modal is open

    const [tableId, chairIndexStr] = modalState.chairId.split("---");
    const chairIndex = parseInt(chairIndexStr, 10);

    if (!tableId || isNaN(chairIndex)) {
      console.error(
        "Invalid chairId format in modal state:",
        modalState.chairId,
      );
      handleClose();
      return;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    // If both fields are empty, treat as removal
    if (!trimmedFirstName && !trimmedLastName) {
      handleRemove();
      return;
    }

    setGuests((prevGuests) => {
      const existingGuestIndex = prevGuests.findIndex(
        (g) => g.id === modalState.guestId,
      );

      if (existingGuestIndex > -1) {
        // Update existing guest
        const updatedGuests = [...prevGuests];
        updatedGuests[existingGuestIndex] = {
          ...updatedGuests[existingGuestIndex],
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          tableId, // Ensure tableId and chairIndex are updated if guest moved (though not supported yet)
          chairIndex,
        };
        return updatedGuests;
      } else {
        // Add new guest
        const newGuest: Guest = {
          id: `guest-${Date.now()}`,
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          tableId,
          chairIndex,
        };
        // Check if another guest is already assigned to this chair
        const guestInChairIndex = prevGuests.findIndex(
          (g) => g.tableId === tableId && g.chairIndex === chairIndex,
        );
        if (guestInChairIndex > -1) {
          // Replace the guest in the chair
          const guestsWithoutOld = prevGuests.filter(
            (g, index) => index !== guestInChairIndex,
          );
          return [...guestsWithoutOld, newGuest];
        } else {
          return [...prevGuests, newGuest];
        }
      }
    });

    handleClose();
  };

  const handleRemove = () => {
    if (!modalState.guestId) {
      // Can only remove if a guest exists
      handleClose(); // Close if trying to remove on empty chair
      return;
    }

    setGuests((prevGuests) =>
      prevGuests.filter((g) => g.id !== modalState.guestId),
    );
    handleClose();
  };

  // Determine button text based on whether inputs are filled
  const saveButtonText =
    firstName.trim() || lastName.trim() ? "Save Guest" : "Remove Guest";

  return (
    <Dialog open={modalState.isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {modalState.guestId ? "Edit Guest" : "Assign Guest"}
          </DialogTitle>
          <DialogDescription>
            Enter the guest's name for this seat.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              First Name
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Jane"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Last Name
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Doe"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{saveButtonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
