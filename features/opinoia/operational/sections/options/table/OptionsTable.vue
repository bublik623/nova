<script setup lang="ts">
import NovaInputNumber from "@/ui-kit/NovaInputNumber/NovaInputNumber.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import ExperiencePaxTypesSelect from "../../../shared/experience-pax-types/ExperiencePaxTypesSelect.vue";
import { Option } from "../types";
import ExperienceSubchannelsSelect from "../../../shared/experience-subchannels/ExperienceSubchannelsSelect.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { useOptionsTable } from "./useOptionsTable";
import NovaSortButton from "@/ui-kit/NovaSortButton/NovaSortButton.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import { DeepReadonly } from "vue";
import SimpleTable from "@/features/opinoia/operational/shared/simple-table/SimpleTable.vue";

const SHOW_SUBCHANNEL_COLUMN = false;

export type OptionsTableProps = {
  experienceId: string;
  invalidOptionsId: string[];
  lastSavedOptions: DeepReadonly<Option[]>;
};

const props = defineProps<OptionsTableProps>();

const options = defineModel<Option[]>("options", { required: true });
const lastSavedOptions = toRef(props, "lastSavedOptions");

const { sortColumn, sortDirection, canEditOptionsCode, sortBy, addNewOption, duplicateOption, removeOption } =
  useOptionsTable(options, lastSavedOptions);

const titleSortDirection = computed(() => (sortColumn.value === "title" ? sortDirection.value : undefined));
const codeSortDirection = computed(() => (sortColumn.value === "code" ? sortDirection.value : undefined));
</script>
<template>
  <div class="flex flex-col">
    <SimpleTable>
      <thead class="bg-primary-100/5">
        <tr class="text-left">
          <th class="w-5/12">
            <div class="flex flex-row justify-between">
              <span>{{ $t("opinoia.options-section.title-column.title") }}*</span>
              <NovaSortButton :sorting="titleSortDirection" @click="sortBy('title')" />
            </div>
          </th>
          <th class="w-3/12">
            <div class="flex flex-row justify-between">
              <span>{{ $t("opinoia.options-section.code-column.title") }}*</span>
              <NovaSortButton :sorting="codeSortDirection" @click="sortBy('code')" />
            </div>
          </th>
          <th class="w-1/12">{{ $t("opinoia.options-section.duration-column.title") }}*</th>
          <th v-if="SHOW_SUBCHANNEL_COLUMN">{{ $t("opinoia.options-section.subchannels-column.title") }}*</th>
          <th class="w-2/12">{{ $t("opinoia.options-section.paxes-column.title") }}*</th>
          <th class="w-1/12"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="option in options" :key="option.id" :class="{ error: invalidOptionsId.includes(option.id) }">
          <td>
            <NovaInputText :id="`option-${option.id}-title`" v-model="option.title" />
          </td>
          <td>
            <NovaInputText
              :id="`option-${option.id}-code`"
              v-model="option.code"
              :readonly="!canEditOptionsCode(option)"
            />
          </td>
          <td>
            <NovaInputNumber :id="`option-${option.id}-duration`" v-model="option.duration" :min-value="0" />
          </td>
          <td v-if="SHOW_SUBCHANNEL_COLUMN">
            <ExperienceSubchannelsSelect v-model:selected="option.subchannels" :experience-id />
          </td>
          <td>
            <ExperiencePaxTypesSelect v-model:selected="option.paxTypes" :experience-id />
          </td>
          <td>
            <div class="flex flex-row gap-2">
              <NovaButtonIcon name="duplicate" @click="duplicateOption(option)" />
              <NovaButtonIcon name="trash" @click="removeOption(option)" />
            </div>
          </td>
        </tr>
      </tbody>
    </SimpleTable>
    <div class="flex flex-row mt-4">
      <NovaButton data-testid="button-new-line" variant="text" theme="primary" size="xs" @click="addNewOption">
        <NovaIcon name="plus" :size="14" class="mr-2" />
        <span class="text-sm">{{ $t("common.new-line") }}</span>
      </NovaButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
table {
  // child input styling override rules
  :deep(.InputText),
  :deep(.InputNumber) {
    border: 0;
    @apply p-0 w-full;

    // Target input elements inside the deep components
    input {
      @apply m-0 p-0;
    }
  }
}
</style>
