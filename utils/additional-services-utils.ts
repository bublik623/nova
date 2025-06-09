import { useMasterData } from "@/stores/master-data";
import { FunctionalGroupCode } from "@/types/DocumentTypes";
import { FormField } from "@/types/Form";

export type ExperienceFunctionalGroupFields = {
  additional_services: FormField<string[], true>;
  product_brand: FormField<string, false>;
  nat_geo_tour_levels: FormField<string, boolean>;
  own_offer: FormField<string, true>;
  promotional_options: FormField<string, false>;
  features: FormField<string[], false>;
};

/**
 * Maps fields values to an array
 */
export function mapCodesToAdditionalServices(fields: ExperienceFunctionalGroupFields): string[] {
  let codes = [];
  codes.push(fields.product_brand.value);
  codes.push(fields.own_offer.value);
  codes.push(fields.promotional_options.value);
  codes.push(fields.nat_geo_tour_levels.value);
  codes = codes.concat(fields.features.value);
  codes = codes.concat(fields.additional_services.value);
  codes = codes.filter((feature) => feature !== ""); // filter empty strings
  return codes;
}

/**
 * Returns selected additional service code(s) for a given additional service group
 * uses masterdata.additionalServices to find the group
 *
 * @param code - name of additional service group
 * @param additionalServiceCodes - existing additional service codes usually coming from backend functional.additional_services
 * @param multi - return one or multiple additional codes (depends on type of the group)
 *
 * @example
 * const additionalServices = ["2_4_HOURS", "ANOTHER_CODE", "BRAND_SCENE"]
 * - multi:
 * getSelectedAdditionalServices("DURATION", additionalServices, true) //=> ["2_4_HOURS", "ANOTHER_CODE"]
 * - single:
 * getSelectedAdditionalServices("PRODUCT_BRAND", additionalServices, false) //=> "BRAND_SCENE"
 */
export function getSelectedAdditionalServices<M extends boolean>(
  code: FunctionalGroupCode,
  additionalServiceCodes: string[],
  multi: M
): M extends true ? string[] : string {
  const masterData = useMasterData();
  const options = masterData.getAdditionalServicesByFGCode(code);
  const selectedOptions = options
    .filter((option) => additionalServiceCodes.includes(option.code))
    .map((option) => option.code);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  if (multi) {
    return selectedOptions as any;
  } else if (selectedOptions[0]) {
    return selectedOptions[0] as any;
  } else {
    return "" as any;
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
