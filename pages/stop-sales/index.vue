<template>
  <div class="stop-sales-page bg-neutral-20 stop-sales-page min-h-screen w-full px-6 py-4 flex flex-col gap-4">
    <section class="section-filters soft-shadow bg-white rounded-lg p-4">
      <div class="filters-wrapper">
        <div class="filters flex items-center gap-[1px]">
          <FilterDestination
            v-model="destinations"
            v-model:selected-items="selectedDestinations"
            v-model:search="searchQueryDestinations"
            :is-loading="destinationsStatus === 'pending'"
            @trigger="handleDestinations"
          />
          <FilterExperiences
            v-model="fetchedExperiences"
            v-model:selected-items="selectedExperiences"
            v-model:search="searchQueryExperiences"
            :is-loading="experiencesStatus === 'pending'"
            :disabled="!selectedDestinations.length"
            @trigger="handleExperiences"
          />
          <FilterOptions
            v-model="fetchedOptions"
            v-model:selected-items="selectedOptions"
            :is-loading="optionsStatus === 'pending'"
            :disabled="!selectedExperiences.length"
            @trigger="handleOptions"
          />
          <FilterDates
            v-model:selected-dates="selectedDates"
            v-model:excluded-dates="excludedDates"
            v-model:range="selectedDateMode"
            :disabled="!selectedOptions.length"
          />
          <FilterTimeSlots
            v-model="fetchedTimeSlots"
            v-model:selected-items="selectedTimeSlots"
            :is-loading="timeSlotsStatus === 'pending'"
            :disabled="!selectedDates.length"
            @trigger="handleTimeSlots"
          />
          <div class="filters-actions ml-4">
            <NovaButton
              data-testid="button-search"
              :disabled="slotsStatus === 'pending' || !isSearchButtonEnabled"
              size="sm"
              @click="refreshSlots"
            >
              {{ $t("common.search") }}
            </NovaButton>
          </div>
        </div>
      </div>
    </section>

    <section
      v-show="isTableVisible"
      class="section-actions soft-shadow bg-white rounded-lg flex gap-4 items-center justify-between p-2 px-6"
    >
      <div class="flex gap-4">
        <template v-if="!isReadonly">
          <NovaCheckbox
            value="select-all-items"
            :status="selectAllCheckboxStatus"
            :label="selectAllItemsLabel"
            @update:status="handleSelectAllItems"
          />
          <div class="border-l border-neutral-60" />
        </template>
        <div class="flex items-baseline gap-2 text-sm text-text-100">
          <span>{{ $t("stop_sales.result_control.view_type.label") }}</span>
          <NovaDropdown
            :selected="[selectedViewTypeFilter]"
            :options="filteredViewTypeOptions"
            :show="showDropdownViewType"
            @select:option="handleViewTypeSelect"
          >
            <template #toggle>
              <button
                data-testid="view-type-toggle"
                class="flex text-center items-center"
                @click="showDropdownViewType = !showDropdownViewType"
              >
                <span class="text-xs">{{ selectedViewTypeFilter.label }}</span>
                <span class="ml-2">
                  <NovaIcon :name="showDropdownViewType ? 'chevron-up' : 'chevron-down'" :size="8" />
                </span>
              </button>
            </template>
            <template #default="{ option }">
              <div :data-testid="`view-type-${option.value.toLowerCase()}`">
                {{ option.label }}
              </div>
            </template>
          </NovaDropdown>
        </div>

        <div class="border-l border-neutral-60" />
        <span class="text-sm">{{ $t("stop_sales.result_control.show_items.label") }}</span>
        <NovaInputRadio
          v-for="(option, index) in filteredShowItemsOptions"
          :key="index"
          :option="option"
          :checked="selectedShowItemsFilter === option.value"
          :data-testid="`checkbox-${option.value}`"
          @input="handleShowItemsChange(option.value)"
        />
      </div>
      <span class="flex gap-4">
        <template v-if="!isReadonly">
          <NovaButton
            variant="outline"
            size="sm"
            :disabled="
              !checkedTimeSliceIds.length ||
              checkedTimeSliceIds.every((id) => slots.find((s) => s.timeslice_id === id)?.enabled)
            "
            data-testid="button-open-selected"
            @click="handleUpdateSlotStatus(checkedTimeSliceIds, true, agendaFilters)"
            >{{ $t("stop_sales.result_control.open_selected") }}</NovaButton
          >
          <NovaButton
            v-if="selectedViewTypeFilter.value === 'detail'"
            class="ml-4"
            variant="outline"
            size="sm"
            :disabled="
              !checkedTimeSliceIds.length ||
              checkedTimeSliceIds.every((id) => !slots.find((s) => s.timeslice_id === id)?.enabled)
            "
            data-testid="button-close-selected"
            @click="handleUpdateSlotStatus(checkedTimeSliceIds, false, agendaFilters)"
            >{{ $t("stop_sales.result_control.close_selected") }}</NovaButton
          >
        </template>
      </span>
    </section>
    <section v-if="isFallbackMessageVisible" class="min-h-screen flex justify-center">
      <div class="flex items-center justify-center">{{ $t("stop_sales.no_table_message") }}</div>
    </section>

    <section v-show="isTableVisible" data-testid="stop-sales-table">
      <template v-if="slotsStatus === 'pending'">
        <div class="flex justify-center items-center">
          <NovaSpinner />
        </div>
      </template>
      <template v-else-if="slotsStatus === 'success'">
        <template v-if="filteredSlots.length">
          <div
            v-if="selectedViewTypeFilter.value === 'detail'"
            class="rounded-lg bg-white p-4"
            data-testid="detail-view"
          >
            <StopSalesTable
              v-for="data in groupedSlots"
              :key="data.slots[0].timeslice_id"
              :is-readonly="isReadonly"
              :experiences="filteredExperiences"
              class="mb-4 z-2"
              :checked="false"
              :date="data.date"
              :slots="data.slots"
              :on-update-capacity="handleSaveNewSlotCapacity"
              :checked-time-slice-ids="checkedTimeSliceIds"
              @toggle:check-slots="handleSlotsCheck"
              @toggle:status="handleUpdateSlotStatus([$event.timeslice_id], $event.value, agendaFilters)"
            />
          </div>
          <section v-else class="w-full soft-shadow p-4 bg-white" data-testid="overview-view">
            <ExperienceOverview
              v-model:checked-time-slice-ids="checkedTimeSliceIds"
              :slots="filteredSlots"
              :experiences="filteredExperiences"
            />
          </section>
        </template>
        <template v-else>
          <p>{{ $t("common.no.items.found") }}</p>
        </template>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import FilterDestination, { DestinationOption } from "@/features/stop-sales/components/FilterDestination.vue";
