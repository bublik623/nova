<script setup lang="ts">
import ActionBarCta from "@/features/experience-shared/components/ActionBarCta.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { format } from "date-fns";

export type ContentStorageSectionProps = {
  lastEditDate: string | undefined;
  canSaveDraft: boolean;
  isBusy: boolean;
};

export type Events = {
  (event: "saveDraft"): void;
};

const props = defineProps<ContentStorageSectionProps>();
defineEmits<Events>();

const DATE_FORMAT = "dd MMM yyyy, p";

const formattedDate = computed(() => (props.lastEditDate ? format(props.lastEditDate, DATE_FORMAT) : ""));
</script>

<template>
  <ActionBarCta
    id="save-content"
    :title="$t('action-bar.raw.save.title')"
    :description="$t('action-bar.raw.save.tip')"
    :cta-text="$t('action-bar.raw.save.button')"
    :cta-enabled="canSaveDraft"
    :cta-loading="isBusy"
    @click:action="$emit('saveDraft')"
  >
    <template v-if="!!lastEditDate" #additional-info>
      <div class="flex flex-row mt-2">
        <NovaIcon name="check" :size="14" :style="{ color: 'var(--color-success-90)' }"></NovaIcon>

        <span class="text-xs ml-2">{{ $t("common.last_edit") }}: {{ formattedDate }}</span>
      </div>
    </template>
  </ActionBarCta>
</template>
