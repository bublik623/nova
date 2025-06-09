import { useAllotmentQuery } from "./queries/useAllotmentQuery";
import { AllotmentData, AllotmentSectionData } from "./types";
import { getDateRange } from "@/features/opinoia/shared/utils/date-utils";
import { isArrayOfAvailableLanguages } from "@/utils/language-utils";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { nanoid } from "nanoid";

export function useLastSavedAllotmentSectionData(experienceId: Readonly<Ref<string>>) {
  const allotmentQuery = useAllotmentQuery(experienceId);
  const logger = useLogger();

  const isLoading = computed(() => allotmentQuery.isFetching.value);

  const checkLanguages = (languages: string[]) => {
    if (!isArrayOfAvailableLanguages(languages)) {
      logger.logError("load-allotments", new Error("Invalid allotment's languages"));
      return [];
    }
    return languages;
  };

  const allotmentSectionData = computed<AllotmentSectionData>(() => {
    const allotmentsDto = allotmentQuery.data.value || [];

    const allotments: AllotmentData[] = allotmentsDto.map(
      (allotment) =>
        ({
          id: allotment.id ?? nanoid(),
          isAtExperienceLevel: !allotment.option_id,
          optionId: allotment.option_id,
          languages: allotment.languages ? checkLanguages(allotment.languages) : [],
          dates: getDateRange(allotment.date_from, allotment.date_to, "yyyy-MM-dd"),
          monday: allotment.monday,
          tuesday: allotment.tuesday,
          wednesday: allotment.wednesday,
          thursday: allotment.thursday,
          friday: allotment.friday,
          saturday: allotment.saturday,
          sunday: allotment.sunday,
        } satisfies AllotmentData)
    );

    return { allotments };
  });

  return {
    isLoading,
    data: allotmentSectionData,
  };
}
