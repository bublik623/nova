import { DateRange } from "@/types/DateTypes";

export function isDateRange(val: unknown): val is DateRange {
  return (
    !!val &&
    typeof val === "object" &&
    ("from" in val || "to" in val) &&
    ((val as DateRange).from instanceof Date || (val as DateRange).from === undefined) &&
    ((val as DateRange).to instanceof Date || (val as DateRange).to === undefined)
  );
}
