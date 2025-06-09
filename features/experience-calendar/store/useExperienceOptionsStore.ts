import { defineStore } from "pinia";
import { isEqual, cloneDeep } from "lodash";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { Option, Experience } from "@/types/generated/OfferServiceApi";
import {
  mapAvailabilitiesToAvailabilityCards,
  mapAvailability,
  validateFields,
} from "../lib/experience-option-availability";
import { AvailabilityCard, AvailabilityType } from "@/features/experience-calendar/types/Availability";
import { usePricingStore } from "@/features/experience-calendar/store/usePricingStore";
import { useCustomerDetailsStore } from "./useCustomerDetailsStore";
import { usePickupsStore } from "./usePickupsStore";

export type ExperienceOptionsState = {
  loading: boolean;
  availabilities: AvailabilityCard<AvailabilityType>[];
  option: Option | null;
};

export const useExperienceOptionsStore = defineStore("experience-options", () => {
  const pricingStore = usePricingStore();
  const customerDetailsStore = useCustomerDetailsStore();
  const pickupsStore = usePickupsStore();
  const offerService = useOfferServiceApi();

  const state = reactive<ExperienceOptionsState>({
    loading: true,
    option: null,
    availabilities: [],
  });

  const initialAvailabilities = ref<AvailabilityCard<AvailabilityType>[]>([]);
  const isLoading = computed(() => state.loading);

  /**
   * @description check if the current optionId availabilities are valid
   */
  const availabilitiesAreValid = computed<boolean>(() => {
    return state.availabilities.length > 0 && !!state.availabilities.every((a) => a.isValid);
  });

  /**
   * Updates the initial availability data after create and update operations
   * so we can diff the data and avoid unnecessary API calls
   */
  function updateInitialAvailabilities(availability: AvailabilityType, existingCardId: string) {
    const index = initialAvailabilities.value.findIndex((a) => a.value?.id === availability?.id);
    const mappedAvailability = mapAvailability(availability, { cardId: existingCardId });
    if (index !== -1) {
      initialAvailabilities.value[index] = mappedAvailability;
    } else {
      initialAvailabilities.value.push(mappedAvailability);
    }
  }

  function isAvailabilityUpdated(availability: AvailabilityCard<AvailabilityType>) {
    if (!initialAvailabilities.value.length) {
      return true;
    }
    const initialAvailability = initialAvailabilities.value.find((a) => a.value?.id === availability.value?.id);
    return !isEqual(initialAvailability?.value, availability.value);
  }

  // Actions

  /**
   * Loads all option data into the Pinia store
   * @param experienceId
   * @param optionId
   * @param type
   * @example
   * const optionStore = useExperienceOptionsStore()
   * await optionStore.loadOptionData("exp-id", "opt-id", ExperienceType.CALENDAR_TIMESLOTS)
   */
  async function loadOptionData(experienceId: string, optionId: string, type: ExperienceType) {
    state.loading = true;

    try {
      const [{ data: option }, { data: availabilities }] = await Promise.all([
        offerService.getOption(optionId),
        offerService.getAvailabilities(optionId, type),
        pricingStore.loadData(experienceId, optionId),
        customerDetailsStore.loadData(experienceId, optionId),
        pickupsStore.loadData(optionId),
      ]);

      state.option = { ...option };
      state.availabilities = mapAvailabilitiesToAvailabilityCards(availabilities);
      initialAvailabilities.value = cloneDeep(state.availabilities);
    } finally {
      state.loading = false;
    }
  }

  /**
   * Updates an option by calling the offer-service API
   * @param optionId
   * @example
   * await updateOption("opt-id")
   */
  async function updateOption(optionId: string, publish = false) {
    if (state.option == null) {
      throw new Error("A valid option must be loaded.");
    }

    if (state.option.multilanguage === false) {
      state.option.allowed_languages = [];
    }

    await offerService.putOption(optionId, {
      ...state.option,
      status: publish ? "PUBLISHED" : "DRAFT",
    });
  }

  /**
   * Deletes an availability and updates the state
   * @param availabilityId
   * @param optionId
   * @param experienceType
   */
  async function deleteAvailability(
    cardIndex: number,
    optionId: string,
    experienceType: ExperienceType,
    availabilityId?: string
  ) {
    if (availabilityId) {
      await offerService.deleteAvailability(availabilityId, experienceType);
    }

    const removed = state.availabilities.splice(cardIndex, 1);
    initialAvailabilities.value = initialAvailabilities.value.filter((a) => a.cardId !== removed[0].cardId);
  }

  /**
   * Save all availabilities for a specific option
   * @param optionId
   * @param experienceType
   */
  async function saveAvailabilities(experienceType: ExperienceType) {
    if (!state.availabilities) {
      return;
    }

    const updatedAvailabilities = state.availabilities.filter(isAvailabilityUpdated);
    for (const availability of updatedAvailabilities) {
      await saveAvailability(availability, experienceType);
      updateInitialAvailabilities(availability.value, availability.cardId);
    }
  }

  /**
   * Save a single availability for a specific option
   * @param availabilityCard
   * @param experienceType
   */
  async function saveAvailability<T extends AvailabilityType>(
    availabilityCard: AvailabilityCard<T>,
    experienceType: ExperienceType
  ) {
    const isValid = validateFields(availabilityCard.value);

    if (!isValid) {
      return;
    }

    if (availabilityCard.value.id) {
      await offerService.updateAvailability(availabilityCard.value, experienceType);
    } else {
      const { data } = await offerService.createAvailability(availabilityCard.value, experienceType);
      availabilityCard.value.id = data.id;
    }
  }

  // Publishing option

  /**
   * @description check if the current option can be published.
   * For now we only check the presence of availabilities,
   * but in the future we may have multiple conditions (pricing, pickup, etc)
   */
  const canPublish = computed<boolean>(() => {
    return availabilitiesAreValid.value && customerDetailsStore.isSaved && pickupsStore.isFormValid;
  });

  /**
   *
   * @description publishes an option by updating the current
   * option and the related experience
   */
  async function publishOption(optionId: string, offerDocument: Experience) {
    await updateOption(optionId, true);

    await offerService.publishExperience(offerDocument.uuid);
  }

  return {
    // State
    state,
    isLoading,
    canPublish,
    loadOptionData,
    updateOption,
    publishOption,
    availabilitiesAreValid,
    deleteAvailability,
    saveAvailabilities,
  };
});
