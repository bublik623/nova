<template>
  <div class="flex flex-col gap-4">
    <template v-if="versionHistoryStore.isFetching">
      <div v-for="i in 2" :key="i">
        <div class="skeleton_item" :style="{ height: '20px', width: '50%' }" />
        <div class="skeleton_item mt-2 mb-4" :style="{ height: '70px' }" />
        <div class="skeleton_item" :style="{ height: '20px', width: '50%' }" />
        <div class="skeleton_item mt-2" :style="{ height: '70px' }" />
      </div>
    </template>
    <template v-for="version in versionHistoryStore.history?.versions" v-else :key="version.snapshotId">
      <VersionHistoryVersionCard
        v-if="versionHistoryStore.experienceFlow"
        :show-action-view="!isActiveVersion(version.snapshotId) && useFeatureFlag('show_action_view_version_history')"
        :show-badge="!!version.options?.shouldDisplayBadge"
        :flow="versionHistoryStore.experienceFlow"
        :version="version"
        @action:open-revision="$emit('action:open-revision', $event)"
        :is-active="isActiveVersion(version.snapshotId)"
      />
    </template>

    <template v-if="!versionHistoryStore.isFetching && !versionHistoryStore.history?.versions.length">
      <div class="text-center text-gray-500">
        {{ $t("experience.version-history.no-versions") }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useVersionHistoryStore } from "@/features/experience-shared/stores/useVersionHistoryStore";
import { DocumentContentType } from "@/types/DocumentStatuses";
import VersionHistoryVersionCard from "@/features/experience-shared/components/VersionHistoryVersionCard.vue";
import { useFeatureFlag } from "../composables/useFeatureFlag";
import { AvailableLanguage } from "@/types/Language";

interface Props {
  experienceId: string;
  currentRevisionId?: string;
  documentContentType: DocumentContentType;
  language?: AvailableLanguage;
}

interface Events {
  (e: "action:open-revision", value: string): void;
}

const props = defineProps<Props>();
defineEmits<Events>();

const versionHistoryStore = useVersionHistoryStore();

const isActiveVersion = computed(() => (revisionId: string) => {
  return props.currentRevisionId === revisionId;
});

watch(
  props,
  () => {
    versionHistoryStore.setExperienceId(props.experienceId);
    versionHistoryStore.setFlow(props.documentContentType);

    if (props.language) {
      versionHistoryStore.setLanguage(props.language);
    }
  },
  {
    immediate: true,
  }
);
</script>
