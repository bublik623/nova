import { Snapshot } from "@/types/Snapshots";
import { DistributionContent, Image, RawSnapshot, Translation } from "@/types/generated/ExperienceRawServiceApi";
import { ExperienceRevision, MediaExperienceRevision } from "../types/revision";
import { Supplier } from "@/types/generated/ContractMasterDataApi";
import { ExperienceLocation } from "@/types/generated/MetadataExperiencesApi";
import { GenericHighlight } from "@/types/Highlights";
import { useMasterData } from "@/stores/master-data";
import { getSelectedAdditionalServices } from "@/utils/additional-services-utils";
import { ExperienceImage } from "@/features/experience-media/stores/useExperienceMediaStore";
import { AllowedRevisionFlow } from "../schema";
import { uuid } from "@/utils/uuid";

export function mapRawSnapshotValues(
  snapshot: RawSnapshot,
  distributionContent: DistributionContent
): ExperienceRevision {
  const masterdata = useMasterData();

  const codes = snapshot.raw?.functional?.additional_services || [];

  const productBrand = getSelectedAdditionalServices("PRODUCT_BRAND", codes, false);
  const promotionalOption = getSelectedAdditionalServices("PROMOTIONAL_OPTIONS", codes, false);
  const ownOffer = getSelectedAdditionalServices("OWN_OFFER", codes, false);
  const natGeoTourLevel = getSelectedAdditionalServices("NAT_GEO_TOUR_LEVELS", codes, false);
  const features = getSelectedAdditionalServices("FEATURES", codes, true);
  const duration = getSelectedAdditionalServices("DURATION", codes, true);

  const supplierName = getSupplier(masterdata.suppliers, distributionContent.supplier_id);

  const highlights = {
    premade:
      snapshot?.raw?.functional?.highlights?.map((code) => {
        return masterdata.getHighlightByCode("highlights", code);
      }) || [],
    custom: (snapshot.raw?.commercial.custom_highlights as GenericHighlight[]) || [],
  };

  const included = {
    premade:
      snapshot?.raw?.functional?.included?.map((code) => {
        return masterdata.getHighlightByCode("included", code);
      }) || [],
    custom: (snapshot.raw?.commercial.custom_included as GenericHighlight[]) || [],
  };

  const nonIncluded = {
    premade:
      snapshot?.raw?.functional?.non_included?.map((code) => {
        return masterdata.getHighlightByCode("included", code);
      }) || [],
    custom: (snapshot.raw?.commercial.custom_non_included as GenericHighlight[]) || [],
  };
  const importantInformation = {
    premade:
      snapshot?.raw?.functional?.important_information?.map((code) => {
        return masterdata.getHighlightByCode("importantInformation", code);
      }) || [],
    custom: (snapshot.raw?.commercial.custom_important_information as GenericHighlight[]) || [],
  };

  const result: ExperienceRevision = {
    productType: distributionContent.experience_source ?? "NOVA",
    statusCode: snapshot?.raw?.status_code,
    revisionDate: snapshot.snapshot_date,
    title: snapshot?.raw?.commercial.title,
    flowCode: "BASE",
    location: snapshot?.raw?.functional?.location as ExperienceLocation,
    description: snapshot?.raw?.commercial.description,
    additionalDescription: snapshot?.raw?.commercial.additional_description,
    collectionCriteria: {
      bestValueGuaranteed: snapshot?.raw?.collection_criteria?.best_value_guaranteed,
      createdWithCare: snapshot?.raw?.collection_criteria?.created_with_care,
      exceptionalExperiences: snapshot?.raw?.collection_criteria?.exceptional_experiences,
    },
    productBrand,
    promotionalOption,
    ownOffer,
    natGeoTourLevel,
    features,
    duration,
    highlights,
    included,
    nonIncluded,
    importantInformation,
    markets: snapshot?.raw?.functional?.markets,
    emergencyContact: snapshot?.raw?.functional?.booking_information?.emergency_contact_number,
    infoVoucher: snapshot?.raw?.commercial.info_voucher,
    voucherType: snapshot?.raw?.functional?.booking_information?.voucher_type,
    experienceCategory: snapshot?.raw?.functional?.categories,
    experienceInterest: snapshot?.raw?.functional?.interests,
    externalReferenceCode: snapshot?.raw?.functional?.external_reference_code,
    meetingPointDetails: snapshot?.raw?.commercial.meeting_point_details,
    refCode: distributionContent.reference_code,
    supplierName,

    seoDescription: undefined, // not present in the raw experience
    seoTitle: undefined, // not present in the raw experience
  };

  if (result.productType === "ASX") {
    result.asx_codes = snapshot.raw?.legacy_adapter_information?.asx_codes ?? [];
  }

  return result;
}

export function mapSnapshotValues(
  flow: AllowedRevisionFlow,
  language: string,
  snapshot: Snapshot,
  distributionContent: DistributionContent
): ExperienceRevision {
  const translation = snapshot?.experience_commercial_information?.translations?.find(
    (translation) => translation.language_code === language
  );

  if (!translation) {
    throw new Error(`Did not find translation for: ${flow}-${language}`);
  }

  const commonValues = commonSnapshotValues(translation, snapshot, distributionContent);

  switch (flow) {
    case "curation":
    case "translation":
      return {
        ...commonValues,
        statusCode: translation?.experience_translation?.status_code,
        flowCode: translation?.experience_translation?.flow_code,
      };

    default:
      throw new Error(`Could not map snapshot values for flow: ${flow}`);
  }
}

