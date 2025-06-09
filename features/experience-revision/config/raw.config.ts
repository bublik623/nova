import { mapSidebarSections } from "@/features/experience-shared/utils/map-sidebar-sections";
import { SidebarSections, SidebarCategory } from "@/types/DocumentSidebar";
import { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { ExperienceRevision, RevisionOptions } from "../types/revision";
import { RevisionFormProps } from "../types/forms";
import RevisionLocationForm from "@/features/experience-revision/components/RevisionLocationForm.vue";
import RevisionSettingsForm from "@/features/experience-revision/components/RevisionSettingsForm.vue";
import RevisionContentSegmentationForm from "@/features/experience-revision/components/RevisionContentSegmentationForm.vue";
import RevisionCustomerInfoForm from "@/features/experience-revision/components/RevisionCustomerInfoForm.vue";
import { validateAsterixAdapterInformation } from "@/stores/experience-raw";
import RevisionRawAsterixIntegrationForm from "../asterix-integration/raw/RevisionRawAsterixIntegrationForm.vue";

export function getRawForms(
  values: ExperienceRevision | null,
  options: RevisionOptions,
  requiredFields: string[]
): {
  settings: {
    is: typeof RevisionSettingsForm;
    props: RevisionFormProps;
  };
  location: {
    is: typeof RevisionLocationForm;
    props: RevisionFormProps;
  };
  "content-segmentation": {
    is: typeof RevisionContentSegmentationForm;
    props: RevisionFormProps;
  };
  "customer-info": {
    is: typeof RevisionCustomerInfoForm;
    props: RevisionFormProps;
  };
  "asterix-integration": {
    is: typeof RevisionRawAsterixIntegrationForm;
    props: RevisionFormProps;
  };
} {
  const rawFormProps: RevisionFormProps = {
    values,
    options,
    requiredFields,
    flow: "raw",
  } as const;

  return {
    settings: {
      is: RevisionSettingsForm,
      props: rawFormProps,
    },
    location: {
      is: RevisionLocationForm,
      props: rawFormProps,
    },
    "content-segmentation": {
      is: RevisionContentSegmentationForm,
      props: rawFormProps,
    },
    "customer-info": {
      is: RevisionCustomerInfoForm,
      props: rawFormProps,
    },
    "asterix-integration": {
      is: RevisionRawAsterixIntegrationForm,
      props: rawFormProps,
    },
  };
}

export function getRawSections(baseUrl: string, values: ExperienceRevision, options: RevisionOptions) {
  const sections: SidebarSections = {
    settings: getSettingsSection(baseUrl, values),
    location: getLocationSection(baseUrl, values),
    "content-segmentation": getContentSegmentationSection(baseUrl, values, options),
    "customer-info": getCustomerInfoSection(baseUrl, values),
    asterix_integration: getAsterixIntegrationSection(baseUrl, values),
  };

  return mapSidebarSections(sections);
}

function getSettingsSection(baseUrl: string, values?: ExperienceRevision): SidebarCategory {
  return {
    url: `${baseUrl}/settings`,
    icon: "settings" as Icon,
    fields: [
      {
        id: "title",
        required: true,
        filled: !!values?.title,
      },
      {
        id: "supplier_name",
        required: true,
        filled: !!values?.supplierName,
      },
      {
        id: "external_reference_code",
        required: false,
        filled: !!values?.externalReferenceCode,
      },
      {
        id: "categories",
        required: false,
        filled: !!((values?.experienceCategory?.length ?? 0) > 0 && (values?.experienceInterest?.length ?? 0) > 0),
      },

      {
        id: "promotional_options",
        required: false,
        filled: !!values?.promotionalOption,
      },
      {
        id: "product_brand",
        required: false,
        filled: !!values?.productBrand,
      },
      {
        id: "own_offer",
        required: false,
        filled: !!values?.ownOffer,
      },
    ],
  };
}

function getLocationSection(baseUrl: string, values?: ExperienceRevision): SidebarCategory {
  return {
    url: `${baseUrl}/location`,
    icon: "location" as Icon,
    fields: [
      {
        id: "location.city",
        required: true,
        filled: !!values?.location?.address.city,
      },
      {
        id: "location.address",
        required: false,
        filled: !!values?.location?.address.direction,
      },
      {
        id: "location.meeting-point",
        required: false,
        filled: !!values?.meetingPointDetails,
      },
    ],
  };
}

function getContentSegmentationSection(
  baseUrl: string,
  values?: ExperienceRevision,
  options?: RevisionOptions
): SidebarCategory {
  return {
    url: `${baseUrl}/content-segmentation`,
    icon: "content-generation" as Icon,
    fields: [
      {
        id: "description",
        required: true,
        filled: !!values?.description,
      },
      {
        id: "additional_description",
        required: false,
        filled: !!values?.additionalDescription,
        hide: options?.showAdditionalDescription,
      },
      {
        id: "features",
        required: false,
        filled: !!values?.features?.length,
      },
      {
        id: "highlights",
        required: true,
        filled: !!values?.highlights?.custom || !!values?.highlights?.premade,
      },
      {
        id: "included",
        required: true,
        filled: !!values?.included?.custom || !!values?.included?.premade,
      },
      {
        id: "non_included",
        required: false,
        filled: !!values?.nonIncluded?.custom || !!values?.nonIncluded?.premade,
      },
      {
        id: "important_information",
        required: false,
        filled: !!values?.importantInformation?.custom || !!values?.importantInformation?.premade,
      },
      {
        id: "duration",
        required: true,
        filled: !!values?.duration,
      },
    ],
  };
}

function getCustomerInfoSection(baseUrl: string, values?: ExperienceRevision): SidebarCategory {
  return {
    url: `${baseUrl}/customer-info`,
    icon: "customer-info",
    fields: [
      {
        id: "emergency_contact",
        required: false,
        filled: !!values?.emergencyContact?.number,
      },
      {
        id: "voucher_type",
        required: true,
        filled: !!values?.voucherType,
      },
      {
        id: "info_voucher",
        required: false,
        filled: !!values?.infoVoucher,
      },
    ],
  };
}

function getAsterixIntegrationSection(baseUrl: string, values?: ExperienceRevision): SidebarCategory {
  const asterixRevision = values?.productType === "ASX" ? values : undefined;
  return {
    url: `${baseUrl}/asterix-integration`,
    icon: "asterix-integration",
    hide: !asterixRevision,
    fields: [
      {
        id: "asterix-service-and-modalities-codes",
        required: true,
        filled: validateAsterixAdapterInformation(asterixRevision?.asx_codes ?? []),
      },
    ],
  };
}
