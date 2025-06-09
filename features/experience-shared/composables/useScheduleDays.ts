import { ScheduleDaysValue } from "@/features/experience-shared/components/ScheduleDays.vue";
import { DateRange, ShortDayNames } from "@/types/DateTypes";
import { DatesRange } from "@/types/generated/OfferServiceApi";
import { getDaysOfWeek } from "@/utils/date-utils";

/**
 * Returns a reactive reference to a `ScheduleDaysValue` object that represents
 * the schedule days based on the provided date range and unchecked day names.
 *
 * @param {Ref<DatesRange | DateRange>} dateRange - The date range to calculate
 * the schedule days from.
 *
 * @returns {Ref<ScheduleDaysValue>} A reactive reference to the `ScheduleDaysValue`
 * object representing the schedule days.
 */
export function useScheduleDays(dateRange: Ref<DatesRange | DateRange>, callback?: () => void): Ref<ScheduleDaysValue> {
  const scheduleDays = ref(getDefaultScheduleDays());

  watch(
    dateRange,
    () => {
      if (dateRange.value) {
        scheduleDays.value = getScheduleDays(dateRange.value.from, dateRange.value.to);
      }
    },
    { immediate: true }
  );

  watch(
    scheduleDays,
    () => {
      callback && callback();
    },
    { deep: true }
  );

  return scheduleDays;
}

/**
 * Returns a `ScheduleDaysValue` object that represents the schedule days based on
 * the provided date range and unchecked day names.
 *
 * @param {string | Date | undefined} [from] - The start date of the range to calculate
 * the schedule days from.
 * @param {string | Date | undefined} [to] - The end date of the range to calculate
 * the schedule days from.
 *
 * @returns {ScheduleDaysValue} The `ScheduleDaysValue` object representing the
 * schedule days.
 */
export function getScheduleDays(from?: string | Date, to?: string | Date): ScheduleDaysValue {
  const scheduleDays = getDefaultScheduleDays();
  if (!from || !to) {
    return scheduleDays;
  }

  const daysOfWeek = getDaysOfWeek(from, to);
  Object.entries(scheduleDays).forEach(([key, day]) => {
    const isDayActive = daysOfWeek[key as ShortDayNames];
    day.checked = isDayActive;
    day.isDisabled = !isDayActive;
  });

  return scheduleDays;
}

/**
 * Returns a `ScheduleDaysValue` object that represents the default schedule
 * days with all days unchecked and disabled.
 *
 * @returns {ScheduleDaysValue} The default `ScheduleDaysValue` object.
 */
function getDefaultScheduleDays(): ScheduleDaysValue {
  return {
    Mon: { checked: false, isDisabled: true },
    Tue: { checked: false, isDisabled: true },
    Wed: { checked: false, isDisabled: true },
    Thu: { checked: false, isDisabled: true },
    Fri: { checked: false, isDisabled: true },
    Sat: { checked: false, isDisabled: true },
    Sun: { checked: false, isDisabled: true },
  };
}
