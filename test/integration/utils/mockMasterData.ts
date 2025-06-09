import { Page } from "@playwright/test";
import { Flow } from "@/types/generated/ContentCommandApi";
import { ContentStatus } from "@/types/generated/ContentMasterDataApi";
import {
  Highlights,
  ImportantInformation,
  Included,
  AdditionalService,
  Category,
  Interest,
  Market,
  HierarchicalGroup,
  Pax,
} from "@/types/generated/ExperienceMasterDataApi";
import { Country as GeoCountry, City as GeoCity, Venue } from "@/types/generated/GeoMasterDataApi";
import { Currency, Supplier } from "@/types/generated/ContractMasterDataApi";
import { BRAND_TUI_COLLECTION } from "@/features/experience-raw/constants";
import { mockRequest } from "./mockRequest";
import { mockQuestionMasterData } from "../experience/options/customer-details/customer-details.data";

const contentCommandURL = "http://localhost:8081";
const contentMasterDataURL = "http://localhost:8082";
const experienceMasterDataURL = "http://localhost:8085";
const geoMasterDataURL = "http://localhost:8094";
const contractMasterDataURL = "http://localhost:8095";

const headers = {
  "content-type": "application/x-ndjson",
};

export const exampleOwnOfferCode = "OWN_OFFER_TEST";

