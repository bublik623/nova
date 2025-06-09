import { RevisionOptions, ExperienceRevision } from "../types/revision";
import { computeExperienceOptions } from "@/features/experience-revision/lib/map-options";

const DEFAULT_OPTIONS = {
  showAsterix: true,
  showNatGeoField: true,
};

/**
 * Computes the revision options based on the given flow and values.
 *
 * @param flow - The flow type.
 * @param values - The revision values.
 * @returns The computed revision options.
 * @throws {Error} If the flow is invalid.
 */
export function computeOptionsByFlow(flow: string, values: ExperienceRevision): RevisionOptions {
  if (flow === "curation" || flow === "raw") {
    return computeExperienceOptions(values);
  }

  if (flow === "translation") {
    return DEFAULT_OPTIONS;
  }

  throw new Error(`Could not compute options for flow: ${flow}`);
}
