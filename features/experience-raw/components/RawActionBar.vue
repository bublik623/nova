<template>
  <ActionBar>
    <template #actions>
      <span v-if="!isReadonly">
        <DistributionAttributes v-if="showDistributionLevel" class="mt-4" />
        <ActionBarCta
          id="save-content"
          :title="$t('action-bar.raw.save.title')"
          :description="`${$t('action-bar.raw.save.tip')}`"
          :cta-text="$t('action-bar.raw.save.button')"
          :cta-type="'outline'"
          :cta-enabled="saveDraftEnabled"
          :cta-loading="saveDraftIsLoading"
          @click:action="$emit('save-draft')"
        >
          <template #additional-info> <ActionBarLastEditDate /> </template>
        </ActionBarCta>
        <ActionBarCta
          id="send-to-preview"
          :title="$t('action.bar.experience.progress.title')"
          :description="$t('action.bar.raw.content.tip')"
          :percentage-completion="percentageCompletion"
          :cta-text="$t('action.bar.raw.content.button')"
          :cta-enabled="publishEnabled"
          :cta-loading="publishIsLoading"
          @click:action="$emit('publish')"
        >
          <template #additional-info>
            <ActionBarPercentage :percentage="percentageCompletion" class="mt-2" />
          </template>
        </ActionBarCta>
      </span>
    </template>
    <template v-if="canDeleteExp" #actions_footer>
      <NovaButton
        class="delete-experience-button"
        variant="action"
        size="xxs"
        data-testid="delete-btn"
        @click="$emit('delete')"
      >
        <NovaIcon name="trash" class="mr-1" :size="14" />
        {{ $t("action.bar.raw.content.delete") }}
      </NovaButton>
    </template>

    <template #history>
      <ProductHistory>
        <template #activity_log>
          <ActionBarActivity class="w-full" />
        </template>
        <template #version_history>
          <VersionHistory
            :experience-id="experienceId"
            :document-content-type="DocumentContentType.RAW"
            @action:open-revision="(revisionId) => $emit('open-revision', revisionId)"
          />
        </template>
      </ProductHistory>
    </template>
  </ActionBar>
</template>

<script setup lang="ts">
import ActionBar from "@/features/experience-shared/components/ActionBar.vue";
import ActionBarCta from "@/features/experience-shared/components/ActionBarCta.vue";
import ActionBarPercentage from "@/features/experience-shared/components/ActionBarPercentage.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import ActionBarLastEditDate from "@/features/experience-shared/components/ActionBarLastEditDate.vue";
import DistributionAttributes from "@/features/experience-shared/components/DistributionAttributes.vue";
import ActionBarActivity from "@/features/experience-activity-log/components/ActionBarActivity.vue";
import ProductHistory from "@/features/experience-shared/components/ProductHistory.vue";
import VersionHistory from "@/features/experience-shared/components/VersionHistory.vue";
import { DocumentContentType } from "@/types/DocumentStatuses";
import { StatusCode } from "@/types/generated/ExperienceRawServiceApi";

interface Props {
  experienceId: string;
  experienceTitle: string;
  isReadonly: boolean;
  showDistributionLevel: boolean;
  saveDraftEnabled: boolean;
  saveDraftIsLoading: boolean;
  publishEnabled: boolean;
  publishIsLoading: boolean;
  percentageCompletion: number;
  statusCode?: StatusCode;
}
interface Events {
  (event: "save-draft"): void;
  (event: "publish"): void;
  (event: "delete"): void;
  (event: "open-revision", revisionId: string): void;
}

const props = defineProps<Props>();
defineEmits<Events>();

const isInCreation = computed(() => props.statusCode === "IN_CREATION");
const canDeleteExp = computed(() => isInCreation.value && !props.isReadonly);
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.ActionBar__footer {
  .delete-experience-button {
    @include font-semibold(12);
  }
}
</style>
