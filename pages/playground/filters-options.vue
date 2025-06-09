<template>
  <div class="m-4">
    <MultiSelect v-model:selected-values="selectedOptions">
      <template #default="{ isDropdownOpen }">
        <MultiSelectTrigger as-child>
          <FilterButton
            v-model:selected-count="selectedOptions.length"
            class="bg-primary-10 w-64 ring-1 ring-primary-100"
            title="Options"
            data-testid="button-options"
            :is-open="isDropdownOpen"
            :selected-items-count="selectedOptions.length"
          />
        </MultiSelectTrigger>
        <MultiSelectPortal
          class="px-5 py-4 content max-w-[calc(32rem+1px)] mt-[1px] bg-white w-full ring-1 ring-primary-100 rounded-br-lg rounded-bl-lg"
        >
          <div class="">
            <div class="bg-gray-100 p-2 rounded">
              <MultiSelectSearch v-model="searchQuery" placeholder="Search for element" />
            </div>
            <div class="flex items-center gap-2 py-3 border-b border-neutral-40 font-normal">
              <MultiSelectAllCheckbox :options="options" />
              <span class="text-sm">Select all items ({{ selectedOptions.length }} selected)</span>
            </div>
            <div class="max-h-[20rem] overflow-y-auto">
              <MultiSelectGroup
                v-for="(experiences, cityName) in groupBy(filteredOptions, 'city')"
                :key="cityName"
                class="text-xs py-2 text-text-80"
                :label="cityName.toString()"
              >
                <MultiSelectGroup
                  v-for="(groupedOptions, experienceName) in groupBy(experiences, 'experience.label')"
                  :key="experienceName"
                  :label="experienceName.toString()"
                  class="text-sm flex items-center gap-2 py-2 pb-4 font-normal"
                >
                  <div v-for="option in groupedOptions" :key="option.val">
                    <div class="flex gap-2 items-center pb-4 pl-4">
                      <MultiSelectCheckbox :model-value="option" />
                      <MultiSelectItem data-testid="option-options-label" class="truncate font-light text-sm">{{
                        option.label
                      }}</MultiSelectItem>
                      <span class="text-text-80 text-xs font-light">{{ option.val }}</span>
                    </div>
                  </div>
                </MultiSelectGroup>
              </MultiSelectGroup>
            </div>
          </div>
        </MultiSelectPortal>
      </template>
    </MultiSelect>
  </div>
</template>

<script setup lang="ts">
import {
  MultiSelect,
  MultiSelectCheckbox,
  MultiSelectGroup,
  MultiSelectAllCheckbox,
  MultiSelectPortal,
  MultiSelectSearch,
  MultiSelectTrigger,
  MultiSelectItem,
} from "@/features/stop-sales/components/MultiSelect";
import { MultiSelectOption } from "@/features/stop-sales/components/MultiSelect/multi-select.types";
import FilterButton from "@/features/stop-sales/components/FilterButton.vue";
import { groupBy } from "lodash";

type OptionItem = MultiSelectOption<string> & { experience: { label: string; subLabel: string }; city: string };

const searchQuery = ref("");
const selectedOptions = ref([]);
const options = ref<OptionItem[]>([
  {
    label: "Entry only",
    val: "KHF9734",
    experience: { label: "Tapas Tasting tour", subLabel: "KHF9712" },
    city: "Madrid",
  },
  {
    label: "With guide",
    val: "IUY765",
    experience: { label: "Tapas Tasting tour", subLabel: "KHF9712" },
    city: "Madrid",
  },
  {
    label: "With meal",
    val: "HGF765",
    experience: { label: "Retiro Park Picnic", subLabel: "HGF243" },
    city: "Mexico City",
  },
  {
    label: "Tour only",
    val: "KK1876",
    experience: { label: "Retiro Park Picnic", subLabel: "HGF243" },
    city: "Mexico City",
  },
  {
    label: "With drinks",
    val: "JHG3837",
    experience: { label: "Retiro Park Picnic", subLabel: "HGF243" },
    city: "Mexico City",
  },
]);
const filteredOptions = computed(() => {
  return options.value.filter((option) => {
    return option.label.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});
</script>
