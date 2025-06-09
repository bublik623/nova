import { useAsyncConfirmModal } from "@/features/core-shared/composables/useAsyncConfirmModal";
import { useExperienceOptionsStore } from "@/features/experience-calendar/store/useExperienceOptionsStore";
import { usePricingStore } from "@/features/experience-calendar/store/usePricingStore";
import { cloneDeep, isEqual } from "lodash";
import type { Option } from "@/types/generated/OfferServiceApi";

export function useOptionDangerousChanges() {
  const { $t } = useNuxtApp();

  const optionsStore = useExperienceOptionsStore();
  const pricingStore = usePricingStore();

  const option = optionsStore.state.option;
  const availabilities = optionsStore.state.availabilities;

  // If the pricing type has changed, we need to show a different modal
  // also because if the pricing type changes, the capacity type may change as well
  const hasPricingTypeChanges = ref<boolean>(false);
  const hasDangerousChanges = ref<boolean>(false);
  const hasAvailabilities = availabilities.length > 0;
  const hasPricings = pricingStore.pricings.length > 0;
  const hasAllowedLanguagesChanges = ref<boolean>(false);

  const initialValues = ref(cloneDeep(option));

  function checkCapacityTypeChange(newCapacity?: Option["capacity_type"]): boolean {
    return newCapacity !== initialValues.value?.capacity_type && hasAvailabilities;
  }

  function checkPricingTypeChange(newPricingType?: Option["pricing_type_allowed"]): boolean {
    return newPricingType !== initialValues.value?.pricing_type_allowed && (hasPricings || hasAvailabilities);
  }

  function checkAllowedLanguages(newAllowedLanguages?: Option["allowed_languages"]): boolean {
    // If the user selects "No" for languages(multilanguage) or there are no availabilities, no dangerous change
    if (initialValues.value?.multilanguage === false || availabilities.length === 0) {
      return false;
    }

    // Check if the allowed languages are different
    return !isEqual(initialValues.value?.allowed_languages, newAllowedLanguages);
  }

  function checkLanguageChange(multilanguage?: Option["multilanguage"]): boolean {
    const hasChanged = multilanguage !== initialValues.value?.multilanguage;
    const hasAvailabilities = availabilities.length > 0;

    return hasChanged && hasAvailabilities;
  }

  watch(
    [
      () => option?.capacity_type,
      () => option?.pricing_type_allowed,
      () => option?.allowed_languages,
      () => option?.multilanguage,
    ],
    ([newCapacity, newPricingType, newAllowedLanguages, newMultilanguage]) => {
      const capacityHasChanged = checkCapacityTypeChange(newCapacity);
      const pricingTypeHasChanged = checkPricingTypeChange(newPricingType);
      const languageHasChanged = checkLanguageChange(newMultilanguage);

      hasAllowedLanguagesChanges.value = checkAllowedLanguages(newAllowedLanguages);
      hasDangerousChanges.value = capacityHasChanged || pricingTypeHasChanged || languageHasChanged;
      hasPricingTypeChanges.value = pricingTypeHasChanged;
    },
    {
      deep: true,
    }
  );

  watch(
    pricingStore.pricings,
    () => {
      if (hasAvailabilities) {
        // we _could_ track diffs for every pricing...
        hasDangerousChanges.value = true;
      }
    },
    {
      deep: true,
    }
  );

  function resetDangerousChanges() {
    initialValues.value = cloneDeep(option);
    hasDangerousChanges.value = false;
    hasPricingTypeChanges.value = false;
    hasAllowedLanguagesChanges.value = false;
  }

  async function showAllowedLanguagesChangesWarning() {
    const { openModal } = useAsyncConfirmModal({
      title: $t("options.languages.modal.availability_impact_warning.title"),
      description: $t("options.languages.modal.availability_impact_warning.description"),
      ctaCancelText: $t("common.cancel"),
      ctaConfirmText: $t("common.confirm"),
    });

    return openModal();
  }

  async function handleDangerousChanges(text: { textMessage: string; confirmMessage: string }) {
    const pricingTypeChangesProps = {
      title: $t("experience.options.pricing_changes_modal.title"),
      ctaCancelText: $t("common.cancel"),
      ctaConfirmText: $t("common.delete"),
      description: $t("experience.options.pricing_changes_modal.description"),
    };

    const dangerousChangesProps = {
      title: $t("experience.options.dangerous_changes_modal.title"),
      ctaCancelText: $t("modal.experience.delete.cancel"),
      ctaConfirmText: text.confirmMessage,
      description: `
        ${$t("experience.options.dangerous_changes_modal.description")}<br/>
        ${text.textMessage}
      `,
    };

    const { openModal } = useAsyncConfirmModal(
      hasPricingTypeChanges.value ? pricingTypeChangesProps : dangerousChangesProps
    );

    const showConfirmation = async () => {
      const confirmed = await openModal();

      return confirmed;
    };

    return showConfirmation();
  }

  return {
    hasDangerousChanges,
    hasPricingTypeChanges,
    handleDangerousChanges,
    resetDangerousChanges,
    hasAllowedLanguagesChanges,
    showAllowedLanguagesChangesWarning,
  };
}
