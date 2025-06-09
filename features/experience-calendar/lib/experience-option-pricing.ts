import { Pax, Pricing as NewApiPricing } from "@/types/generated/OfferServiceApi";
import { Pricing } from "@/types/generated/OfferServiceApiOld";
import { HolderCard, PricingCard } from "@/types/Pricing";
import { uuid } from "@/utils/uuid";
import { PaxType, PaxPricing } from "../components/PricingFormPaxPricingList/PricingFormPaxPricingTypes";
import { chain, countBy, isEqual } from "lodash";

/**
 * Converts a pricing array into pricing cards
 * @param pricings
 */
export function mapPricingsToPricingCards(pricings: Pricing[]): PricingCard[] {
  const cards: PricingCard[] = [];
  const group = groupPricingItemsByName(pricings);
  let pricingIndex = 0;

  Object.entries(group).forEach(([pricingName, holders], index) => {
    const pricingCard = createPricingCard(pricingName, { isOpen: index === 0 });

    holders.forEach((holder) => {
      const holderCard = createHolderCard(holder, { pricingIndex });
      pricingCard.holders.push(holderCard);
      pricingIndex += 1;
    });

    pricingCard.paxPricingList = mapApiPricingsToPaxPricings(holders);
    pricingCard.paxTypes = derivePaxTypesFromPricings(holders);

    cards.push(pricingCard);
  });

  return cards;
}

/**
 * Convert Pricing items from backend into PaxPricing items used by frontend.
 * @param apiPricings the list of Pricing items coming from backend
 * @returns the list of PaxPricing items converted from the input
 */
export function mapApiPricingsToPaxPricings(apiPricings: Pricing[]): PaxPricing[] {
  const personApiPricings = apiPricings.filter((apiPricing) => apiPricing.pricing_type === "person");

  const holdersSet = chain(personApiPricings).map("holder").uniq().value();
  const pricingsPerHolder = countBy(personApiPricings, "holder");
  const holdersWithMoreThanOnePricing = holdersSet.filter((holder) => pricingsPerHolder[holder] > 1);

  if (holdersWithMoreThanOnePricing.length > 0) {
    throw new Error(`more than one Pricing for the same pax type(s): ${holdersWithMoreThanOnePricing.join(",")}`);
  }

  return personApiPricings.map((apiPricing) => {
    const purchasableQuantityConstrained = !!apiPricing.tiers[0].from && !!apiPricing.tiers[0].to;
    return {
      id: apiPricing.id,
      paxTypeCode: apiPricing.holder,
      pricing: {
        retailPrice: apiPricing.tiers[0].retail_price,
        commissionPercentage: apiPricing.tiers[0].commission,
        netPrice: apiPricing.tiers[0].net_price,
        purchasableAmountConstraint: purchasableQuantityConstrained
          ? { min: apiPricing.tiers[0].from!, max: apiPricing.tiers[0].to! }
          : undefined,
      },
    };
  });
}

export function mapApiPaxesToPaxTypes(apiPaxes?: Pax[]): PaxType[] {
  return (apiPaxes ?? []).map((apiPax) => ({
    code: apiPax.pax_code,
    label: masterDataPricingHolderOptions.find((opt) => opt.value === apiPax.pax_code)?.label ?? apiPax.pax_code,
    allAges: apiPax.all_ages,
    ageFrom: apiPax.age_from,
    ageTo: apiPax.age_to,
    freeOfCharge: apiPax.free_of_charge,
  }));
}

export function derivePaxTypesFromPricings(apiPricing: NewApiPricing[]): PaxType[] {
  return apiPricing.flatMap<PaxType>((pricing) => {
    const paxTypeConfiguration = masterDataPricingHolderOptions.find((config) => config.value === pricing.holder);

    return pricing.tiers.map<PaxType>((tier) => {
      return {
        code: pricing.holder,
        label: paxTypeConfiguration?.label ?? pricing.holder,
        freeOfCharge: tier.net_price === 0,
        ageFrom: pricing.age_range?.from,
        ageTo: pricing.age_range?.to,
        allAges:
          pricing.age_range === undefined ||
          (pricing.age_range.from === undefined && pricing.age_range.to === undefined),
      };
    });
  });
}

