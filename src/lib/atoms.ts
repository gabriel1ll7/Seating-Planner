import { atom } from "jotai";
import { splitAtom, atomWithReset } from "jotai/utils";
import { Table, VenueElement, Guest } from "../types/seatingChart";
import type { VenueData } from "@shared/types/venue"; // Import shared type

// Define Shape union type and export it
export type Shape = VenueElement | Table;

// --- Standard Atoms (No Longer Persisted Automatically) ---

// Base atom to store all shapes (venue elements and tables)
const baseShapesAtom = atom<Shape[]>([]);
export { baseShapesAtom };

// Atom containing derived atoms for each shape
export const shapeAtomsAtom = splitAtom(baseShapesAtom);

// Atom to store the currently selected shape ID
export const selectedShapeIdAtom = atom<string | null>(null);

// Atom to store the currently hovered guest ID
export const hoveredGuestIdAtom = atom<string | null>(null);

// Atom to store the currently hovered table ID
export const hoveredTableIdAtom = atom<string | null>(null);

// Atom to store the dragging state
export const isDraggingAtom = atom<boolean>(false);

// Atom to store the panning state
export const isPanningAtom = atom<boolean>(false);

// Atom to store the stage scale
export const stageScaleAtom = atom<number>(1);

// Atom to track if the venue space shape is locked
export const venueSpaceLockedAtom = atom<boolean>(false);

// Atom to store all guests
export const guestsAtom = atom<Guest[]>([]);

// Atom to calculate the total number of guests
export const totalGuestsAtom = atom((get) => get(guestsAtom).length);

// Atom containing derived atoms for each guest
export const guestAtomsAtom = splitAtom(guestsAtom);

// Atom to keep track of the next table number
export const tableCounterAtom = atom<number>(1);

// Atom to store the event title
export const eventTitleAtom = atom<string>("My Event");

// --- PIN and Edit Mode Atoms ---
// Reverted to simple primitive atom definitions
export const editModeAtom = atom<boolean>(false);
export const venuePinAtom = atom<string | null>(null);
export const pinEntryAtom = atom<string>("");

// Atom for reseting atoms to initial value (if needed, check usage)
// If handleReset in SeatingChartApp just sets defaults, atomWithReset might be removable too
// export const resettableGuestsAtom = atomWithReset<Guest[]>([]);

// --- Transient Atoms (Not persisted) ---

// Atom to manage the state of the guest assignment modal
export const modalStateAtom = atom<{
  isOpen: boolean;
  chairId: string | null;
  guestId: string | null;
}>({ isOpen: false, chairId: null, guestId: null });

// Atom for the rename element modal state
export const renameModalStateAtom = atom<{
  isOpen: boolean;
  elementId: string | null;
  currentTitle: string | null;
}>({ isOpen: false, elementId: null, currentTitle: null });

// --- Derived Atoms ---

// Derived atom that combines all relevant state into a single VenueData object
// This will be watched by the persistence logic
export const venueDataAtom = atom<VenueData>(
  (get) => ({
    shapes: get(baseShapesAtom),
    guests: get(guestsAtom),
    eventTitle: get(eventTitleAtom),
    tableCounter: get(tableCounterAtom),
    // Add other state properties here if they should be persisted
    // e.g., venueSpaceLocked: get(venueSpaceLockedAtom)
  }),
  // Note: This derived atom is read-only in the sense that you don't 'set' it directly.
  // You modify the base atoms (baseShapesAtom, guestsAtom, etc.) and this atom's value updates.
);

// Atom for only Venue Space elements (should typically be just one)
export const venueSpaceShapeAtomsAtom = atom((get) =>
  get(shapeAtomsAtom).filter((shapeAtom) => {
    const shape = get(shapeAtom);
    return shape.type === "venue" && shape.title === "Venue Space";
  }),
);

// Atom for all other shapes (non-Venue Space)
export const otherShapeAtomsAtom = atom((get) =>
  get(shapeAtomsAtom).filter((shapeAtom) => {
    const shape = get(shapeAtom);
    // Include tables and venue elements that are NOT title 'Venue Space'
    return (
      shape.type === "table" ||
      (shape.type === "venue" && shape.title !== "Venue Space")
    );
  }),
);
