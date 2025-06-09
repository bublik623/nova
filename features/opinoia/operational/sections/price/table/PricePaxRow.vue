<script setup lang="ts">
defineProps<{
  parentId?: string;
  paxLabel?: string;
  isInvalid?: boolean;
  disabled?: boolean;
}>();

const cost = defineModel<number>("cost");
const initialPrice = defineModel<number>("initialPrice");
const suggestedPrice = defineModel<number>("suggestedPrice");
</script>

<template>
  <tr :class="{ error: isInvalid }" data-testid="sub-row-pax" :data-parent-id="parentId">
    <td class="border-r-0 border-t-0"></td>
    <!-- Empty cell for toggle column -->
    <td class="border-t-0"></td>
    <td data-testid="cell-pax-label" :class="{ 'bg-neutral-10': disabled }">
      {{ paxLabel }}
    </td>
    <td data-testid="cell-pax-cost" :class="{ 'bg-neutral-10': disabled }">
      <input
        v-model="cost"
        :disabled="disabled"
        step="any"
        data-testid="input-pax-cost"
        type="number"
        class="price-input"
        :class="{ 'text-neutral-400': !cost }"
      />
    </td>
    <td data-testid="cell-pax-initial-price" :class="{ 'bg-neutral-10': disabled }">
      <input
        v-model="initialPrice"
        :disabled="disabled"
        step="any"
        data-testid="input-pax-initial-price"
        type="number"
        class="price-input"
        :class="{ 'text-neutral-400': !initialPrice }"
      />
    </td>
    <td data-testid="cell-pax-suggested-price" :class="{ 'bg-neutral-10': disabled }">
      <input
        v-model="suggestedPrice"
        :disabled="disabled"
        step="any"
        data-testid="input-pax-suggested-price"
        type="number"
        class="price-input"
        :class="{ 'text-neutral-400': !suggestedPrice }"
      />
    </td>
    <!-- Empty cell for the days of the week -->
    <td class="border-t-0 border-r-0"></td>
    <!-- Empty cell for the last column -->
    <td class="border-t-0"></td>
  </tr>
</template>
<style scoped lang="scss">
.price-input {
  @apply w-full bg-transparent focus:outline-none;
}
</style>
