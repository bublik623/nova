<template>
  <DocumentFormSection id="agenda" :required="false">
    <FilterGroup
      :slots="slots"
      :hide-date-filter="isOpenDate"
      :hide-timeslot-filter="isOpenDate || experienceType === ExperienceType.CALENDAR_NO_TIMESLOTS"
      @update:dates="handleApplyFilters"
      @apply:filters="handleApplyFilters($event, true)"
    />

    <NovaAlert
      v-show="filteredSlots.some((el) => el.option.pricing_type_allowed === PricingDefinition.GROUP)"
      status="warning"
      size="sm"
      variant="solid"
      class="my-4"
      data-testid="agenda-alert-groups"
    >
      <UtilsRenderHtml :string="$t('experience.agenda.alert.groups')"> </UtilsRenderHtml>
    </NovaAlert>

    <div class="Results">
      <div v-if="groupedSlots.length">
        <div v-if="!isReadonly" class="Results__select-all mt-4">
          <NovaCheckbox
            value="select-all-checkbox"
            :status="areAllChecked ? 'checked' : 'unchecked'"
            :label="`Select all items (${checkedTimeSliceIds.length} selected)`"
            @update:status="handleSlotsCheck(filteredSlots.map((slot) => slot.timeslice_id))"
          />
          <span>
            <NovaButton
              variant="outline"
              size="sm"
              :disabled="
                !checkedTimeSliceIds.length ||
                checkedTimeSliceIds.every((id) => filteredSlots.find((s) => s.timeslice_id === id)?.enabled)
              "
              data-testid="agenda.open-selected.button"
              @click="handleUpdateSlotStatus(checkedTimeSliceIds, true, filters)"
              >{{ $t("experience.agenda.button.open-selected") }}</NovaButton
            >
            <NovaButton
              class="ml-4"
              variant="outline"
              size="sm"
              :disabled="
                !checkedTimeSliceIds.length ||
                checkedTimeSliceIds.every((id) => !filteredSlots.find((s) => s.timeslice_id === id)?.enabled)
              "
              data-testid="agenda.close-selected.button"
              @click="handleUpdateSlotStatus(checkedTimeSliceIds, false, filters)"
              >{{ $t("experience.agenda.button.close-selected") }}</NovaButton
            ></span
          >
        </div>

        <ResultTable
          v-for="data in groupedSlots"
          :key="data.slots[0].timeslice_id"
          class="my-4"
          :checked="false"
          :date="data.date"
          :slots="data.slots"
          :on-update-capacity="handleSaveNewSlotCapacity"
          :checked-time-slice-ids="checkedTimeSliceIds"
          :readonly="isReadonly"
          @toggle:check-slots="handleSlotsCheck"
          @toggle:status="handleUpdateSlotStatus([$event.timeslice_id], $event.value, filters)"
        >
        </ResultTable>
      </div>
      <div v-else class="Results__no-results">
        <p>{{ $t("experience.agenda.no-results") }}</p>
      </div>
    </div>
  </DocumentFormSection>
</template>

<script lang="ts" setup>
import ResultTable from "@/features/experience-agenda/components/ResultTable.vue";
import { groupSlots } from "@/features/experience-agenda/lib/group-slots";
import { generateOptions } from "@/features/experience-agenda/lib/generate-options";
import { AgendaFilters, Slot } from "@/features/experience-agenda/types/Agenda";
import { useInventoryServiceApi } from "@/features/core-shared/composables/useInventoryServiceApi";
import { useNotifications } from "@/stores/notifications";
import { useExperienceRaw } from "@/stores/experience-raw";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import FilterGroup from "@/features/experience-agenda/components/FilterGroup.vue";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { splitArray } from "@/features/experience-agenda/lib/split-array";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { eventBusCuration } from "@/features/experience-shared/composables/useEventBus";
import { saveCurationContent } from "@/features/experience-curation/lib/saveCurationContent";
import NovaAlert from "@/ui-kit/NovaAlert/NovaAlert.vue";
import { PricingDefinition } from "@/types/Options";

