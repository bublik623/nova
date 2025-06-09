/* eslint-disable prefer-promise-reject-errors */
import { setActivePinia, createPinia } from "pinia";
import { describe, expect, test, beforeEach, afterEach, vi, beforeAll } from "vitest";
import { Option, Pricing } from "@/types/generated/OfferServiceApiOld";
import { usePricingStore } from "@/features/experience-calendar/store/usePricingStore";
import { HolderCard, PricingCard } from "@/types/Pricing";
import { mapPricingsToPricingCards } from "../../lib/experience-option-pricing";
import { Pax } from "@/types/generated/OfferServiceApi";

const useFeatureFlagMock = vi.hoisted(() => vi.fn());
vi.mock("@/features/experience-shared/composables/useFeatureFlag", () => {
  return { useFeatureFlag: useFeatureFlagMock };
});

const mockOption: Option = {
  id: "option-id",
  capacity_type: "unlimited",
  duration: "P0Y0M1DT0H0M0S",
  experience: "experience-id",
  multilanguage: false,
  name: "Hello",
  status: "DRAFT",
  pricing_type_allowed: "person",
};

function getMockPricings(): Pricing[] {
  return [
    {
      id: "pricing-child",
      name: "Summer season",
      holder: "child",
      age_range: { from: 1, to: 17 },
      option: "option-id",
      pricing_type: "person",
      tiers: [{ from: 1, to: 8, retail_price: 70.0, commission: 33, net_price: 46.9 }],
    },
    {
      id: "pricing-adult",
      name: "Summer season",
      holder: "adult",
      age_range: { from: 18, to: 45 },
      option: "option-id",
      pricing_type: "person",
      tiers: [{ from: 1, to: 4, retail_price: 100.0, commission: 34, net_price: 66.0 }],
    },
  ];
}

const mockExperiencePaxes: Pax[] = [
  { pax_code: "child", pax_type: "PERSON", all_ages: false, age_from: 1, age_to: 17, free_of_charge: false },
  { pax_code: "adult", pax_type: "PERSON", all_ages: false, age_from: 18, age_to: 45, free_of_charge: false },
  { pax_code: "senior", pax_type: "PERSON", all_ages: false, age_from: 46, age_to: 99, free_of_charge: false },
];

const offerServiceMock = {
  getOption: vi.fn(),
  putOption: vi.fn(() => Promise.resolve()),
  getPricings: vi.fn(),
  createPricing: vi.fn(() => Promise.resolve({ data: { id: "new-id" } })),
  updatePricing: vi.fn(() => Promise.resolve({ data: { id: "new-id" } })),
  deletePricing: vi.fn(() => Promise.resolve()),
  getAvailabilities: vi.fn(() => Promise.resolve({ data: [] })),
  createAvailability: vi.fn(() => Promise.resolve({ data: { id: "new-id" } })),
  updateAvailability: vi.fn(() => Promise.resolve({ data: { id: "new-id" } })),
  deleteAvailability: vi.fn(() => Promise.resolve()),
  getExperiencePaxes: vi.fn(),
};

vi.mock("@/composables/useOfferServiceApi", () => ({
  useOfferServiceApi: () => offerServiceMock,
}));
vi.mock("@/utils/uuid", () => ({
  uuid: () => "test-uuid",
}));

const customerDetailsStoreMock = { loadData: vi.fn() };
vi.mock("@/features/experience-calendar/store/useCustomerDetailsStore", () => ({
  useCustomerDetailsStore: () => customerDetailsStoreMock,
}));

const pickupsStoreMock = { loadData: vi.fn() };
vi.mock("@/features/experience-calendar/store/usePickupsStore", () => ({
  usePickupsStore: () => pickupsStoreMock,
}));

vi.stubGlobal("useRoute", () => ({ params: { optionId: "option-id" } }));

