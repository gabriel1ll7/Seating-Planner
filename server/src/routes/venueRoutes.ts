import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { customAlphabet } from "nanoid";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import db from "../db.js";
import asyncHandler from "../utils/asyncHandler.js"; // Import asyncHandler
import type { VenueData } from '../../../shared/types/venue.js'; // Corrected relative path and kept .js extension

// Define an interface for the Venue data structure
interface Venue {
  slug: string;
  venue_data: VenueData; // Changed from any to VenueData
  hashed_pin?: string; // Added for internal use, will not be sent in GET responses
  created_at: string; // Or Date, depending on how pg returns TIMESTAMPTZ
  updated_at: string; // Or Date
}

const router = Router();

// Define the alphabet and length for nanoid slugs
// Using lowercase alphanumeric characters for URL-friendliness
// Length of 10 should provide ample uniqueness (36^10 combinations)
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

const MAX_SLUG_RETRIES = 5;

// Rate limiter for PIN validation
const pinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 PIN validation requests per windowMs
  message: {
    message:
      "Too many PIN validation attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * POST /api/venues
 * Creates a new venue with a unique slug.
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let attempts = 0;
    let slugGenerated = false;
    let newSlug = "";

    while (attempts < MAX_SLUG_RETRIES && !slugGenerated) {
      newSlug = nanoid();
      attempts++;
      try {
        const initialVenueData = {}; // This might need to be a valid empty VenueData
        const queryText =
          "INSERT INTO venues (slug, venue_data) VALUES ($1, $2) RETURNING slug";
        await db.query(queryText, [newSlug, initialVenueData as VenueData]); // Added type assertion for initialVenueData
        slugGenerated = true;
      } catch (error: unknown) { // Changed from any to unknown
        if (error instanceof Error && "code" in error && (error as { code: string }).code === "23505") { // Type check for error code
          console.warn(
            `Slug collision for '${newSlug}'. Attempt ${attempts}/${MAX_SLUG_RETRIES}. Retrying...`,
          );
          if (attempts >= MAX_SLUG_RETRIES) {
            throw new Error(
              "Failed to generate unique identifier for venue after multiple attempts.",
            );
          }
          // Continue loop for retry
        } else {
          throw error; // Rethrow for asyncHandler to catch and pass to global error handler
        }
      }
    }

    if (slugGenerated) {
      res.status(201).json({ slug: newSlug });
    } else {
      // This path should ideally be unreachable if the loop logic is correct and throws on max retries
      throw new Error(
        "Failed to create venue due to an unexpected issue generating a unique slug.",
      );
    }
  }),
);

/**
 * GET /api/venues/:slug
 * Retrieves a specific venue by its slug.
 */
router.get(
  "/:slug",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;

    // Basic slug validation (check for non-empty string)
    if (!slug || typeof slug !== "string") {
      res.status(400).json({ message: "Invalid slug format." });
      return;
    }

    // Select specific columns, explicitly EXCLUDING hashed_pin
    const queryText =
      "SELECT slug, venue_data, created_at, updated_at FROM venues WHERE slug = $1";
    const result = await db.query<Omit<Venue, "hashed_pin">>(queryText, [slug]); // Use Omit to reflect excluded field

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Venue not found." });
      return;
    }
    res.status(200).json(result.rows[0]);
    // No explicit return needed here, as res.json() sends the response and ends it.
  }),
);

/**
 * PUT /api/venues/:slug
 * Updates an existing venue or creates it if it doesn't exist (Upsert).
 */