export function mapMediaSnapshotValues(snapshot: Snapshot): MediaExperienceRevision {
  return {
    productType: snapshot.experience_source,
    refCode: snapshot.reference_code,
    images: mapPayloadToForm(snapshot.experience_commercial_information?.experience_media?.images),
    revisionDate: snapshot.creation_date,
    statusCode: snapshot.experience_commercial_information?.experience_media?.status_code,
    flowCode: snapshot.experience_commercial_information?.experience_media?.flow_code,
  };
}

function mapPayloadToForm(images?: Image[]): ExperienceImage[] {
  return (
    images?.map((image) => ({
      id: uuid(),
      name: image.file_name as string,
      preview_url: image.preview_url || "",
      visualization_order: image.visualization_order || 0,
    })) ?? []
  );
}

function getSupplier(supplierList: Supplier[], supplierId: string | undefined): string | undefined {
  return supplierList?.find((el) => el.id === supplierId)?.name;
}

function commonSnapshotValues(
  translation: Translation,
  snapshot: Snapshot,
  distributionContent: DistributionContent
): ExperienceRevision {
  const masterdata = useMasterData();

  const codes = snapshot.experience_functional_information.additional_services.codes;

  const productBrand = getSelectedAdditionalServices("PRODUCT_BRAND", codes, false);
  const promotionalOption = getSelectedAdditionalServices("PROMOTIONAL_OPTIONS", codes, false);
  const ownOffer = getSelectedAdditionalServices("OWN_OFFER", codes, false);
  const natGeoTourLevel = getSelectedAdditionalServices("NAT_GEO_TOUR_LEVELS", codes, false);
  const features = getSelectedAdditionalServices("FEATURES", codes, true);
  const duration = getSelectedAdditionalServices("DURATION", codes, true);

  const highlights = {
    premade:
      snapshot?.experience_functional_information.highlights?.codes?.map((code) => {
        return masterdata.getHighlightByCode("highlights", code);
      }) || [],
    custom: (translation?.customs?.custom_highlights as GenericHighlight[]) || [],
  };
  const included = {
    premade:
      snapshot?.experience_functional_information.included?.codes?.map((code) => {
        return masterdata.getHighlightByCode("included", code);
      }) || [],
    custom: (translation?.customs?.custom_included as GenericHighlight[]) || [],
  };
  const nonIncluded = {
    premade:
      snapshot?.experience_functional_information.excluded?.codes?.map((code) => {
        return masterdata.getHighlightByCode("included", code);
      }) || [],
    custom: (translation?.customs?.custom_non_included as GenericHighlight[]) || [],
  };
  const importantInformation = {
    premade:
      snapshot?.experience_functional_information.important_information?.codes?.map((code) => {
        return masterdata.getHighlightByCode("importantInformation", code);
      }) || [],
    custom: (translation?.customs?.custom_important_information as GenericHighlight[]) || [],
  };

  const supplierName = getSupplier(masterdata.suppliers, distributionContent.supplier_id);

  const result: ExperienceRevision = {
    productType: distributionContent?.experience_source ?? "NOVA",
    refCode: distributionContent?.reference_code,
    revisionDate: snapshot.creation_date,
    title: translation?.experience_translation?.title,
    statusCode: translation?.experience_translation?.status_code,
    supplierName: supplierName ?? "",
    flowCode: translation?.experience_translation?.flow_code,
    externalReferenceCode: snapshot?.experience_functional_information?.external_reference_code,
    seoTitle: translation?.experience_translation?.seo_title,
    experienceCategory: snapshot?.experience_functional_information.categories.codes,
    experienceInterest: snapshot?.experience_functional_information.interests.codes,
    promotionalOption,
    productBrand,
    ownOffer,
    natGeoTourLevel,
    location: snapshot?.experience_functional_information.location as ExperienceLocation,
    meetingPointDetails: translation?.experience_translation?.meeting_point_details,
    description: translation?.experience_translation?.text1,
    seoDescription: translation?.experience_translation?.seo_description,
    additionalDescription: translation?.experience_translation?.text2,
    features,
    highlights,
    included,
    nonIncluded,
    importantInformation,
    duration,
    markets: snapshot?.experience_functional_information?.markets?.codes,
    emergencyContact:
      snapshot?.experience_functional_information.booking_information.information?.emergency_contact_number,
    infoVoucher: translation?.experience_translation?.info_voucher,
    voucherType: snapshot?.experience_functional_information.booking_information.information?.voucher_type,
    images: mapPayloadToForm(snapshot?.experience_commercial_information?.experience_media?.images || []),
  };

  if (result.productType === "ASX") {
    result.serviceAndModalitiesTitleTranslationList = translation.asx_service_code_translations?.map(
      (serviceCodeTranslation) => {
        const modalities =
          translation.option_translations
            ?.filter(
              (optionTranslation) => optionTranslation.asx_service_code_translation_id === serviceCodeTranslation.id
            )
            .map((optionTranslation) => ({
              modalityCode: optionTranslation.asx_modality_code!,
              title: optionTranslation.name!,
            })) ?? [];

        return {
          serviceCode: serviceCodeTranslation.code!,
          title: serviceCodeTranslation.name!,
          modalities,
        };
      }
    );
  }

  return result;
}
