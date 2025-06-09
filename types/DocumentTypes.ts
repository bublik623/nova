import { z } from "zod";

export const FunctionalGroupCodeSchema = z.enum([
  "PROMOTIONAL_OPTIONS",
  "PRODUCT_BRAND",
  "OWN_OFFER",
  "FEATURES",
  "DURATION",
  "NAT_GEO_TOUR_LEVELS",
]);

export type FunctionalGroupCode = z.infer<typeof FunctionalGroupCodeSchema>;
