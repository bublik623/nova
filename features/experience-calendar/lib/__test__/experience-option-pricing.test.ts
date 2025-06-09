import { describe, test, expect, vi, beforeEach } from "vitest";
import * as pricingLib from "../experience-option-pricing";
import { HolderCard, PricingCard } from "@/types/Pricing";
import { Pricing } from "@/types/generated/OfferServiceApiOld";
import { PaxPricing } from "../../components/PricingFormPaxPricingList/PricingFormPaxPricingTypes";
import { Pax, Pricing as NewApiPricing } from "@/types/generated/OfferServiceApi";

const useFeatureFlagMock = vi.hoisted(() => vi.fn());
vi.mock("@/features/experience-shared/composables/useFeatureFlag", () => {
  return { useFeatureFlag: useFeatureFlagMock };
});

const pricings: Pricing[] = [
  {
    id: "pricing-child",
    name: "Summer season",
    holder: "child",
    age_range: { from: 1, to: 17 },
    pricing_type: "person",
    option: "option-id",
    tiers: [{ from: 1, to: 8, retail_price: 70.0, commission: 33, net_price: 46.9 }],
  },
  {
    id: "pricing-adult",
    name: "Summer season",
    holder: "adult",
    age_range: { from: 18, to: 45 },
    pricing_type: "person",
    option: "option-id",
    tiers: [{ from: 1, to: 4, retail_price: 100.0, commission: 34, net_price: 66.0 }],
  },
  {
    id: "pricing-adult",
    name: "Winter season",
    holder: "adult",
    age_range: { from: 18, to: 45 },
    pricing_type: "person",
    option: "option-id",
    tiers: [{ from: 1, to: 4, retail_price: 100.0, commission: 34, net_price: 66.0 }],
  },
];

vi.mock("@/utils/uuid", () => ({
  uuid: () => "test-uuid",
}));

