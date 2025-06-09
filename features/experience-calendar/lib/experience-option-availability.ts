import { AvailabilityCard, AvailabilityType } from "@/features/experience-calendar/types/Availability";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { isOpenTicket } from "../utils/availability-types-guard";
import { uuid } from "@/utils/uuid";

/**
 * Verifies that an availability form is valid
 * @param fields
 * @param experienceType
 */
export function validateFields(fields: AvailabilityType) {
  if (!fields.name) {
    return false;
  }

  if (isOpenTicket(fields)) {
    if (fields.expiration_days === null && fields.expiration_date === null) {
      return false;
    }
  } else if (!fields.date_range.from || !fields.date_range.to) {
    return false;
  }

  return true;
}

/**
 * Converts an availabilities array into availability cards
 * @param availabilities
 */
export function mapAvailabilitiesToAvailabilityCards<T extends AvailabilityType>(
  availabilities: T[]
): AvailabilityCard<T>[] {
  return availabilities.map<AvailabilityCard<T>>((a) => mapAvailability(a));
}

/**
 * Maps an availability to an availability card
 * @param availability
 */
export function mapAvailability<T extends AvailabilityType>(
  availability: T,
  overrides?: Partial<AvailabilityCard<T>>
): AvailabilityCard<T> {
  return {
    cardId: uuid(),
    isOpen: false,
    isValid: validateFields(availability),
    value: { ...availability },
    ...overrides,
  };
}

/**
 * Creates a default empty availability card
 * @param optionId
 * @param experienceType
 */
export function getDefaultAvailabilityFields<T extends AvailabilityType>(
  optionId: string,
  experienceType: ExperienceType
): AvailabilityCard<T> {
  if (
    experienceType === ExperienceType.NO_CALENDAR_FIXED_END ||
    experienceType === ExperienceType.NO_CALENDAR_FIXED_VALIDITY
  ) {
    return {
      cardId: uuid(),
      isOpen: true,
      isValid: false,
      value: {
        option: optionId,
        expiration_date: null,
        expiration_days: null,
        name: "",
        pricings: [],
        languages: [],
      } as unknown as T, // Could not resolve this TS "issue"
    };
  } else {
    return {
      cardId: uuid(),
      isOpen: true,
      isValid: false,
      value: {
        days: {},
        option: optionId,
        date_range: { from: undefined, to: undefined },
        name: "",
      } as unknown as T, // Could not resolve this TS "issue"
    };
  }
}
