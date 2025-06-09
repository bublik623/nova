import { z } from "zod";
import { StoreField, useStoreFields } from "../composables/useStoreFields";
import { useDistributionContentMutation } from "@/features/experience-raw/queries/distribution-content-mutation";
import { defineStore, acceptHMRUpdate } from "pinia";
import { updateSupplierIdForPickups } from "@/features/experience-shared/utils/update-supplier-id";
import { useCurrentDistributionContentQuery } from "../composables/useCurrentDistributionContentQuery";

export const supplierIdField: StoreField = {
  key: "supplier_id",
  isRequired: true,
  schema: z.string().min(1),
};

export const curationLevelField: StoreField = {
  key: "curation_level",
  isRequired: false,
  schema: z.string().min(1),
};

export const priorityField: StoreField = {
  key: "priority",
  isRequired: false,
  schema: z.number().int().min(0),
};

export const useDistributionContentStore = defineStore("useDistributionContentStore", () => {
  const distributionContentQuery = useCurrentDistributionContentQuery();
  const distributionContentMutation = useDistributionContentMutation();

  const experienceId = computed(() => distributionContentQuery.data.value?.id);
  const productType = computed(() => distributionContentQuery.data.value?.experience_source);

  const isSaving = computed(() => distributionContentMutation.isPending.value);
  const canSave = computed(() => !isSaving.value && formFields.isValid.value && formFields.hasChanges.value);

  const formFields = useStoreFields(() => [supplierIdField, curationLevelField, priorityField], {
    initialValues: distributionContentQuery.data,
  });
  return {
    productType,
    save,
    isSaving,
    canSave,
    enabled: true,
    ...formFields,
    $reset,
  };

  async function save() {
    if (!formFields.hasChanges.value) {
      return;
    }

    if (!experienceId.value) {
      throw new Error("experienceId is required");
    }

    const promises: Promise<unknown>[] = [
      distributionContentMutation.mutateAsync({
        id: experienceId.value,
        ...formFields.updatedValues.value,
      }),
    ];

    if (productType.value !== "ASX" && formFields.values.supplier_id) {
      promises.push(updateSupplierIdForPickups(experienceId.value, formFields.values.supplier_id));
    }

    await Promise.all(promises);
  }

  function $reset() {
    Object.assign(formFields.values, distributionContentQuery.data.value);
  }
});

// HMR
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDistributionContentStore, import.meta.hot));
}