describe("Pricing Lib", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("mapPricingsToPricingCards", () => {
    test("mapPricingsToPricingCards", () => {
      expect(pricingLib.mapPricingsToPricingCards(pricings)).toStrictEqual<PricingCard[]>([
        expect.objectContaining({
          cardId: "test-uuid",
          pricingName: "Summer season",
          holders: [
            {
              pricingIndex: 0,
              cardId: "test-uuid",
              cardTitle: "",
              isChanged: false,
              fields: {
                ...pricings[0],
              },
              isDeleteModalVisible: false,
            },
            {
              pricingIndex: 1,
              cardId: "test-uuid",
              cardTitle: "",
              isChanged: false,
              fields: {
                ...pricings[1],
              },
              isDeleteModalVisible: false,
            },
          ],
          isOpen: true,
          isDeleteModalVisible: false,
        }),
        expect.objectContaining({
          cardId: "test-uuid",
          pricingName: "Winter season",
          holders: [
            {
              pricingIndex: 2,
              cardId: "test-uuid",
              cardTitle: "",
              isChanged: false,
              fields: {
                ...pricings[2],
              },
              isDeleteModalVisible: false,
            },
          ],
          isOpen: false,
          isDeleteModalVisible: false,
        }),
      ]);
    });

    test("paxPricingList should contain the list of PaxPricing mapped by mapApiPricingsToPaxPricings", () => {
      const result = pricingLib.mapPricingsToPricingCards(pricings);

      expect(result).toStrictEqual<PricingCard[]>([
        expect.objectContaining<Partial<PricingCard>>({
          pricingName: "Summer season",
          paxPricingList: [
            {
              id: "pricing-child",
              paxTypeCode: "child",
              pricing: {
                retailPrice: 70.0,
                commissionPercentage: 33,
                netPrice: 46.9,
                purchasableAmountConstraint: { min: 1, max: 8 },
              },
            },
            {
              id: "pricing-adult",
              paxTypeCode: "adult",
              pricing: {
                retailPrice: 100.0,
                commissionPercentage: 34,
                netPrice: 66,
                purchasableAmountConstraint: { min: 1, max: 4 },
              },
            },
          ],
        }),
        expect.objectContaining<Partial<PricingCard>>({
          pricingName: "Winter season",
          paxPricingList: [
            {
              id: "pricing-adult",
              paxTypeCode: "adult",
              pricing: {
                retailPrice: 100.0,
                commissionPercentage: 34,
                netPrice: 66,
                purchasableAmountConstraint: { min: 1, max: 4 },
              },
            },
          ],
        }),
      ]);
    });
  });

  test("groupPricingItemsByName", () => {
    expect(pricingLib.groupPricingItemsByName(pricings)).toStrictEqual({
      "Summer season": [pricings[0], pricings[1]],
      "Winter season": [pricings[2]],
    });
  });

  test("createPricingCard", () => {
    expect(pricingLib.createPricingCard("New pricing")).toStrictEqual({
      cardId: "test-uuid",
      pricingName: "New pricing",
      holders: [],
      paxPricingList: [],
      paxTypes: [],
      isOpen: false,
      isDeleteModalVisible: false,
    });
    expect(pricingLib.createPricingCard("New pricing", { isOpen: true })).toStrictEqual({
      cardId: "test-uuid",
      pricingName: "New pricing",
      holders: [],
      paxPricingList: [],
      paxTypes: [],
      isOpen: true,
      isDeleteModalVisible: false,
    });
  });

  test("createHolderCard", () => {
    expect(pricingLib.createHolderCard(pricings[0])).toStrictEqual<HolderCard>({
      pricingIndex: 0,
      cardId: "test-uuid",
      cardTitle: "",
      isChanged: false,
      fields: pricings[0],
      isDeleteModalVisible: false,
    });
    expect(pricingLib.createHolderCard(pricings[0], { isChanged: true })).toStrictEqual<HolderCard>({
      pricingIndex: 0,
      cardId: "test-uuid",
      cardTitle: "",
      isChanged: true,
      fields: pricings[0],
      isDeleteModalVisible: false,
    });
  });

  test("getDefaultPricingFields for person pricing type", () => {
    expect(pricingLib.getDefaultPricingFields("option-id", "person")).toStrictEqual({
      name: "",
      holder: "",
      age_range: {
        from: 0,
        to: 0,
      },
      option: "option-id",
      pricing_type: "person",
      tiers: [
        {
          from: 1,
          to: 15,
          retail_price: 1,
          commission: 0,
          net_price: 0,
        },
      ],
    });
  });

  test("getDefaultPricingFields for group pricing type", () => {
    expect(pricingLib.getDefaultPricingFields("option-id", "group")).toStrictEqual({
      name: "",
      holder: "",
      age_range: {
        from: 0,
        to: 0,
      },
      option: "option-id",
      pricing_type: "group",
      tiers: [
        {
          from: 1,
          to: 15,
          retail_price: 1,
          commission: 0,
          net_price: 0,
        },
      ],
    });
  });

  test("getDefaultPricingFields for all ages pricing type", () => {
    expect(pricingLib.getDefaultPricingFields("option-id", "person", true)).toStrictEqual({
      name: "",
      holder: "",
      age_range: {
        from: 0,
        to: 99,
      },
      option: "option-id",
      pricing_type: "person",
      tiers: [
        {
          from: 1,
          to: 15,
          retail_price: 1,
          commission: 0,
          net_price: 0,
        },
      ],
    });
  });

  test("getAgeRequiredHolders returns list of holders requiring age specification", () => {
    const result = pricingLib.getAgeRequiredHolders();

    expect(result).toEqual([
      { is_age_required: true, label: "Participant", value: "participant" },
      { is_age_required: true, label: "Student", value: "student" },
      { is_age_required: true, label: "EU citizen", value: "eu-citizen" },
      { is_age_required: true, label: "EU teacher", value: "eu-teacher" },
      { is_age_required: true, label: "Military", value: "military" },
      { is_age_required: true, label: "Person with disability", value: "person with disability" },
      { is_age_required: true, label: "Caregiver", value: "caregiver" },
    ]);
  });

  describe("mapApiPricingsToPaxPricings", () => {
    test("it should return an array containing one element for each Pricing with 'person' pricing_type contained in the given array", () => {
      const pricingsWithoutDuplicates = [pricings[0], pricings[1]];
      const groupPricingHolderPrefix = "group-";
      const groupPricings = pricingsWithoutDuplicates.map<Pricing>((pricing) => ({
        ...pricing,
        holder: `${groupPricingHolderPrefix}-${pricing.holder}`,
        pricing_type: "group",
      }));

      const result = pricingLib.mapApiPricingsToPaxPricings(pricingsWithoutDuplicates.concat(groupPricings));

      // verify that the item count in the results correspond with the pricings length (the pricing array only contains pricings with 'person' price type)
      expect(result.length).toBe(pricingsWithoutDuplicates.length);
      // verify that the items in the result actually correspond to the pricings with 'person' price type
      expect(result.filter((paxPricing) => paxPricing.paxTypeCode.startsWith(groupPricingHolderPrefix)).length).toBe(0);
    });

    test("it should map each Pricing with 'person' pricing_type contained in the given array to a PaxPricing object", () => {
      const expectedResult: PaxPricing[] = [
        {
          id: "pricing-child",
          paxTypeCode: "child",
          pricing: {
            retailPrice: 70.0,
            commissionPercentage: 33,
            netPrice: 46.9,
            purchasableAmountConstraint: {
              min: 1,
              max: 8,
            },
          },
        },
        {
          id: "pricing-adult",
          paxTypeCode: "adult",
          pricing: {
            retailPrice: 100.0,
            commissionPercentage: 34,
            netPrice: 66,
            purchasableAmountConstraint: {
              min: 1,
              max: 4,
            },
          },
        },
      ];

      const result = pricingLib.mapApiPricingsToPaxPricings([pricings[0], pricings[1]]);

      expect(result).toStrictEqual(expectedResult);
    });

    test("it should throw an error if more than one Pricing for the same pax type exists in the given array", () => {
      expect(() => pricingLib.mapApiPricingsToPaxPricings(pricings)).toThrowError(
        "more than one Pricing for the same pax type(s): adult"
      );
    });
  });

  describe("mapApiPaxesToPaxTypes", () => {
    const apiPaxes: Pax[] = [
      {
        pax_code: "adult",
        pax_type: "PERSON",
        free_of_charge: false,
        all_ages: false,
        age_from: 18,
        age_to: 60,
      },
      {
        pax_code: "child",
        pax_type: "PERSON",
        free_of_charge: true,
        all_ages: true,
        age_from: 3,
        age_to: 12,
      },
    ];

    test("it should return an array containing the mapped PaxTypes", () => {
      const result = pricingLib.mapApiPaxesToPaxTypes(apiPaxes);

      expect(result).toStrictEqual([
        {
          code: "adult",
          freeOfCharge: false,
          label: "Adult",
          allAges: false,
          ageFrom: 18,
          ageTo: 60,
        },
        {
          code: "child",
          freeOfCharge: true,
          label: "Child",
          allAges: true,
          ageFrom: 3,
          ageTo: 12,
        },
      ]);
    });

    test("it should return an empty array when the given array is undefined", () => {
      const result = pricingLib.mapApiPaxesToPaxTypes(undefined);

      expect(result).toStrictEqual([]);
    });
  });

  describe("mapPaxPricingsToApiPricings", () => {
    test("it should throw an error when the pax type of one of the elements can't be found", () => {
      expect(() =>
        pricingLib.mapPaxPricingsToApiPricings(
          "opt-id",
          "winter season",
          [],
          [{ id: undefined, paxTypeCode: "adult", pricing: { retailPrice: 1, commissionPercentage: 0, netPrice: 1 } }]
        )
      ).toThrow("can't find pax type adult");
    });

    test("it should return an array containing the mapped pricings", () => {
      const result = pricingLib.mapPaxPricingsToApiPricings(
        "opt-id",
        "winter season",
        [
          { code: "child", label: "child", freeOfCharge: false, allAges: false, ageFrom: 1, ageTo: 6 },
          { code: "adult", label: "adult", freeOfCharge: false, allAges: false, ageFrom: 18, ageTo: 60 },
        ],
        [
          { id: undefined, paxTypeCode: "child", pricing: { retailPrice: 1, commissionPercentage: 0, netPrice: 1 } },
          {
            id: "pricing-id",
            paxTypeCode: "adult",
            pricing: { retailPrice: 10, commissionPercentage: 10, netPrice: 9 },
          },
        ]
      );

      expect(result).toStrictEqual([
        {
          id: undefined,
          option_id: "opt-id",
          name: "winter season",
          holder: "child",
          age_range: { from: 1, to: 6 },
          pricing_type: "person",
          tiers: [{ retail_price: 1, commission: 0, net_price: 1, from: undefined, to: undefined }],
        },
        {
          id: "pricing-id",
          option_id: "opt-id",
          name: "winter season",
          holder: "adult",
          age_range: { from: 18, to: 60 },
          pricing_type: "person",
          tiers: [{ retail_price: 10, commission: 10, net_price: 9, from: undefined, to: undefined }],
        },
      ]);
    });
  });

  describe("getNewOrEditedPricings", () => {
    const workingCopy: NewApiPricing[] = [
      {
        id: undefined,
        option_id: "opt-id",
        name: "winter season",
        holder: "child",
        age_range: { from: 1, to: 6 },
        pricing_type: "person",
        tiers: [{ retail_price: 1, commission: 0, net_price: 1, from: undefined, to: undefined }],
      },
      {
        id: "pricing-id-adult",
        option_id: "opt-id",
        name: "winter season",
        holder: "adult",
        age_range: { from: 18, to: 60 },
        pricing_type: "person",
        tiers: [{ retail_price: 10, commission: 10, net_price: 9, from: undefined, to: undefined }],
      },
    ];
    const lastSavedVersion: NewApiPricing[] = [
      {
        id: "pricing-id-adult",
        option_id: "opt-id",
        name: "winter season",
        holder: "adult",
        age_range: { from: 18, to: 60 },
        pricing_type: "person",
        tiers: [{ retail_price: 10, commission: 20, net_price: 8, from: undefined, to: undefined }],
      },
    ];

    test("it returns not yet saved pricings", () => {
      const result = pricingLib.getNewOrEditedPricings(workingCopy, lastSavedVersion);

      expect(result).toStrictEqual(
        expect.arrayContaining([
          {
            id: undefined,
            option_id: "opt-id",
            name: "winter season",
            holder: "child",
            age_range: { from: 1, to: 6 },
            pricing_type: "person",
            tiers: [{ retail_price: 1, commission: 0, net_price: 1, from: undefined, to: undefined }],
          },
        ])
      );
    });

    test("it returns items that have different pricings tiers from their last saved version", () => {
      const result = pricingLib.getNewOrEditedPricings(workingCopy, lastSavedVersion);

      expect(result).toStrictEqual(
        expect.arrayContaining([
          {
            id: "pricing-id-adult",
            option_id: "opt-id",
            name: "winter season",
            holder: "adult",
            age_range: { from: 18, to: 60 },
            pricing_type: "person",
            tiers: [{ retail_price: 10, commission: 10, net_price: 9, from: undefined, to: undefined }],
          },
        ])
      );
    });
  });

  describe("getRemovedPricings", () => {
    const workingCopy: NewApiPricing[] = [
      {
        id: undefined,
        option_id: "opt-id",
        name: "winter season",
        holder: "child",
        age_range: { from: 1, to: 6 },
        pricing_type: "person",
        tiers: [{ retail_price: 1, commission: 0, net_price: 1, from: undefined, to: undefined }],
      },
      {
        id: "pricing-id-senior",
        option_id: "opt-id",
        name: "winter season",
        holder: "senior",
        age_range: { from: 61, to: 99 },
        pricing_type: "person",
        tiers: [{ retail_price: 9, commission: 10, net_price: 8.1, from: undefined, to: undefined }],
      },
    ];
    const lastSavedVersion: NewApiPricing[] = [
      {
        id: "pricing-id-adult",
        option_id: "opt-id",
        name: "winter season",
        holder: "adult",
        age_range: { from: 18, to: 60 },
        pricing_type: "person",
        tiers: [{ retail_price: 10, commission: 20, net_price: 8, from: undefined, to: undefined }],
      },
    ];

    test("it returns items that no longer exists in the working copy", () => {
      const result = pricingLib.getRemovedPricings(workingCopy, lastSavedVersion);

      expect(result).toStrictEqual([
        {
          id: "pricing-id-adult",
          option_id: "opt-id",
          name: "winter season",
          holder: "adult",
          age_range: { from: 18, to: 60 },
          pricing_type: "person",
          tiers: [{ retail_price: 10, commission: 20, net_price: 8, from: undefined, to: undefined }],
        },
      ]);
    });
  });
});
