import { defineStore, acceptHMRUpdate } from "pinia";
import { useGetExperiencePaxesQuery, useUpdateExperiencePaxesMutation } from "../api/useExperiencePaxesQuery";
import type { Pax } from "@/types/generated/OfferServiceApi";
import { useRoute } from "vue-router";
import { FormField } from "@/types/Form";
import { paxListSchema, mapZodErrorsToPaxTypes } from "@/features/experience-shared/schemas/experience-paxes-schema";
import type { PaxErrorMap } from "@/features/experience-shared/schemas/experience-paxes-schema";

export interface PaxesFields {
  paxes: FormField<Pax[], true>;
}

/**
 * Store for managing experience pax types
 * Handles loading, tracking changes, and saving pax types
 */
export const usePaxesStore = defineStore("usePaxesStore", () => {
  const route = useRoute();
  const experienceId = computed(() => route.params.id as string);

  // API queries and mutations
  const { data: dataExperiencePaxes, isLoading } = useGetExperiencePaxesQuery(experienceId);
  const { mutateAsync: updateExperiencePaxes, isPending: isSaving } = useUpdateExperiencePaxesMutation(experienceId);

  // State
  const enabled = true; // TODO: this shouldn't be here but we need to have it bec of @useRawExperienceStore
  const fields = reactive<PaxesFields>({
    paxes: { value: [], required: true, validator: (value) => value.length > 0 },
  });
  const hasChanges = ref(false);
  const errors = ref<PaxErrorMap>();

  const hasErrors = computed(() => Object.keys(errors.value ?? {}).length > 0);
  const canSave = computed(() => !hasErrors.value && fields.paxes.value.length > 0);

  // Initialize the pax types when the remote data is loaded
  watch(dataExperiencePaxes, init);

  function init(paxes: Pax[] | undefined) {
    fields.paxes.value = paxes ?? [];
    errors.value = undefined;
    hasChanges.value = false;
  }

  function validatePaxes(paxes: Pax[]) {
    const result = paxListSchema.safeParse(paxes);
    if (result.success) {
      errors.value = undefined;
    } else {
      errors.value = mapZodErrorsToPaxTypes(result.error.format(), paxes);
    }
  }

  function setPaxes(paxes: Pax[]) {
    validatePaxes(paxes);
    fields.paxes.value = paxes;
  }

  function setHasChanges(value: boolean) {
    hasChanges.value = value;
  }

  async function save() {
    if (!hasChanges.value || hasErrors.value) {
      return;
    }

    try {
      await updateExperiencePaxes(fields.paxes.value);
      hasChanges.value = false;
    } catch (error) {
      console.error(error);
    }
  }

  // Reset local changes and match the remote data
  function $reset() {
    if (dataExperiencePaxes.value) {
      fields.paxes.value = dataExperiencePaxes.value;
    } else {
      fields.paxes.value = [];
    }
    hasChanges.value = false;
    errors.value = undefined;
  }

  return {
    fields,
    isLoading,
    isSaving,
    canSave,
    hasChanges,
    errors,
    hasErrors,
    setPaxes,
    setHasChanges,
    save,
    $reset,
    enabled,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePaxesStore, import.meta.hot));
}
