import { useDistributionContentQuery } from "@/features/experience-raw/queries/distribution-content-query";
import { useMasterLanguage } from "./i18n/useMasterLanguage";
import { OpinoiaExperience } from "./types";
import { useTranslationQuery } from "./translations/useTranslationQuery";
import { useExperienceRawQuery } from "@/features/experience-raw/queries/experience-raw-query";

/**
 * Provides a consolidated, reactive view of commonly used "Opinoia Experience" data.
 *
 * This composable acts as a facade, fetching data from various sources like
 * raw content (`useExperienceRawQuery`), distribution content (`useDistributionContentQuery`),
 * and translations (`useTranslationQuery` with the master language) based on the experience ID.
 * It computes a unified `OpinoiaExperience` object.
 *
 * @param experienceId - A readonly ref containing the ID of the experience.
 * @returns A readonly computed ref (`ComputedRef<OpinoiaExperience>`) containing the aggregated experience data.
 * The object updates reactively when the underlying data sources change.
 *
 * @remarks
 * - The `experienceState` and `documents` properties are currently stubbed with default values.
 * Their implementation will be added later.
 * - This composable might be refactored into smaller, more focused composables in the future
 * if it grows too large or if consumers consistently only need a subset of the data.
 *
 * @see useExperienceRawQuery - Source for raw commercial title.
 * @see useDistributionContentQuery - Source for reference code.
 * @see useTranslationQuery - Source for translated title (preferred).
 * @see useMasterLanguage - Provides the master language for translation lookup.
 *
 * @example
 * const experienceId = ref('exp-123');
 * const experienceData = useOpinoiaExperience(experienceId);
 *
 * console.log(experienceData.value.title);
 * console.log(experienceData.value.referenceCode);
 */
export function useOpinoiaExperience(experienceId: Readonly<Ref<string>>): ComputedRef<OpinoiaExperience> {
  const rawContentQuery = useExperienceRawQuery(experienceId);
  const distributionContentQuery = useDistributionContentQuery(experienceId);
  const masterLanguageTranslationQuery = useTranslationQuery(experienceId, useMasterLanguage());

  // TODO: add proper implementation for:
  // [experienceState, documents]
  return computed(() => ({
    id: experienceId.value,
    title: masterLanguageTranslationQuery.data.value?.title ?? rawContentQuery.data.value?.commercial.title ?? "",
    referenceCode: distributionContentQuery.data.value?.reference_code ?? "",
    experienceState: "draft",
    documents: {
      RAW_COMMERCIAL: {
        type: "RAW_COMMERCIAL",
        state: rawContentQuery.data.value?.status_code ?? "IN_CREATION",
      },
      OPERATIONAL: {
        type: "OPERATIONAL",
        state: "IN_CREATION",
      },
    },
  }));
}
