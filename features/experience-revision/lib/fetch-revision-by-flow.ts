import {
  mapMediaSnapshotValues,
  mapRawSnapshotValues,
  mapSnapshotValues,
} from "@/features/experience-revision/lib/map-values";
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";
import { AllowedRevisionFlow } from "../schema";

/**
 * Fetches a revision by flow and maps it to the correct shape.
 *
 * @param flow - The flow type ("raw" or "curation").
 * @param revisionId - The ID of the revision to fetch.
 * @returns The mapped values based on the flow type.
 * @throws Error if the flow type is invalid.
 * @description This function fetches a revision by flow and maps it to the correct shape.
 * We use the refCode and supplierId from the distributionContent, even if the translation snapshot has it.
 */
export async function fetchRevisionByFlow(
  language: string,
  flow: AllowedRevisionFlow,
  revisionId: string,
  experienceId: string
) {
  const { getSingleRawSnapshot, getSingleSnapshot, getDistributionContent } = useExperienceRawApi();

  if (flow === "raw") {
    const [{ data }, { data: distributionContent }] = await Promise.all([
      getSingleRawSnapshot(revisionId),
      getDistributionContent(experienceId),
    ]);

    return mapRawSnapshotValues(data, distributionContent);
  } else if (flow === "translation" || flow === "curation") {
    const [{ data }, { data: distributionContent }] = await Promise.all([
      getSingleSnapshot(revisionId),
      getDistributionContent(experienceId),
    ]);

    return mapSnapshotValues(flow, language, data, distributionContent);
  } else if (flow === "media") {
    const { data } = await getSingleSnapshot(revisionId);

    return mapMediaSnapshotValues(data);
  }
  throw new Error(`Could not fetch revision for flow: ${flow}`);
}
