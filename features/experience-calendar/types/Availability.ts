import { DateTicket, DatetimeTicket, OpenTicket } from "@/types/generated/OfferServiceApiOld";

export type AvailabilityType = DatetimeTicket | DateTicket | OpenTicket;

export type AvailabilityCard<T extends AvailabilityType> = {
  cardId: string;
  isOpen: boolean;
  isValid: boolean;
  value: T;
};
