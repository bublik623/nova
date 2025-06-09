<template>
  <div class="flex flex-col items-center justify-center w-full max-w-[410px] p-6" data-testid="event-field-modal">
    <NovaIcon class="text-warning" name="warning-solid" :size="48" />
    <h2 class="mt-2 font-bold text-lg text-text-100">
      {{ $t(currentActionTranslations.title) }}
    </h2>
    <div class="mt-4 text-center text-text-90 text-sm">
      <p>{{ $t(currentActionTranslations.description) }}</p>
      <p class="text-text-100 font-bold mt-2">{{ $t(currentActionTranslations.prompt) }}</p>
    </div>
    <div class="mt-5 flex gap-5 justify-between w-full">
      <NovaButton data-testid="modal-action-cancel" size="sm" variant="underlined" @click="$emit('cancel')">
        {{ $t("event-field.modal.edit.cancel") }}
      </NovaButton>
      <NovaButton data-testid="modal-action-confirm" size="sm" @click="confirmAction">
        {{ $t(currentActionTranslations.confirm) }}
      </NovaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { UseAsyncModalEvents } from "@/features/core-shared/composables/useAsyncModal";

type Emits = UseAsyncModalEvents;

const emit = defineEmits<Emits>();
const props = defineProps<{ handleConfirm: () => Promise<void> | void; action: "edit" | "remove" }>();

const currentActionTranslations = computed(() => translations[props.action]);

const translations = {
  edit: {
    title: "event-field.modal.edit.title",
    description: "event-field.modal.edit.description",
    prompt: "event-field.modal.edit.prompt",
    confirm: "event-field.modal.edit.confirm",
  },
  remove: {
    title: "event-field.modal.remove.title",
    description: "event-field.modal.remove.description",
    prompt: "event-field.modal.remove.prompt",
    confirm: "event-field.modal.remove.confirm",
  },
};

async function confirmAction() {
  await props.handleConfirm();
  emit("confirm");
}
</script>