import FilterExperiences, { ExperienceOption } from "@/features/stop-sales/components/FilterExperiences.vue";
import FilterOptions, { OptionOption } from "@/features/stop-sales/components/FilterOptions.vue";
import FilterTimeSlots, { TimeSlotOption } from "@/features/stop-sales/components/FilterTimeSlots.vue";
import FilterDates from "@/features/stop-sales/components/FilterDates.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { useMasterData } from "@/stores/master-data";
import { useNotifications } from "@/stores/notifications";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useContentQueryApi } from "@/composables/useContentQueryApi";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";
import { useInventoryServiceApi } from "@/features/core-shared/composables/useInventoryServiceApi";
import { refDebounced } from "@vueuse/core";
import { ReturnType } from "birpc";
import { Props as NovaDatePickerProps } from "@/ui-kit/NovaDatePicker/NovaDatePicker.vue";
import { generateOptions } from "@/features/experience-agenda/lib/generate-options";
import { AgendaFilters, Slot } from "@/features/experience-agenda/types/Agenda";
import { groupSlots } from "@/features/experience-agenda/lib/group-slots";
import StopSalesTable from "@/features/stop-sales/components/StopSalesTable.vue";
import { splitArray } from "@/features/experience-agenda/lib/split-array";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaInputRadio from "@/ui-kit/NovaInputRadio/NovaInputRadio.vue";
import NovaDropdown from "@/ui-kit/NovaDropdown/NovaDropdown.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import ExperienceOverview from "@/features/stop-sales/components/ExperienceOverview.vue";
import { busOverviewSelectAll } from "@/features/stop-sales/composables/useEventBus";
import NovaSpinner from "@/ui-kit/NovaSpinner/NovaSpinner.vue";
import { hasPermission } from "@/features/roles/lib/has-permission";

