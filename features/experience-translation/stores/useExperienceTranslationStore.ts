import { useLogger } from "@/features/core-shared/composables/useLogger";
import {
  allCustomHighlights,
  getAllCustomHighlights,
} from "@/features/experience-highlights/lib/get-all-custom-highlights";
import {
  allPremadeHighlights,
  getAllPremadeHighlights,
} from "@/features/experience-highlights/lib/get-all-premade-highlights";
import { ExperienceFlowCode } from "@/types/DocumentStatuses";
import { ExperienceTranslation, FlowCode } from "@/types/generated/ContentCommandApi";
import { AvailableLanguage } from "@/types/Language";
import { acceptHMRUpdate, defineStore } from "pinia";
import { useFormValidation } from "../composables/useFormValidation";
import { fetchTranslation } from "../lib/fetch-translation";
import { updateTranslation } from "../lib/update-translation";
import { experienceTranslationSchema } from "../schemas";
import { useContentCommandApi } from "@/composables/useContentCommandApi";
import { StatusCode } from "@/types/generated/ContentQueryApiV2";
import { waitForTimeout } from "@/features/core-shared/utils/promise/wait";
import { updateDelayMs } from "@/features/experience-shared/constants/experience-shared-constants";

type Translation = Omit<ExperienceTranslation, "flow_code"> & { flow_code: FlowCode | "" } & allCustomHighlights &
  allPremadeHighlights;

export const useExperienceTranslationStore = defineStore("use-experience-translation-store", () => {
  const translationId = ref<string | null>(null);
  const loaded = ref(false);
  const modified = ref(false);
  const isSaving = ref(false);

  const translation = ref<Translation>({
    experience_id: "",
    flow_code: "",
    status_code: "IN_REVIEW",
    language_code: "",
    title: "",
    custom_highlights: [],
    custom_important_information: [],
    custom_included: [],
    custom_non_included: [],
    premade_highlights: [],
    premade_important_information: [],
    premade_included: [],
    premade_non_included: [],
  });

  const isTranslationPublished = computed(() => translation.value.status_code === "READY");

  const validation = useFormValidation(translation, experienceTranslationSchema);
  const { logError } = useLogger();

  async function loadTranslation(languageCode: AvailableLanguage, experienceId: string) {
    const [translationData, allCustomHighlightsData, allPremadeHighlightsData] = await Promise.all([
      fetchTranslation(languageCode, experienceId),
      getAllCustomHighlights(languageCode, experienceId),
      getAllPremadeHighlights(languageCode, experienceId),
    ]).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      throw error;
    });

    const { id, ...data } = translationData;

    if (id == null || id.length === 0) {
      throw new Error("Cannot load a translation without id!");
    }

    translation.value = { ...data, ...allCustomHighlightsData, ...allPremadeHighlightsData };

    translationId.value = id;
    loaded.value = true;
    modified.value = false;
    validation.runValidation();
  }

  async function saveTranslation(publish = false) {
    if (translationId.value == null || translationId.value.length === 0) {
      throw new Error("Cannot save a translation without translation ID.");
    }

    try {
      const statusCode: StatusCode = "IN_REVIEW";
      const flowCode: ExperienceFlowCode = "MANUAL_TRANSLATION";

      const {
        custom_highlights = [],
        custom_important_information = [],
        custom_included = [],
        custom_non_included = [],
        premade_highlights: _premade_highlights,
        premade_important_information: _premade_important_information,
        premade_included: _premade_included,
        premade_non_included: _premade_non_included,
        ...updatedTranslation
      } = translation.value;

      await updateTranslation(translationId.value, {
        translation: {
          ...updatedTranslation,
          status_code: statusCode,
          flow_code: flowCode,
          // if updated/saved from the frontend,
          // it's not an automatic translation anymore
          automatic_translation: false,
          to_be_translated: false,
        },
        highlights: {
          custom_highlights,
          custom_important_information,
          custom_included,
          custom_non_included,
        },
      });

      // remove also this publish check OFF-2547
      if (!publish) {
        // todo remove delay OFF-2547
        await waitForTimeout(updateDelayMs);
        await refreshNuxtData(`getDistributionContent-${translation.value.experience_id}`);
        translation.value.status_code = statusCode;
        translation.value.flow_code = flowCode;
      }
    } catch (e) {
      logError("update-translation", e);
    }
  }

  async function publishTranslationExperience() {
    const { publishTranslation } = useContentCommandApi();

    await publishTranslation(translation.value.experience_id, translation.value.language_code as AvailableLanguage);

    // todo remove delay OFF-2547
    await waitForTimeout(updateDelayMs);
    await refreshNuxtData(`getDistributionContent-${translation.value.experience_id}`);

    translation.value.status_code = "READY";
  }

  return {
    translation,
    isTranslationPublished,
    translationId,
    loaded,
    modified,
    isSaving,
    loadTranslation,
    validation,
    saveTranslation,
    publishTranslationExperience,
  };
});

// HMR
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useExperienceTranslationStore, import.meta.hot));
}
