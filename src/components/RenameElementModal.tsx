import React, { useState, useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import { renameModalStateAtom, baseShapesAtom } from "../lib/atoms";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Use DialogClose for cancel
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VenueElement } from "../types/seatingChart"; // Import type

export const RenameElementModal = () => {
  const [modalState, setModalState] = useAtom(renameModalStateAtom);
  const setBaseShapes = useSetAtom(baseShapesAtom);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (modalState.isOpen && modalState.currentTitle) {
      setNewTitle(modalState.currentTitle);
    } else {
      setNewTitle(""); // Reset on open without title or on close
    }
  }, [modalState.isOpen, modalState.currentTitle]);

  const handleClose = () => {
    setModalState({ isOpen: false, elementId: null, currentTitle: null });
  };

  const handleSave = () => {
    if (!modalState.elementId) return;

    setBaseShapes((currentShapes) => {
      const index = currentShapes.findIndex(
        (s) => s.id === modalState.elementId,
      );
      if (index === -1) return currentShapes;

      const shapeToUpdate = currentShapes[index];
      // Ensure it's a VenueElement before updating title
      if (shapeToUpdate.type !== "venue") return currentShapes;

      const updatedShape: VenueElement = {
        ...shapeToUpdate,
        title: newTitle.trim() || "Untitled Element", // Provide default if empty
      };

      const newShapes = [...currentShapes];
      newShapes[index] = updatedShape;
      return newShapes;
    });

    handleClose(); // Close modal after saving
  };

  // Prevent closing via overlay click if needed, but usually fine
  // const handleOpenChange = (open: boolean) => {
  //   if (!open) {
  //      handleClose();
  //   }
  // };

  return (
    <Dialog open={modalState.isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Element</DialogTitle>
          <DialogDescription>
            Enter a new title for the selected venue element.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="element-title" className="text-right">
              Title
            </Label>
            <Input
              id="element-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="col-span-3"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }} // Save on Enter
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