export const mockData: {
  contentStatuses: ContentStatus[];
  contentFlows: Partial<Flow>[];
  highlights: Highlights[];
  included: Included[];
  importantInformation: ImportantInformation[];
  additionalServices: AdditionalService[];
  categories: Category[];
  interests: Interest[];
  markets: Market[];
  countries: GeoCountry[];
  cities: GeoCity[];
  hierarchicalGroups: HierarchicalGroup[];
  currencies: Partial<Currency>[];
  suppliers: Supplier[];
  venues: Venue[];
} = {
  contentStatuses: [
    {
      id: "to_be_edit",
      code: "TO_BE_EDIT",
      name: "To be edit",
      description: "Description if it needs",
      language_code: "en",
    },
    {
      id: "ready",
      code: "READY",
      name: "Ready",
      description: "Description if it needs",
      language_code: "en",
    },
    {
      id: "in_review",
      code: "IN_REVIEW",
      name: "In review",
      description: "Description if it needs",
      language_code: "en",
    },
  ],
  contentFlows: [
    {
      id: "autotranslation",
      code: "AUTOTRANSLATION",
    },
    {
      id: "manual_translation",
      code: "MANUAL_TRANSLATION",
    },
    {
      id: "curation",
      code: "CURATION",
    },
    {
      id: "media",
      code: "MEDIA",
    },
  ],
  highlights: [
    {
      id: "e77052a7-8f71-4400-b13e-e23f6c746a77",
      code: "LUNCHMENU",
      name: "Lunch menu to keep you going all the day",
      description: "Description if it needs",
      language_code: "en",
    },
    {
      id: "d4f44cee-285e-4d7a-b9a7-5b9ae1e5142f",
      code: "DINNERMENU",
      name: "Dinner menu to keep you well-fed and happy",
      description: "Description if it needs",
      language_code: "en",
    },
    {
      id: "8ad1c6a2-a6d7-45be-bbd5-a60bd8959bc3",
      code: "BREAKFASTMENU",
      name: "Includes a tasty breakfast to help you start the day right",
      description: "Description if it needs",
      language_code: "en",
    },
    {
      id: "diff-id",
      code: "DIFF-PREMADE-ADDED",
      name: "Added For Diff Premade",
      description: "don't remove or change me",
      language_code: "en",
    },
    {
      id: "diff-id",
      code: "DIFF-PREMADE-REMOVED",
      name: "Added For Testing Removed Premade",
      description: "don't remove or change me",
      language_code: "en",
    },
  ],
  included: [
    {
      id: "18990c41-afac-48fc-9d34-19251cf80c8d",
      code: "ENTRANCEFEES",
      name: "Entrance fees",
      description: "Description if it needs",
      language_code: "en",
    },
    {
      id: "169af128-c2af-49e3-b484-83ee163da619",
      code: "DRINKS",
      name: "Drinks",
      description: "Description if it needs",
      language_code: "en",
    },
    {
      id: "f25e99bd-f386-445e-960d-ae6a1c0c7854",
      code: "LUNCH",
      name: "Lunch",
      description: "Description if it needs",
      language_code: "en",
    },
  ],
  importantInformation: [
    {
      id: "4c85b760-94ed-43b7-8e60-bbfc6b48e182",
      code: "COPYPASS",
      name: "Copy of your password",
      description: "Description if it needs",
      language_code: "en",
    },
    {
      id: "cd225e6b-691d-4d16-8968-b69efa27deb3",
      code: "SHOES",
      name: "We recommend you wear comfortable shoes",
      description: "Description if it needs",
      language_code: "en",
    },
    {
      id: "e95aa468-31d1-4dfa-8884-b0d5b981e129",
      code: "DIFFICULTY",
      name: "Due to uneven and steep surfaces, this activity is unsuitable for anyone who has difficulty walking",
      description: "Description if it needs",
      language_code: "en",
    },
  ],
  additionalServices: [
    {
      id: "de5605b5-a35a-4745-811a-89e21d1c3dc2",
      code: "OWN_OFFER_TUI_DESIGNED_OPERATED",
      name: "TUI Designed & TUI Operated",
      language_code: "en",
      functional_group_code: "OWN_OFFER",
    },
    {
      id: "e64e8311-32b2-4738-ad47-3b764c8bff59",
      code: "OWN_OFFER_TUI_DESIGNED_3P_OPERATED",
      name: "TUI Designed & 3P Operated",
      language_code: "en",
      functional_group_code: "OWN_OFFER",
    },
    {
      id: "3640bd7c-330b-4702-9bea-2411c67f2788",
      code: "OWN_OFFER_3P_DESIGNED_OPERATED",
      name: "3P Designed & 3P Operated",
      language_code: "en",
      functional_group_code: "OWN_OFFER",
    },
    {
      id: "bf0c64c5-d2d9-4e1e-adc3-0d0da018d183",
      code: "OWN_OFFER_PARTNER_DESIGNED_TUI_OPERATED",
      name: "Partner Designed, TUI Operated",
      language_code: "en",
      functional_group_code: "OWN_OFFER",
    },
    {
      id: "1f0a0034-a432-4c11-a9f3-e10fc6df27f5",
      code: "ACCESSIBILITY_WALKING_DISABILITIES",
      name: "Suitable for walking disabilities",
      language_code: "en",
      functional_group_code: "ACCESSIBILITY",
    },
    {
      id: "f5956ec9-e3a5-48fb-99f1-f05c74394fb8",
      code: "ACCESSIBILITY_WHEELCHAIR",
      name: "Wheelchair users",
      language_code: "en",
      functional_group_code: "ACCESSIBILITY",
    },
    {
      id: "c5d73dc7-86e4-4ede-9965-60bfb502192f",
      code: "ACCESSIBILITY_HEARING_IMPAIRMENTS",
      name: "Hearing impairments",
      language_code: "en",
      functional_group_code: "ACCESSIBILITY",
    },
    {
      id: "697c1725-9dd5-43cc-b215-8a83615ee04b",
      code: "ACCESSIBILITY_VISUAL_IMPAIRMENTS",
      name: "Visual impairments",
      language_code: "en",
      functional_group_code: "ACCESSIBILITY",
    },
    {
      id: "0d7f5436-9a48-44e4-a9bb-4ef21f2b5efd",
      code: "ACCESSIBILITY_COGNITIVE_IMPAIRMENT",
      name: "Cognitive impairment",
      language_code: "en",
      functional_group_code: "ACCESSIBILITY",
    },
    {
      id: "df189abb-2a1e-4bf5-b37a-935fb0c7b9c3",
      code: "GSTC_LOCAL_COMMUNITY",
      name: "Support local community",
      language_code: "en",
      functional_group_code: "GSTC_CERTIFIED",
    },
    {
      id: "bd39e587-e47d-4b70-b4f2-d0fd9e97e606",
      code: "GSTC_PLASTIC_REDUCTION",
      name: "Plastic reduction initiatives",
      language_code: "en",
      functional_group_code: "GSTC_CERTIFIED",
    },
    {
      id: "ad01352e-1656-48d8-a19d-3430814d30a4",
      code: "GSTC_NATURAL_AREA",
      name: "Natural/Protected area",
      language_code: "en",
      functional_group_code: "GSTC_CERTIFIED",
    },
    {
      id: "9da8f2ff-afcf-4c2f-9823-7c638b91db9e",
      code: "GSTC_HISTORICAL",
      name: "Historical site/UNESCO",
      language_code: "en",
      functional_group_code: "GSTC_CERTIFIED",
    },
    {
      id: "d7a07dbd-1c92-4ebc-bf30-b80f8812391a",
      code: "GSTC_FOOD",
      name: "Traditional/Local food",
      language_code: "en",
      functional_group_code: "GSTC_CERTIFIED",
    },
    {
      id: "04bdb5fd-af66-4ce5-bbb0-0c70b267eb71",
      code: "GSTC_WALKING_TOUR",
      name: "Walking tour",
      language_code: "en",
      functional_group_code: "GSTC_CERTIFIED",
    },
    {
      id: "86047bab-7993-4cf7-8743-537ab2fe66b8",
      code: "GSTC_SUITABLE_TRANSPORT",
      name: "Suitable transport",
      language_code: "en",
      functional_group_code: "GSTC_CERTIFIED",
    },
    {
      id: "71414c81-c659-4699-b565-0e3ee9086760",
      code: "GSTC_TRADITIONAL_ACTIVITY",
      name: "Traditional/typical activity",
      language_code: "en",
      functional_group_code: "GSTC_CERTIFIED",
    },
    {
      id: "6be85f72-d5bd-4771-8eff-f505f5b8441e",
      code: "GSTC_ACCESSIBILITY",
      name: "Accessibility",
      language_code: "en",
      functional_group_code: "GSTC_CERTIFIED",
    },
    {
      id: "096b7c10-bb8a-4971-a829-62a09c21c03e",
      code: "GSTC_CHARITY",
      name: "Charity",
      language_code: "en",
      functional_group_code: "GSTC_CERTIFIED",
    },
    {
      id: "03fd8056-2a52-4223-9a1c-1f222edd47c0",
      code: "NAT_GEO_TOUR_LEVEL_ENTRY",
      name: "Entry level",
      language_code: "en",
      functional_group_code: "NAT_GEO_TOUR_LEVELS",
    },
    {
      id: "2d41f42e-b234-4f8a-9b79-d4a9b02c47ed",
      code: "NAT_GEO_TOUR_LEVEL_MID",
      name: "Mid level",
      language_code: "en",
      functional_group_code: "NAT_GEO_TOUR_LEVELS",
    },
    {
      id: "786157fe-cd0c-48c4-8496-83e4d76afbd0",
      code: "NAT_GEO_TOUR_LEVEL_PREMIUM",
      name: "Premium level",
      language_code: "en",
      functional_group_code: "NAT_GEO_TOUR_LEVELS",
    },
    {
      id: "9d42b90e-16c2-4fdc-9144-9fa18b3ef9e8",
      code: "PROMOTIONAL_NONE",
      name: "None",
      language_code: "en",
      functional_group_code: "PROMOTIONAL_OPTIONS",
    },
    {
      id: "b1f1a131-497b-4d4b-be9c-1ffc0f3f6db4",
      code: "PROMOTIONAL_SPECIAL",
      name: "Special offer/promo",
      language_code: "en",
      functional_group_code: "PROMOTIONAL_OPTIONS",
    },
    {
      id: "a1ad88ca-65c0-4fcc-856c-f6eb5bba04cc",
      code: "PROMOTIONAL_SELL_OUT",
      name: "Likely to sell out",
      language_code: "en",
      functional_group_code: "PROMOTIONAL_OPTIONS",
    },
    {
      id: "648632fa-36e4-47c3-8d50-42249cda939a",
      code: "DURATION_UP_2",
      name: "Up to 2 hours",
      language_code: "en",
      functional_group_code: "DURATION",
    },
    {
      id: "873d99ea-787a-4793-bfb8-fa0dd1276528",
      code: "DURATION_2_4",
      name: "2-4 hours",
      language_code: "en",
      functional_group_code: "DURATION",
    },
    {
      id: "9077e1e2-16f7-4ec7-89d8-acf051eea0f7",
      code: "DURATION_4_6",
      name: "4-6 hours",
      language_code: "en",
      functional_group_code: "DURATION",
    },
    {
      id: "13722b88-7650-4280-bde7-0fe959843d7b",
      code: "DURATION_6_8",
      name: "6-8 hours",
      language_code: "en",
      functional_group_code: "DURATION",
    },
    {
      id: "13722b88-7650-4280-bde7-0fe959843d7c",
      code: "DURATION_OVER_12",
      name: ">12 hours",
      language_code: "en",
      functional_group_code: "DURATION",
    },
    {
      id: "91852cc2-3cb3-4f9d-b4f0-f1eff67e7dfe",
      code: "DURATION_OVERNIGHT",
      name: "Overnight",
      language_code: "en",
      functional_group_code: "DURATION",
    },
    {
      id: "d9d03f38-b702-4ef6-bccc-283f6d4ccbe9",
      code: exampleOwnOfferCode,
      name: "Own Offer Test",
      language_code: "en",
      functional_group_code: "PRODUCT_BRAND",
    },
    {
      id: "d9d03f38-b702-4ef6-bccc-283f6d4ccbe8",
      code: BRAND_TUI_COLLECTION,
      name: "TUI Collection",
      language_code: "en",
      functional_group_code: "PRODUCT_BRAND",
    },
    {
      id: "506d51ad-f5cb-45b7-9b58-27a053add4b9",
      code: "BRAND_NATIONAL_GEOGRAPHIC",
      name: "National Geographic Day Tours",
      language_code: "en",
      functional_group_code: "PRODUCT_BRAND",
    },
    {
      id: "c15f1547-9488-492c-bc1d-74b8ef7015f4",
      code: "BRAND_SCENE",
      name: "Scene",
      language_code: "en",
      functional_group_code: "PRODUCT_BRAND",
    },
    {
      id: "c15f1547-9488-492c-bc1d-74b8ef7015f5",
      code: "BRAND_TUI_RIVER_CRUISE",
      name: "TUI River Cruise",
      language_code: "en",
      functional_group_code: "PRODUCT_BRAND",
    },
    {
      id: "c15f1547-9488-492c-bc1d-74b8ef7015f6",
      code: "BRAND_NONE",
      name: "None",
      language_code: "en",
      functional_group_code: "PRODUCT_BRAND",
    },
    {
      id: "6a6c5722-db3c-495c-9e4b-262683ae7eec",
      code: "FEATURE_GLOBAL_ACCOUNT",
      name: "Global account",
      language_code: "en",
      functional_group_code: "FEATURES",
    },
    {
      id: "f72a7698-06ad-415e-93e1-94104ab5999c",
      code: "FEATURE_HOTEL-PICKUP",
      name: "Hotel pick-up",
      language_code: "en",
      functional_group_code: "FEATURES",
    },
    {
      id: "8e2a1ba0-1125-40db-a6d3-d7d9e01767ab",
      code: "FEATURE_INSTANT_CONFIRMATION",
      name: "Instant confirmation",
      language_code: "en",
      functional_group_code: "FEATURES",
    },
  ],
  categories: [
    {
      id: "75d5a37f-73ee-4899-b029-eee1fd6517d0",
      code: "ACTIVITIES",
      name: "Activities",
      language_code: "en",
    },
    {
      id: "146a7eec-498a-4ef2-a071-68d0c5a1c1f7",
      code: "BOAT_TRIPS",
      name: "Boat trips",
      language_code: "en",
    },
    {
      id: "dbc5c645-5319-49e8-8e65-67a288d35b21",
      code: "SHOREX",
      name: "Shorex",
      language_code: "en",
    },
  ],
  interests: [
    {
      code: "AIR_ACTIVITIES",
      name: "Air activities",
      language_code: "en",
      id: "f628e0ad-92b0-4e1f-859c-cd47c10127e7",
    },
    {
      code: "CLASSES_AND_WORKSHOPS",
      name: "Classes & workshops",
      language_code: "en",
      id: "7e5547d6-f1f0-4a77-be3a-f312977accae",
    },
    {
      code: "FOOD_AND_DRINK",
      name: "Food & drink",
      language_code: "en",
      id: "23ef3863-9ccc-415c-9228-93d938ff33da",
    },
    {
      code: "BIKE",
      name: "Bike",
      language_code: "en",
      id: "79844b1b-3dac-4cd1-a651-6e1db1f7642e",
    },
    {
      code: "FESTIVAL_AND_CONCERTS",
      name: "Festival & concerts",
      language_code: "en",
      id: "2c02cabc-b4c7-426d-9c82-ad60a7d0acf9",
    },
    {
      code: "GOLF",
      name: "Golf",
      language_code: "en",
      id: "ecb0e6ef-9618-4251-a2ed-e76556dbe269",
    },
  ],
  markets: [
    {
      id: "0bd69cfb-adc5-482d-8047-c7288d580c69",
      language_code: "en",
      code: "bo-2b",
      name: "Booking.com Market",
      category: "Booking.com",
    },
    {
      id: "234433c6-e939-4854-87f0-741949349079",
      language_code: "en",
      code: "br-2c",
      name: "Brazil",
      category: "B2C Musement",
    },
    {
      id: "ef467d4b-95f9-4296-9ade-0006035d8126",
      language_code: "en",
      code: "de-2c",
      name: "Germany",
      category: "B2C Musement",
    },
    {
      id: "416ad036-427c-4986-b93e-676dbb091386",
      language_code: "en",
      code: "es-2c",
      name: "Spain",
      category: "B2C Musement",
    },
    {
      id: "b238f18f-dd7a-454f-ac33-e8f8d574b555",
      language_code: "en",
      code: "be-tx",
      name: "TUI B2C Belgium (French, Wallonia)",
      category: "B2C TUI",
    },
    {
      id: "5d187aa8-587f-4ea6-8ae2-73a419fcd156",
      language_code: "en",
      code: "de-tx",
      name: "TUI B2C Germany",
      category: "B2C TUI",
    },
    {
      id: "00928bab-222f-4a6d-a7bf-1b0875d10fc6",
      language_code: "en",
      code: "be-2b",
      name: "TUI B2B Belgium",
      category: "B2B TUI",
    },
    {
      id: "3235b339-5d6f-4cb8-8749-ffe887f72e89",
      language_code: "en",
      code: "de-2b",
      name: "TUI B2B Germany",
      category: "B2B TUI",
    },
    {
      id: "6dfc429f-84d7-4cb1-ab25-77086e6a6cad",
      language_code: "en",
      code: "2b-rc",
      name: "GlobusTours TUI RiverCruise UK",
      category: "Not managed by Offer Content",
    },
    {
      id: "aa2626d4-8a20-4842-8ddb-2ac6effe451b",
      language_code: "en",
      code: "3p-nz",
      name: "Nezasa Central markets",
      category: "Not managed by Offer Content",
    },
    {
      id: "22035626-05ac-4bca-b093-051e3696790e",
      language_code: "en",
      code: "ab-ex",
      name: "Agency account for Airbnb",
      category: "Not managed by Offer Content",
    },
  ],
  cities: [
    {
      id: "403be0f5-b40b-4df0-a7f8-5e9eb9e11641",
      code: "DBV",
      name: "Dubrovnik",
      country_code_alpha2: "hr",
      language_code: "en",
    },
    {
      id: "fe668778-341f-4918-bcb4-c213e0d1d2fd",
      code: "SPU",
      name: "Split",
      country_code_alpha2: "hr",
      language_code: "en",
    },
    {
      id: "caa5ccbe-ec6c-4bfc-931a-fb2698953c43",
      code: "ZAD",
      name: "Zadar",
      country_code_alpha2: "hr",
      language_code: "en",
    },
    {
      id: "9add3b82-c707-4205-bb44-5cc2fbb2ba1d",
      code: "ION",
      name: "Argostoli, Kefalonia",
      country_code_alpha2: "gr",
      language_code: "en",
    },
    {
      id: "1aeb3eaf-a5de-448f-8770-e8e51eac73ef",
      code: "CFU",
      name: "Corfu",
      country_code_alpha2: "gr",
      language_code: "en",
    },
    {
      id: "bb81cdc3-a7fa-4438-ba35-36c1abeb5324",
      code: "heraklion",
      name: "Heraklion",
      country_code_alpha2: "gr",
      language_code: "en",
    },
    {
      id: "b2cb2266-69c0-4b48-b5c8-e05c56f37397",
      code: "XLC",
      name: "Alicante",
      country_code_alpha2: "es",
      language_code: "en",
    },
  ],
  countries: [
    {
      id: "b6ebc105-1a34-4fc5-bed0-f20464f0191d",
      iso_code_alpha2: "AF",
      iso_code_alpha3: "AFG",
      iso_code_numeric: 4,
      name: "Afghanistan",
      language_code: "ps",
      description: "Afghanistan",
      country_calling_codes: [93],
    },
    {
      id: "725aaf5a-105f-4d0a-8197-868b6994a7e9",
      iso_code_alpha2: "AX",
      iso_code_alpha3: "ALA",
      iso_code_numeric: 248,
      name: "Åland Islands",
      language_code: "sv",
      description: "Åland Islands",
      country_calling_codes: [358],
    },
    {
      id: "c9e3f6d1-68e0-4c05-913b-eee63ab588e9",
      iso_code_alpha2: "AL",
      iso_code_alpha3: "ALB",
      iso_code_numeric: 8,
      name: "Albania",
      language_code: "sq",
      description: "Albania",
      country_calling_codes: [355],
    },
    {
      id: "bbad72c4-bf60-4368-a224-9f43854a3762",
      iso_code_alpha2: "DZ",
      iso_code_alpha3: "DZA",
      iso_code_numeric: 12,
      name: "Algeria",
      language_code: "ar",
      description: "Algeria",
      country_calling_codes: [213],
    },
    {
      id: "28546608-804b-4197-92ab-72e34e2d2a0c",
      iso_code_alpha2: "AS",
      iso_code_alpha3: "ASM",
      iso_code_numeric: 16,
      name: "American Samoa",
      language_code: "en",
      description: "American Samoa",
      country_calling_codes: [1],
    },
    {
      id: "59e66dd5-684a-42bf-b676-942df0dca2fa",
      iso_code_alpha2: "AD",
      iso_code_alpha3: "AND",
      iso_code_numeric: 20,
      name: "Andorra",
      language_code: "ca",
      description: "Andorra",
      country_calling_codes: [376],
    },
    {
      id: "5649367d-a979-4632-aefa-1155e46fdc41",
      iso_code_alpha2: "AO",
      iso_code_alpha3: "AGO",
      iso_code_numeric: 24,
      name: "Angola",
      language_code: "pt",
      description: "Angola",
      country_calling_codes: [244],
    },
    {
      id: "44adf143-03bf-41f5-9649-fe3ff3486ac5",
      iso_code_alpha2: "AI",
      iso_code_alpha3: "AIA",
      iso_code_numeric: 660,
      name: "Anguilla",
      language_code: "en",
      description: "Anguilla",
      country_calling_codes: [1],
    },
    {
      id: "33265c8e-011c-49cf-8a78-932d6285c0da",
      iso_code_alpha2: "AQ",
      iso_code_alpha3: "ATA",
      iso_code_numeric: 10,
      name: "Antarctica",
      language_code: "en",
      description: "Antarctica",
      country_calling_codes: [672],
    },
    {
      id: "9df7caf3-40e0-4d4b-ae83-067f98e078c5",
      iso_code_alpha2: "AG",
      iso_code_alpha3: "ATG",
      iso_code_numeric: 28,
      name: "Antigua and Barbuda",
      language_code: "en",
      description: "Antigua and Barbuda",
      country_calling_codes: [1],
    },
    {
      id: "54b635c9-fc97-4c5d-a1a0-11c3652e245f",
      iso_code_alpha2: "AR",
      iso_code_alpha3: "ARG",
      iso_code_numeric: 32,
      name: "Argentina",
      language_code: "es",
      description: "Argentina",
      country_calling_codes: [54],
    },
    {
      id: "b763e1a5-144a-4e9c-96a0-c8642b6bc5ee",
      iso_code_alpha2: "AM",
      iso_code_alpha3: "ARM",
      iso_code_numeric: 51,
      name: "Armenia",
      language_code: "hy",
      description: "Armenia",
      country_calling_codes: [374],
    },
    {
      id: "95059db3-b543-496b-bead-4197a1cefc41",
      iso_code_alpha2: "AW",
      iso_code_alpha3: "ABW",
      iso_code_numeric: 533,
      name: "Aruba",
      language_code: "nl",
      description: "Aruba",
      country_calling_codes: [297],
    },
    {
      id: "765bef51-45e7-4d6b-9ec1-96ea5259f721",
      iso_code_alpha2: "AU",
      iso_code_alpha3: "AUS",
      iso_code_numeric: 36,
      name: "Australia",
      language_code: "en",
      description: "Australia",
      country_calling_codes: [61],
    },
    {
      id: "8e404918-98c0-4669-adf1-a62251474fda",
      iso_code_alpha2: "AT",
      iso_code_alpha3: "AUT",
      iso_code_numeric: 40,
      name: "Austria",
      language_code: "de",
      description: "Austria",
      country_calling_codes: [43],
    },
    {
      id: "99eca48b-db44-475a-9017-c4c7b9cfc177",
      iso_code_alpha2: "AZ",
      iso_code_alpha3: "AZE",
      iso_code_numeric: 31,
      name: "Azerbaijan",
      language_code: "az",
      description: "Azerbaijan",
      country_calling_codes: [994],
    },
    {
      id: "84b8f4dd-59a0-4082-87c9-180b6c8cfc6a",
      iso_code_alpha2: "BS",
      iso_code_alpha3: "BHS",
      iso_code_numeric: 44,
      name: "Bahamas (the)",
      language_code: "en",
      description: "Bahamas (the)",
      country_calling_codes: [1],
    },
    {
      id: "66fbcf44-5ad1-4fc3-bc61-7e1587067d9e",
      iso_code_alpha2: "BH",
      iso_code_alpha3: "BHR",
      iso_code_numeric: 48,
      name: "Bahrain",
      language_code: "ar",
      description: "Bahrain",
      country_calling_codes: [973],
    },
    {
      id: "3f4801f3-96b8-4d76-b96c-cec4c8366bcd",
      iso_code_alpha2: "BD",
      iso_code_alpha3: "BGD",
      iso_code_numeric: 50,
      name: "Bangladesh",
      language_code: "bn",
      description: "Bangladesh",
      country_calling_codes: [880],
    },
    {
      id: "7d146561-8b1f-429d-bc73-de025cef543c",
      iso_code_alpha2: "BB",
      iso_code_alpha3: "BRB",
      iso_code_numeric: 52,
      name: "Barbados",
      language_code: "en",
      description: "Barbados",
      country_calling_codes: [1],
    },
    {
      id: "1080bbe8-6b3b-4cda-8d81-0cb13e84f12f",
      iso_code_alpha2: "BY",
      iso_code_alpha3: "BLR",
      iso_code_numeric: 112,
      name: "Belarus",
      language_code: "be",
      description: "Belarus",
      country_calling_codes: [375],
    },
    {
      id: "37a14661-a4bd-4367-8d2f-607ce505cad0",
      iso_code_alpha2: "BE",
      iso_code_alpha3: "BEL",
      iso_code_numeric: 56,
      name: "Belgium",
      language_code: "nl",
      description: "Belgium",
      country_calling_codes: [32],
    },
    {
      id: "59423595-7ba2-44a9-b628-ebfa43713d97",
      iso_code_alpha2: "BZ",
      iso_code_alpha3: "BLZ",
      iso_code_numeric: 84,
      name: "Belize",
      language_code: "en",
      description: "Belize",
      country_calling_codes: [501],
    },
    {
      id: "c965aee6-3f2e-4866-a00f-a696cb4b5bbf",
      iso_code_alpha2: "BJ",
      iso_code_alpha3: "BEN",
      iso_code_numeric: 204,
      name: "Benin",
      language_code: "fr",
      description: "Benin",
      country_calling_codes: [229],
    },
    {
      id: "d028789e-64a2-4271-ac50-4cfa3114618d",
      iso_code_alpha2: "BM",
      iso_code_alpha3: "BMU",
      iso_code_numeric: 60,
      name: "Bermuda",
      language_code: "en",
      description: "Bermuda",
      country_calling_codes: [1],
    },
    {
      id: "0452fe8e-743a-4890-9893-8d2963739b92",
      iso_code_alpha2: "BT",
      iso_code_alpha3: "BTN",
      iso_code_numeric: 64,
      name: "Bhutan",
      language_code: "dz",
      description: "Bhutan",
      country_calling_codes: [975],
    },
    {
      id: "cb89a975-c56f-4e1c-acb1-d6708bb0a271",
      iso_code_alpha2: "BO",
      iso_code_alpha3: "BOL",
      iso_code_numeric: 68,
      name: "Bolivia (Plurinational State of)",
      language_code: "es",
      description: "Bolivia (Plurinational State of)",
      country_calling_codes: [591],
    },
    {
      id: "708c4e1c-9c10-437d-8f05-17bc2db37e7c",
      iso_code_alpha2: "BQ",
      iso_code_alpha3: "BES",
      iso_code_numeric: 535,
      name: "Bonaire, Sint Eustatius and Saba",
      language_code: "nl",
      description: "Bonaire, Sint Eustatius and Saba",
      country_calling_codes: [599],
    },
    {
      id: "8910fdbd-6464-43a5-ad81-a17eb6d1bb96",
      iso_code_alpha2: "BA",
      iso_code_alpha3: "BIH",
      iso_code_numeric: 70,
      name: "Bosnia and Herzegovina",
      language_code: "bs",
      description: "Bosnia and Herzegovina",
      country_calling_codes: [387],
    },
    {
      id: "5b4bbe01-36e6-4ef7-8d7e-c5a6340ff815",
      iso_code_alpha2: "BW",
      iso_code_alpha3: "BWA",
      iso_code_numeric: 72,
      name: "Botswana",
      language_code: "en",
      description: "Botswana",
      country_calling_codes: [267],
    },
    {
      id: "d67d6f2d-0c46-45d2-b594-5da917767432",
      iso_code_alpha2: "BV",
      iso_code_alpha3: "BVT",
      iso_code_numeric: 74,
      name: "Bouvet Island",
      language_code: "no",
      description: "Bouvet Island",
      country_calling_codes: [55],
    },
    {
      id: "a6de0e47-c5f5-467f-a520-1f426f681d2b",
      iso_code_alpha2: "BR",
      iso_code_alpha3: "BRA",
      iso_code_numeric: 76,
      name: "Brazil",
      language_code: "pt",
      description: "Brazil",
      country_calling_codes: [55],
    },
    {
      id: "a078ead3-fe0b-4ca5-834a-fbfed30b6a06",
      iso_code_alpha2: "IO",
      iso_code_alpha3: "IOT",
      iso_code_numeric: 86,
      name: "British Indian Ocean Territory (the)",
      language_code: "en",
      description: "British Indian Ocean Territory (the)",
      country_calling_codes: [246],
    },
    {
      id: "a074b887-9844-4a7f-a4f6-fbbdce9f5276",
      iso_code_alpha2: "BN",
      iso_code_alpha3: "BRN",
      iso_code_numeric: 96,
      name: "Brunei Darussalam",
      language_code: "ms",
      description: "Brunei Darussalam",
      country_calling_codes: [673],
    },
    {
      id: "5ec3fbc3-6c6d-40e8-876a-4b5f95adfd86",
      iso_code_alpha2: "BG",
      iso_code_alpha3: "BGR",
      iso_code_numeric: 100,
      name: "Bulgaria",
      language_code: "bg",
      description: "Bulgaria",
      country_calling_codes: [359],
    },
    {
      id: "d90aaa20-625c-49fc-ae8b-ff0febd18f73",
      iso_code_alpha2: "BF",
      iso_code_alpha3: "BFA",
      iso_code_numeric: 854,
      name: "Burkina Faso",
      language_code: "fr",
      description: "Burkina Faso",
      country_calling_codes: [226],
    },
    {
      id: "67f43aa7-a4e4-4228-abca-9c6f35e4b3f7",
      iso_code_alpha2: "BI",
      iso_code_alpha3: "BDI",
      iso_code_numeric: 108,
      name: "Burundi",
      language_code: "fr",
      description: "Burundi",
      country_calling_codes: [257],
    },
    {
      id: "0a7af766-1670-49b2-b754-f755ee7c9f97",
      iso_code_alpha2: "CV",
      iso_code_alpha3: "CPV",
      iso_code_numeric: 132,
      name: "Cabo Verde",
      language_code: "pt",
      description: "Cabo Verde",
      country_calling_codes: [238],
    },
    {
      id: "ca080b2d-a420-43bf-b109-25f7f3b26c09",
      iso_code_alpha2: "KH",
      iso_code_alpha3: "KHM",
      iso_code_numeric: 116,
      name: "Cambodia",
      language_code: "km",
      description: "Cambodia",
      country_calling_codes: [855],
    },
    {
      id: "6add071a-055e-483f-95bd-6edf3d1b79c0",
      iso_code_alpha2: "CM",
      iso_code_alpha3: "CMR",
      iso_code_numeric: 120,
      name: "Cameroon",
      language_code: "fr",
      description: "Cameroon",
      country_calling_codes: [237],
    },
    {
      id: "05a85551-9e32-4c1b-8c9b-eb3495e317df",
      iso_code_alpha2: "CA",
      iso_code_alpha3: "CAN",
      iso_code_numeric: 124,
      name: "Canada",
      language_code: "en",
      description: "Canada",
      country_calling_codes: [1],
    },
    {
      id: "48f2aa2f-6b67-4ea6-81a6-ac23521f6f36",
      iso_code_alpha2: "KY",
      iso_code_alpha3: "CYM",
      iso_code_numeric: 136,
      name: "Cayman Islands (the)",
      language_code: "en",
      description: "Cayman Islands (the)",
      country_calling_codes: [1],
    },
    {
      id: "b93f3596-b79e-4c34-bfa8-81841cc5379d",
      iso_code_alpha2: "CF",
      iso_code_alpha3: "CAF",
      iso_code_numeric: 140,
      name: "Central African Republic (the)",
      language_code: "fr",
      description: "Central African Republic (the)",
      country_calling_codes: [236],
    },
    {
      id: "9a8b5826-c37a-483c-b56b-53f1bd652e88",
      iso_code_alpha2: "TD",
      iso_code_alpha3: "TCD",
      iso_code_numeric: 148,
      name: "Chad",
      language_code: "ar",
      description: "Chad",
      country_calling_codes: [235],
    },
    {
      id: "dbe1e250-694a-47a4-ae9f-148a6e1881fa",
      iso_code_alpha2: "CL",
      iso_code_alpha3: "CHL",
      iso_code_numeric: 152,
      name: "Chile",
      language_code: "es",
      description: "Chile",
      country_calling_codes: [56],
    },
    {
      id: "f5d7ee53-9150-4f84-ab9c-ad2acb332867",
      iso_code_alpha2: "CN",
      iso_code_alpha3: "CHN",
      iso_code_numeric: 156,
      name: "China",
      language_code: "zh-hans",
      description: "China",
      country_calling_codes: [86],
    },
    {
      id: "7bbe34b3-41ed-414b-9f6e-56838f450f5d",
      iso_code_alpha2: "CX",
      iso_code_alpha3: "CXR",
      iso_code_numeric: 162,
      name: "Christmas Island",
      language_code: "en",
      description: "Christmas Island",
      country_calling_codes: [61],
    },
    {
      id: "60482cfa-f09a-459f-8818-fc4889e992f5",
      iso_code_alpha2: "CC",
      iso_code_alpha3: "CCK",
      iso_code_numeric: 166,
      name: "Cocos (Keeling) Islands (the)",
      language_code: "en",
      description: "Cocos (Keeling) Islands (the)",
      country_calling_codes: [61],
    },
    {
      id: "19063232-98ae-43ee-97a9-483161e562e0",
      iso_code_alpha2: "CO",
      iso_code_alpha3: "COL",
      iso_code_numeric: 170,
      name: "Colombia",
      language_code: "es",
      description: "Colombia",
      country_calling_codes: [57],
    },
    {
      id: "fa09257c-f91e-4970-b41d-95aacb41a604",
      iso_code_alpha2: "HR",
      iso_code_alpha3: "HRV",
      iso_code_numeric: 191,
      name: "Croatia",
      language_code: "hr",
      description: "Croatia",
      country_calling_codes: [385],
    },
    {
      id: "d1979abb-bd94-4a28-841b-211cb158acf9",
      iso_code_alpha2: "GR",
      iso_code_alpha3: "GRC",
      iso_code_numeric: 300,
      name: "Greece",
      language_code: "el",
      description: "Greece",
      country_calling_codes: [30],
    },
    {
      id: "bdfd5912-b0bb-4ac6-87a9-fca9a22ff150",
      iso_code_alpha2: "ES",
      iso_code_alpha3: "ESP",
      iso_code_numeric: 724,
      name: "Spain",
      language_code: "es",
      description: "Spain",
      country_calling_codes: [34],
    },
  ],
  hierarchicalGroups: [
    {
      id: "68f8efc9-ab4e-4213-8fe2-63d1dd0f6db8",
      language_code: "en",
      code: "PROMOTIONAL_OPTIONS",
      name: "Promotional Options",
    },
    {
      id: "55313338-8fbc-4388-8e95-ca8e9792d68e",
      language_code: "en",
      code: "OWN_OFFER",
      name: "Own offer classification",
    },
    {
      id: "9067170f-de64-495e-8759-e483fd4bdcf3",
      language_code: "en",
      code: "FEATURE",
      name: "Features",
      description:
        "Please select the features that apply to your experience. These will appear as icons on the product page",
    },
  ],
  currencies: [
    { id: "1", name: "USD", code: "USD", symbol: "$" },
    { id: "2", name: "EUR", code: "EUR", symbol: "€" },
  ],
  suppliers: [
    {
      id: "test-supplier-id",
      source: "NOVA",
      name: "nova test supplier",
      email: "test@example.com",
      commission: 1.5,
    },
    {
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      source: "BP",
      name: "Musement",
      email: "Musement@tui.com",
      commission: 25.2,
    },
    { id: "1", name: "Supplier 1", email: "sup1@plier.com" },
    { id: "2", name: "Supplier 2", email: "sup2@plier.com" },
  ],
  venues: [
    {
      id: "1a2b3c4d-5678-9101-1121-314151617181",
      code: "DBV1",
      name: "Old Town Dubrovnik",
      city: "DBV",
      latitude: 42.6414,
      longitude: 18.1099,
      address: "Stradun, Dubrovnik, Croatia",
      language_code: "en",
    },
    {
      id: "2b3c4d5e-6789-1011-1213-141516171819",
      code: "ZAD1",
      name: "Town in Split",
      city: "SPU",
      latitude: 42.6405,
      longitude: 18.1059,
      address: "Ul. od Tabakarije 29, 20000, Dubrovnik, Croatia",
      language_code: "en",
    },
    {
      id: "3c4d5e6f-7890-1011-1213-141516176677",
      code: "ZAD2",
      name: "Colosseum",
      city: "SPU",
      latitude: 43.5081,
      longitude: 16.4402,
      address: "Dioklecijanova ul. 1, 21000, Split, Croatia",
      language_code: "en",
    },
    {
      id: "3c4d5e6f-7890-1011-1213-141516177788",
      code: "XLC",
      name: "Temple of Jupiter",
      city: "XLC",
      latitude: 43.5081,
      longitude: 16.4402,
      address: "Dioklecijanova ul. 1, 21000, Split, Croatia",
      language_code: "en",
    },
    {
      id: "3c4d5e6f-7890-1011-1213-141516178899",
      code: "CFU1",
      name: "Olympic Palace",
      city: "CFU",
      latitude: 43.5081,
      longitude: 16.4402,
      address: "Corfu, Greece",
      language_code: "en",
    },
  ],
};

