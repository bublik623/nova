<template>
  <span class="flex justify-between items-center">
    <span v-show="!!event" class="font-bold h-100 leading-[30px]">{{
      $t("raw-event-selection-field-recap-title")
    }}</span>
    <NoContentUtil
      v-if="!event"
      :placeholder="$t('raw-event-selection-field-no-event-placeholder')"
      class="self-center"
    />
    <span class="flex gap-1">
      <NovaButton
        v-if="!readonly"
        variant="text"
        size="sm"
        theme="primary"
        data-testid="raw-event-selection-field-edit"
        style="margin: 0; padding: 5px"
        @click="$emit('click-action:edit')"
      >
        <NovaIcon name="edit" class="inline-block mr-1" />
        {{ $t("common.edit") }}
      </NovaButton>
      <NovaButton
        v-if="!readonly && !!event"
        variant="text"
        size="sm"
        theme="primary"
        data-testid="raw-event-selection-field-remove"
        style="margin: 0; padding: 5px"
        @click="$emit('click-action:remove')"
      >
        <NovaIcon name="trash" class="inline-block mr-1" />
        {{ $t("common.remove") }}
      </NovaButton>
    </span>
  </span>

  <div v-show="!!event">
    <p class="font-normal mb-4">{{ event?.title || "" }}</p>
    <p class="font-bold mb-1 leading-[30px]">{{ $t("raw-event-selection-field-recap-code") }}</p>
    <p class="font-normal">{{ event?.code || "" }}</p>
  </div>
</template>

<script setup lang="ts">
import NoContentUtil from "@/features/experience-shared/components/NoContentUtil.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";

defineProps<{
  readonly?: boolean;
  event?: { title: string; code: string };
}>();
defineEmits<{
  (e: "click-action:edit"): void;
  (e: "click-action:remove"): void;
}>();
</script>
