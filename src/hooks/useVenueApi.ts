import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { getVenue, createVenue, updateVenue } from "@/lib/api/venues"; // Use @ alias for src/
import type {
  Venue,
  VenueData,
  CreateVenueResponse,
} from "@shared/types/venue";

// Type definition for the update mutation variables
type UpdateVenueVariables = {
  slug: string;
  data: { venue_data: VenueData };
};

// --- Query Hook ---

/**
 * Custom hook to fetch venue data by slug.
 * @param slug - The venue slug (string) or null/undefined if no slug is available.
 * @param options - Optional React Query query options.
 */
export const useVenueQuery = (
  slug: string | null | undefined,
  options?: Omit<
    UseQueryOptions<Venue, Error, Venue, readonly [string, string | null]>,
    "queryKey" | "queryFn" | "enabled"
  >,
) => {
  return useQuery({
    queryKey: ["venue", slug ?? null] as const,
    queryFn: () => {
      if (!slug) {
        return Promise.reject(
          new Error("Attempted to fetch venue without a slug."),
        );
      }
      return getVenue(slug);
    },
    enabled: !!slug,
    ...options,
  });
};

// --- Mutation Hooks ---

/**
 * Custom hook for creating a new venue.
 * @param options - Optional React Query mutation options.
 */
export const useCreateVenueMutation = (
  options?: UseMutationOptions<CreateVenueResponse, Error, void>,
) => {
  return useMutation({
    mutationFn: createVenue,
    ...options,
  });
};

/**
 * Custom hook for updating an existing venue.
 * @param options - Optional React Query mutation options.
 */
export const useUpdateVenueMutation = (
  options?: UseMutationOptions<Venue, Error, UpdateVenueVariables>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }) => updateVenue(slug, data),
    onSuccess: (data, variables, context) => {
      console.log(`Invalidating query for venue: ${variables.slug}`);
      queryClient.invalidateQueries({ queryKey: ["venue", variables.slug] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};
