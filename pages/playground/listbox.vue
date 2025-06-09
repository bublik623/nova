<script setup lang="ts">
import FieldListBox from "@/features/experience-shared/components/FieldListBox.vue";
import FieldListBoxItem from "@/features/experience-shared/components/FieldListBoxItem.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";

interface DummyItem {
  id: number;
  name: string;
  description?: string;
}

const dummyItems = ref<DummyItem[]>([
  { id: 1, name: "British Airport", description: "Airport Highway. London. England." },
  { id: 2, name: "Milan Airport", description: "Milan" },
  { id: 3, name: "Green Park", description: "Green park Street. London. England." },
  { id: 4, name: "Barcelona", description: "Barcelona Street. Barcelona. Spain." },
  { id: 5, name: "Airport", description: "Airport Highway. London. England" },
]);

const handleDelete = (item: DummyItem) => {
  console.log("Item deleted:", item);
  dummyItems.value = dummyItems.value.filter((i) => i.id !== item.id);
};
</script>

<template>
  <div class="p-5">
    <h1 class="text-2xl font-bold mb-5">FieldListBox Playground</h1>
    <div class="max-w-xl mb-5">
      <FieldListBox v-if="dummyItems.length" class="px-4" data-testid="field-list-box">
        <FieldListBoxItem v-for="item in dummyItems" :key="item.id">
          <span class="mr-2">{{ item.name }}</span>
          <span class="text-xs text-text-80">{{ item.description }}</span>
          <template #actions>
            <NovaButtonIcon :size="16" name="trash" theme="dark" shape="square" @click="handleDelete(item)" />
          </template>
        </FieldListBoxItem>
      </FieldListBox>
    </div>
    <div class="bg-gray-100 p-3 rounded-md">
      <h2 class="text-lg font-semibold mb-2">Current Items:</h2>
      <pre class="whitespace-pre-wrap break-words">{{ JSON.stringify(dummyItems, null, 2) }}</pre>
    </div>
  </div>
</template>