describe("usePricingStore", () => {
  let store: ReturnType<typeof usePricingStore>;

  beforeAll(() => {
    setActivePinia(createPinia());
    store = usePricingStore();
  });

  beforeEach(async () => {
    vi.useFakeTimers();

    vi.spyOn(offerServiceMock, "getOption").mockImplementation(() => Promise.resolve({ data: mockOption }));
    vi.spyOn(offerServiceMock, "getPricings").mockImplementation(() => Promise.resolve({ data: getMockPricings() }));
    vi.spyOn(offerServiceMock, "getExperiencePaxes").mockImplementation(() =>
      Promise.resolve({ data: { experience_id: "id", pax_list: mockExperiencePaxes } })
    );

    await store.loadData("exp-id", "option-id");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getters", () => {
    test("pricings", () => {
      const expectedResult = getMockPricings();
      expect(store.pricings).toStrictEqual(expectedResult);
    });
  });

  describe("actions", () => {
    describe("deletePricingCard", () => {
      test("it should call the offer service to delete the pricing", async () => {
        const holdersToDelete = [{ fields: { id: "holder-1" }, cardId: "holder-card-1" }];

        await store.deletePricingCard("option-id", "test-uuid", holdersToDelete as HolderCard[]);

        expect(offerServiceMock.deletePricing).toHaveBeenCalledWith("holder-1");
      });

      test("it should remove the pricing card from the store", async () => {
        store.state.pricingCards.push({
          cardId: "test-delete",
          pricingName: "Summer season",
          holders: [
            {
              cardId: "test-delete",
              cardTitle: "",
              isChanged: false,
              fields: {
                id: "pricing-child",
                name: "Summer season",
                holder: "child",
                option: "option-id",
              },
              isDeleteModalVisible: false,
            },
          ],
          isOpen: true,
          isDeleteModalVisible: false,
        } as PricingCard);

        const holdersToDelete = [{ fields: { id: "holder-1" }, cardId: "test-delete" }];
        expect(store.state.pricingCards.length).toBe(2);

        await store.deletePricingCard("option-id", "test-delete", holdersToDelete as HolderCard[]);

        expect(store.state.pricingCards.length).toBe(1);
        expect(store.state.pricingCards[0].cardId).not.toBe("test-delete");
      });
    });

    describe("save", () => {
      describe("new pax feature disabled", () => {
        beforeEach(() => {
          useFeatureFlagMock.mockReturnValueOnce(false);
        });

        test("it should call the offer service to update the pricing", async () => {
          const mockPricings = getMockPricings();
          store.state.pricingCards[0].holders[0].isChanged = true;
          const expected = { ...mockPricings[0] };
          await store.save("option-id");
          expect(offerServiceMock.updatePricing).toHaveBeenCalledWith(expected);
        });

        describe("if the holder is new", () => {
          test("it should call the offer service to create the pricing", async () => {
            const mockPricings = getMockPricings();
            store.state.pricingCards[0].holders[0].isChanged = true;
            store.state.pricingCards[0].holders[0].fields.id = undefined;
            const expected = { ...mockPricings[0], id: undefined };

            await store.save("option-id");
            expect(offerServiceMock.createPricing).toHaveBeenCalledWith(expected);
          });
        });
      });

      describe("new pax feature enabled", () => {
        beforeEach(() => {
          useFeatureFlagMock.mockReturnValueOnce(true);
        });

        test("it throw an error if the option id is undefined", async () => {
          store.state.optionId = undefined;

          await expect(() => store.save("option-id")).rejects.toThrow("No optionId");
        });

        test("it creates new pricings", async () => {
          store.state.pricingCards[0].paxPricingList.push({
            id: undefined,
            paxTypeCode: "senior",
            pricing: { retailPrice: 100, commissionPercentage: 10, netPrice: 90 },
          });

          await store.save("option-id");

          expect(offerServiceMock.createPricing).toHaveBeenCalledOnce();
          expect(offerServiceMock.createPricing).toHaveBeenCalledWith({
            id: undefined,
            option_id: store.state.optionId,
            pricing_type: "person",
            holder: "senior",
            name: store.state.pricingCards[0].pricingName,
            age_range: { from: 46, to: 99 },
            tiers: [
              {
                retail_price: 100,
                commission: 10,
                net_price: 90,
                from: undefined,
                to: undefined,
              },
            ],
          });
        });

        test("it updates changed pricings", async () => {
          store.state.pricingCards[0].paxPricingList[1].pricing.commissionPercentage = 35;
          store.state.pricingCards[0].paxPricingList[1].pricing.netPrice = 65;

          await store.save("option-id");

          expect(offerServiceMock.updatePricing).toHaveBeenCalledOnce();
          expect(offerServiceMock.updatePricing).toHaveBeenCalledWith({
            id: "pricing-adult",
            option_id: store.state.optionId,
            pricing_type: "person",
            holder: "adult",
            name: store.state.pricingCards[0].pricingName,
            age_range: { from: 18, to: 45 },
            tiers: [
              {
                retail_price: 100,
                commission: 35,
                net_price: 65,
                from: 1,
                to: 4,
              },
            ],
          });
        });

        test("it delete removed pricings", async () => {
          store.state.pricingCards[0].paxPricingList.splice(0, 1);

          await store.save("option-id");

          expect(offerServiceMock.deletePricing).toHaveBeenCalledOnce();
          expect(offerServiceMock.deletePricing).toHaveBeenCalledWith("pricing-child");
        });

        test("it refresh data", async () => {
          await store.save("option-id");

          expect(offerServiceMock.getPricings).toHaveBeenCalledTimes(2);
        });
      });
    });

    describe("handleAddPricing", () => {
      test("it should add a new pricing card", () => {
        expect(store.state.pricingCards.length).toBe(1);
        store.handleAddPricing("option-id", "person");
        expect(store.state.pricingCards.length).toBe(2);
        expect(store.state.pricingCards[1]).toStrictEqual({
          cardId: "test-uuid",
          holders: [
            {
              cardId: "test-uuid",
              cardTitle: "",
              fields: {
                age_range: {
                  from: 0,
                  to: 0,
                },
                holder: "",
                name: "",
                option: "option-id",
                pricing_type: "person",
                tiers: [
                  {
                    commission: 0,
                    from: 1,
                    net_price: 0,
                    retail_price: 1,
                    to: 15,
                  },
                ],
              },
              isChanged: false,
              isDeleteModalVisible: false,
              pricingIndex: 2,
            },
          ],
          paxPricingList: [],
          isDeleteModalVisible: false,
          isOpen: true,
          paxTypes: [],
          pricingName: "",
        });
      });

      test("it should add a group with default correctly", async () => {
        expect(store.state.pricingCards.length).toBe(1);
        store.handleAddPricing("option-id", "group");
        expect(store.state.pricingCards.length).toBe(2);

        expect(store.state.pricingCards[1]).toStrictEqual({
          cardId: "test-uuid",
          holders: [
            {
              cardId: "test-uuid",
              cardTitle: "",
              fields: {
                age_range: {
                  from: 0,
                  to: 0,
                },
                holder: "",
                name: "",
                option: "option-id",
                pricing_type: "group",
                tiers: [
                  {
                    commission: 0,
                    from: 1,
                    net_price: 0,
                    retail_price: 1,
                    to: 15,
                  },
                ],
              },
              isChanged: false,
              isDeleteModalVisible: false,
              pricingIndex: 2,
            },
          ],
          paxPricingList: [],
          isDeleteModalVisible: false,
          isOpen: true,
          paxTypes: [],
          pricingName: "",
        });
      });
    });

    describe("handleAddHolder", () => {
      test("it should add a holder to a pricing card", () => {
        expect(store.state.pricingCards[0].holders.length).toBe(2);

        store.handleAddHolder(store.state.pricingCards[0], "option-id", "person");

        expect(store.state.pricingCards[0].holders.length).toBe(3);
        expect(store.state.pricingCards[0].holders[2]).toStrictEqual({
          cardId: "test-uuid",
          cardTitle: "",
          isChanged: false,
          isDeleteModalVisible: false,
          pricingIndex: 2,
          fields: {
            age_range: {
              from: 0,
              to: 0,
            },
            holder: "",
            name: "Summer season",
            pricing_type: "person",
            option: "option-id",
            tiers: [
              {
                commission: 0,
                from: 1,
                net_price: 0,
                retail_price: 1,
                to: 15,
              },
            ],
          },
        });
      });
    });

    describe("getPricingError", () => {
      test("it should return a boolean indicating whether or not there is an error for the given field", () => {
        store.state.pricingCards.push({
          cardId: "test-uuid",
          pricingName: "",
          holders: [
            { fields: { name: "", tiers: [{ from: 1, to: 2 }], holder: "student", age_range: { from: 18, to: 35 } } },
          ],
          isOpen: true,
          isDeleteModalVisible: false,
        } as PricingCard);
        vi.runAllTimers();

        expect(store.getPricingError("0.name")).toBe(false);
        expect(store.getPricingError("2.name")).toBe(true); // name is required
        expect(store.getPricingError("2.age_range")).toBe(false); // no overlap issues
      });

      test("it should error when there are overlapping ages", () => {
        const mockPricings = getMockPricings();
        store.state.pricingCards.push({
          cardId: "test-uuid",
          pricingName: "test-name",
          holders: [{ fields: { ...mockPricings[0], name: "" } }],
          isOpen: true,
          isDeleteModalVisible: false,
        } as PricingCard);

        // Add an overlapping holder
        store.handleAddHolder(store.state.pricingCards[0], "option-id", "person");
        store.state.pricingCards[0].holders[2].fields.age_range.from = 35;
        store.state.pricingCards[0].holders[2].fields.age_range.to = 55;
        vi.runAllTimers();

        expect(store.getPricingError("2.age_range")).toBe(true);
        expect(store.getPricingError("3.age_range")).toBe(false);
      });

      test("it should NOT error if those overlapping ages are all ages (0-99)", async () => {
        const mockPricings = getMockPricings();
        const holder = "student"; // student is a holder that has no overlap rule. returned by `getAgeRequiredHolders()`
        const pricingForStudent: Pricing = {
          ...mockPricings[0],
          holder,
          age_range: {
            from: 0,
            to: 99,
          },
        };

        const pricings = mockPricings.concat(pricingForStudent);
        const cards = mapPricingsToPricingCards(pricings);
        store.state.pricingCards = cards;
        store.handleAddHolder(store.state.pricingCards[0], "option-id", "person");
        vi.runAllTimers();

        expect(store.getPricingError("1.age_range")).toBe(false);
        expect(store.getPricingError("2.age_range")).toBe(false);
      });
    });
  });
});
