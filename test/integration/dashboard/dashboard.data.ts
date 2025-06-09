import { DocumentFlow } from "@/types/DocumentStatuses";
import { DistributionContent, Raw, ExperienceContentV2 } from "@/types/generated/ContentQueryApiV2";

export const rawData: Raw[] = [
  {
    id: "raw-content-1",
    reference_code: "EXP0000001",
    experience_id: "raw-exp-1",
    creation_date: "2022-08-09T08:42:18",
    updated_date: "2022-08-10T08:42:18",
    experience_source: "NOVA",
    commercial: {
      title: "Raw content 1",
    },
    flow_code: "BASE",
    status_code: "IN_CREATION",
  },
  {
    id: "raw-content-2",
    reference_code: "EXP0000001",
    experience_id: "raw-exp-2",
    creation_date: "2022-08-15T08:42:18",
    updated_date: "2022-08-16T08:42:18",
    experience_source: "NOVA",
    commercial: {
      title: "Raw content 2",
    },
    flow_code: "BASE",
    status_code: "IN_CREATION",
  },
];

export const contentData: ExperienceContentV2[] = [
  {
    supplier_id: "supplier-1",
    language_code: "en",
    experience_id: "experience-1",
    experience_translation: {
      title: "English title",
      name: "name",
      id: "70b7084a-5e6e-40c2-8aff-51b51015d1fa",
      creation_date: "2022-08-09T07:11:21",
      updated_date: "2022-08-09T07:11:21",
      automatic_translation: false,
      curation_quality: false,
      flow_code: "curation",
      status_code: "READY",
    },
  },
  {
    supplier_id: "supplier-1",
    language_code: "it",
    experience_id: "experience-1",
    experience_translation: {
      title: "Italian title",
      name: "name",
      id: "7c2dc78e-a02c-49e5-b3e1-db39e6272d44",
      creation_date: "2022-08-09T07:11:21",
      updated_date: "2022-08-09T07:11:21",
      automatic_translation: false,
      curation_quality: false,
      flow_code: "manual_translation",
      status_code: "TO_BE_EDIT",
    },
  },
  {
    supplier_id: "supplier-1",
    language_code: "es",
    experience_id: "experience-1",
    experience_translation: {
      title: "Spanish title",
      name: "name",
      id: "30087cfb-6c13-4b51-9c62-d7096df187d8",
      creation_date: "2022-08-09T07:11:21",
      updated_date: "2022-08-09T07:11:21",
      automatic_translation: false,
      curation_quality: false,
      flow_code: "manual_translation",
      status_code: "TO_BE_EDIT",
    },
  },
  {
    supplier_id: "supplier-1",
    language_code: "en",
    experience_id: "experience-2",
    experience_translation: {
      title: "English title 2",
      name: "name",
      id: "30087cfb-6c13-g651-9c62-d7096df187f4",
      creation_date: "2022-08-09T07:11:21",
      updated_date: "2022-08-09T07:11:21",
      automatic_translation: false,
      curation_quality: false,
      flow_code: "curation",
      status_code: "TO_BE_EDIT",
    },
  },
];

export const distributionContentData: DistributionContent[] = [
  {
    id: "experience-1",
    reference_code: "EXP0000001",
    global_status: "PUBLISHED",
    experience_source: "NOVA",
    experience_media: {
      flow_code: DocumentFlow.MEDIA,
      status_code: "TO_BE_EDIT",
    },
    experience_content: [
      {
        experience_id: "experience-1",
        language_code: "en",
        experience_translation: {
          name: "exp 1",
          title: "English title",
          id: "111",
          automatic_translation: false,
          curation_quality: false,
          distribution_status: "READY",
          creation_date: "2023-07-21",
          updated_date: "2023-07-21",
          flow_code: "CURATION",
          status_code: "READY",
        },
        supplier_id: "1",
      },
      {
        experience_id: "experience-1",
        language_code: "it",
        experience_translation: {
          title: "Italian title",
          name: "name",
          id: "7c2dc78e-a02c-49e5-b3e1-db39e6272d44",
          creation_date: "2022-08-09T07:11:21",
          updated_date: "2022-08-09T07:11:21",
          automatic_translation: false,
          curation_quality: false,
          distribution_status: "READY",
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
        },
        supplier_id: "1",
      },
      {
        experience_id: "experience-1",
        language_code: "es",
        experience_translation: {
          title: "Spanish title",
          name: "name",
          id: "30087cfb-6c13-4b51-9c62-d7096df187d8",
          creation_date: "2022-08-09T07:11:21",
          updated_date: "2022-08-09T07:11:21",
          automatic_translation: false,
          curation_quality: false,
          distribution_status: "READY",
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
        },
        supplier_id: "1",
      },
    ],
    functional_content: {
      experience_location: { id: "loc-1", address: { city: "DBV", country: "Croatia" } },
    },
  },
  {
    id: "experience-2",
    reference_code: "EXP0000001",
    global_status: "PUBLISHED",
    experience_source: "NOVA",
    experience_media: {
      flow_code: DocumentFlow.MEDIA,
      status_code: "TO_BE_EDIT",
    },
    experience_content: [
      {
        experience_id: "experience-2",
        language_code: "en",
        experience_translation: {
          id: "experience-2",
          name: "experience 2",
          title: "English title 2",
          automatic_translation: false,
          curation_quality: false,
          distribution_status: "NOT_READY",
          creation_date: "2023-07-21",
          updated_date: "2023-07-21",
          flow_code: "CURATION",
          status_code: "TO_BE_EDIT",
        },
        supplier_id: "2",
      },
    ],
    functional_content: {
      experience_location: { id: "loc-2", address: { city: "DBV", country: "Croatia" } },
    },
  },
];
