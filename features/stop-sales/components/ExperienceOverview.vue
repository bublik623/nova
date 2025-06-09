<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Slot } from "@/features/experience-agenda/types/Agenda";
import { ExperienceOption } from "./FilterExperiences.vue";
import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import { parseISO, format, addDays, isSameDay } from "date-fns";
import { formatDay } from "../utils/slot-helpers";
import { busOverviewSelectAll } from "../composables/useEventBus";

interface Props {
  slots: Slot[];
  experiences: ExperienceOption[];
}

const props = defineProps<Props>();

interface DateRange {
  start: string;
  end: string;
  timeslices: Slot[];
}

interface TimesliceGroup {
  month: string;
  dateRanges: DateRange[];
}

interface Option {
  id: string;
  label: string;
  timesliceGroup: TimesliceGroup;
}

interface GroupedExperience {
  id: string;
  label: string;
  options: Option[];
}

const closedSlots = computed<Slot[]>(() => {
  return props.slots.filter((slot) => !slot.enabled);
});

const groupConsecutiveDates = (slots: Slot[]): DateRange[] => {
  if (slots.length === 0) return [];

  const sortedSlots = slots.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  const ranges: DateRange[] = [];

  let start = sortedSlots[0];
  let end = start;
  let currentTimeslices = [start];

  for (let i = 1; i < sortedSlots.length; i++) {
    const current = sortedSlots[i];
    const previous = sortedSlots[i - 1];

    if (isSameDay(addDays(parseISO(previous.date), 1), parseISO(current.date))) {
      end = current;
      currentTimeslices.push(current);
    } else {
      ranges.push({ start: start.date, end: end.date, timeslices: currentTimeslices });
      start = current;
      end = current;
      currentTimeslices = [current];
    }
  }

  // Push the last range
  if (currentTimeslices.length > 0) {
    ranges.push({ start: start.date, end: end.date, timeslices: currentTimeslices });
  }

  return ranges;
};

const groupedExperiences = computed<GroupedExperience[]>(() => {
  return props.experiences
    .map((experience) => {
      const experienceSlots = closedSlots.value.filter((slot) => slot.experience_id === experience.id);
      const optionsMap = new Map<string, Option>();

      experienceSlots.forEach((slot) => {
        const optionId = slot.option.id || "";
        if (!optionsMap.has(optionId)) {
          optionsMap.set(optionId, {
            id: optionId,
            label: slot.option.name,
            timesliceGroup: {
              month: format(parseISO(slot.date), "MMMM"),
              dateRanges: [],
            },
          });
        }
        const existingRange = optionsMap
          .get(optionId)!
          .timesliceGroup.dateRanges.find((range) => range.start === slot.date);
        if (existingRange) {
          existingRange.timeslices.push(slot);
        } else {
          optionsMap.get(optionId)!.timesliceGroup.dateRanges.push({
            start: slot.date,
            end: slot.date,
            timeslices: [slot],
          });
        }
      });

      const options = Array.from(optionsMap.values()).map((option) => ({
        ...option,
        timesliceGroup: {
          ...option.timesliceGroup,
          dateRanges: groupConsecutiveDates(
            option.timesliceGroup.dateRanges
              .flatMap((range) => range.timeslices)
              .filter((slot, index, self) => index === self.findIndex((t) => t.date === slot.date))
          ),
        },
      }));

      return {
        id: experience.id,
        label: experience.label,
        options,
      };
    })
    .filter((experience) => experience.options.length > 0); // Filter out experiences with no options
});

const checkedTimeslices = ref<Set<string>>(new Set());
const checkedTimeSliceIdsModel = defineModel<string[]>("checkedTimeSliceIds", {
  required: true,
});

watch(
  checkedTimeslices,
  (newValue) => {
    checkedTimeSliceIdsModel.value = Array.from(newValue);
  },
  { deep: true }
);

const isExperienceChecked = (experienceId: string): boolean => {
  const experience = groupedExperiences.value.find((exp) => exp.id === experienceId);
  if (!experience) return false;

  return experience.options.every((option) =>
    option.timesliceGroup.dateRanges.every((dateRange) =>
      dateRange.timeslices.every((timeslice) => checkedTimeslices.value.has(timeslice.timeslice_id))
    )
  );
};

const isExperienceIndeterminate = (experienceId: string): boolean => {
  const experience = groupedExperiences.value.find((exp) => exp.id === experienceId);
  if (!experience) return false;

  const someChecked = experience.options.some((option) =>
    option.timesliceGroup.dateRanges.some((dateRange) =>
      dateRange.timeslices.some((timeslice) => checkedTimeslices.value.has(timeslice.timeslice_id))
    )
  );

  return someChecked && !isExperienceChecked(experienceId);
};

const getExperienceStatus = (experienceId: string): "checked" | "unchecked" | "indeterminate" => {
  if (isExperienceChecked(experienceId)) return "checked";
  if (isExperienceIndeterminate(experienceId)) return "indeterminate";
  return "unchecked";
};

const toggleExperience = (experienceId: string) => {
  const experience = groupedExperiences.value.find((exp) => exp.id === experienceId);
  if (!experience) return;

  const shouldCheck = !isExperienceChecked(experienceId);

  experience.options.forEach((option) =>
    option.timesliceGroup.dateRanges.forEach((dateRange) =>
      dateRange.timeslices.forEach((timeslice) => {
        if (shouldCheck) {
          checkedTimeslices.value.add(timeslice.timeslice_id);
        } else {
          checkedTimeslices.value.delete(timeslice.timeslice_id);
        }
      })
    )
  );
};

