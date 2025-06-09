import { commercialFields } from "@/features/experience-shared/constants/experience-fields-metadata";
import { RawStatusCode } from "@/types/DocumentStatuses";
import { RawElement, StatusCode } from "@/types/generated/ExperienceRawServiceApi";
import objectAssignDeep from "object-assign-deep";

/**
 * This function is used to get the initial values for the RawElement type.
 *
 * @param overrides - An optional parameter used to overwrite the default initial values.
 */
export function getExperienceRawInitialValues(
  overrides?: Partial<RawElement>
): Omit<RawElement, "experience_id" | "status_code" | "flow_code"> {
  const initialValues: RawElement = {
    functional: {
      additional_cities: [],
      venues: [],
      asterix_id: "",
      options: [],
      highlights: [],
      included: [],
      non_included: [],
      important_information: [],
      additional_services: [],
      categories: [],
      interests: [],
      external_reference_code: "",
      location: undefined,
      booking_information: {
        // @ts-ignore Ensure form diffing works correctly by adding empty values
        voucher_type: "",
        emergency_contact_number: {
          country_calling_code: "",
          number: "",
        },
      },
      markets: [],
    },
    commercial: {
      title: "",
      description: "",
      additional_description: "",
      info_voucher: "",
      meeting_point_details: "",
      custom_highlights: [],
      custom_included: [],
      custom_non_included: [],
      custom_important_information: [],
    },
    experience_id: "",
    flow_code: "BASE",
    status_code: RawStatusCode.IN_CREATION,
    collection_criteria: {
      best_value_guaranteed: "",
      created_with_care: "",
      exceptional_experiences: "",
    },
  };

  return objectAssignDeep(initialValues, overrides);
}

/**
 * This function checks if the field is a commercial field and the experience is in the 'being_curated' status.
 *
 * @param fieldName - The name of the field to check.
 * @param experienceStatusCode - The status_code of the experience.
 *
 * @returns True if the field is a commercial field and the experience is being curated, false otherwise.
 */
export function isDisabledDuringCuration(fieldName: string, experienceStatusCode?: StatusCode | RawStatusCode) {
  return commercialFields.includes(fieldName) && experienceStatusCode === RawStatusCode.BEING_CURATED;
}
