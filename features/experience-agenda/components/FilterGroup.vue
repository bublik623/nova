<template>
  <NovaCollapse v-model="open" :title="$t('experience.agenda.filters.title')">
    <div class="FilterGroup">
      <template v-if="!hideDateFilter">
        <NovaFieldHeading
          :title="$t('experience.agenda.filters.date.title')"
          :description="$t('experience.agenda.filters.date.description')"
          :required="true"
        />

        <div class="FilterGroup__date-type">
          <NovaRadioCard
            :title="$t('experience.agenda.filters.date.type.range.title')"
            value="RANGE"
            :checked="filters.type === 'RANGE'"
            @input="handleChangeDateFilterType"
          >
            <template #description>{{ $t("experience.agenda.filters.date.type.range.description") }}</template>
          </NovaRadioCard>
          <NovaRadioCard
            :title="$t('experience.agenda.filters.date.type.single.title')"
            value="SINGLE"
            :checked="filters.type === 'SINGLE'"
            @input="handleChangeDateFilterType"
          >
            <template #description>{{ $t("experience.agenda.filters.date.type.range.description") }}</template>
          </NovaRadioCard>
        </div>

        <FilterDateRange
          v-if="filters.type === 'RANGE'"
          class="mb-8"
          :range="filters.range"
          :excluded-dates="filters.excludedDates"
          @update:selected-range="handleUpdateDates"
          @update:excluded-dates="handleUpdateDates(filters.range, $event)"
        />

        <FilterDateSingle v-else class="mb-8" :dates="filters.selectedDates" @update:dates="handleUpdateDates" />
      </template>

      <div class="FilterGroup__section">
        <div class="FilterGroup__options">
          <NovaFieldHeading
            :title="$t('experience.agenda.filters.options.title')"
            :description="$t('experience.agenda.filters.options.description')"
          />
          <div>
            <MultiSelect
              v-model="filters.selectedOptions"
              data-testid="options-filter"
              :disabled="areOptionsAndTimeslotsDisabled"
              :label="handleOptionsLabelText"
              :options="options"
              class="FilterGroup__multi-select"
            ></MultiSelect>
          </div>
        </div>
        <div v-if="!hideTimeslotFilter" class="FilterGroup__timeslots">
          <NovaFieldHeading
            :title="$t('experience.agenda.filters.timeslots.title')"
            :description="$t('experience.agenda.filters.timeslots.description')"
          />
          <MultiSelect
            v-model="filters.selectedTimeslots"
            data-testid="timeslots-filter"
            :disabled="areOptionsAndTimeslotsDisabled"
            :label="handleTimeslotsLabelText"
            :options="timeslots"
            class="FilterGroup__multi-select"
          ></MultiSelect>
        </div>

        <div class="FilterGroup__checkbox">
          <NovaCheckbox
            value="closed-items-only"
            :label="$t('experience.agenda.filters.closed-items.title')"
            data-testid="closed-items-checkbox"
            :status="filters.onlyClosedSlots ? 'checked' : 'unchecked'"
            @update:status="filters.onlyClosedSlots = !filters.onlyClosedSlots"
          />
        </div>
      </div>
      <div class="mt-6 FilterGroup__apply-btn">
        <NovaButton
          variant="outline"
          :disabled="!hideDateFilter && (!filters.range.from || !filters.range.to)"
          size="sm"
          data-testid="agenda-date-filter-apply"
          @click="
            $emit('apply:filters', filters);
            open = false;
          "
          >{{ $t("experience.agenda.button.apply-filters") }}</NovaButton
        >
      </div>
    </div>

    <template #closedContent>
      <div class="FilterGroup__summary" data-testid="filters-summary">
        <div v-if="!hideDateFilter">
          <p>{{ $t("experience.availability.dates.title") }}</p>
          <span v-if="filters.range.from && filters.range.to">
            From: {{ format(filters.range.from, DATE_FORMAT_SHORT) }}
            <NovaIcon name="arrow-right" />
            To: {{ format(filters.range.to, DATE_FORMAT_SHORT) }}
          </span>
          <span v-else>{{ $t("experience.agenda.filters.date.single.empty") }}</span>
        </div>
        <div>
          <p>{{ $t("experience.agenda.filters.options.title") }}</p>
          <span>
            {{
              filters.selectedOptions.length === 0 || filters.selectedOptions.length === options.length
                ? $t("experience.agenda.filters.options.all-options")
                : filters.selectedOptions.map((o) => o.label).join(", ")
            }}
          </span>
        </div>
        <div v-if="!hideTimeslotFilter">
          <p>{{ $t("experience.agenda.filters.timeslots.title") }}</p>
          <span>
            {{
              filters.selectedTimeslots.length === 0 || filters.selectedTimeslots.length === timeslots.length
                ? $t("experience.agenda.filters.timeslots.all-timeslots")
                : filters.selectedTimeslots.map((o) => o.label).join(", ")
            }}
          </span>
        </div>
      </div>
    </template>
  </NovaCollapse>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import { DATE_FORMAT_SHORT } from "@/constants/date.constants";
