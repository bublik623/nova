<template>
  <ActionBar>
    <template #actions>
      <span v-if="!isReadonly">
        <ExperienceStatusDropdown
          :is-loading="isLoadingStatus"
          :experience-status="dropdownStatuses"
          @publish="$emit('status-change', 'publish')"
          @unpublish="$emit('status-change', 'unpublish')"
        />
        <DistributionAttributes v-if="useFeatureFlag('curation_level')" class="mt-4" />

        <div v-if="showBrandCollectionCriteria">
          <h3 class="font-bold text-xs">
            {{ $t("action-bar.value-proposition.header") }}
          </h3>
          <CollectionCriteriaButton
            class="mt-2"
            :best-value-guaranteed="collectionCriteria.best_value_guaranteed || ''"
            :exceptional-experiences="collectionCriteria.exceptional_experiences || ''"
            :created-with-care="collectionCriteria.created_with_care || ''"
          />
        </div>
        <ActionBarCta
          id="save-content"
          :title="$t('action-bar.curation.save.title')"
          :description="`${$t('action-bar.curation.save.tip')}`"
          :cta-text="$t('action-bar.curation.save.button')"
          :cta-type="'outline'"
          :cta-enabled="isSaveEnabled"
          :cta-loading="isSaving && saveButtonClicked === 'SAVE_DRAFT'"
          @click:action="$emit('save-draft')"
        >
          <template #additional-info>
            <ActionBarLastEditDate />
          </template>
        </ActionBarCta>
        <ActionBarCta
          id="send-to-translation"
          :title="$t('action.bar.experience.progress.title')"
          :description="$t('action.bar.curation.content.tip')"
          :cta-enabled="isEnabled"
          :cta-loading="isSendingToTranslation"
          :cta-text="$t('action.bar.curation.content.button')"
          @click:action="$emit('publish-and-translate')"
          ><template #additional-info>
            <ActionBarPercentage :percentage="percentageCompletion" class="mt-2" />
          </template>
        </ActionBarCta>
        <NovaButton
          size="sm"
          full-width
          :data-testid="`experience-curation-${id}-action-bar-publish-update`"
          variant="outline"
          :disabled="!isEnabled"
          :loading="isSaving && saveButtonClicked === 'UPDATE'"
          @click="$emit('publish-without-translation')"
          >{{ $t("action.bar.curation.publish-update") }}</NovaButton
        >
      </span>
    </template>
    <template #history>
      <ProductHistory>
        <template #activity_log>
          <ActionBarActivity class="w-full" />
        </template>

        <template #version_history>
          <VersionHistory
            :experience-id="id"
            :document-content-type="DocumentContentType.EDITORIAL"
            language="en"
            @action:open-revision="(revisionId) => $emit('open-revision', revisionId)"
          />
        </template>
      </ProductHistory>
    </template>
  </ActionBar>
</template>

<script setup lang="ts">
import ActionBar from "@/features/experience-shared/components/ActionBar.vue";
import ExperienceStatusDropdown, {
  DropdownStatuses,
} from "@/features/experience-shared/components/ExperienceStatusDropdown.vue";
import CollectionCriteriaButton from "./CollectionCriteriaButton.vue";
import ActionBarCta from "@/features/experience-shared/components/ActionBarCta.vue";
import ActionBarLastEditDate from "@/features/experience-shared/components/ActionBarLastEditDate.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import ProductHistory from "@/features/experience-shared/components/ProductHistory.vue";
import ActionBarActivity from "@/features/experience-activity-log/components/ActionBarActivity.vue";
import VersionHistory from "@/features/experience-shared/components/VersionHistory.vue";
import { DocumentContentType } from "@/types/DocumentStatuses";
import DistributionAttributes from "@/features/experience-shared/components/DistributionAttributes.vue";
import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";
import ActionBarPercentage from "@/features/experience-shared/components/ActionBarPercentage.vue";

interface Props {
  id: string;
  isLoadingStatus: boolean;
  dropdownStatuses: DropdownStatuses;
  showBrandCollectionCriteria: boolean;
  isSaveEnabled: boolean;
  isSaving: boolean;
  saveButtonClicked?: string;
  isEnabled: boolean;
  isSendingToTranslation: boolean;
  percentageCompletion: number;
  isReadonly: boolean;
  collectionCriteria: {
    best_value_guaranteed?: string;
    exceptional_experiences?: string;
    created_with_care?: string;
  };
}

interface Events {
  (e: "status-change", status: "publish" | "unpublish"): void;
  (e: "save-draft"): void;
  (e: "publish-and-translate"): void;
  (e: "publish-without-translation"): void;
  (e: "open-revision", revisionId: string): void;
}

defineProps<Props>();
defineEmits<Events>();
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";
</style>
