import { ref } from "vue";
import { DistributionContent } from "@/types/generated/ExperienceRawServiceApi";
import { useDistributionContentStore } from "@/features/experience-shared/stores/useDistributionContentStore";

export interface Attributes {
  curationLevel?: DistributionContent["curation_level"];
  priority?: DistributionContent["priority"];
}

export function useDistributionAttributes() {
  const { $t } = useNuxtApp();

  const store = useDistributionContentStore();

  const attributeValues = computed<Attributes>(() => ({
    priority: store.values.priority,
    curationLevel: store.values.curation_level,
  }));

  const curationOptions = ref<{ label: string; value: DistributionContent["curation_level"] }[]>([
    { label: $t("experience.attributes.curation_level.option.dedicated"), value: "DEDICATED" },
    { label: $t("experience.attributes.curation_level.option.full_curation"), value: "FULL_CURATION" },
    { label: $t("experience.attributes.curation_level.option.soft_curation"), value: "SOFT_CURATION" },
    { label: $t("experience.attributes.curation_level.option.self_management"), value: "SELF_MANAGEMENT" },
    { label: $t("experience.attributes.curation_level.option.to_be_dedicated"), value: "TO_BE_DEDICATED" },
    { label: $t("experience.attributes.curation_level.option.to_be_full_curated"), value: "TO_BE_FULL_CURATED" },
    { label: $t("experience.attributes.curation_level.option.to_be_soft_curated"), value: "TO_BE_SELF_MANAGED" },
    { label: $t("experience.attributes.curation_level.option.to_be_self_managed"), value: "TO_BE_SOFT_CURATED" },
  ]);

  const priorityOptions = ref<{ label: string; value: DistributionContent["priority"] }[]>([
    { label: $t("experience.attributes.priority.option.priority_8"), value: 8 },
    { label: $t("experience.attributes.priority.option.priority_4"), value: 4 },
    { label: $t("experience.attributes.priority.option.priority_1"), value: 1 },
    { label: $t("experience.attributes.priority.option.priority_blocker"), value: 0 },
  ]);

  // We need this for retro-compatibility in places where we haven't applied the new stores yet (ie: curation flow)
  async function saveData(_: string) {
    await store.save();
  }

  const setCurationLevel = (curationLevel: DistributionContent["curation_level"]) => {
    store.updateValues({
      curation_level: curationLevel,
    });
  };

  const setPriority = (priority: DistributionContent["priority"]) => {
    store.updateValues({
      priority: priority,
    });
  };

  return {
    saveData,
    setCurationLevel,
    setPriority,
    curationOptions,
    priorityOptions,
    attributeValues,
  };
}
