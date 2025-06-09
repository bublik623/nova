<template>
  <div data-testid="raw-event-selection-field">
    <div class="p-4 border">
      <div v-show="isEditable">
        <NovaSelectSearch
          id="raw-event-selection-field"
          v-model:search-query="searchQuery"
          :label="$t('raw-event-selection-field-select-label')"
          :max-height="260"
          :options="filteredEventList"
          placeholder="Select"
          :selected="[selectedEventOption]"
          :loading="apiConnectionStore.isLoadingEvents"
          @select:option="handleSelectOption"
        >
          <template #default="{ option }">
            <NovaSelectSearchOption :option="option">
              <template #label="{ option: optionItem }">
                <div class="flex items-center justify-start whitespace-nowrap">
                  <span class="overflow-hidden text-ellipsis min-w-0">
                    {{ optionItem.label }}
                  </span>
                  <span class="ml-2 text-text-80 text-xs flex-shrink-0">
                    {{ optionItem.code }}
                  </span>
                </div>
              </template>
            </NovaSelectSearchOption>
          </template>
        </NovaSelectSearch>

        <div class="flex justify-end mt-4 gap-x-2">
          <NovaButton variant="outline" data-testid="raw-event-selection-field-cancel" @click="handleCancel"
            >{{ $t("common.cancel") }}
          </NovaButton>
          <NovaButton
            :disabled="!hasValidChanges"
            data-testid="raw-event-selection-field-save"
            @click="handleSave(selectedEventId)"
            >{{ $t("common.save-selection") }}</NovaButton
          >
        </div>
      </div>
      <EventFieldRecap
        v-if="!isEditable"
        :readonly="readonly"
        :event="selectedEventRecap"
        @click-action:edit="handleEventEdit"
        @click-action:remove="handleEventRemove"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { BaseOption } from "@/types/Option";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaSelectSearch from "@/ui-kit/NovaSelectSearch/NovaSelectSearch.vue";
import NovaSelectSearchOption from "@/ui-kit/NovaSelectSearch/NovaSelectSearchOption.vue";
import { useVModel } from "@vueuse/core";
import EventFieldRecap from "./EventFieldRecap.vue";
import { useEventField } from "./composables/useEventField";
import { useRawApiConnectionStore } from "../../stores/useRawApiConnectionStore";
import { useAsyncModal } from "@/features/core-shared/composables/useAsyncModal";
import EventFieldModal from "./EventFieldModal.vue";

const props = defineProps<{
  appliedEvent?: string;
  readonly?: boolean;
  supplierId: string;
}>();

const events = defineEmits<{
  (e: "update:appliedEvent", value: string): void;
}>();

const appliedEventVmodel = useVModel(props, "appliedEvent", events);
const isEditable = ref(false);

const searchQuery = ref("");
const apiConnectionStore = useRawApiConnectionStore();
const selectedEventId = ref(props.appliedEvent);

const {
  selectedEventOption,
  filteredEventList,
  hasValidChanges,
  eventListLoadedForOtherSupplier,
  selectedEventRecap,
  hasLinkedEvent,
} = useEventField({
  supplierId: props.supplierId,
  searchQuery,
  selectedEventId,
});

const handleSelectOption = (opt: BaseOption<string | undefined>) => {
  selectedEventId.value = opt.value;
  searchQuery.value = "";
};

const handleCancel = () => {
  apiConnectionStore.resetEvent();
  selectedEventId.value = apiConnectionStore.linkedEvent?.id;
  isEditable.value = false;
};

const handleSave = (eventId?: string) => {
  appliedEventVmodel.value = eventId;
  isEditable.value = false;
};

const enableEditing = () => {
  isEditable.value = true;
  if (!apiConnectionStore.eventList?.length || eventListLoadedForOtherSupplier.value) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    apiConnectionStore.loadEventList();
  }
};

const eventFieldEditModal = useAsyncModal(EventFieldModal);
const handleEventEdit = async () => {
  if (!hasLinkedEvent.value) {
    enableEditing();
    return;
  }
  await eventFieldEditModal.openModal({
    action: "edit",
    handleConfirm: () => {
      enableEditing();
    },
  });
};

const handleEventRemove = async () => {
  await eventFieldEditModal.openModal({
    action: "remove",
    handleConfirm: () => {
      selectedEventId.value = undefined;
      appliedEventVmodel.value = undefined;
    },
  });
};
</script>

<style scoped lang="scss">
.border {
  border: var(--border-default);
  border-radius: var(--border-radius-default);
}
</style>
