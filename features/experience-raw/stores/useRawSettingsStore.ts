import { StoreField, useStoreFields } from "@/features/experience-shared/composables/useStoreFields";
import {
  mapRawElementToRawSettingsValue,
  mapRawSettingsValueToRawElement,
} from "@/features/experience-raw/lib/map-raw-element.js";
import { z } from "zod";
import { BRAND_NATIONAL_GEOGRAPHIC, BRAND_TUI_COLLECTION } from "../constants";
import { defineStore, acceptHMRUpdate } from "pinia";
import { useExperienceRawMutation } from "../queries/experience-raw-mutation";
import { useCurrentRawExperienceQuery } from "@/features/experience-raw/composables/useCurrentRawExperienceQuery";

const titleField: StoreField = {
  key: "title",
  isRequired: true,
  schema: z.string().min(1, { message: "experience.title.input.error" }),
};

const externalReferenceCodeField: StoreField = {
  key: "external_reference_code",
  isRequired: false,
  schema: z.string().min(1),
};

const categoriesInterestsField: StoreField = {
  key: "categories_interests",
  isRequired: true,
  schema: z.object({
    categories: z.array(z.string()),
    interests: z.array(z.string()),
  }),
};

const promotionalOptionsField: StoreField = {
  key: "promotional_options",
  isRequired: false,
  schema: z.string().min(1),
};

const productBrandField: StoreField = {
  key: "product_brand",
  isRequired: false,
  schema: z.string().min(1),
};

const natGeoTourLevelsField: StoreField = {
  key: "nat_geo_tour_levels",
  isRequired: true,
  schema: z.string().min(1),
};

const ownOfferField: StoreField = {
  key: "own_offer",
  isRequired: true,
  schema: z.string().min(1),
};

const collectionCriteriaField: StoreField = {
  key: "collection_criteria",
  isRequired: false,
  schema: z
    .object({
      best_value_guaranteed: z.string().optional(),
      created_with_care: z.string().optional(),
      exceptional_experiences: z.string().optional(),
    })
    .optional(),
};

export const useRawSettingsStore = defineStore("useRawSettingsStore", () => {
  const experienceRawQuery = useCurrentRawExperienceQuery();
  const experienceRawMutation = useExperienceRawMutation();

  const rawSettingsData = computed(() => mapRawElementToRawSettingsValue(experienceRawQuery.data.value));

  const isSaving = computed(() => experienceRawMutation.isPending.value);

  const isNatGeo = computed(() => isStringNatGeo(storeFields.values.product_brand));
  const isTuiCollection = computed(() => isStringTuiCollection(storeFields.values.product_brand));

  const storeFields = useStoreFields(
    (v) => {
      const fields = [
        titleField,
        externalReferenceCodeField,
        categoriesInterestsField,
        promotionalOptionsField,
        productBrandField,
        isStringNatGeo(v.product_brand) ? natGeoTourLevelsField : [],
        isStringTuiCollection(v.product_brand) ? collectionCriteriaField : [],
        ownOfferField,
      ];

      return fields.flatMap((field) => field);
    },
    {
      initialValues: rawSettingsData,
    }
  );

  return {
    save,
    isSaving,
    isNatGeo,
    isTuiCollection,
    ...storeFields,
    enabled: true,
    $reset,
  };

  async function save() {
    if (!storeFields.hasChanges.value) {
      return Promise.resolve();
    }

    const promises: Promise<void>[] = [];

    const rawId = experienceRawQuery.data.value?.id;
    const experienceId = experienceRawQuery.data.value?.experience_id;
    const mappedValues = mapRawSettingsValueToRawElement(storeFields.updatedValues.value || {}, {
      additional_services: experienceRawQuery.data.value?.functional?.additional_services || [],
    });

    if (!rawId) {
      throw new Error("Raw ID is missing");
    }

    if (!experienceId) {
      throw new Error("Experience ID is missing");
    }

    promises.push(experienceRawMutation.mutateAsync({ ...mappedValues, experience_id: experienceId, id: rawId }));

    await Promise.all(promises);
  }

  function $reset() {
    Object.assign(storeFields.values, rawSettingsData.value);
  }
});

function isStringNatGeo(s: string | undefined) {
  return s === BRAND_NATIONAL_GEOGRAPHIC;
}

function isStringTuiCollection(s: string | undefined) {
  return s === BRAND_TUI_COLLECTION;
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRawSettingsStore, import.meta.hot));
}
