import { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { ExperienceRevision } from "../types/revision";
import { MappedCategory, SidebarCategory, SidebarSections } from "@/types/DocumentSidebar";
import { mapSidebarSections } from "@/features/experience-shared/utils/map-sidebar-sections";
import TranslationSettingsForm, {
  TranslationSettingsFormValues,
} from "@/features/experience-translation/forms/TranslationSettingsForm.vue";
import { TranslationFormProps } from "@/features/experience-translation/types";
import { AvailableLanguage } from "@/types/Language";
import TranslationLocationForm, {
  TranslationLocationFormValues,
} from "@/features/experience-translation/forms/TranslationLocationForm.vue";
import TranslationContentGenerationForm, {
  TranslationContentGenerationValues,
} from "@/features/experience-translation/forms/TranslationContentGenerationForm.vue";
import TranslationCustomerInformationForm, {
  TranslationCustomerInformationFormValues,
} from "@/features/experience-translation/forms/TranslationCustomerInformationForm.vue";
import { translationHighlightArraySchema } from "@/features/experience-translation/schemas";
import RevisionTranslationAsterixIntegrationForm from "@/features/experience-revision/asterix-integration/translation/RevisionTranslationAsterixIntegrationForm.vue";
import { serviceAndModalitiesTitleTranslationList } from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/composables/useAsterixServiceAndModalitiesTitleTranslationsListField";

// We do not need to pass the flow here because the forms are already "translation" forms,
// as we reuse the forms for the translation flow. Nice!
export function getTranslationForms(
  lang: string,
  values: ExperienceRevision | null,
  curationValues: ExperienceRevision | null
): {
  settings: {
    is: typeof TranslationSettingsForm;
    props: TranslationFormProps<TranslationSettingsFormValues>;
  };
  location: {
    is: typeof TranslationLocationForm;
    props: TranslationFormProps<TranslationLocationFormValues>;
  };
  "content-segmentation": {
    is: typeof TranslationContentGenerationForm;
    props: TranslationFormProps<TranslationContentGenerationValues>;
  };
  "customer-info": {
    is: typeof TranslationCustomerInformationForm;
    props: TranslationFormProps<TranslationCustomerInformationFormValues>;
  };
  "asterix-integration": {
    is: typeof RevisionTranslationAsterixIntegrationForm;
    props: TranslationFormProps<ExperienceRevision>;
  };
} {
  const language = lang as AvailableLanguage;

  return {
    settings: {
      is: TranslationSettingsForm,
      props: {
        curationValues: {
          title: curationValues?.title,
          seo_title: curationValues?.seoTitle,
        },
        readonly: true,
        initialValues: {
          title: values?.title,
          seo_title: values?.seoTitle,
        },
        language: language,
      },
    },
    location: {
      is: TranslationLocationForm,
      props: {
        curationValues: {
          meeting_point_details: curationValues?.meetingPointDetails,
        },
        hasDiff: false,
        readonly: true,
        initialValues: {
          meeting_point_details: values?.meetingPointDetails,
        },
        language,
      },
    },
    "content-segmentation": {
      is: TranslationContentGenerationForm,
      props: {
        curationValues: {
          text1: curationValues?.description,
          seo_description: curationValues?.seoDescription,
          text2: curationValues?.additionalDescription,
          custom_highlights: useDefaultValue(curationValues?.highlights?.custom),
          custom_included: useDefaultValue(curationValues?.included?.custom),
          custom_non_included: useDefaultValue(curationValues?.nonIncluded?.custom),
          custom_important_information: useDefaultValue(curationValues?.importantInformation?.custom),
          premade_highlights: useDefaultValue(curationValues?.highlights?.premade),
          premade_included: useDefaultValue(curationValues?.included?.premade),
          premade_non_included: useDefaultValue(curationValues?.nonIncluded?.premade),
          premade_important_information: useDefaultValue(curationValues?.importantInformation?.premade),
        },
        hasDiff: false,
        readonly: true,
        initialValues: {
          text1: values?.description,
          seo_description: values?.seoDescription,
          text2: values?.additionalDescription,
          custom_highlights: useDefaultValue(values?.highlights?.custom),
          custom_included: useDefaultValue(values?.included?.custom),
          custom_non_included: useDefaultValue(values?.nonIncluded?.custom),
          custom_important_information: useDefaultValue(values?.importantInformation?.custom),
          premade_highlights: useDefaultValue(values?.highlights?.premade),
          premade_included: useDefaultValue(values?.included?.premade),
          premade_non_included: useDefaultValue(values?.nonIncluded?.premade),
          premade_important_information: useDefaultValue(values?.importantInformation?.premade),
        },
        language,
      },
    },
    "customer-info": {
      is: TranslationCustomerInformationForm,
      props: {
        curationValues: {
          info_voucher: curationValues?.infoVoucher,
        },
        hasDiff: false,
        readonly: true,
        initialValues: {
          info_voucher: values?.infoVoucher,
        },
        language,
      },
    },
    "asterix-integration": {
      is: RevisionTranslationAsterixIntegrationForm,
      props: {
        hasDiff: false,
        readonly: true,
        language,
        curationValues: curationValues!,
        initialValues: values!,
      },
    },
  };
}

export function getTranslationSections(
  baseUrl: string,
  language: string,
  values: ExperienceRevision
): Record<string, MappedCategory> {
  const sections: SidebarSections = {
    settings: {
      url: `${baseUrl}/${language}/settings`,
      icon: "settings" as Icon,
      fields: [
        {
          id: "title",
          required: true,
          filled: !!values?.title,
        },
        {
          id: "seo_title",
          required: false,
          filled: !!values?.seoTitle,
        },
      ],
    },
    location: {
      url: `${baseUrl}/${language}/location`,
      icon: "location" as Icon,
      fields: [
        {
          id: "meeting_point_details",
          required: false,
          filled: !!values?.meetingPointDetails,
        },
      ],
    },
    "content-segmentation": {
      url: `${baseUrl}/${language}/content-segmentation`,
      icon: "content-generator",
      fields: [
        {
          id: "description",
          required: true,
          filled: !!values.description,
        },
        {
          id: "seo_description",
          required: true,
          filled: !!values.seoDescription,
        },
        {
          id: "additional_description",
          required: false,
          filled: !!values.additionalDescription,
        },
        {
          id: "highlights",
          required: true,
          filled: translationHighlightArraySchema.safeParse(values.highlights?.custom).success,
        },
        {
          id: "included",
          required: true,
          filled: translationHighlightArraySchema.safeParse(values.included?.custom).success,
        },
        {
          id: "non_included",
          required: false,
          filled: translationHighlightArraySchema.safeParse(values.nonIncluded?.custom).success,
        },
        {
          id: "important_information",
          required: false,
          filled: translationHighlightArraySchema.safeParse(values.importantInformation?.custom).success,
        },
      ],
    },
    "customer-info": {
      url: `${baseUrl}/${language}/customer-info`,
      icon: "customer-info",
      fields: [
        {
          id: "info_voucher",
          required: false,
          filled: !!values.infoVoucher,
        },
      ],
    },
    asterix_integration: getAsterixIntegrationSection(baseUrl, language, values),
  };

  return mapSidebarSections(sections);
}

function getAsterixIntegrationSection(baseUrl: string, language: string, values?: ExperienceRevision): SidebarCategory {
  const asterixRevision = values?.productType === "ASX" ? values : undefined;
  return {
    url: `${baseUrl}/${language}/asterix-integration`,
    icon: "asterix-integration",
    hide: !asterixRevision,
    fields: [
      {
        id: "asterix-service-and-modalities-codes",
        required: true,
        filled: serviceAndModalitiesTitleTranslationList.schema.safeParse(
          asterixRevision?.serviceAndModalitiesTitleTranslationList
        ).success,
      },
    ],
  };
}

// Sonar complains that passing a default value inline for a nullable value is "tOo CoMpLiCaTeD"
function useDefaultValue<T>(value: T, defaultValue = []): never[] | NonNullable<T> {
  return value ?? defaultValue;
}
