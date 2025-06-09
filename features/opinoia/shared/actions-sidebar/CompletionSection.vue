<script setup lang="ts">
import ActionBarCta from "@/features/experience-shared/components/ActionBarCta.vue";
import ActionBarPercentage from "@/features/experience-shared/components/ActionBarPercentage.vue";

export type CompletionSectionProps = {
  completionPercentage: number;
  canPublish: boolean;
  isBusy: boolean;
};

export type Events = {
  (event: "publish"): void;
};

defineProps<CompletionSectionProps>();
defineEmits<Events>();
</script>

<template>
  <ActionBarCta
    id="send-to-preview"
    :title="$t('action.bar.experience.progress.title')"
    :description="$t('action.bar.raw.content.tip')"
    :percentage-completion="completionPercentage"
    :cta-text="$t('action.bar.raw.content.button')"
    :cta-enabled="canPublish"
    :cta-loading="isBusy"
    @click:action="$emit('publish')"
  >
    <template #additional-info>
      <ActionBarPercentage :percentage="completionPercentage" class="mt-2" />
    </template>
  </ActionBarCta>
</template>
