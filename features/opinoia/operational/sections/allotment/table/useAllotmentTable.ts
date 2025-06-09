import { AllotmentData } from "../types";
import { nanoid } from "nanoid";
import { cloneDeep } from "lodash";
import { useLastSavedOptionsSectionData } from "@/features/opinoia/operational/sections/options/composables/useLastSavedOptionsSectionData";
import { BaseOption } from "@/types/Option";
import { useLastSavedConfigurationSectionData } from "@/features/opinoia/operational/sections/configuration/useLastSavedConfigurationSectionData";
export const ALLOTMENT_AT_EXPERIENCE_LEVEL = "experience_level";

export function useAllotmentTable(opt: { allotments: Ref<AllotmentData[]>; experienceId: string }) {
  const configurationData = useLastSavedConfigurationSectionData(readonly(toRef(opt.experienceId)));
  const lastSavedOptionsSectionData = useLastSavedOptionsSectionData(readonly(toRef(opt.experienceId)));

  function addNewAllotment() {
    const newAllotment: AllotmentData = {
      id: nanoid(),
      isAtExperienceLevel: false,
      optionId: undefined,
      dates: undefined,
      languages: [],
      monday: undefined,
      tuesday: undefined,
      wednesday: undefined,
      thursday: undefined,
      friday: undefined,
      saturday: undefined,
      sunday: undefined,
    };

    opt.allotments.value.push(newAllotment);
  }

  function duplicateAllotment(allotment: AllotmentData) {
    const duplicatedAllotment: AllotmentData = { ...cloneDeep(allotment), id: nanoid() };

    const allotmentIndex = opt.allotments.value.findIndex((p) => p.id === allotment.id);
    if (allotmentIndex !== -1) {
      opt.allotments.value.splice(allotmentIndex + 1, 0, duplicatedAllotment);
    } else {
      opt.allotments.value.push(duplicatedAllotment);
    }
  }

  function removeAllotment(allotment: AllotmentData) {
    const allotmentIndex = opt.allotments.value.findIndex((a) => a.id === allotment.id);
    if (allotmentIndex !== -1) {
      opt.allotments.value.splice(allotmentIndex, 1);
    }
  }

  const options = computed<BaseOption<string>[]>(() => {
    return (
      lastSavedOptionsSectionData.data.value?.options.map((experienceOption) => ({
        value: experienceOption.id,
        label: experienceOption.code,
      })) ?? []
    );
  });

  const optionListWithExperience = computed(() => [
    {
      value: ALLOTMENT_AT_EXPERIENCE_LEVEL,
      label: `${configurationData.data.value.configuration.experienceCode.value}(Exp)`,
    },
    ...options.value,
  ]);

  function getSelectedOptionValue(allotment: AllotmentData) {
    if (allotment.isAtExperienceLevel) {
      return ALLOTMENT_AT_EXPERIENCE_LEVEL;
    } else {
      return optionListWithExperience.value.find((option) => option.value === allotment.optionId)?.value;
    }
  }
  function handleUpdateOption(value: string, allotment: AllotmentData) {
    if (value === ALLOTMENT_AT_EXPERIENCE_LEVEL) {
      allotment.isAtExperienceLevel = true;
      allotment.optionId = undefined;
    } else {
      allotment.isAtExperienceLevel = false;
      allotment.optionId = value;
    }
  }

  return {
    optionListWithExperience,
    addNewAllotment,
    duplicateAllotment,
    removeAllotment,
    getSelectedOptionValue,
    handleUpdateOption,
  };
}