import FilterDateRange from "@/features/experience-agenda/components/FilterDateRange.vue";
import FilterDateSingle from "@/features/experience-agenda/components/FilterDateSingle.vue";
import MultiSelect from "@/features/experience-agenda/components/MultiSelect.vue";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";
import NovaFieldHeading from "@/ui-kit/NovaFieldHeading/NovaFieldHeading.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaRadioCard from "@/ui-kit/NovaRadioCard/NovaRadioCard.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { AgendaFilters, Slot } from "@/features/experience-agenda/types/Agenda";
import { DateRange } from "@/types/DateTypes";
import { Option, Option as SelectOption } from "@/types/Option";
import { isDateRange } from "@/features/core-shared/utils/type-guards/date-range";

export interface Props {
  slots: Slot[];
  hideDateFilter?: boolean;
  hideTimeslotFilter?: boolean;
}

interface Events {
  (e: "update:dates", value: AgendaFilters): void;
  (e: "apply:filters", value: AgendaFilters): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const { $t } = useNuxtApp();
const open = ref(true);

const filters = reactive<AgendaFilters>({
  range: { from: undefined, to: undefined },
  excludedDates: [],
  selectedDates: [],
  type: "RANGE",
  selectedOptions: [],
  selectedTimeslots: [],
  onlyClosedSlots: false,
});

const options = ref<Option[]>([]);
const timeslots = ref<Option[]>([]);

watch(
  () => props.slots,
  () => {
    options.value = Object.values(
      props.slots.reduce<Record<string, SelectOption>>((res, slot) => {
        const optionId = slot.option.id;
        if (!optionId) {
          return res;
        }

        if (!res[optionId]) {
          res[optionId] = { label: slot.option.name, value: optionId };
        }

        return res;
      }, {})
    );

    timeslots.value = props.slots
      .reduce<string[]>((res, slot) => {
        if (slot.time && !res.includes(slot.time)) {
          res.push(slot.time);
        }
        return res;
      }, [])
      .map((t) => ({ value: t, label: t.slice(0, 5) }));

    filters.selectedOptions = [...options.value];
    filters.selectedTimeslots = [...timeslots.value];
  },
  { immediate: true }
);

const areOptionsAndTimeslotsDisabled = computed(
  () => !props.hideDateFilter && (!filters.range.from || !filters.range.to)
);

const handleOptionsLabelText = (defaultLabel: string) => {
  return filters.selectedOptions.length === options.value.length
    ? $t("experience.agenda.filters.options.all-options")
    : defaultLabel;
};

const handleTimeslotsLabelText = (defaultLabel: string) => {
  return filters.selectedTimeslots.length === timeslots.value.length
    ? $t("experience.agenda.filters.timeslots.all-timeslots")
    : defaultLabel;
};

function handleChangeDateFilterType(type: string) {
  if (type === "RANGE" || type === "SINGLE") {
    filters.type = type;
  }
  filters.range = { from: undefined, to: undefined };
  filters.selectedDates = [];
  filters.excludedDates = [];
}

async function handleUpdateDates(dates: Date[] | DateRange, excludedDates?: Date[]) {
  if (isDateRange(dates)) {
    filters.range = dates;
  } else {
    const sortedDates = [...dates];
    sortedDates.sort((a, b) => a.getTime() - b.getTime());
    filters.range.from = sortedDates[0];
    filters.range.to = sortedDates[sortedDates.length - 1];
    filters.selectedDates = sortedDates;
  }

  filters.selectedOptions = [];
  filters.selectedTimeslots = [];
  filters.excludedDates = excludedDates ?? [];

  emit("update:dates", filters);
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.FilterGroup {
  padding: rem(20) rem(15);

  &__date-type {
    max-width: rem(600);
    display: flex;
    gap: rem(15);
    margin: rem(15) 0;
  }

  &__section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: rem(32);
  }

  &__options,
  &__timeslots {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &__checkbox {
    grid-row: 2 / 2;
  }

  &__multi-select {
    margin-top: rem(16);
    max-width: 286px;
  }

  &__summary {
    display: grid;
    column-gap: rem(20);
    grid-template-columns: repeat(3, 1fr);
    @include font-regular(14);

    & p {
      color: var(--color-primary-100);
      margin-bottom: rem(5);
    }

    & span {
      display: flex;
      align-items: center;
      gap: rem(5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__apply-btn {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
