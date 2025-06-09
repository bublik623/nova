<template>
  <DocumentFormSection id="curation.options.settings" :required="document.fields.options!.required">
    <OptionsRecap :readonly="store.isReadonly || !canCreateOption" />
  </DocumentFormSection>
</template>

<script setup lang="ts">
import OptionsRecap from "@/features/experience-calendar/components/OptionsRecap.vue";
import { useExperienceRaw } from "@/stores/experience-raw";
import { eventBusCuration } from "@/features/experience-shared/composables/useEventBus";
import { useNotifications } from "@/stores/notifications";
import { saveCurationContent } from "@/features/experience-curation/lib/saveCurationContent";
import { useCurationExperienceStore } from "@/features/experience-curation/stores/useCurationExperienceStore";
import { hasPermission } from "@/features/roles/lib/has-permission";

const { params } = useRoute();
const experienceRaw = useExperienceRaw();
const notificationStore = useNotifications();
const id = params.id as string;

const document = computed(() => experienceRaw.rawContents[id]);
const store = useCurationExperienceStore();
const canCreateOption = hasPermission("experience.options.canWrite");

// Saving
const stopBus = eventBusCuration.on(
  async (event, opt: { publish: boolean; redirect: boolean; translate: boolean; force: boolean }) => {
    if (event === "SAVE") {
      if (opt?.publish || opt?.translate) {
        saveCurationContent({
          id,
          redirect: opt?.redirect,
          translate: opt?.translate,
          publish: opt?.publish,
          force: opt?.force,
          afterSaving: () => {
            eventBusCuration.emit("SAVED", opt);
          },
        });
      } else {
        notificationStore.addNotification({
          theme: "success",
          message: "notifications.success.saving.document",
        });
      }
    }
  }
);
onBeforeUnmount(() => stopBus());
</script>
