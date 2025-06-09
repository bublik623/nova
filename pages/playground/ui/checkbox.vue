<script setup lang="ts">
import { Checkbox, CheckboxCheckedState } from "@/packages/ui/components/ui/checkbox";

import Label from "@/packages/ui/components/ui/label/Label.vue";
import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";

const checked = ref(false);

// # Example - Checkbox Days of the week
const selectedDays = ref<string[]>([]);
const days = [
  { label: "Mon", id: "mon" },
  { label: "Tue", id: "tue" },
  { label: "Wed", id: "wed" },
  { label: "Thu", id: "thu" },
  { label: "Fri", id: "fri" },
  { label: "Sat", id: "sat" },
  { label: "Sun", id: "sun" },
];

const handleCheckDay = (id: string, checked: CheckboxCheckedState) => {
  if (checked) {
    selectedDays.value.push(id);
  } else {
    selectedDays.value = selectedDays.value.filter((value) => value !== id);
  }
};

// # Example - Checkbox Group
const selectedItems = ref<string[]>([]);
const items = [
  { label: "React", id: "react" },
  { label: "Vue", id: "vue" },
  { label: "Angular", id: "angular" },
];

const handleCheckFramework = (id: string, checked: CheckboxCheckedState) => {
  if (checked) {
    selectedItems.value.push(id);
  } else {
    selectedItems.value = selectedItems.value.filter((value) => value !== id);
  }
};

// # Example - Checkbox Composed with Collapse
const initialValues = [
  { label: "React", value: "react-id", checked: false },
  { label: "Solid", value: "solid-id", checked: false },
  { label: "Vue", value: "vue-id", checked: false },
];
const open = ref(true);
const selectedItemsInCollapse = ref([...initialValues]);
const allChecked = computed(() => selectedItemsInCollapse.value.every((item) => item.checked));
const indeterminate = computed(() => selectedItemsInCollapse.value.some((item) => item.checked) && !allChecked.value);
const selectedValues = computed(() =>
  selectedItemsInCollapse.value.filter((item) => item.checked).map((item) => item.value)
);
</script>

<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold">Checkbox</h2>
    <p class="text-sm text-neutral-70">Examples with code snippets</p>

    <div class="sections grid grid-cols-1 lg:grid-cols-2 lg:gap-8 max-w-screen-xl">
      <!-- # Example - Default -->
      <div class="section">
        <h3>Checkbox - Simple</h3>
        <div class="card">
          <div class="flex items-center gap-2">
            <Checkbox id="simple" v-model="checked" />
            <Label for="simple">Accept terms and conditions </Label>
          </div>
        </div>
      </div>

      <!-- # Example - Disabled -->
      <div class="section">
        <h3>Disabled</h3>
        <div class="card">
          <div class="flex items-center gap-2">
            <Checkbox id="disabled-checked" :model-value="true" disabled />
            <Label for="disabled-checked">Accept terms and conditions </Label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox id="disabled" disabled />
            <Label for="disabled">Accept terms and conditions</Label>
          </div>
        </div>
      </div>

      <!-- # Example - Indeterminate -->
      <div class="section">
        <h3>Indeterminate</h3>
        <div class="card">
          <div class="flex items-center gap-2">
            <Checkbox id="indeterminate" :model-value="'indeterminate'" />
            <Label for="indeterminate">Indeterminate</Label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox id="indeterminate-disabled" :model-value="'indeterminate'" disabled />
            <Label for="indeterminate-disabled">Indeterminate disabled</Label>
          </div>
        </div>
      </div>

      <!-- # Example - Custom Label -->
      <div class="section">
        <h3>Custom Label</h3>
        <div class="card">
          <div class="flex items-center gap-2">
            <Checkbox> </Checkbox>
            <Label>
              I agree to the <a target="_blank" href="/" class="font-bold text-primary-100"> terms and conditions </a>
            </Label>
          </div>
        </div>
      </div>

      <!-- Example - checkbox 3 -->
      <div class="section">
        <h3>Checkbox Days of the week</h3>
        <div class="card">
          <div class="flex items-center gap-2">
            <div v-for="item in days" :key="item.id" class="flex items-center gap-2">
              <Checkbox
                :id="`day-${item.id}`"
                :model-value="selectedDays.includes(item.id)"
                @update:model-value="(checked) => handleCheckDay(item.id, checked)"
              />
              <Label :for="`day-${item.id}`">{{ item.label }}</Label>
            </div>
          </div>

          <div>SelectedDays: {{ JSON.stringify(selectedDays, null, 2) }}</div>
        </div>
      </div>

      <!-- # Example - Checkbox Group -->
      <div class="section">
        <h3>Checkbox Group</h3>
        <div class="card">
          <div>
            <h3 class="pb-1">Select Frameworks</h3>
            <div class="flex flex-col gap-2">
              <div v-for="item in items" :key="item.id" class="flex items-center gap-2">
                <Checkbox
                  :id="item.id"
                  :model-value="selectedItems.includes(item.id)"
                  @update:model-value="(checked) => handleCheckFramework(item.id, checked)"
                />
                <Label :for="item.id">{{ item.label }}</Label>
              </div>
            </div>
          </div>
          <div>SelectedItems: {{ JSON.stringify(selectedItems, null, 2) }}</div>
        </div>
      </div>

      <!-- # Example - Checkbox Composed with Collapse -->
      <div class="section">
        <h3>Checkbox Composed with Collapse</h3>
        <div class="card">
          <div>
            <NovaCollapse v-model="open" class="w-full" :active="selectedValues.length > 0">
              <template #title>
                <div class="flex items-center gap-2" @click.stop>
                  <Checkbox
                    id="collapse-checkbox"
                    :model-value="indeterminate ? 'indeterminate' : allChecked"
                    @update:model-value="
                      (checked) =>
                        (selectedItemsInCollapse = selectedItemsInCollapse.map((item) => ({
                          ...item,
                          checked: !!checked,
                        })))
                    "
                  >
                  </Checkbox>
                  <Label for="collapse-checkbox" class="font-bold text-base" @click.stop>Frameworks</Label>
                </div>
              </template>
              <div class="px-6 py-4 flex flex-col gap-2">
                <div v-for="item in selectedItemsInCollapse" :key="item.value" class="flex items-center gap-2">
                  <Checkbox :id="item.value" v-model="item.checked" :value="item.value"> </Checkbox>
                  <Label :for="item.value">{{ item.label }}</Label>
                </div>
              </div>
            </NovaCollapse>
          </div>
          <div>SelectedValues: {{ JSON.stringify(selectedValues, null, 2) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./assets/playground-styles.css"></style>
