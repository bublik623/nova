import type { Pax as MasterDataPax } from "@/types/generated/ExperienceMasterDataApi";
import type { Pax as ExperiencePax } from "@/types/generated/OfferServiceApi";

export const mapMasterdataPaxToExperiencePax = (masterDataPax: MasterDataPax): ExperiencePax => ({
  pax_type: masterDataPax.type,
  pax_code: masterDataPax.name,
  all_ages: masterDataPax.all_ages ?? false,
  age_from: masterDataPax.age_from,
  age_to: masterDataPax.age_to,
  free_of_charge: masterDataPax.free_of_charge ?? false,
});
