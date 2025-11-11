import { useEffect, useRef, useCallback } from "react";
import { useAtom, useSetAtom, useAtomValue } from "jotai";
import { useParams, useNavigate } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { customAlphabet } from "nanoid";
import { animals, furniture } from "@/lib/wordlists"; // Import word lists

import {
  venueDataAtom,
  baseShapesAtom,
  guestsAtom,
  eventTitleAtom,
  tableCounterAtom,
  editModeAtom,
  venuePinAtom,
} from "@/lib/atoms"; // Use @ alias for src/
import {
  useVenueQuery,
  useUpdateVenueMutation,
  // validatePinOnServer // Will be imported from the correct path below
  // useCreateVenueMutation // Uncomment if/when needed
} from "./useVenueApi"; // Assuming hooks are in the same directory
import { validatePinOnServer } from "@/lib/api/venues"; // Corrected import path
import type { VenueData } from "@shared/types/venue";
import type { UpdateVenuePayload } from "@/lib/api/venues"; // Added for specific payload type

// --- New Slug Generation Function ---
const generateClientSlug = (): string => {
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const randomFurniture =
    furniture[Math.floor(Math.random() * furniture.length)];
  // Generate number between 100 and 999
  const randomNumber = Math.floor(Math.random() * 900) + 100;
  return `${randomAnimal}-${randomFurniture}-${randomNumber}`;
};

// --- PIN Generation Function ---
const generateVenuePin = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit PIN
};

// --- localStorage Constants and Helper ---
const LAST_VENUE_SLUG_KEY = "lastVenueSlug";
const storage = {
  // Venue data
  getVenueDataKey: (slug: string | undefined | null) =>
    slug ? `venue-${slug}-data` : null,
  getVenueData: (slug: string | undefined | null): VenueData | null => {
    const key = storage.getVenueDataKey(slug);
    if (!key) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error("Error reading from localStorage", key, e);
      // Optionally remove corrupted item
      // localStorage.removeItem(key);
      return null;
    }
  },
  setVenueData: (slug: string | undefined | null, data: VenueData): void => {
    const key = storage.getVenueDataKey(slug);
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Error writing to localStorage", key, e);
      // Handle potential quota exceeded errors
    }
  },
  // New helpers for last slug
  getLastSlug: (): string | null => localStorage.getItem(LAST_VENUE_SLUG_KEY),
  setLastSlug: (slug: string): void =>
    localStorage.setItem(LAST_VENUE_SLUG_KEY, slug),

  // PIN and Edit Mode storage
  getPinKey: (slug: string) => `venue-${slug}-pin`,
  getPin: (slug: string): string | null => localStorage.getItem(storage.getPinKey(slug)),
  setPin: (slug: string, pin: string): void =>
    localStorage.setItem(storage.getPinKey(slug), pin),
  removePin: (slug: string): void =>
    localStorage.removeItem(storage.getPinKey(slug)),

  getEditModeKey: (slug: string) => `venue-${slug}-editMode`,
  getEditModeStorage: (slug: string): boolean =>
    localStorage.getItem(storage.getEditModeKey(slug)) === "true",
  setEditModeStorage: (slug: string, enabled: boolean): void =>
    localStorage.setItem(storage.getEditModeKey(slug), String(enabled)),
  removeEditModeStorage: (slug: string): void =>
    localStorage.removeItem(storage.getEditModeKey(slug)),
};
// ------------------------

