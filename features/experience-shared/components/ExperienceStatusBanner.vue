<template>
  <div v-if="isVisible" data-testid="experience-status-banner" :data-status="status">
    <NovaAlert class="alertBanner" :status="alertStatus">
      {{ alertMessage }}
      <NovaIcon v-if="shouldShowCloseIcon" name="close" :size="12" class="close-icon" @click="closeBanner" />
    </NovaAlert>
  </div>
</template>

<script setup lang="ts">
import NovaAlert from "@/ui-kit/NovaAlert/NovaAlert.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { ExperienceState } from "../utils/get-experience-state";
import { useSessionStorage } from "@vueuse/core";

export interface ExperienceStatusBannerProps {
  status: ExperienceState;
  experienceId: string;
  isTranslationFlow?: boolean;
}

const { $t } = useNuxtApp();

const props = defineProps<ExperienceStatusBannerProps>();

const alertStatus = computed(() => {
  switch (props.status) {
    case "ready":
      return "success";
    case "in_review":
      return "warning";
    case "draft":
      return "warning";
    case "unpublished":
      return "error";
    default:
      return "warning";
  }
});

const statusKeys: Record<ExperienceState, string> = {
  ready: "experience.status_banner.ready",
  in_review: "experience.status_banner.in_review",
  unpublished: "experience.status_banner.unpublished",
  draft: "",
};

const translationStatusKeys: Record<ExperienceState, string> = {
  ready: "experience.status_banner.translation_ready",
  in_review: "experience.status_banner.translation_in_review",
  unpublished: "experience.status_banner.translation_unpublished",
  draft: "",
};

const alertMessage = computed(() => {
  const keyMap = props.isTranslationFlow ? translationStatusKeys : statusKeys;
  const key = keyMap[props.status];
  return $t(key);
});

const supportedBannerStatuses = ["ready", "in_review", "unpublished"];
const shouldShowBanner = computed(() => supportedBannerStatuses.includes(props.status));

const isVisible = useSessionStorage(`experience-banner-${props.experienceId}`, shouldShowBanner.value, {
  writeDefaults: false,
});

const shouldShowCloseIcon = computed(() => {
  return alertStatus.value === "success" || alertStatus.value === "error";
});

watch(
  () => props.status,
  () => {
    isVisible.value = shouldShowBanner.value;
  },
  { immediate: true }
);

const closeBanner = () => {
  isVisible.value = false;
};
</script>

<style scoped lang="scss">
@import "assets/scss/utilities/index";

.alertBanner {
  position: relative;
}

.close-icon {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);

  &:hover {
    cursor: pointer;
  }
}
</style>