router.put(
  "/:slug",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;
    const { venue_data, pin } = req.body;

    console.log(`[PUT /api/venues/${slug}] Received request.`); // Log entry

    // Basic slug validation
    if (!slug || typeof slug !== "string") {
      console.error(`[PUT /api/venues/${slug}] Invalid slug format.`);
      res.status(400).json({ message: "Invalid slug format." });
      return;
    }

    // Basic validation for venue_data
    if (typeof venue_data === "undefined") {
      console.error(`[PUT /api/venues/${slug}] Missing venue_data in body.`);
      res
        .status(400)
        .json({ message: "venue_data is required in the request body." });
      return;
    }

    // **AUTHORIZATION CHECK: Validate PIN if venue already exists with a PIN**
    const checkExistingQuery = "SELECT hashed_pin FROM venues WHERE slug = $1";
    const existingVenue = await db.query<{ hashed_pin: string | null }>(
      checkExistingQuery,
      [slug],
    );

    // If venue exists and has a PIN set, we MUST validate the provided PIN
    if (existingVenue.rows.length > 0 && existingVenue.rows[0].hashed_pin) {
      console.log(
        `[PUT /api/venues/${slug}] Venue exists with PIN. Validating authorization...`,
      );

      // PIN is required for updates to protected venues
      if (!pin) {
        console.warn(
          `[PUT /api/venues/${slug}] Update attempted without PIN on protected venue.`,
        );
        res.status(401).json({ message: "PIN required to update this venue." });
        return;
      }

      // Validate PIN format
      if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
        console.error(`[PUT /api/venues/${slug}] Invalid PIN format provided.`);
        res.status(400).json({ message: "PIN must be a 4-digit string." });
        return;
      }

      // Verify PIN matches
      const isValidPin = await bcrypt.compare(
        pin,
        existingVenue.rows[0].hashed_pin,
      );

      if (!isValidPin) {
        console.warn(
          `[PUT /api/venues/${slug}] Invalid PIN provided for update.`,
        );
        res.status(403).json({ message: "Invalid PIN." });
        return;
      }

      console.log(`[PUT /api/venues/${slug}] PIN validation successful.`);
    }

    // Handle PIN hashing for new PIN or PIN changes
    let hashedPinToStore: string | null = null;
    if (pin) {
      if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
        console.error(`[PUT /api/venues/${slug}] Invalid PIN format provided.`);
        res.status(400).json({ message: "PIN must be a 4-digit string." });
        return;
      }
      const saltRounds = 10;
      hashedPinToStore = await bcrypt.hash(pin, saltRounds);
      console.log(`[PUT /api/venues/${slug}] PIN provided, generating hash.`);
    }

    console.log(`[PUT /api/venues/${slug}] Attempting upsert...`); // Log before query
    try {
      // Use INSERT ... ON CONFLICT to perform an Upsert
      // Conditionally set hashed_pin only if a new pin was provided
      // If pin is not provided, existing hashed_pin should be preserved on update.
      const queryText = `
      INSERT INTO venues (slug, venue_data, hashed_pin, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (slug) 
      DO UPDATE SET 
        venue_data = EXCLUDED.venue_data,
        -- Only update hashed_pin if a new one was actually provided in this PUT request
        -- Otherwise, keep the existing one.
        hashed_pin = CASE
                       WHEN $3 IS NOT NULL THEN EXCLUDED.hashed_pin
                       ELSE venues.hashed_pin 
                     END,
        updated_at = NOW()
      RETURNING slug, venue_data, created_at, updated_at; -- Exclude hashed_pin from returning
    `;

      console.log(
        `[PUT /api/venues/${slug}] Executing query with slug: ${slug}`,
      ); // Log parameters
      // Pass hashedPinToStore (which can be null if no pin was provided)
      const result = await db.query<Omit<Venue, "hashed_pin">>(queryText, [
        slug,
        venue_data,
        hashedPinToStore,
      ]);
      console.log(
        `[PUT /api/venues/${slug}] Upsert successful. Rows returned: ${result.rows.length}`,
      ); // Log success

      if (result.rows.length === 0) {
        // This case should not happen with the ON CONFLICT query if parameters are valid
        console.error(
          `[PUT /api/venues/${slug}] Upsert operation returned 0 rows unexpectedly.`,
        );
        throw new Error("Upsert operation failed unexpectedly.");
      }

      res.status(200).json(result.rows[0]); // Return the created or updated venue
    } catch (error) {
      console.error(`[PUT /api/venues/${slug}] Error during upsert:`, error); // Log the actual error
      next(error);
    }
  }),
);

/**
 * POST /api/venues/:slug/validate-pin
 * Validates a PIN for a given venue slug.
 */
router.post(
  "/:slug/validate-pin",
  pinLimiter,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;
    const { pin: pinAttempt } = req.body;

    if (!slug || typeof slug !== "string") {
      res.status(400).json({ message: "Invalid slug format." });
      return;
    }
    if (
      !pinAttempt ||
      typeof pinAttempt !== "string" ||
      !/^\d{4}$/.test(pinAttempt)
    ) {
      res.status(400).json({ message: "PIN must be a 4-digit string." });
      return;
    }

    console.log(
      `[POST /api/venues/${slug}/validate-pin] Attempting to validate PIN.`,
    );

    const queryText = "SELECT hashed_pin FROM venues WHERE slug = $1";
    const result = await db.query<{ hashed_pin: string | null }>(queryText, [
      slug,
    ]);

    if (result.rows.length === 0) {
      console.warn(`[POST /api/venues/${slug}/validate-pin] Venue not found.`);
      // Still return 403 to not reveal if a slug exists or not based on PIN attempts
      res
        .status(403)
        .json({ success: false, message: "Invalid PIN or venue not found." });
      return;
    }

    const venueWithPin = result.rows[0];

    if (!venueWithPin.hashed_pin) {
      console.warn(
        `[POST /api/venues/${slug}/validate-pin] Venue found, but no PIN is set for it.`,
      );
      res
        .status(403)
        .json({ success: false, message: "No PIN set for this venue." });
      return;
    }

    const isValidPin = await bcrypt.compare(
      pinAttempt,
      venueWithPin.hashed_pin,
    );

    if (isValidPin) {
      console.log(
        `[POST /api/venues/${slug}/validate-pin] PIN validation successful.`,
      );
      res.status(200).json({ success: true });
      return;
    } else {
      console.warn(
        `[POST /api/venues/${slug}/validate-pin] PIN validation failed.`,
      );
      res.status(403).json({ success: false, message: "Invalid PIN." });
      return;
    }
  }),
);

// Placeholder for other venue routes (GET /:slug, PUT /:slug)
// router.get('/:slug', async (req, res, next) => { /* ... */ });
// router.put('/:slug', async (req, res, next) => { /* ... */ });

export default router;
