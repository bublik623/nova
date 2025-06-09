import { RawElement } from "@/types/generated/ExperienceRawServiceApi";
import { getSelectedAdditionalServices } from "@/utils/additional-services-utils";
import { setByPath } from "dot-path-value";
import { RawSettingValues } from "../types/experience";
import { mapAdditionalServices } from "./map-additional-services";

export function mapRawElementToRawSettingsValue(rawElement?: RawElement): Omit<RawSettingValues, "supplier_id"> {
  const addServicesCodes = rawElement?.functional?.additional_services || [];

  return {
    title: rawElement?.commercial.title || "",
    external_reference_code: rawElement?.functional?.external_reference_code,
    categories_interests: {
      categories: rawElement?.functional?.categories,
      interests: rawElement?.functional?.interests,
    },
    collection_criteria: {
      best_value_guaranteed: rawElement?.collection_criteria?.best_value_guaranteed,
      created_with_care: rawElement?.collection_criteria?.created_with_care,
      exceptional_experiences: rawElement?.collection_criteria?.exceptional_experiences,
    },
    product_brand: getSelectedAdditionalServices("PRODUCT_BRAND", addServicesCodes, false),
    own_offer: getSelectedAdditionalServices("OWN_OFFER", addServicesCodes, false),
    nat_geo_tour_levels: getSelectedAdditionalServices("NAT_GEO_TOUR_LEVELS", addServicesCodes, false),
    promotional_options: getSelectedAdditionalServices("PROMOTIONAL_OPTIONS", addServicesCodes, false),
  };
}

export function mapRawSettingsValueToRawElement(
  rawSettings: Partial<RawSettingValues>,
  initialValues: {
    additional_services: string[];
  }
): Partial<RawElement> {
  // We use setByPath to avoid creating nested objects if the value is empty
  const update: Partial<RawElement> = {};

  const additionalServices = [
    rawSettings.product_brand || [],
    rawSettings.own_offer || [],
    rawSettings.nat_geo_tour_levels || [],
    rawSettings.promotional_options || [],
  ].flatMap((v) => v);

  if (rawSettings.title) {
    setByPath(update, "commercial.title", rawSettings.title);
  }

  if (rawSettings.external_reference_code) {
    setByPath(update, "functional.external_reference_code", rawSettings.external_reference_code);
  }

  if (rawSettings.categories_interests) {
    setByPath(update, "functional.categories", rawSettings.categories_interests.categories);
    setByPath(update, "functional.interests", rawSettings.categories_interests.interests);
  }

  if (additionalServices.length > 0) {
    const mappedAdditionalServices = mapAdditionalServices(initialValues.additional_services, additionalServices);

    setByPath(update, "functional.additional_services", mappedAdditionalServices);
  }

  if (rawSettings.collection_criteria) {
    setByPath(
      update,
      "collection_criteria.best_value_guaranteed",
      rawSettings.collection_criteria.best_value_guaranteed
    );

    setByPath(update, "collection_criteria.created_with_care", rawSettings.collection_criteria.created_with_care);

    setByPath(
      update,
      "collection_criteria.exceptional_experiences",
      rawSettings.collection_criteria.exceptional_experiences
    );
  }

  return update;
}