const toggleOption = (experienceId: string, optionId: string) => {
  const option = groupedExperiences.value
    .find((exp) => exp.id === experienceId)
    ?.options.find((opt) => opt.id === optionId);

  if (!option) return;

  const allChecked = option.timesliceGroup.dateRanges.every((dateRange) =>
    dateRange.timeslices.every((timeslice) => checkedTimeslices.value.has(timeslice.timeslice_id))
  );

  option.timesliceGroup.dateRanges.forEach((dateRange) =>
    dateRange.timeslices.forEach((timeslice) => {
      if (allChecked) {
        checkedTimeslices.value.delete(timeslice.timeslice_id);
      } else {
        checkedTimeslices.value.add(timeslice.timeslice_id);
      }
    })
  );
};

const toggleDateRange = (experienceId: string, optionId: string, dateRange: DateRange) => {
  const allChecked = dateRange.timeslices.every((timeslice) => checkedTimeslices.value.has(timeslice.timeslice_id));

  dateRange.timeslices.forEach((timeslice) => {
    if (allChecked) {
      checkedTimeslices.value.delete(timeslice.timeslice_id);
    } else {
      checkedTimeslices.value.add(timeslice.timeslice_id);
    }
  });
};

const getOptionStatus = (experienceId: string, optionId: string): "checked" | "unchecked" | "indeterminate" => {
  const option = groupedExperiences.value
    .find((exp) => exp.id === experienceId)
    ?.options.find((opt) => opt.id === optionId);

  if (!option) return "unchecked";

  const allChecked = option.timesliceGroup.dateRanges.every((dateRange) =>
    dateRange.timeslices.every((timeslice) => checkedTimeslices.value.has(timeslice.timeslice_id))
  );

  if (allChecked) return "checked";

  const someChecked = option.timesliceGroup.dateRanges.some((dateRange) =>
    dateRange.timeslices.some((timeslice) => checkedTimeslices.value.has(timeslice.timeslice_id))
  );

  return someChecked ? "indeterminate" : "unchecked";
};

const getDateRangeStatus = (dateRange: DateRange): "checked" | "unchecked" | "indeterminate" => {
  const checkedCount = dateRange.timeslices.filter((timeslice) =>
    checkedTimeslices.value.has(timeslice.timeslice_id)
  ).length;

  if (checkedCount === 0) return "unchecked";
  if (checkedCount === dateRange.timeslices.length) return "checked";
  return "indeterminate";
};

const formatDateRange = (dateRange: DateRange) => {
  if (dateRange.start === dateRange.end) {
    return formatDay(dateRange.start);
  }
  return `${formatDay(dateRange.start)} - ${formatDay(dateRange.end)}`;
};

const handleSelectAll = (value: boolean) => {
  if (value) {
    // Select all timeslices
    groupedExperiences.value.forEach((experience) => {
      experience.options.forEach((option) => {
        option.timesliceGroup.dateRanges.forEach((dateRange) => {
          dateRange.timeslices.forEach((timeslice) => {
            checkedTimeslices.value.add(timeslice.timeslice_id);
          });
        });
      });
    });
  } else {
    // Deselect all timeslices
    checkedTimeslices.value.clear();
  }
};

busOverviewSelectAll.on((value) => {
  handleSelectAll(value);
});
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <div
      v-for="experience in groupedExperiences"
      :key="experience.id"
      data-testid="card-experience"
      class="h-full max-h-[525px] overflow-hidden"
    >
      <NovaCollapse :model-value="true" class="experience-collapse">
        <template #title>
          <div class="flex gap-2 min-w-0">
            <NovaCheckbox
              :status="getExperienceStatus(experience.id)"
              :value="experience.id"
              data-testid="checkbox-experience"
              @update:status="() => toggleExperience(experience.id)"
            />
            <h3 class="truncate max-w-fit" :title="experience.label">{{ experience.label }}</h3>
          </div>
        </template>
        <div class="p-4 w-full overflow-x-auto h-full">
          <div class="flex gap-4 flex-nowrap">
            <div
              v-for="option in experience.options"
              :key="option.id"
              class="w-60 flex-shrink-0"
              data-testid="card-option"
            >
              <NovaCollapse size="md">
                <template #title>
                  <div class="flex gap-2 items-center min-w-0">
                    <NovaCheckbox
                      :status="getOptionStatus(experience.id, option.id)"
                      :value="option.id"
                      data-testid="checkbox-option"
                      @update:status="() => toggleOption(experience.id, option.id)"
                    />
                    <h4 class="truncate text-sm font-medium" :title="option.label">{{ option.label }}</h4>
                  </div>
                </template>
                <div class="divide-y max-h-96 overflow-y-auto">
                  <div class="py-2 px-4">
                    <h5 class="text-sm font-medium pb-1">{{ option.timesliceGroup.month }}</h5>
                    <div
                      v-for="dateRange in option.timesliceGroup.dateRanges"
                      :key="dateRange.start"
                      class="flex gap-2 items-center py-0.5"
                    >
                      <NovaCheckbox
                        :status="getDateRangeStatus(dateRange)"
                        :value="dateRange.start"
                        data-testid="timeslice-checkbox"
                        @update:status="() => toggleDateRange(experience.id, option.id, dateRange)"
                      />
                      <span class="text-sm font-normal">
                        {{ formatDateRange(dateRange) }}
                      </span>
                    </div>
                  </div>
                </div>
              </NovaCollapse>
            </div>
          </div>
        </div>
      </NovaCollapse>
    </div>
  </div>
</template>
