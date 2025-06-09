<script setup lang="ts">
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import InlineSingleSelect from "../../../shared/inline-single-select/InlineSingleSelect.vue";
import DatePicker from "../../../shared/date-picker/DatePicker.vue";
import InlineMultiSelect from "../../../shared/inline-multi-select/InlineMultiSelect.vue";
import NovaInputNumber from "@/ui-kit/NovaInputNumber/NovaInputNumber.vue";
import { AllotmentData } from "../types";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { mapMasterdataLanguagesToBaseOptions } from "@/features/experience-calendar/utils/option-language-utils";
import { useAllotmentTable } from "./useAllotmentTable";
import { useMasterData } from "@/stores/master-data";
import SimpleTable from "@/features/opinoia/operational/shared/simple-table/SimpleTable.vue";

export type AllotmentTableProps = {
  experienceId: string;
};

const props = defineProps<AllotmentTableProps>();
const allotments = defineModel<AllotmentData[]>("allotments", { required: true });

const { availableLanguages } = useMasterData();
const languagesAsOptions = computed(() => {
  return mapMasterdataLanguagesToBaseOptions(availableLanguages);
});

const {
  optionListWithExperience,
  addNewAllotment,
  duplicateAllotment,
  removeAllotment,
  getSelectedOptionValue,
  handleUpdateOption,
} = useAllotmentTable({
  allotments,
  experienceId: props.experienceId,
});
</script>

<template>
  <div class="flex flex-col">
    <SimpleTable>
      <thead class="bg-primary-100/5">
        <tr>
          <th scope="col" class="w-40">
            <div class="flex flex-row justify-between">
              <span>{{ $t("opinoia.allotment-section.table.column.option.title") }}*</span>
            </div>
          </th>
          <th class="w-40">{{ $t("opinoia.allotment-section.table.column.dateRange.title") }}*</th>
          <th scope="col" class="w-40">{{ $t("opinoia.allotment-section.table.column.languages.title") }}*</th>
          <th class="w-10">{{ $t("common.monday.short") }}</th>
          <th class="w-10">{{ $t("common.tuesday.short") }}</th>
          <th class="w-10">{{ $t("common.wednesday.short") }}</th>
          <th class="w-10">{{ $t("common.thursday.short") }}</th>
          <th class="w-10">{{ $t("common.friday.short") }}</th>
          <th class="w-10">{{ $t("common.saturday.short") }}</th>
          <th class="w-10">{{ $t("common.sunday.short") }}</th>
          <th scope="col" class="w-10"></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(allotment, index) in allotments" :key="index">
          <tr>
            <td>
              <InlineSingleSelect
                :selected-value="getSelectedOptionValue(allotment)"
                :options="optionListWithExperience"
                @update:selected-value="(val) => handleUpdateOption(val!, allotment)"
              />
            </td>
            <td data-testid="cell-date-range">
              <DatePicker v-model:selected-dates="allotment.dates" />
            </td>
            <td data-testid="cell-languages">
              <InlineMultiSelect v-model:selected-values="allotment.languages" :options="languagesAsOptions" />
            </td>
            <td><NovaInputNumber id="input-monday" v-model="allotment.monday" :min-value="0" /></td>
            <td><NovaInputNumber id="input-tuesday" v-model="allotment.tuesday" :min-value="0" /></td>
            <td><NovaInputNumber id="input-wednesday" v-model="allotment.wednesday" :min-value="0" /></td>
            <td><NovaInputNumber id="input-thursday" v-model="allotment.thursday" :min-value="0" /></td>
            <td><NovaInputNumber id="input-friday" v-model="allotment.friday" :min-value="0" /></td>
            <td><NovaInputNumber id="input-saturday" v-model="allotment.saturday" :min-value="0" /></td>
            <td><NovaInputNumber id="input-sunday" v-model="allotment.sunday" :min-value="0" /></td>

            <td data-testid="cell-actions">
              <div class="flex">
                <NovaButtonIcon
                  data-testid="button-duplicate-allotment"
                  shape="square"
                  theme="dark"
                  :size="16"
                  name="duplicate"
                  @click="duplicateAllotment(allotment)"
                />
                <NovaButtonIcon
                  data-testid="button-delete-allotment"
                  shape="square"
                  theme="dark"
                  :size="16"
                  name="trash"
                  @click="removeAllotment(allotment)"
                />
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </SimpleTable>
  </div>
  <div class="flex flex-row mt-4">
    <NovaButton data-testid="button-new-line" variant="text" theme="primary" size="xs" @click="addNewAllotment">
      <NovaIcon name="plus" :size="14" class="mr-2" />
      <span class="text-sm">{{ $t("common.new-line") }}</span>
    </NovaButton>
  </div>
</template>

<style lang="scss" scoped>
// child input styling override rules
:deep(.InputNumber) {
  border: 0;
  @apply p-0 w-full;

  // Target input elements inside the deep components
  input {
    @apply m-0 p-0;
  }
}
</style>
