import { RevisionOptions, ExperienceRevision } from "../types/revision";

/**
 * Maps the given `RevisionValues` to `RevisionOptions` for the raw or curation flow.
 * @param values - The `RevisionValues` object to map.
 * @returns The mapped `RevisionOptions` object.
 */
export function computeExperienceOptions(values: ExperienceRevision): RevisionOptions {
  const options: RevisionOptions = {};

  if (values.productBrand === "BRAND_NATIONAL_GEOGRAPHIC") {
    options.showNatGeoField = true;
  }

  if (values.additionalDescription && values.additionalDescription.length > 0) {
    options.showAdditionalDescription = true;
  }

  return options;
}
