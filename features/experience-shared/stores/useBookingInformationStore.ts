import { FormField } from "@/types/Form";
import {
  BookingInformation,
  ContactNumber,
  ExperienceBookingInformation,
} from "@/types/generated/MetadataExperiencesApi";
import { BookingInformation as RawBookingInformation } from "@/types/generated/ExperienceRawServiceApi.js";
import { defineStore } from "pinia";
import { useMetadataExperienceApi } from "@/composables/useMetadataExperienceApi";
import { hasPermission } from "@/features/roles/lib/has-permission";

export type BookingInformationFields = {
  voucher_type: FormField<BookingInformation["voucher_type"] | undefined, boolean>;
  emergency_contact: FormField<ContactNumber, boolean>;
};

export type ExperienceBookingInformationData = Omit<ExperienceBookingInformation, "experience_id">;

const isSaving = ref(false);
const defaultVoucherType: BookingInformation["voucher_type"] = "MOBILE";

export const useBookingInformationStore = defineStore("useBookingInformationStore", () => {
  const { getBookingInfo, createBookingInfo, updateBookingInfo } = useMetadataExperienceApi();

  const relationId = ref<string>();

  const bookingInfoFields = ref<BookingInformationFields>({
    voucher_type: {
      value: undefined,
      required: true,
      category: "voucher",
    },
    emergency_contact: {
      value: { country_calling_code: "", number: "" },
      required: false,
      category: "voucher",
      validator: (val) => !!val?.country_calling_code && !!val?.number,
    },
  });

  const isFormValid = computed(() => {
    return !!bookingInfoFields.value.voucher_type.value;
  });

  function getBookingInfoPayload(): ExperienceBookingInformationData {
    const voucherType = bookingInfoFields.value.voucher_type.value;
    const emergency_contact = bookingInfoFields.value.emergency_contact.value;

    return {
      booking_information: {
        voucher_type: voucherType ?? defaultVoucherType,
        emergency_contact_number: emergency_contact,
      },
    };
  }

  function initFields(data: RawBookingInformation | undefined) {
    const emergencyContact = data?.emergency_contact_number;
    const voucherType = data?.voucher_type;
    bookingInfoFields.value.voucher_type.value = voucherType ?? defaultVoucherType;
    bookingInfoFields.value.emergency_contact.value.country_calling_code = emergencyContact?.country_calling_code ?? "";
    bookingInfoFields.value.emergency_contact.value.number = emergencyContact?.number ?? "";
  }

  /**
   * Get or Create bookingInfo
   */
  const loadBookingInfo = async (experience_id: string) => {
    const { data } = await getBookingInfo(experience_id);
    const bookingInfo = data[0] as ExperienceBookingInformation | undefined; // Forcing this to undefined as the array can be empty
    const canCreateBookingInfo = hasPermission("experience.curation.canWrite");

    if (!bookingInfo && canCreateBookingInfo) {
      // creating booking information entity with default voucher type value
      const bookingInfoPayload = {
        experience_id,
        booking_information: {
          voucher_type: defaultVoucherType,
        },
      };

      const { headers } = await createBookingInfo(bookingInfoPayload);
      bookingInfoFields.value.voucher_type.value = defaultVoucherType;

      if (!headers.location) {
        throw new Error(`No location in headers for booking info: ${JSON.stringify(bookingInfoPayload)}`);
      }
      relationId.value = headers.location.split("/")[2];
      return;
    }
    initFields(bookingInfo?.booking_information);
    relationId.value = bookingInfo?.id;
  };

  /**
   * Save bookingInfo
   */
  const saveBookingInfo = async (experience_id: string) => {
    isSaving.value = true;

    try {
      if (!bookingInfoFields.value.voucher_type.value) {
        return;
      }

      const payload: ExperienceBookingInformation = {
        experience_id,
        ...getBookingInfoPayload(),
      };

      if (!relationId.value) {
        throw new Error(`No booking information data loaded in the store`);
      }

      await updateBookingInfo(relationId.value as string, payload);
    } catch (err) {
      console.log(err);
    } finally {
      isSaving.value = false;
    }
  };

  function $reset() {
    relationId.value = undefined;
    initFields(undefined);
  }

  return {
    initFields,
    isFormValid,
    getBookingInfoPayload,
    bookingInfoFields,
    loadBookingInfo,
    saveBookingInfo,
    isSaving,
    $reset,
  };
});
