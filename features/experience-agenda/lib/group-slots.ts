import { CapacityType } from "@/types/Options";
import { Slot, SlotsByDateType, TimeSliceSlotType } from "../types/Agenda";

/**
 * Groups an array of `TimeSliceSlotType` objects by their `date` property.
 *
 * @param {TimeSliceSlotType[]} slots - The array of `TimeSliceSlotType` objects to group.
 * @returns {SlotsByDateType[]} An array of `SlotsByDateType` objects, each representing a group of slots that share the same date.
 */
export const groupByDate = (slots: TimeSliceSlotType[]): SlotsByDateType =>
  Object.values(
    slots.reduce((acc, slot) => {
      const { date } = slot;
      return {
        ...acc,
        [date]: {
          slots: [...(acc[date]?.slots ?? []), slot],
          date,
        },
      };
    }, {} as { [key: string]: SlotsByDateType[number] })
  );

/**
 * Groups an array of `Slot` objects by their `aggregation_id` property.
 *
 * @param {Slot[]} slots - The array of `Slot` objects to group.
 * @returns {Slot[]} An array of `Slot` objects, each representing a group of slots that share the same `aggregation_id`.
 */
export const groupByAggregationId = (slots: Array<Slot>): Array<Slot> =>
  Object.values(
    slots.reduce((acc, slot) => {
      const { aggregation_id, bookings } = slot;
      return {
        ...acc,
        [aggregation_id]: {
          ...slot,
          bookings: bookings + (acc[aggregation_id]?.bookings ?? 0),
        },
      };
    }, {} as { [key: string]: Slot })
  );

/**
 * Groups an array of `Slot` objects by their `timeslice_id` property.
 *
 * @param {Slot[]} slots - The array of `Slot` objects to group.
 * @returns {TimeSliceSlotType[]} An array of `TimeSliceSlotType` objects, each representing a group of slots that share the same `timeslice_id`.
 */
export const groupByTimesliceId = (slots: Array<Slot>): Array<TimeSliceSlotType> =>
  Object.values(
    slots.reduce((acc, slot) => {
      const { timeslice_id, bookings } = slot;
      return {
        ...acc,
        [timeslice_id]: {
          ...slot,
          ...(slot.remaining_capacity
            ? {
                remaining_capacity:
                  slot.option?.capacity_type !== CapacityType.SHARED
                    ? slot.remaining_capacity + (acc[timeslice_id]?.remaining_capacity ?? 0)
                    : slot.remaining_capacity,
              }
            : {}),
          ...(slot.total_capacity
            ? {
                total_capacity:
                  slot.option?.capacity_type !== CapacityType.SHARED
                    ? slot.total_capacity + (acc[timeslice_id]?.total_capacity ?? 0)
                    : slot.total_capacity,
              }
            : {}),
          bookings: bookings + (acc[timeslice_id]?.bookings ?? 0),
          aggregationSlots: [...(acc[timeslice_id]?.aggregationSlots ?? []), slot],
        },
      };
    }, {} as { [key: string]: TimeSliceSlotType })
  );

/**
 * Groups an array of `Slot` objects first by their `aggregation_id` property, then by their `timeslice_id` property, and finally by their `date` property.
 *
 * @param {Slot[]} slots - The array of `Slot` objects to group.
 * @returns {SlotsByDateType[]} An array of `SlotsByDateType` objects, each representing a group of slots that share the same `aggregation_id`, `timeslice_id`, and `date`.
 */
export const groupSlots = (slots: Slot[]) => {
  return groupByDate(groupByTimesliceId(groupByAggregationId(slots)));
};