const { $t } = useNuxtApp();
const isReadonly = computed(() => !hasPermission("stop-sales.canWrite"));

const selectedDestinations = ref<DestinationOption[]>([]);
const selectedExperiences = ref<ExperienceOption[]>([]);
const selectedOptions = ref<OptionOption[]>([]);
const selectedTimeSlots = ref<TimeSlotOption[]>([]);
const selectedDates = ref<Date[]>([]);
const excludedDates = ref<Date[]>([]);
const searchQueryDestinations = ref("");
const searchQueryExperiences = ref("");
const searchQueryExperienceDebounced = refDebounced(searchQueryExperiences, 1000);
const searchQueryDestinationsDebounced = refDebounced(searchQueryDestinations, 1000);
const selectedDateMode = ref<NovaDatePickerProps["mode"]>("range");
const checkedTimeSliceIds: Ref<string[]> = ref([]);

const masterdataStore = useMasterData();
const notificationStore = useNotifications();
const offerServiceApi = useOfferServiceApi();
const { getExperienceRawContent } = useContentQueryApi();
const { getSlot, getSlots, postSlotCapacity, postEnabling } = useInventoryServiceApi();
const { logError } = useLogger();
const agendaFilters: Ref<AgendaFilters | null> = ref(null);
const isTableVisible = ref(false);
const isFallbackMessageVisible = ref(true);
const filteredExperiences = ref<ExperienceOption[]>([]);

const viewTypeOptions = [
  { label: $t("stop_sales.result_control.view_type.detail"), value: "detail" as const },
  { label: $t("stop_sales.result_control.view_type.overview"), value: "overview" as const },
];

const visibilityOptions = [
  { label: $t("stop_sales.result_control.show_items.all"), value: "all" },
  { label: $t("stop_sales.result_control.show_items.open"), value: "open" },
  { label: $t("stop_sales.result_control.show_items.closed"), value: "closed" },
];

const isAllSlotsChecked = computed(() =>
  filteredSlots.value.every((slot) => checkedTimeSliceIds.value.includes(slot.timeslice_id))
);

const selectAllCheckboxStatus = computed(() => {
  if (checkedTimeSliceIds.value.length === 0) {
    return "unchecked";
  }
  return isAllSlotsChecked.value ? "checked" : "indeterminate";
});

const selectedShowItemsFilter = ref("all");
const selectedViewTypeFilter = ref(viewTypeOptions[0]);
const showDropdownViewType = ref(false);

const filteredViewTypeOptions = computed(() => {
  return selectedViewTypeFilter.value.value === "detail" ? [viewTypeOptions[1]] : [viewTypeOptions[0]];
});

const filteredShowItemsOptions = computed(() => {
  if (selectedViewTypeFilter.value.value === "overview") {
    return visibilityOptions.filter((option) => option.value === "closed");
  }
  return visibilityOptions;
});

const filteredSlots = computed(() => {
  if (selectedShowItemsFilter.value === "all") {
    return slots.value;
  }
  return slots.value.filter((slot) => (selectedShowItemsFilter.value === "open" ? slot.enabled : !slot.enabled));
});

