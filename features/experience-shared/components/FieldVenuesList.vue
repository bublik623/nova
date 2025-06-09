<script setup lang="ts">
import FieldListBox from "@/features/experience-shared/components/FieldListBox.vue";
import FieldListBoxItem from "@/features/experience-shared/components/FieldListBoxItem.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import { Venue } from "@/types/generated/GeoMasterDataApi";

defineProps<{ disabled?: boolean; items: Venue[] }>();
const emit = defineEmits<{ remove: [Venue] }>();

const handleRemove = (venue: Venue) => {
  emit("remove", venue);
};
</script>

<template>
  <FieldListBox v-if="items.length" class="px-4 max-h-[206px]" data-testid="field-selected-venues">
    <FieldListBoxItem v-for="item in items" :key="item.code">
      <span class="mr-2">{{ item.name }}</span>
      <template v-if="!disabled" #actions>
        <NovaButtonIcon
          data-testid="button-remove-item"
          :size="16"
          name="trash"
          theme="dark"
          shape="square"
          @click="handleRemove(item)"
        />
      </template>
    </FieldListBoxItem>
  </FieldListBox>
</template>
