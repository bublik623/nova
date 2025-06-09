import {
  AsxExperience,
  DistributionContent,
  ModalityCodes,
  RawSnapshot,
} from "@/types/generated/ExperienceRawServiceApi";

export const mockDistributionData: DistributionContent = {
  id: "182368a2-2879-4a43-b5f7-94fdc3e59641",
  experience_source: "NOVA",
  reference_code: "EXP0016118",
  supplier_id: "082d65c7-3d18-484b-9dc5-6e33ef73be49",
  media_content: { id: "f1ea3518-47dd-4559-bc78-6a0147963bc8", distribution_status: "NOT_READY" },
  translation_content_list: [
    { id: "d6d6dd71-5914-407b-91d4-f1aaa743e7ee", language_code: "es", distribution_status: "READY" },
    { id: "80f4b554-2572-40de-8101-73b0cc3f03cd", language_code: "en", distribution_status: "NOT_READY" },
    { id: "0fcfe9cd-5b32-4e49-bc93-77e14a9a4c77", language_code: "it", distribution_status: "NOT_READY" },
    { id: "75d1e590-2c57-46bf-82e2-7d90c2313f12", language_code: "de", distribution_status: "NOT_READY" },
    { id: "3c688577-370c-4f6e-99e2-600ebf30377e", language_code: "fr", distribution_status: "NOT_READY" },
    { id: "b7ec8df9-aae3-4ecf-ae0e-5e923e352c45", language_code: "nl", distribution_status: "NOT_READY" },
    { id: "9e3492b6-a207-4166-b1c9-c4e541569e14", language_code: "pl", distribution_status: "NOT_READY" },
    { id: "5fe5b738-b873-42bc-b62e-b4824479fe59", language_code: "pt", distribution_status: "NOT_READY" },
    { id: "55521d3a-9c3a-48d6-a326-5e9f4cfae557", language_code: "ru", distribution_status: "NOT_READY" },
    { id: "e4302e37-cdef-444b-8ba4-e5f6c1090639", language_code: "dk", distribution_status: "NOT_READY" },
    { id: "20a1f7fa-964a-4637-bc0e-55dde4be87a1", language_code: "no", distribution_status: "NOT_READY" },
    { id: "dc3c208a-7dfa-45b2-8df3-a20a5954fcd6", language_code: "fi", distribution_status: "NOT_READY" },
    { id: "2a94e87d-290c-4dc9-b6c7-7e920df14c1e", language_code: "se", distribution_status: "NOT_READY" },
  ],
  global_status: "NOT_READY",
  curation_level: "DEDICATED",
  priority: 8,
  imported: false,
};

export const mockRawRevision: RawSnapshot = {
  id: "1deb23f5-837a-4385-8fb6-23fa19d572d1",
  snapshot_date: "2024-07-30T09:18:53.147Z",
  version_id: "v1",
  user_version: "tommaso.bartolucci",
  raw: {
    id: "8411db45-6dc9-44ba-bcd6-f1c34c29d893",
    experience_id: "6ab12cef-b5bf-4719-ba23-d89edc79af08",
    functional: {
      external_reference_code: "test ref code",

      additional_services: [
        "BRAND_TUI_COLLECTION",
        "OWN_OFFER_TUI_DESIGNED_OPERATED",
        "PROMOTIONAL_SPECIAL",
        "FEATURE_AUDIOGUIDE",
        "FEATURE_FREE_CANCELLATION",
        "DURATION_UP_2",
      ],
      categories: ["BOAT_TRIPS"],
      interests: ["WALKING_TOUR"],
      location: {
        latitude: "42.651711",
        longitude: "18.0858801",
        address: {
          direction: "Croatia, Brsečinska ulica, Dubrovnik, Croatia",
          city: "DBV",
          postal_code: "20000",
          country: "Croatia",
        },
        // creation_date: "2024-05-24T08:32:39.368",
        // updated_date: "2024-05-24T08:32:39.368",
      },
      markets: ["bo-2b"],
      booking_information: {
        voucher_type: "MOBILE",
        emergency_contact_number: { country_calling_code: "212", number: "0699999999" },
      },
    },
    commercial: {
      title: "1805906d-b861-4380-bf6e-e06d5c8a6657",
      description: "<p>Any description</p>",
      additional_description: "<p>Any Additional description</p>",
      info_voucher: "<p>Any Voucher instructions</p>",
      meeting_point_details: "<p>Any Meeting point details</p>",
      custom_highlights: [{ code: "local-s1971laoi7", name: "Any custom highlights", visualization_order: 1 }],
      custom_included: [{ code: "local-zkzj17qrxzo", name: "Any custom included", visualization_order: 1 }],
      custom_non_included: [{ code: "local-xwoyn15szim", name: "Any custom non-included", visualization_order: 1 }],
      custom_important_information: [
        { code: "local-c7sjz441zy", name: "Any custom important information", visualization_order: 1 },
      ],
    },
    flow_code: "BASE",
    status_code: "SENT_TO_REVIEW",
    creation_date: "2024-05-24T08:32:26.945Z",
    updated_date: "2024-07-30T09:18:53.151Z",
    collection_criteria: {
      exceptional_experiences: "<p>test tui col</p>",
      created_with_care: "<p>test tui col</p>",
      best_value_guaranteed: "<p>test tui col</p>",
    },
  },
};

export const mockAsxDistributionData: DistributionContent = {
  ...mockDistributionData,
  experience_source: "ASX",
};

export const mockAsxRawRevision: RawSnapshot = {
  ...mockRawRevision,
  raw: {
    ...mockRawRevision.raw!,
    legacy_adapter_information: {
      asx_codes: [{ code: "SVC-001", modality_codes: ["MOD-001"] }],
    },
  },
};

export const mockAsxServices: AsxExperience[] = [
  {
    code: "SVC-001",
    default_name: "My Service 001",
  },
];

export const mockAsxModalities: ModalityCodes[] = [
  {
    code: "MOD-001",
    default_name: "My Modality 001",
  },
];
