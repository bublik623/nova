import { AdditionalServices } from "@/types/generated/ExperienceRawServiceApi";

// Strings with which the codes start (e.g. "BRAND_TUI_COLLECTION", "PROMOTIONAL_LIKELY_TO_SELL_OUT", etc.)
export const additionalServicesCodes = [
  "BRAND",
  "PROMOTIONAL",
  "NAT_GEO_TOUR_LEVEL",
  "OWN_OFFER",
  "DURATION",
  "FEATURE",
] as const;

/**
 * Filters the additional services based on the provided service code.
 *
 * @param code - The service code to filter the additional services.
 * @param values - The list of additional services to filter.
 * @returns A list of additional services that start with the provided service code.
 */
function getValueForAdditionalServiceCode(code: string, values: AdditionalServices): AdditionalServices {
  return values.filter((value) => value.startsWith(code));
}

/**
 * This function merges the initial values with the updated values for additional services.
 * If a value is present in the initial values, it is assumed to be validated and kept,
 * with the updated values added on top. We avoid using the masterdata to simplify the logic.
 * We assume that if a value is present in the initialValues, it's valid. We can add more strings to the codes array if needed.
 *
 * @param {AdditionalServices} initialValues - The initial values of the additional services.
 * @param {AdditionalServices} updatedValues - The updated values of the additional services.
 * @returns {AdditionalServices} - The merged additional services.
 */
export function mapAdditionalServices(
  initialValues: AdditionalServices,
  updatedValues: AdditionalServices
): AdditionalServices {
  return additionalServicesCodes.flatMap((code) => {
    const initialValuesForCode = getValueForAdditionalServiceCode(code, initialValues);
    const updatedValuesForCode = getValueForAdditionalServiceCode(code, updatedValues);

    // For each code, check if we have an update
    if (updatedValuesForCode.length > 0) {
      return updatedValuesForCode;
    }

    // If we don't have an update, check if we have an initial value
    if (initialValuesForCode.length > 0) {
      return initialValuesForCode;
    }

    // If we don't have an update or an initial value, return an empty array
    return [];
  });
}
