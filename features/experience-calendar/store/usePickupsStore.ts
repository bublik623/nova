import { FormField } from "@/types/Form";
import { defineStore } from "pinia";
import { usePickupExperienceApi } from "../api/usePickupExperienceApi";
import { usePickupPlaceApi } from "../api/usePickupPlaceApi";
import { PickupPlaceWithId } from "../types/Pickups";
import { ContactNumber, Pickup } from "@/types/generated/PickupExperienceServiceApi";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { formatPrefix } from "@/utils/format-prefix";
import { BookingQuestion } from "@/types/generated/ExperienceMasterDataApi";

export type PickupsFormFields = {
  selectedPickups: FormField<PickupPlaceWithId[]>;
  contactPhoneNumber: FormField<ContactNumber>;
  contactEmail: FormField<string>;
};

const getEmptyPickup = (): Pickup => {
  return { option_id: "", pickup_place_ids: [], supplier_id: "" };
};
const getEmptyPhoneNumber = (): ContactNumber => {
  return { country_iso_code: "", phone_number: "", phone_prefix: "" };
};

export const usePickupsStore = defineStore("usePickupsStore", () => {
  const pickupExperienceService = usePickupExperienceApi();
  const pickupPlaceService = usePickupPlaceApi();
  const authStore = useAuthStore();

  const isLoading = ref(false);
  const isSaving = ref(false);
  const hasPickupService = ref(false);
  const bookingQuestions = ref<BookingQuestion[]>([]);
  // existing data in db
  const pickupPlacesData = ref<PickupPlaceWithId[]>([]);
  const optionPickupData = ref<Pickup>(getEmptyPickup());
  const hadPickupServiceOnLoad = ref(false);

  const fields = ref<PickupsFormFields>({
    selectedPickups: {
      value: [],
      required: true,
      category: "experience_pickups",
    },
    contactPhoneNumber: {
      value: getEmptyPhoneNumber(),
      required: true,
      category: "experience_pickups",
    },
    contactEmail: {
      value: "",
      required: false,
      category: "experience_pickups",
    },
  });

  const isFormValid = computed(() => {
    if (!hasPickupService.value && !hadPickupServiceOnLoad.value) {
      return true;
    }

    if (!hasPickupService.value && !optionPickupData.value?.id) {
      return false;
    }
    if (!fields.value.selectedPickups.value.length) {
      return false;
    }
    return true;
  });

  const initFields = () => {
    if (optionPickupData.value?.id) {
      hasPickupService.value = true;
      fields.value.selectedPickups.value = pickupPlacesData.value.filter((pickupPlace) =>
        optionPickupData.value.pickup_place_ids.includes(pickupPlace.id)
      );
      if (optionPickupData.value.contact_form?.contact_number) {
        fields.value.contactPhoneNumber.value = optionPickupData.value.contact_form?.contact_number;
      }

      if (optionPickupData.value.contact_form?.contact_email) {
        fields.value.contactEmail.value = optionPickupData.value.contact_form?.contact_email;
      }
    } else {
      $reset();
    }
  };

  const getSelectedPickupIds = () => fields.value.selectedPickups.value.map((selectedPickup) => selectedPickup.id);

  const loadPickupPlaces = async () => {
    try {
      const { data: pickupPlaces } = await pickupPlaceService.getPickupPlaces();
      pickupPlacesData.value = pickupPlaces;
    } catch (error) {
      console.error("Failed to load pickup places:", error);
    }
  };

  const loadData = async (optionId: string) => {
    isLoading.value = true;

    const [{ data: optionPickup }, { data: pickupPlaces }] = await Promise.all([
      pickupExperienceService.getPickupsByOptionId(optionId),
      pickupPlaceService.getPickupPlaces(),
    ]);

    optionPickupData.value = optionPickup;
    pickupPlacesData.value = pickupPlaces;

    if (optionPickupData.value?.id) {
      hadPickupServiceOnLoad.value = true;
    }

    isLoading.value = false;

    initFields();
  };

  /**
   * Create or update form data
   */
  const saveForm = async (optionId: string) => {
    isSaving.value = true;

    const pickupPlaceIds = getSelectedPickupIds();

    const payload: Pickup = {
      option_id: optionId,
      supplier_id: authStore.userUuid!,
      pickup_place_ids: pickupPlaceIds,
      ...(fields.value.contactPhoneNumber.value.phone_number && {
        contact_form: {
          contact_email: fields.value.contactEmail.value,
          contact_number: {
            ...fields.value.contactPhoneNumber.value,
            phone_prefix: formatPrefix(fields.value.contactPhoneNumber.value.phone_prefix),
          },
        },
      }),
    };

    await handler();

    isSaving.value = false;

    async function handler() {
      // if there is a pickup and the user has changed the first field(hasPickupService) to false, remove the pickup
      if (!hadPickupServiceOnLoad.value && !hasPickupService.value) {
        // No changes, return early
        return Promise.resolve();
      } else if (!hasPickupService.value && optionPickupData.value?.id) {
        await pickupExperienceService.deletePickup(optionPickupData.value.id);
      } else {
        if (optionPickupData.value?.id) {
          await pickupExperienceService.updatePickup(optionPickupData.value.id, payload);
        } else {
          const { data } = await pickupExperienceService.createPickup(payload);
          optionPickupData.value = { ...payload, id: data };
        }
      }
    }
  };

  function $reset() {
    fields.value.selectedPickups.value = [];
    fields.value.contactEmail.value = "";
    fields.value.contactPhoneNumber.value = getEmptyPhoneNumber();
    hasPickupService.value = false;
    hadPickupServiceOnLoad.value = false;
  }

  return {
    isLoading,
    isSaving,
    isFormValid,
    hasPickupService,
    fields,
    bookingQuestions,
    loadPickupPlaces,
    loadData,
    saveForm,
    pickupPlacesData,
    $reset,
  };
});
