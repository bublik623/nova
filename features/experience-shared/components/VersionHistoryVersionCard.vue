<template>
  <div
    class="bg-white p-2 m-1 rounded-lg border"
    :class="{ 'border-secondary-100 outline outline-4 outline-secondary-30': isActive }"
  >
    <div>
      <span class="text-sm flex items-center justify-between pr-1"
        >{{ formatDate(version.date) }}
        <NovaTooltip v-if="showActionView" theme="dark">
          <template #content>
            {{ $t("common.view") }}
          </template>
          <NovaButton
            data-testid="version-card-action-view"
            variant="action"
            size="xxs"
            theme="light"
            @click="$emit('action:open-revision', version.snapshotId)"
          >
            <NovaIcon name="file-upload" :size="18"> </NovaIcon>
          </NovaButton>
        </NovaTooltip>
      </span>

      <p class="mt-4">
        <span class="font-bold">{{ $t(flowKey || "") }}</span>
        <span class="font-thin"> by {{ $t(version.authorName) }}</span>
      </p>
      <ExperienceStatusBadge
        v-if="showBadge"
        class="mt-2"
        :flow-code="version.flowCode"
        :status-code="version.statusCode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { DocumentContentType } from "@/types/DocumentStatuses";
import { VersionInfo } from "../stores/useVersionHistoryStore";
import ExperienceStatusBadge from "./ExperienceStatusBadge.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaTooltip from "@/ui-kit/NovaTooltip/NovaTooltip.vue";

const { $t } = useNuxtApp();

interface Props {
  version: VersionInfo;
  flow: DocumentContentType;
  showBadge: boolean;
  showActionView?: boolean;
  isActive?: boolean;
}

interface Events {
  (e: "action:open-revision", value: string): void;
}

const props = defineProps<Props>();
defineEmits<Events>();

const flowKey = computed(() => {
  if (props.flow === DocumentContentType.RAW) {
    return "experience.version-history.base-content";
  }

  if (props.flow === DocumentContentType.EDITORIAL) {
    return "experience.version-history.curated-content";
  }

  if (props.flow === DocumentContentType.TRANSLATION) {
    return "experience.version-history.translation-content";
  }

  if (props.flow === DocumentContentType.MEDIA) {
    return "experience.version-history.media-content";
  }

  throw Error(`Invalid flow: ${props.flow}`);
});

function formatDate(date: string) {
  return new Date(date)
    .toLocaleDateString("en-gb", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
    .replace(",", " -");
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";
</style>