export const mockMasterDataPaxList: Pax[] = [
  {
    id: "1",
    name: "adult",
    description: "Adult",
    type: "PERSON",
    age_from: 18,
    age_to: 99,
    all_ages: false,
    language_code: "en",
    free_of_charge: false,
  },
  {
    id: "2",
    name: "child",
    description: "Child",
    type: "PERSON",
    all_ages: false,
    age_from: 0,
    age_to: 17,
    free_of_charge: false,
    language_code: "en",
  },
  {
    id: "3",
    name: "infant",
    description: "Infant",
    type: "PERSON",
    all_ages: false,
    age_from: 0,
    age_to: 2,
    free_of_charge: false,
    language_code: "en",
  },
  {
    id: "4",
    name: "student",
    description: "Student",
    type: "PERSON",
    all_ages: false,
    age_from: 6,
    age_to: 25,
    free_of_charge: false,
    language_code: "en",
  },
  {
    id: "5",
    name: "senior",
    description: "Senior",
    type: "PERSON",
    all_ages: false,
    age_from: 65,
    age_to: 99,
    free_of_charge: false,
    language_code: "en",
  },
];

export async function mockMasterData(page: Page) {
  await page.route(`${experienceMasterDataURL}/highlights*`, async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: mockData.highlights?.map((d) => JSON.stringify(d)).join("\n\r"),
    });
  });

  await page.route(`${experienceMasterDataURL}/pax*`, async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: mockMasterDataPaxList.map((d) => JSON.stringify(d)).join("\n\r"),
    });
  });

  await page.route(`${experienceMasterDataURL}/included*`, async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: mockData.included?.map((d) => JSON.stringify(d)).join("\n\r"),
    });
  });

  await page.route(`${experienceMasterDataURL}/important-information*`, async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: mockData.importantInformation?.map((d) => JSON.stringify(d)).join("\n\r"),
    });
  });
  await page.route(`${contentMasterDataURL}/content-statuses*`, async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: mockData.contentStatuses?.map((d) => JSON.stringify(d)).join("\n\r"),
    });
  });
  await page.route(`${contentCommandURL}/flows*`, async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: mockData.contentFlows.map((f) => JSON.stringify(f)).join("\n\r"),
    });
  });
  await page.route(`${experienceMasterDataURL}/additional-services*`, async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: mockData.additionalServices.map((d) => JSON.stringify(d)).join("\n\r"),
    });
  });
  await page.route(`${experienceMasterDataURL}/categories*`, async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: mockData.categories.map((d) => JSON.stringify(d)).join("\n\r"),
    });
  });
  await page.route(`${experienceMasterDataURL}/interests*`, async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: mockData.interests.map((d) => JSON.stringify(d)).join("\n\r"),
    });
  });
  await page.route(`${experienceMasterDataURL}/markets*`, async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: mockData.markets.map((d) => JSON.stringify(d)).join("\n\r"),
    });
  });

  await page.route(`${experienceMasterDataURL}/hierarchical-groups*`, async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: mockData.markets.map((d) => JSON.stringify(d)).join("\n\r"),
    });
  });

  await page.route(`${geoMasterDataURL}/cities*`, async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: mockData.cities.map((d) => JSON.stringify(d)).join("\n\r"),
    });
  });

  await page.route(`${geoMasterDataURL}/countries*`, async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: mockData.countries.map((d) => JSON.stringify(d)).join("\n\r"),
    });
  });

  await page.route(`${contractMasterDataURL}/currencies`, async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: mockData.currencies.map((d) => JSON.stringify(d)).join("\n\r"),
    });
  });

  await page.route(`${contractMasterDataURL}/suppliers`, async (route) => {
    await route.fulfill({
      status: 200,
      headers,
      body: mockData.suppliers.map((d) => JSON.stringify(d)).join("\n\r"),
    });
  });

  await page.route(`${geoMasterDataURL}/venues*`, async (route, req) => {
    if (req.method() === "GET") {
      // Parse the URL and extract the city codes
      const searchParams = new URLSearchParams(new URL(req.url()).search);
      const filtersParam = searchParams.get("filters");
      // example filtersParam: filters=city=in=(XLC,ZAD)
      const cityCodesMatch = filtersParam?.match(/city=in=\((.*?)\)/);
      const cityCodes = cityCodesMatch ? cityCodesMatch[1].split(",") : [];
      // Filter venues based on the city codes
      const filteredVenues = mockData.venues.filter((venue) => cityCodes.includes(venue.city));

      await route.fulfill({
        status: 200,
        body: JSON.stringify(filteredVenues),
      });
    } else {
      throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  await mockRequest(page, `${experienceMasterDataURL}/booking-questions`, "GET", {
    responseBody: mockQuestionMasterData,
  });
}
