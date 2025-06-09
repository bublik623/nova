import { SHORT_DAY_NAMES } from "@/constants/date.constants";

export type ShortDayNames = (typeof SHORT_DAY_NAMES)[number];

export interface DateRange {
  from?: Date;
  to?: Date;
}
