import { DistributionContent } from "@/types/generated/ExperienceRawServiceApi";

export function shouldLoadOfferExperience(productType: DistributionContent["experience_source"]) {
  if (productType) {
    return productType === "NOVA";
  } else return true;
}
