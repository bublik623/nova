import { DATE_FORMAT } from "@/constants/date.constants";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";
import { AxiosRequestConfig } from "axios";
import { format } from "date-fns";
import { AgendaFilters } from "@/features/experience-agenda/types/Agenda";
import { ExpressionNode } from "@rsql/ast";

/**
 * Formats an array of `Date` objects into an array of strings using the `DATE_FORMAT` constant.
 *
 * @param {Date[]} array - The array of `Date` objects to format.
 * @returns {string[]} An array of strings representing the formatted dates.
 */
const formatDatesArray = (array: Date[]): string[] => {
  return array.map((el) => format(el, DATE_FORMAT));
};

/**
 * Builds an Axios request configuration object for retrieving slots with optional filters based on the provided `AgendaFilters`.
 *
 * @param {AgendaFilters} filters - The `AgendaFilters` object containing the filter options.
 * @returns {{ config: AxiosRequestConfig }} An object containing the Axios request configuration.
 */
export const generateOptions = (filters: AgendaFilters) => {
  const {
    range,
    excludedDates,
    type,
    selectedDates,
    selectedOptions,
    selectedTimeslots,
    onlyClosedSlots,
    timesliceIds,
  } = filters;
  const isDateRangeSelect = type === "RANGE";
  const filterExp: ExpressionNode[] = [];

  const options: {
    config: AxiosRequestConfig;
  } = {
    config: {
      params:
        range.from && range.to
          ? {
              start_date: format(range.from, DATE_FORMAT),
              end_date: format(range.to, DATE_FORMAT),
            }
          : {},
    },
  };

  if (selectedDates.length && !isDateRangeSelect) {
    filterExp.push(builder.in("date", formatDatesArray(selectedDates)));
  } else if (excludedDates.length && isDateRangeSelect) {
    filterExp.push(builder.out("date", formatDatesArray(excludedDates)));
  }

  if (selectedOptions.length) {
    const optionIds = selectedOptions.map((o) => o.value);
    filterExp.push(builder.in("option.id", optionIds));
  }

  if (selectedTimeslots.length) {
    const timeslots = selectedTimeslots.map((t) => t.value);
    filterExp.push(builder.in("time", timeslots));
  }

  if (onlyClosedSlots) {
    filterExp.push(builder.in("enabled", ["false"]));
  }

  if (timesliceIds) {
    filterExp.push(builder.in("timeslice_id", timesliceIds));
  }

  if (filterExp.length) {
    options.config.params.filters = emit(builder.and(...filterExp));
  }

  return options;
};
