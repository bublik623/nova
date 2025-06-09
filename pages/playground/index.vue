<template>
  <main>
    <NovaMultiSelect
      v-model:model-value="selectedValues"
      :options="options"
      show-searchbar
      name="Filters"
    ></NovaMultiSelect>
  </main>
</template>
<script setup lang="ts">
import NovaMultiSelect from "@/ui-kit/NovaMultiSelect/NovaMultiSelect.vue";

const selectedValues = ref([]);
const options = [
  {
    label: "label1",
    value: "value1",
  },
  {
    label: "label2",
    value: "value2",
  },
  {
    label: "label3",
    value: "value3",
  },
  {
    label: "label4",
    value: "value4",
  },
  {
    label: "label5",
    value: "value5",
  },
  {
    label: "label6",
    value: "value6",
  },
  {
    label: "label7",
    value: "value7",
  },
  {
    label: "label8",
    value: "value8",
  },
  {
    label: "label9",
    value: "value9",
  },
  {
    label: "label10",
    value: "value10",
  },
];
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

main {
  width: 300px;
  padding: 100px;
}
</style>
