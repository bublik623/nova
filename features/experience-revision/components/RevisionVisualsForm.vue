<template>
  <DocumentFormSection id="gallery" :required="requiredFields.includes('gallery')">
    <NovaImageGallery :model-value="values?.images || []" :readonly="true" />
  </DocumentFormSection>
</template>

<script setup lang="ts">
import NovaImageGallery from "@/ui-kit/NovaImageGallery/NovaImageGallery.vue";
import { RevisionFormProps } from "../types/forms";

defineProps<RevisionFormProps>();
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";
</style>
