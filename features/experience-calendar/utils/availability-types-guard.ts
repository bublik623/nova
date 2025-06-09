import { AvailabilityType } from "@/features/experience-calendar/types/Availability";
import { DatetimeTicket, OpenTicket } from "@/types/generated/OfferServiceApiOld";

/**
 * Types Guard to define as OpenTicket an availability.
 *
 * @param availability should be an OpenTicket availability"
 */
export function isOpenTicket(availability: AvailabilityType): availability is OpenTicket {
  return (
    (availability as OpenTicket).expiration_days !== undefined &&
    (availability as OpenTicket).expiration_date !== undefined
  );
}

/**
 * Types Guard to define as DatetimeTicket an availability.
 *
 * @param availability should be an DatetimeTicket availability"
 */
export function isDateTimeTicket(availability: AvailabilityType): availability is DatetimeTicket {
  return (
    (availability as DatetimeTicket).days !== undefined && (availability as DatetimeTicket).date_range !== undefined
  );
}