/**
 * Convert PaxPricing items used in frontend into Pricing items expected by backend.
 * @param optionId the id of the option for which the given pricings are defined
 * @param pricingName the name of the pricing card that groups the given pricings
 * @param paxTypes the set of pax types defined for the experience
 * @param paxPricings the list of pricings to convert
 * @returns the list of Pricing items converted from the input
 */
export function mapPaxPricingsToApiPricings(
  optionId: string,
  pricingName: string,
  paxTypes: PaxType[],
  paxPricings: PaxPricing[]
): NewApiPricing[] {
  return paxPricings.map((paxPricing) => {
    const paxType = paxTypes.find((paxType) => paxType.code === paxPricing.paxTypeCode);

    if (!paxType) {
      throw new Error(`can't find pax type ${paxPricing.paxTypeCode} for ${pricingName}`);
    }

    const result: NewApiPricing = {
      id: paxPricing.id,
      option_id: optionId,
      pricing_type: "person",
      holder: paxPricing.paxTypeCode,
      name: pricingName,
      age_range: !paxType.ageFrom && !paxType.ageTo ? undefined : { from: paxType.ageFrom, to: paxType.ageTo },
      tiers: [
        {
          retail_price: paxPricing.pricing.retailPrice,
          commission: paxPricing.pricing.commissionPercentage,
          net_price: paxPricing.pricing.netPrice,
          from: paxPricing.pricing.purchasableAmountConstraint?.min,
          to: paxPricing.pricing.purchasableAmountConstraint?.max,
        },
      ],
    };

    return result;
  });
}

/**
 * Find the new or edited pricings in the working copy respect to the last saved pricings.
 * @param workingCopy an array containing the working copy of pricings
 * @param lastSaved an array containing the last saved version of pricings
 * @returns an array containing the new or edited pricings present in the working copy
 */
export function getNewOrEditedPricings(workingCopy: NewApiPricing[], lastSaved: NewApiPricing[]) {
  return workingCopy.filter(newOrEdited(lastSaved));

  function newOrEdited(lastSavedPricings: NewApiPricing[]) {
    return (workingCopyPricing: NewApiPricing) => {
      const lastSavedVersion = lastSavedPricings.find(matchingNameAndHolder(workingCopyPricing));

      return (
        !workingCopyPricing.id ||
        (!!lastSavedVersion && !isEqual(workingCopyPricing.tiers[0], lastSavedVersion.tiers[0]))
      );
    };
  }

  function matchingNameAndHolder(aPricing: NewApiPricing) {
    return (bPricing: NewApiPricing) => aPricing.name === bPricing.name && aPricing.holder === bPricing.holder;
  }
}

/**
 * Find the pricings that have been removed from the working copy respect to the last saved pricings.
 * @param workingCopy an array containing the working copy of pricings
 * @param lastSaved an array containing the last saved version of pricings
 * @returns an array containing the pricings that no longer exists in the working copy
 */
export function getRemovedPricings(workingCopy: NewApiPricing[], lastSaved: NewApiPricing[]) {
  return lastSaved.filter(notExistingIn(workingCopy));

  function notExistingIn(workingCopyPricings: NewApiPricing[]) {
    return (lastSavedPricing: NewApiPricing) => {
      return !workingCopyPricings.find(
        (workingCopyPricing) => !!lastSavedPricing.id && workingCopyPricing.id === lastSavedPricing.id
      );
    };
  }
}

export const pricingMapToService = (pricingName: Pricing["name"], fields: Pricing): Pricing => {
  return {
    ...fields,
    name: pricingName,
  };
};

/**
 * Groups pricings by pricing name
 * @param pricings
 */
export function groupPricingItemsByName(pricings: Pricing[]): Record<string, Pricing[]> {
  return pricings.reduce((acc, item) => {
    if (acc[item.name]) {
      acc[item.name].push(item);
    } else {
      acc[item.name] = [item];
    }
    return acc;
  }, {} as Record<string, Pricing[]>);
}