const groupedSlots = computed(() => {
  return groupSlots(filteredSlots.value).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

function handleSelectAllItems() {
  if (selectedViewTypeFilter.value.value === "overview") {
    busOverviewSelectAll.emit(!isAllSlotsChecked.value);
  } else {
    handleSlotsCheck(filteredSlots.value.map((slot) => slot.timeslice_id));
  }
}

function handleViewTypeSelect(option: (typeof viewTypeOptions)[number]) {
  selectedViewTypeFilter.value = option;
  showDropdownViewType.value = false;
  checkedTimeSliceIds.value = [];

  // Update selectedVisibilityFilter based on the view type
  if (option.value === "overview") {
    selectedShowItemsFilter.value = "closed";
  } else {
    selectedShowItemsFilter.value = "all";
  }
}

function handleShowItemsChange(value: string) {
  selectedShowItemsFilter.value = value;
  checkedTimeSliceIds.value = [];
}

const isSearchButtonEnabled = computed(() => {
  return (
    selectedDestinations.value.length > 0 &&
    selectedExperiences.value.length > 0 &&
    selectedOptions.value.length > 0 &&
    selectedTimeSlots.value.length > 0
  );
});

const {
  data: slots,
  refresh: refreshSlots,
  status: slotsStatus,
} = useLazyAsyncData<Slot[]>("slots", fetchSlots, {
  immediate: false,
  default() {
    return [];
  },
});

const {
  data: destinations,
  refresh: refreshDestinations,
  status: destinationsStatus,
} = await useAsyncData("destination-filter", fetchCities, {
  watch: [searchQueryDestinationsDebounced],
  immediate: true,
  deep: false,
  default: () => [],
});

const {
  data: fetchedExperiences,
  refresh: refreshExperiences,
  status: experiencesStatus,
} = await useAsyncData("experience-filter", fetchExperiences, {
  watch: [searchQueryExperienceDebounced],
  immediate: false,
  deep: false,
  default: () => [],
  transform: (experiences) => {
    const items = [...experiences];

    const mappedExperiences = items.map((item) => {
      let destination: ReturnType<typeof masterdataStore.getCityByCode> = {
        name: "",
        code: "",
        language_code: "",
        country_code_alpha2: "",
      };
      try {
        destination = masterdataStore.getCityByCode(item.functional?.location?.address?.city ?? "");
      } catch (e) {
        logError("master-data", e);
      }

      return {
        label: item?.commercial?.title ?? "",
        val: item?.reference_code ?? "",
        city: destination ? destination.name : "",
        id: item?.experience_id ?? "",
      };
    });

    return mappedExperiences.sort(sortByCity);
  },
});

const {
  data: fetchedOptions,
  refresh: refreshOptions,
  status: optionsStatus,
} = useAsyncData("options-filter", fetchOptions, {
  immediate: false,
  deep: false,
  default: () => [],
});

const {
  data: fetchedTimeSlots,
  refresh: refreshTimeSlots,
  status: timeSlotsStatus,
} = await useAsyncData("timeslots-filter", fetchTimeSlots, {
  immediate: false,
  deep: false,
  default: () => [],
  transform: (timeSlots) => {
    return timeSlots.map((timeSlot) => ({
      label: timeSlot.label,
      val: timeSlot.val,
    }));
  },
});

const countryMap = Object.fromEntries(
  masterdataStore.countries.map((country) => [country.code.toLowerCase(), country.name])
);

const sortByLabel = (a: { label: string }, b: { label: string }) => {
  return a.label.localeCompare(b.label);
};

const sortByCity = (a: { city: string }, b: { city: string }) => {
  return a.city.localeCompare(b.city);
};

async function fetchCities() {
  const mappedCities = masterdataStore.geoCities.map((city) => ({
    label: city.name,
    val: city.code,
    subLabel: countryMap[city.country_code_alpha2.toLowerCase()],
  }));

  const filteredCities = searchQueryDestinationsDebounced.value
    ? mappedCities.filter((city) => {
        const searchValue = new RegExp(searchQueryDestinationsDebounced.value.toLocaleLowerCase(), "i");
        return searchValue.test(city.label) || searchValue.test(city.subLabel);
      })
    : mappedCities;

  return filteredCities.sort(sortByLabel).slice(0, 30);
}

async function fetchExperiences() {
  try {
    const { data: experiences } = await getExperienceRawContent({
      limit: "25",
      cities: selectedDestinations.value.map((destination) => destination.val),
      search: searchQueryExperiences.value,
      sort: "-updated_date",
    });
    return experiences;
  } catch (error) {
    logError("load-experiences", error);
    notificationStore.addNotification({
      theme: "error",
      message: "notifications.error.fetching.data",
    });
    return [];
  }
}

async function fetchOptions(): Promise<OptionOption[]> {
  if (selectedExperiences.value.length === 0) {
    return [];
  }

  try {
    const experienceIds = selectedExperiences.value.map((exp) => exp.id);
    const responses = await Promise.all(experienceIds.map((id) => offerServiceApi.getOptions(id)));
    const fetchedOptions = responses.flatMap((response) => response.data);

    const mappedOptions = fetchedOptions.map((option) => {
      const experience = selectedExperiences.value.find((exp) => exp.id === option.experience);
      return {
        label: option.name ?? "",
        val: option.id ?? "",
        experience: {
          id: experience?.id ?? "",
          label: experience?.label ?? "",
          subLabel: experience?.val ?? "",
        },
        city: experience ? experience.city : "",
      };
    });

    return mappedOptions.sort(sortByCity);
  } catch (e) {
    logError("load-option", e);
    notificationStore.addNotification({
      theme: "error",
      message: "notifications.error.fetching.data",
    });
    return [];
  }
}

async function fetchTimeSlots() {
  if (selectedDates.value.length === 0) {
    return [];
  }

  const allTimeSlotsMap = new Map<string, TimeSlotOption>();
  let responses: { data: Slot[] }[] = [];

  if (selectedDateMode.value === "range") {
    responses = await Promise.all(
      selectedOptions.value.map((option) =>
        getSlots(option.experience.id, {
          config: {
            params: {
              start_date: formatDate(selectedDates.value[0]),
              end_date: formatDate(selectedDates.value[1]),
            },
          },
        })
      )
    );
  } else if (selectedDateMode.value === "multiple") {
    const selectedDays = selectedOptions.value.flatMap((option) =>
      selectedDates.value.map((date) =>
        getSlots(option.experience.label, {
          config: {
            params: {
              start_date: formatDate(date),
              end_date: formatDate(date),
            },
          },
        })
      )
    );
    responses = await Promise.all(selectedDays);
  }

  const fetchedTimeSlots = responses.flatMap((response) => response.data);
  let hasNoTimeSlots = false;

  fetchedTimeSlots.forEach((slot) => {
    if (slot.type === "CALENDAR-NO-TIMESLOTS") {
      hasNoTimeSlots = true;
    }
    if (slot.time) {
      if (slot.type === "CALENDAR-TIMESLOTS") {
        allTimeSlotsMap.set(slot.time, { label: slot.time.slice(0, 5), val: slot.time });
      }
    }
  });

  const allTimeSlots = [...Array.from(allTimeSlotsMap.values())];

  if (hasNoTimeSlots) {
    allTimeSlots.unshift({ label: "No time slots", val: "no-time-slot" });
  }

  return allTimeSlots;
}

function getAgendaFilters() {
  const noTimeSlotsSelected = selectedTimeSlots.value.some((timeslot) => timeslot.label === "No time slots");

  const filters = {
    excludedDates: excludedDates.value,
    selectedDates: selectedDates.value,
    type: selectedDateMode.value.toUpperCase() as AgendaFilters["type"],
    selectedOptions: selectedOptions.value.map((option) => ({
      label: option.label,
      value: option.val,
    })),
    selectedTimeslots: noTimeSlotsSelected
      ? []
      : selectedTimeSlots.value.map((timeslot) => ({
          label: timeslot.label,
          value: timeslot.val,
        })),
  };

  if (selectedDateMode.value === "range") {
    return {
      ...filters,
      range: {
        from: selectedDates.value[0] || undefined,
        to: selectedDates.value[1] || undefined,
      },
    };
  }

  return {
    ...filters,
    range: {
      from: undefined,
      to: undefined,
    },
  };
}

async function fetchSlots(): Promise<Slot[]> {
  isTableVisible.value = true;
  isFallbackMessageVisible.value = false;
  filteredExperiences.value = [...selectedExperiences.value];

  agendaFilters.value = getAgendaFilters();

  if (!agendaFilters.value) return [];
  const cfg = generateOptions(agendaFilters.value);

  const responses = await Promise.all(
    selectedExperiences.value.map(async (experience) => {
      const { data } = await getSlots(experience.id, cfg);
      return data;
    })
  );

  return responses.flat();
}

async function handleUpdateSlotStatus(timesliceIds: string[], enabled: boolean, filtersAgenda: AgendaFilters | null) {
  if (!filtersAgenda) {
    return;
  }

  agendaFilters.value = filtersAgenda;

  try {
    await postEnabling(timesliceIds, enabled);

    // Needed because the filter limit in the inventory service is 100
    const idsChunks = splitArray(timesliceIds, 100);
    await Promise.all(
      idsChunks.map(async (chunk) => {
        const opt = generateOptions({
          ...filtersAgenda,
          timesliceIds: chunk,
          onlyClosedSlots: false,
        });

        const responses = await Promise.all(
          selectedExperiences.value.map(async (experience) => {
            const { data } = await getSlots(experience.id as string, opt);
            return data;
          })
        );

        responses.flat().forEach((slot) => updateSlot(slot));
      })
    );

    checkedTimeSliceIds.value = [];
    notificationStore.addNotification({
      theme: "success",
      message: "Status successfully updated!",
    });
  } catch (error) {
    logError("toggle-agenda-slot", error);
    notificationStore.addNotification({
      theme: "error",
      message: "Could not update slot status",
    });
  }
}

const handleSlotsCheck = (timesliceIds: string[]) => {
  const areAllIdsChecked = timesliceIds.every((timesliceId) => checkedTimeSliceIds.value.includes(timesliceId));

  if (areAllIdsChecked) {
    checkedTimeSliceIds.value = checkedTimeSliceIds.value.filter(
      (checkedTimeSliceId) => !timesliceIds.includes(checkedTimeSliceId)
    );
  } else {
    const missingIds = timesliceIds.filter((timesliceId) => !checkedTimeSliceIds.value.includes(timesliceId));
    checkedTimeSliceIds.value = checkedTimeSliceIds.value.concat(missingIds);
  }
};

const updateSlot = (newSlot: Slot) => {
  const originalItemIdx = slots.value.findIndex((slot) => slot.id === newSlot.id);

  if (originalItemIdx >= 0) {
    slots.value[originalItemIdx] = newSlot;
  } else {
    throw new Error("Could not update local slots. Item not found");
  }
};

async function handleSaveNewSlotCapacity(payload: Array<{ id: string; capacity: number }>) {
  try {
    // Update slots
    await Promise.all(payload.map((slot) => postSlotCapacity(slot.id, slot.capacity)));

    // Get updated slots
    const result = await Promise.all(payload.map((slot) => getSlot(slot.id)));

    // Update local results
    result.forEach(({ data }) => {
      updateSlot(data);
    });

    notificationStore.addNotification({
      theme: "success",
      message: "Capacity successfully updated!",
    });
  } catch (error) {
    logError("update-agenda-slot-capacity", error);
    notificationStore.addNotification({
      theme: "error",
      message: "Could not update slot capacity",
    });
  }
}

const selectAllItemsLabel = computed(() => {
  const count = checkedTimeSliceIds.value.length;
  const options = { placeholders: { count } };
  return $t("stop_sales.result_control.select_all_items", options);
});

const handleDestinations = async () => {
  await refreshDestinations();
};
const handleExperiences = async () => {
  await refreshExperiences();
};
const handleOptions = async () => {
  await refreshOptions();
};
const handleTimeSlots = async () => {
  await refreshTimeSlots();
};
watch(selectedDestinations, () => {
  selectedExperiences.value = [];
  selectedOptions.value = [];
  selectedTimeSlots.value = [];
  selectedDates.value = [];
  excludedDates.value = [];
});

watch(selectedExperiences, () => {
  selectedOptions.value = [];
  selectedTimeSlots.value = [];
  selectedDates.value = [];
  excludedDates.value = [];
});

watch(selectedOptions, () => {
  selectedTimeSlots.value = [];
  selectedDates.value = [];
  excludedDates.value = [];
});
onMounted(() => {
  isTableVisible.value = false;
});
</script>

<style scoped lang="scss">
@import "assets/scss/utilities/index";

.soft-shadow {
  box-shadow: 0 0 6px 0 rgb(3 8 72 / 6%);
}

:deep(.Dropdown__list) {
  width: fit-content;
}
</style>
