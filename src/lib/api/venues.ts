import type {
  Venue,
  VenueData,
  CreateVenueResponse,
} from "@shared/types/venue"; // Use path alias

const API_BASE_URL = "/api"; // Vite proxy will handle this

// Define a type for the update payload to include optional pin
export interface UpdateVenuePayload {
  venue_data: VenueData;
  pin?: string; // PIN is optional, only sent when setting/changing
}

/**
 * Creates a new venue by calling the backend.
 * @returns A promise that resolves to an object containing the new slug.
 */
export const createVenue = async (): Promise<CreateVenueResponse> => {
  const response = await fetch(`${API_BASE_URL}/venues`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}), // Sending empty body as backend handles defaults
  });

  if (!response.ok) {
    // Consider more specific error handling based on status code
    const errorBody = await response.text(); // Read error body for more details
    throw new Error(
      `Failed to create venue: ${response.status} ${response.statusText} - ${errorBody}`,
    );
  }

  return response.json();
};

/**
 * Fetches a specific venue by its slug.
 * @param slug The unique identifier of the venue.
 * @returns A promise that resolves to the Venue object.
 */
export const getVenue = async (slug: string): Promise<Venue> => {
  if (!slug) {
    throw new Error("Slug must be provided to fetch a venue.");
  }
  const response = await fetch(`${API_BASE_URL}/venues/${slug}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Venue not found."); // Specific error for 404
    }
    const errorBody = await response.text();
    throw new Error(
      `Failed to fetch venue: ${response.status} ${response.statusText} - ${errorBody}`,
    );
  }

  return response.json();
};

/**
 * Updates an existing venue by its slug.
 * @param slug The unique identifier of the venue to update.
 * @param data An object containing the venue_data payload.
 * @returns A promise that resolves to the updated Venue object.
 */
export const updateVenue = async (
  slug: string,
  data: UpdateVenuePayload,
): Promise<Venue> => {
  if (!slug) {
    throw new Error("Slug must be provided to update a venue.");
  }
  if (!data || typeof data.venue_data === "undefined") {
    throw new Error("venue_data payload is required to update a venue.");
  }

  const response = await fetch(`${API_BASE_URL}/venues/${slug}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data), // Send the whole { venue_data: { ... } } object
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Venue not found for update."); // Specific error for 404
    }
    const errorBody = await response.text();
    throw new Error(
      `Failed to update venue: ${response.status} ${response.statusText} - ${errorBody}`,
    );
  }

  return response.json();
};

/**
 * Validates a PIN for a given venue slug against the backend.
 * @param slug The unique identifier of the venue.
 * @param pin The 4-digit PIN to validate.
 * @returns A promise that resolves to an object with a success boolean and optional message.
 */
export const validatePinOnServer = async (
  slug: string,
  pin: string,
): Promise<{ success: boolean; message?: string }> => {
  if (!slug) {
    throw new Error("Slug must be provided to validate a PIN.");
  }
  if (!pin || typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
    throw new Error("PIN must be a 4-digit string for validation.");
  }

  const response = await fetch(`${API_BASE_URL}/venues/${slug}/validate-pin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pin }),
  });

  const responseData = await response.json(); // Always parse JSON body

  if (!response.ok) {
    // Use message from responseData if available, otherwise a generic one
    const message =
      responseData.message ||
      `PIN validation failed: ${response.status} ${response.statusText}`;
    // For PIN validation, we don't throw an error directly for failed attempts (403),
    // instead, we return success: false. But other errors (500, 400) should still throw.
    if (
      response.status !== 403 &&
      response.status !== 400 &&
      response.status !== 404
    ) {
      // 403 is invalid pin, 400 is bad request (e.g. bad slug/pin format), 404 venue not found during validation (treated as invalid pin)
      // these are handled by returning success: false
      throw new Error(message);
    }
    return { success: false, message };
  }

  return responseData; // Should be { success: true } from backend on 200 OK
};
