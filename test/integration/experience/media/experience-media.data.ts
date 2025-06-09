import { DistributionContent } from "@/types/generated/ContentQueryApiV2";

export const contentQueryData: DistributionContent = {
  id: "experience-1",
  supplier_id: "supplier-1",
  global_status: "PUBLISHED",
  experience_media: {
    id: "random-media-id",
    images_v2: [
      {
        id: "0af79004-a06f-4905-882c-432b80e715b8",
        file_name: "image-1",
        preview_url: "image-1-url.jpg",
        visualization_order: 1,
        image_type: "GALLERY",
      },
    ],
    flow_code: "MEDIA",
    status_code: "READY",
    creation_date: "2023-07-12T07:04:17",
    updated_date: "2023-07-17T12:45:56",
  },
  experience_content: [
    {
      experience_id: "ac684f01-84ec-4bc9-a847-285c4a3eb275",
      language_code: "de",
      supplier_id: "supplier-1",
      experience_translation: {
        id: "1e9ab696-ba33-42e8-8f59-f264d45dcf34",
        name: "German translation name",
        title: "German translation title",
        flow_code: "MANUAL_TRANSLATION",
        status_code: "TO_BE_EDIT",
        distribution_status: "NOT_READY",
        creation_date: "2023-10-17T11:56:40",
        updated_date: "2023-10-17T11:56:40",
      },
      custom_highlights: [
        {
          id: "04aff81d-770d-4237-9bbd-f53147f603c0",
          code: "local-6iyw0vmkrje",
          name: "Any custom highlights",
          visualization_order: 1,
          creation_date: "2023-10-17T11:56:40",
          updated_date: "2023-10-17T11:56:40",
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
        },
      ],
      custom_included: [
        {
          id: "af53cf34-fe80-4394-9101-ea2ecf796af3",
          code: "local-t87di3tfkt",
          name: "Any custom included",
          visualization_order: 1,
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
          creation_date: "2023-10-17T11:56:40",
          updated_date: "2023-10-17T11:56:40",
        },
      ],
      custom_non_included: [
        {
          id: "1774960d-1f1d-4086-a491-fe5ec92c8eb8",
          code: "local-okgttcw7hm",
          name: "Any custom non-included",
          visualization_order: 1,
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
          creation_date: "2023-10-17T11:56:40",
          updated_date: "2023-10-17T11:56:40",
        },
      ],
      custom_important_information: [
        {
          id: "254bc3eb-5807-4f13-a329-75229bb0b1e0",
          code: "local-xpt5kwb7ql",
          name: "Any custom important information",
          visualization_order: 1,
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
          creation_date: "2023-10-17T11:56:40",
          updated_date: "2023-10-17T11:56:40",
        },
      ],
    },
    {
      experience_id: "ac684f01-84ec-4bc9-a847-285c4a3eb275",
      supplier_id: "supplier-2",
      language_code: "en",
      experience_translation: {
        id: "2e7b1377-57dc-47a2-af72-b31c82dc50db",
        title: "English translation name",
        text1: "<p>Any description</p>",
        text2: "<p>Any Additional description</p>",
        info_voucher: "<p>Any Voucher instructions</p>",
        name: "English translation name",
        curation_quality: false,
        flow_code: "CURATION",
        status_code: "IN_REVIEW",
        distribution_status: "NOT_READY",
        distribution_date: "2023-10-17T12:17:56",
        creation_date: "2023-10-17T11:55:59",
        updated_date: "2023-10-17T12:19:25",
      },
      custom_highlights: [
        {
          id: "0cc056c8-9e7c-4fe8-bce0-33568e0e61d4",
          code: "local-6iyw0vmkrje",
          name: "Any custom highlights",
          visualization_order: 1,
          flow_code: "CURATION",
          status_code: "READY",
          creation_date: "2023-10-17T11:55:59",
          updated_date: "2023-10-17T11:56:40",
        },
      ],
      custom_included: [
        {
          id: "97e26ad7-4215-4be6-bcad-183babebadea",
          code: "local-t87di3tfkt",
          name: "Any custom included",
          visualization_order: 1,
          flow_code: "CURATION",
          status_code: "READY",
          creation_date: "2023-10-17T11:55:59",
          updated_date: "2023-10-17T11:56:40",
        },
      ],
      custom_non_included: [
        {
          id: "b45717a4-e859-4dcf-aa9f-bfea31041ce5",
          code: "local-okgttcw7hm",
          name: "Any custom non-included",
          visualization_order: 1,
          flow_code: "CURATION",
          status_code: "READY",
          creation_date: "2023-10-17T11:55:59",
          updated_date: "2023-10-17T11:56:40",
        },
      ],
      custom_important_information: [
        {
          id: "72822844-137d-4896-80d0-b09d6354d1ed",
          code: "local-xpt5kwb7ql",
          name: "Any custom important information",
          visualization_order: 1,
          flow_code: "CURATION",
          status_code: "READY",
          creation_date: "2023-10-17T11:55:59",
          updated_date: "2023-10-17T11:56:40",
        },
      ],
    },
  ],
  functional_content: {
    experience_location: {
      id: "a3f1cb48-009d-4d03-ae08-e08ebcd4fe2e",
      address: {
        direction: "Croatia, Brsečinska ulica, Dubrovnik, Croatia",
        city: "DBV",
        postal_code: "20000",
        country: "Croatia",
      },
      latitude: "42.651711",
      longitude: "18.0858801",
    },
  },
};

export const mockDamService = [
  {
    filename: "image-1",
    preview_url: "image-1-url.jpg",
  },
  {
    filename: "image-2",
    preview_url: "image-2-url.jpg",
  },
  {
    filename: "image-3",
    preview_url: "image-3-url.jpg",
  },
  {
    filename: "image-4",
    preview_url: "image-4-url.jpg",
  },
  {
    filename: "image-5",
    preview_url: "image-5-url.jpg",
  },
  {
    filename: "image-6",
    preview_url: "image-6-url.jpg",
  },
  {
    filename: "image-7",
    preview_url: "image-7-url.jpg",
  },
];