export const useVenuePersistence = () => {
  const { slug } = useParams<{ slug?: string }>(); // Get slug from URL
  const navigate = useNavigate();

  // Jotai state and setters
  const [currentVenueData] = useAtom(venueDataAtom); // Read the derived atom for saving
  const setShapes = useSetAtom(baseShapesAtom);
  const setGuests = useSetAtom(guestsAtom);
  const setEventTitle = useSetAtom(eventTitleAtom);
  const setTableCounter = useSetAtom(tableCounterAtom);
  const setEditMode = useSetAtom(editModeAtom);
  const setVenuePin = useSetAtom(venuePinAtom);
  const currentEditMode = useAtomValue(editModeAtom);
  const [currentPin] = useAtom(venuePinAtom); // Use useAtom to get value, ignore setter

  // React Query hooks for server interaction
  const {
    data: serverData,
    isLoading: isLoadingFromServer, // isLoading is correct for useQuery
    error: serverError,
    isError: isServerError,
    isSuccess: isServerLoadSuccess,
  } = useVenueQuery(slug);

  const {
    mutate: updateVenueMutate,
    status: updateStatus, // Get status ('idle', 'pending', 'success', 'error')
    error: updateError, // Get potential error from mutation
  } = useUpdateVenueMutation();

  // Ref to track initial load status for the current slug
  const isInitialLoadComplete = useRef<boolean>(false);
  // Ref to store the slug for which the initial load completed
  const loadedSlugRef = useRef<string | null>(null);
  // Ref to track if the current venue's PIN needs to be synced with the backend
  const pinNeedsSync = useRef<string | null>(null); // Stores the PIN that needs to be sent

  // --- Load Logic Effect ---
  useEffect(() => {
    // Reset load status whenever the slug changes
    isInitialLoadComplete.current = false;
    loadedSlugRef.current = null;
    pinNeedsSync.current = null; // Reset PIN sync status
    setEditMode(false); // Default to view mode on slug change
    setVenuePin(null);
    console.log(`Persistence Hook: Slug changed/detected: ${slug}`);

    if (!slug) {
      // === No Slug: Check localStorage for last used slug ===
      const lastSlug = storage.getLastSlug();
      if (lastSlug) {
        console.log(
          `Persistence Hook: No slug in URL, found last used slug '${lastSlug}', navigating...`,
        );
        navigate(`/${lastSlug}`, { replace: true });
        // The hook will re-run with the actual slug now, triggering the 'else' block below
      } else {
        // === No Slug & No Last Slug: Generate New Venue ===
        console.log(
          "Persistence Hook: No slug and no last slug found, generating new one...",
        );
        const newSlug = generateClientSlug();
        const newPin = generateVenuePin(); // Generate PIN
        const initialState: VenueData = {
          shapes: [],
          guests: [],
          eventTitle: "My Event",
          tableCounter: 1,
        };

        setShapes(initialState.shapes);
        setGuests(initialState.guests);
        setEventTitle(initialState.eventTitle);
        setTableCounter(initialState.tableCounter);

        storage.setVenueData(newSlug, initialState);
        storage.setLastSlug(newSlug);
        storage.setPin(newSlug, newPin); // Store PIN
        storage.setEditModeStorage(newSlug, true); // Creator is in edit mode
        pinNeedsSync.current = newPin; // Mark PIN for backend sync

        setVenuePin(newPin); // Update Jotai atom for PIN display
        setEditMode(true); // Update Jotai atom for edit mode

        navigate(`/${newSlug}`, { replace: true });
        isInitialLoadComplete.current = true;
        loadedSlugRef.current = newSlug;
      }
    } else {
      // === Slug Exists: Load Flow ===
      console.log(
        `Persistence Hook: Attempting to load from localStorage for slug: ${slug}`,
      );
      const localData = storage.getVenueData(slug);
      const localPin = storage.getPin(slug);
      const localEditMode = storage.getEditModeStorage(slug);

      if (localPin && localEditMode) {
        console.log("Persistence Hook: Found local PIN and edit mode enabled.");
        setVenuePin(localPin);
        setEditMode(true);
      } else {
        setEditMode(false); // Default to view-only if no local pin/edit status
        setVenuePin(null);
      }

      if (localData) {
        // 1. Found in localStorage
        console.log(
          "Persistence Hook: Data found in localStorage, loading into Jotai.",
        );
        setShapes(localData.shapes);
        setGuests(localData.guests);
        setEventTitle(localData.eventTitle);
        setTableCounter(localData.tableCounter);
        storage.setLastSlug(slug); // Update last used slug
        isInitialLoadComplete.current = true;
        loadedSlugRef.current = slug;
      } else {
        // 2. Not in localStorage - useVenueQuery will be enabled and fetch
        console.log(
          "Persistence Hook: No data in localStorage, waiting for server fetch...",
        );
        // Loading state will be handled based on useVenueQuery's isLoading
        // Data will be loaded in the next effect block when serverData arrives
      }
    }
    // Dependencies carefully chosen to run only when slug changes
  }, [
    slug,
    navigate,
    setShapes,
    setGuests,
    setEventTitle,
    setTableCounter,
    setEditMode,
    setVenuePin,
  ]);

  // --- Effect to Handle Data Fetched From Server ---
  useEffect(() => {
    // Only process server data if we have a slug and the query was successful
    // AND if the initial load from localStorage didn't already complete for this slug
    // AND if a PIN doesn't need sync (server data shouldn't overwrite just-created client data with PIN)
    if (
      slug &&
      isServerLoadSuccess &&
      serverData &&
      loadedSlugRef.current !== slug &&
      !pinNeedsSync.current
    ) {
      console.log(
        "Persistence Hook: Server data received, updating Jotai and localStorage.",
      );
      const fetchedVenueData = serverData.venue_data;
      // Update Jotai atoms
      setShapes(fetchedVenueData.shapes);
      setGuests(fetchedVenueData.guests);
      setEventTitle(fetchedVenueData.eventTitle);
      setTableCounter(fetchedVenueData.tableCounter);
      // Cache fetched data locally
      storage.setVenueData(slug, fetchedVenueData);
      storage.setLastSlug(slug); // Update last used slug after successful fetch
      isInitialLoadComplete.current = true; // Mark load as complete now
      loadedSlugRef.current = slug;
    } else if (slug && isServerError && loadedSlugRef.current !== slug) {
      // Handle case where slug exists but no data on server (treat as new empty venue for this slug)
      console.warn(
        `Persistence Hook: Server fetch failed for slug ${slug}, treating as new. Error:`,
        serverError,
      );
      const emptyState: VenueData = {
        shapes: [],
        guests: [],
        eventTitle: "My Event",
        tableCounter: 1,
      };
      setShapes(emptyState.shapes);
      setGuests(emptyState.guests);
      setEventTitle(emptyState.eventTitle);
      setTableCounter(emptyState.tableCounter);
      storage.setVenueData(slug, emptyState); // Cache empty state locally
      storage.setLastSlug(slug); // Still set this slug as last used, even if empty
      isInitialLoadComplete.current = true; // Mark load complete (as empty)
      loadedSlugRef.current = slug;
    }
    // This effect depends on the server fetch results and the slug
  }, [
    slug,
    serverData,
    isServerLoadSuccess,
    isServerError,
    serverError,
    setShapes,
    setGuests,
    setEventTitle,
    setTableCounter,
  ]);

  // --- Save Logic ---
  const debouncedServerUpdate = useDebouncedCallback(
    (
      slugToUpdate: string,
      dataToUpdate: VenueData,
      editMode: boolean, // Pass editMode state
      pinToPotentiallySave: string | null, // Pass current PIN state
    ) => {
      console.log(
        `Persistence Hook: Debounced save triggered for slug: ${slugToUpdate}. Syncing to server...`,
      );

      const payload: UpdateVenuePayload = { venue_data: dataToUpdate };

      // If in edit mode and a PIN exists, include it in the payload
      if (editMode && pinToPotentiallySave) {
        payload.pin = pinToPotentiallySave;
        console.log(
          `Persistence Hook: Including current PIN in payload for slug ${slugToUpdate}`,
        );
        // Clear the initial sync flag if this save includes the pin that needed syncing
        if (pinNeedsSync.current === pinToPotentiallySave) {
            pinNeedsSync.current = null;
        }
      } else {
         console.log(`Persistence Hook: Not including PIN (EditMode: ${editMode}, PinExists: ${!!pinToPotentiallySave})`);
      }

      updateVenueMutate(
        { slug: slugToUpdate, data: payload },
        {
          onError: (error) => {
            console.error(
              "Persistence Hook: Failed to sync update to server:",
              error,
            );
            // TODO: Add user feedback (e.g., toast notification)
          },
          onSuccess: (updatedVenue) => {
            console.log(
              "Persistence Hook: Successfully synced update to server.",
            );
            if (payload.pin) {
              // If PIN was part of this successful sync
              pinNeedsSync.current = null; // Clear the flag
              console.log(
                `Persistence Hook: PIN sync successful for ${slugToUpdate}, flag cleared.`,
              );
            }
            storage.setLastSlug(slugToUpdate);
          },
        },
      );
    },
    2000, // 2-second debounce interval
  );

  // Effect to watch the derived venueDataAtom and trigger saves
  useEffect(() => {
    // Only save if: initial load for *this specific slug* is complete AND slug is valid
    if (
      isInitialLoadComplete.current &&
      loadedSlugRef.current === slug &&
      slug
    ) {
      console.log(
        `Persistence Hook: Jotai state changed for ${slug}, saving to localStorage...`,
      );
      storage.setVenueData(slug, currentVenueData);
      storage.setLastSlug(slug); // Update last used slug on local save
      // Trigger debounced server update with current edit mode and PIN
      debouncedServerUpdate(slug, currentVenueData, currentEditMode, currentPin);
    }
  }, [currentVenueData, slug, debouncedServerUpdate, currentEditMode, currentPin]); // Add currentPin back

  // --- Reset Logic --- (Handler to be called from UI)
  const handleResetVenue = useCallback(() => {
    console.log("Persistence Hook: Resetting venue...");
    const newSlug = generateClientSlug();
    const newPin = generateVenuePin(); // Generate new PIN
    const initialState: VenueData = {
      shapes: [],
      guests: [],
      eventTitle: "My Event",
      tableCounter: 1,
    };

    setShapes(initialState.shapes);
    setGuests(initialState.guests);
    setEventTitle(initialState.eventTitle);
    setTableCounter(initialState.tableCounter);

    storage.setVenueData(newSlug, initialState);
    storage.setLastSlug(newSlug);
    storage.setPin(newSlug, newPin); // Store new PIN
    storage.setEditModeStorage(newSlug, true); // Set edit mode for new venue
    pinNeedsSync.current = newPin; // Mark PIN for backend sync

    setVenuePin(newPin); // Update Jotai atom
    setEditMode(true); // Update Jotai atom

    navigate(`/${newSlug}`, { replace: true });
  }, [
    navigate,
    setShapes,
    setGuests,
    setEventTitle,
    setTableCounter,
    setEditMode,
    setVenuePin,
  ]);

  // --- PIN Validation Logic ---
  const attemptUnlock = useCallback(
    async (
      pinAttempt: string,
    ): Promise<{ success: boolean; message?: string }> => {
      if (!slug) {
        console.error("Attempted to unlock without a slug.");
        return { success: false, message: "No venue loaded." };
      }
      try {
        console.log(
          `Persistence Hook: Attempting PIN validation for slug ${slug}`,
        );
        const validationResult = await validatePinOnServer(slug, pinAttempt);
        if (validationResult.success) {
          console.log(
            `Persistence Hook: PIN validation successful for ${slug}`,
          );
          storage.setPin(slug, pinAttempt); // Store the successfully validated PIN
          storage.setEditModeStorage(slug, true);
          setVenuePin(pinAttempt);
          setEditMode(true);
          return { success: true };
        } else {
          console.warn(
            `Persistence Hook: PIN validation failed for ${slug}: ${validationResult.message}`,
          );
          setEditMode(false); // Ensure still in view mode
          return {
            success: false,
            message: validationResult.message || "Invalid PIN.",
          };
        }
      } catch (error) {
        console.error(
          `Persistence Hook: Error during PIN validation for ${slug}:`,
          error,
        );
        setEditMode(false); // Ensure still in view mode on error
        // Check if error is an instance of Error before accessing message
        const errorMessage = error instanceof Error ? error.message : "An error occurred during PIN validation.";
        return {
          success: false,
          message: errorMessage,
        };
      }
    },
    [slug, setEditMode, setVenuePin],
  );

  // --- Return Values ---
  // Determine a unified loading state
  const isLoading = !isInitialLoadComplete.current && isLoadingFromServer;
  const isSaving = updateStatus === "pending"; // Check status for saving state

  return {
    isLoading,
    isSaving,
    currentSlug: slug,
    handleResetVenue,
    serverError: serverError, // Expose server error from query for UI handling
    updateError: updateError, // Expose server error from mutation
    editMode: currentEditMode,
    attemptUnlock,
  };
};
