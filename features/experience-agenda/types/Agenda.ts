import { DateRange } from "@/types/DateTypes";
import { IntRange, PricingType } from "@/types/generated/InventoryServiceApi";
import { CapacityType } from "@/types/Options";
import { Option as SelectOption } from "@/types/Option";

export type Slot = {
  id: string;
  experience_id: string;
  timeslice_id: string;
  aggregation_id: string;
  date: string;
  language?: string;
  type: string;
  confirmation_time?: string;
  cutoff_time?: string;
  supplier?: string;
  option: {
    id?: string;
    name: string;
    duration?: string;
    validity_days?: number;
    multilanguage?: boolean;
    capacity_type: CapacityType;
    pricing_type_allowed: PricingType;
  };
  cancellation_policy?: Array<unknown>;
  pricing: {
    id: string;
    name: string;
    holder: string;
    age_range: IntRange;
    tiers: Tiers;
    currency: Currency;
    pricing_type: PricingType;
  };
  total_capacity?: number;
  remaining_capacity?: number;
  bookings: number;
  time?: string;
  expiration_date?: string;
  expiration_days?: number;
  name?: string;
  enabled?: boolean;
  status?: "ACTIVE" | "DELETED";
};

export type Currency = string;
export type Tiers = Array<Tier>;
export type Tier = {
  from: number;
  to: number;
  retail_price: number;
  commission: number;
  net_price: number;
};
type AggregationSlotsType = {
  aggregationSlots: Array<Slot>;
};
export type TimeSliceSlotType = Slot & AggregationSlotsType;
export type dateSelection = {
  from: string | undefined;
  to: string | undefined;
};
export type dateView = { year: number; month: number };
export type optionsSelection = Array<string>;
export type SlotsByDateType = Array<{
  date: string;
  slots: Array<TimeSliceSlotType>;
}>;
export type FilterSlotsType = Array<{
  date: string;
  options: { [key: string]: Slot["option"] };
}>;

export interface AgendaFilters {
  range: DateRange;
  excludedDates: Date[];
  selectedDates: Date[];
  type: "RANGE" | "SINGLE" | "MULTIPLE";
  selectedOptions: SelectOption[];
  selectedTimeslots: SelectOption[];
  onlyClosedSlots?: boolean;
  timesliceIds?: string[];
}