/**
 * Creates an empty pricing card starting from a pricing name
 * @param pricingName
 * @param overrides used to override some of the pricing card properties
 */
export function createPricingCard(pricingName: Pricing["name"], overrides?: Partial<PricingCard>): PricingCard {
  return {
    cardId: uuid(),
    pricingName,
    holders: [],
    paxPricingList: [],
    isOpen: false,
    isDeleteModalVisible: false,
    paxTypes: [],
    ...overrides,
  };
}

/**
 * Creates an holder card starting from a pricing item
 * @param pricingName
 * @param overrides used to override some of the holder card properties
 */
export function createHolderCard(holder: Pricing, overrides?: Partial<HolderCard>): HolderCard {
  return {
    pricingIndex: 0,
    cardId: uuid(),
    cardTitle: "",
    isChanged: false,
    fields: holder,
    isDeleteModalVisible: false,
    ...overrides,
  };
}

export function getDefaultPricingFields(
  optionId: string,
  pricingType: Pricing["pricing_type"],
  isAllAges: boolean = false
): Pricing {
  const isGroup = pricingType === "group";

  return {
    name: "",
    holder: "",
    age_range: {
      from: 0,
      to: 0,
    },
    option: optionId,
    pricing_type: pricingType,
    tiers: [
      {
        from: 1,
        to: 15,
        retail_price: 1,
        commission: 0,
        net_price: 0,
      },
    ],
    // If a group or pax is all ages, set the defaults
    ...(isAllAges && masterDataAllAgesDefaults()),
    // If is a group pricing, add the group defaults overrides
    ...(isGroup && masterDataGroupHolderTierDefaults()),
  };
}
// Those are functions to avoid reference issues
export const masterDataAgeRangeDefaults = () => ({ age_range: { from: 0, to: 0 } });
export const masterDataAllAgesDefaults = () => ({ age_range: { from: 0, to: 99 } });

const masterDataGroupHolderTierDefaults = () => ({
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

export const masterDataGroupHolderOptions = [
  { label: "Group (generic)", value: "group", is_age_required: true },
  {
    label: "Vehicle (generic)",
    value: "vehicle",
    is_age_required: true,
  },
  { label: "Bike", value: "bike", is_age_required: true },
  { label: "Car", value: "car", is_age_required: true },
  { label: "Van", value: "van", is_age_required: true },
  { label: "Bus", value: "bus", is_age_required: true },
  { label: "Boat", value: "boat", is_age_required: true },
  {
    label: "School Group",
    value: "school-group",
    is_age_required: true,
  },
];

export const masterDataPricingHolderOptions = [
  { is_age_required: false, label: "Adult", value: "adult" },
  { is_age_required: false, label: "Child", value: "child" },
  { is_age_required: true, label: "Participant", value: "participant" },
  { is_age_required: false, label: "Infant", value: "infant" },
  { is_age_required: false, label: "Youth", value: "youth" },
  { is_age_required: false, label: "Senior", value: "senior" },
  { is_age_required: true, label: "Student", value: "student" },
  { is_age_required: true, label: "EU citizen", value: "eu-citizen" },
  { is_age_required: true, label: "EU teacher", value: "eu-teacher" },
  { is_age_required: true, label: "Military", value: "military" },
  {
    is_age_required: true,
    label: "Person with disability",
    value: "person with disability",
  },
  { is_age_required: true, label: "Caregiver", value: "caregiver" },
];

/**
 *
 * This function returns an array of holders that require age specification.
 *
 * @warning These holders are used for overlapping age range checks. Overlapping age range check is a validation
 * to ensure that there are no two holders with overlapping age ranges.
 * The returned list from this function should be ignored when checking for overlapping age ranges.
 * {@link pricing.schema.ts}
 *
 *
 * @example getAgeRequiredHolders()  => ['student', 'military', ...]
 */
export function getAgeRequiredHolders() {
  return masterDataPricingHolderOptions.filter((pricingOption) => pricingOption.is_age_required);
}
