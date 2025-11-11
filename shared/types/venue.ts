import type { Table, VenueElement, Guest } from "../src/types/seatingChart.ts"; // Try adding .ts extension

/**
 * Represents the data structure stored in the venue_data JSONB column
 * and potentially in localStorage.
 */
export interface VenueData {
  shapes: Array<VenueElement | Table>; // Represents the shapes array
  guests: Guest[];
  eventTitle: string;
  tableCounter: number;
  // Add other relevant state properties managed by atoms if needed
  // e.g., venueSpaceLocked?: boolean;
}

/**
 * Represents the full venue object as stored in the database
 * and returned by API endpoints.
 */
export interface Venue {
  slug: string;
  venue_data: VenueData; // Embed the VenueData structure
  created_at: string; // ISO 8601 date string (TIMESTAMPTZ)
  updated_at: string; // ISO 8601 date string (TIMESTAMPTZ)
}

// Optional: Type for the API response when creating a venue
export interface CreateVenueResponse {
  slug: string;
}
