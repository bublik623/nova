<template>
  <DocumentFormSection id="gallery" :required="fields.gallery.required">
    <NovaImageGallery
      v-model="fields.gallery.value"
      :disabled="isReadonly"
      :cta-text="`+ ${$t('common.add.images')}`"
    ></NovaImageGallery>
  </DocumentFormSection>
</template>

<script setup lang="ts">
import { useExperienceMediaStore } from "@/features/experience-media/stores/useExperienceMediaStore";
import { hasPermission } from "@/features/roles/lib/has-permission";
import NovaImageGallery from "@/ui-kit/NovaImageGallery/NovaImageGallery.vue";
import { storeToRefs } from "pinia";

const mediaStore = useExperienceMediaStore();
const { fields } = storeToRefs(mediaStore);

const isReadonly = !hasPermission("experience.media.canWrite");
</script>