const { $t } = useNuxtApp();
const { params } = useRoute();
const { getSlot, getSlots, postSlotCapacity, postEnabling } = useInventoryServiceApi();
const notificationStore = useNotifications();
const { logError } = useLogger();
const experienceRaw = useExperienceRaw();
const id = params.id as string;

defineProps<{ isReadonly: boolean }>();

const experienceType = computed(() => experienceRaw.rawContents[params.id as string].data.offerExperience!.type);
const isOpenDate = computed(() =>
  [ExperienceType.NO_CALENDAR_FIXED_END, ExperienceType.NO_CALENDAR_FIXED_VALIDITY].includes(experienceType.value!)
);

// ids needed to change the slots status
const checkedTimeSliceIds: Ref<string[]> = ref([]);

const isLoading = ref(false);
const areAllChecked = computed(() =>
  filteredSlots.value.reduce((acc, slot) => {
    return acc && checkedTimeSliceIds.value.includes(slot.timeslice_id);
  }, {})
);
const filters: Ref<AgendaFilters | null> = ref(null);
const slots = ref<Slot[]>([]);
const filteredSlots = ref<Slot[]>([]);
const groupedSlots = computed(() => groupSlots(filteredSlots.value ?? []));

onBeforeMount(async () => {
  // If it's an open date ticket we don't wait for date selection to get the slots
  // Because we don't show the date filter
  if (isOpenDate.value) {
    const { data } = await getSlots(params.id as string);
    slots.value = data;
  }
});

async function handleApplyFilters(agendaFilters: AgendaFilters, showResults?: boolean) {
  if (isLoading.value) {
    return;
  }
  isLoading.value = true;

  if (!agendaFilters.range.from || !agendaFilters.range.to) {
    slots.value = [];
    isLoading.value = false;
    return;
  }

  filters.value = agendaFilters;
  const cfg = generateOptions(agendaFilters);
  const { data } = await getSlots(params.id as string, cfg);

  if (showResults) {
    filteredSlots.value = data;
  } else {
    slots.value = data;
  }
  isLoading.value = false;
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
  const originalItemIdx = filteredSlots.value.findIndex((slot) => slot.id === newSlot.id);

  if (originalItemIdx >= 0) {
    filteredSlots.value[originalItemIdx] = newSlot;
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

async function handleUpdateSlotStatus(timesliceIds: string[], enabled: boolean, filtersAgenda: AgendaFilters | null) {
  if (!filtersAgenda) {
    return;
  }

  try {
    await postEnabling(timesliceIds, enabled);

    // needed because the filter limit in the inventory service is 100
    const idsChunks = splitArray(timesliceIds, 100);
    idsChunks.forEach(async (chunk) => {
      const opt = generateOptions({
        ...filtersAgenda,
        timesliceIds: chunk,
        onlyClosedSlots: false,
      });
      const { data } = await getSlots(params.id as string, opt);
      data.forEach(async (slot) => updateSlot(slot));
    });

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
// Saving
const stopCurationBus = eventBusCuration.on(
  async (event, opt: { publish: boolean; redirect: boolean; translate: boolean; force: boolean }) => {
    if (event === "SAVE") {
      if (opt?.publish || opt?.translate) {
        saveCurationContent({
          id,
          redirect: opt?.redirect,
          translate: opt?.translate,
          publish: opt?.publish,
          force: opt?.force,
        });
      } else {
        notificationStore.addNotification({
          theme: "success",
          message: "notifications.success.saving.document",
        });
      }
    }
  }
);
onBeforeUnmount(() => {
  stopCurationBus();
});
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.filters {
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

    & > p {
      color: var(--color-primary-100);
      margin-bottom: rem(5);
    }

    & > span {
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

.Results {
  &__no-results {
    display: flex;
    justify-content: center;
    margin-top: rem(34);
    @include font-semibold(18);
  }

  &__select-all {
    padding: rem(6) rem(16);
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      display: flex;
    }
  }
}
</style>
