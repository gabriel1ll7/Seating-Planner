import { atom } from "jotai";
import {
  atomWithStorage,
  createJSONStorage,
  splitAtom,
  atomWithReset,
} from "jotai/utils";
import { RESET } from "jotai/utils";
import { Table, VenueElement, Guest } from "../types/seatingChart";

// Define Shape union type and export it
export type Shape = VenueElement | Table;

// Storage configuration for localStorage
const storage = createJSONStorage<any>(() => localStorage);

// --- Persisted Atoms --- Re-add these

// Base atom to store all shapes (venue elements and tables)
const baseShapesAtom = atomWithStorage<Shape[]>(
  "seatingChartShapes",
  [],
  storage,
);
export { baseShapesAtom };

// Create split atoms for individual shape access
export const shapeAtomsAtom = splitAtom(baseShapesAtom);

// Atom to store all guests
export const guestsAtom = atomWithStorage<Guest[]>(
  "seatingChartGuests",
  [],
  storage,
);

// Atom to keep track of the next table number
export const tableCounterAtom = atomWithStorage<number>(
  "seatingChartTableCounter",
  1,
  storage,
);

// Atom to store the event title
export const eventTitleAtom = atomWithStorage<string>(
  "seatingChartEventTitle",
  "My Event",
  storage,
);

// Atom to track the current scale of the Konva stage
export const stageScaleAtom = atom(1);

// --- Transient Atoms (Not persisted) ---

// Atom to store the ID of the currently selected shape - Use atomWithReset
export const selectedShapeIdAtom = atomWithReset<string | null>(null);

// Atom to control whether the main stage is draggable (REMOVING)
// export const stageDraggableAtom = atom<boolean>(true);

// Atom to manage the state of the guest assignment modal
export const modalStateAtom = atom<{
  isOpen: boolean;
  chairId: string | null; 
  guestId: string | null;
}>({ isOpen: false, chairId: null, guestId: null });

// Atom to track the lock state of the main Venue Space element
export const venueSpaceLockedAtom = atom<boolean>(true);

// Atom for the rename element modal state
export const renameModalStateAtom = atom<{ 
    isOpen: boolean; 
    elementId: string | null; 
    currentTitle: string | null; 
}>({ isOpen: false, elementId: null, currentTitle: null });

// Atom to track the ID of the guest hovered over in the sidebar
export const hoveredGuestIdAtom = atomWithReset<string | null>(null);

// Atom to track if a shape is currently being dragged
export const isDraggingAtom = atom<boolean>(false);

// Atom to track if the stage is currently being panned (RE-ADDING)
export const isPanningAtom = atom<boolean>(false);

// Atom to track the ID of the table hovered over in the sidebar
export const hoveredTableIdAtom = atomWithReset<string | null>(null);

// --- Derived Atoms ---

// Atom for only Venue Space elements (should typically be just one)
export const venueSpaceShapeAtomsAtom = atom((get) =>
  get(shapeAtomsAtom).filter(shapeAtom => {
    const shape = get(shapeAtom);
    return shape.type === 'venue' && shape.title === 'Venue Space';
  })
);

// Atom for all other shapes (non-Venue Space)
export const otherShapeAtomsAtom = atom((get) => 
  get(shapeAtomsAtom).filter(shapeAtom => {
    const shape = get(shapeAtom);
    // Include tables and venue elements that are NOT title 'Venue Space'
    return shape.type === 'table' || (shape.type === 'venue' && shape.title !== 'Venue Space');
  })
);

// Example: Derived atom for total guest count
export const totalGuestsAtom = atom((get) => get(guestsAtom).length); 