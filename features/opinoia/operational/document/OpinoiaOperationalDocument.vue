<script setup lang="ts">
import ProductsSidebar from "@/features/experience-shared/components/ProductsSidebar.vue";
import ExperienceSidebar from "../ExperienceSidebar/ExperienceSidebar.vue";
import ActionsSidebar from "../actions-sidebar/ActionsSidebar.vue";
import SkeletonDocument from "@/components/Document/SkeletonDocument/SkeletonDocument.vue";
import { useOpinoiaOperationalDocument } from "./useOpinoiaOperationalDocument";
import DocumentTabs from "@/features/opinoia/shared/document-tabs/DocumentTabs.vue";

export type OpinoiaOperationalDocumentProps = {
  experienceId: string;
};

const props = defineProps<OpinoiaOperationalDocumentProps>();

const { isLoading, isSaving } = useOpinoiaOperationalDocument(readonly(toRef(props.experienceId)));
const showSkeleton = computed(() => isLoading.value && !isSaving.value);
</script>

<template>
  <div class="DocumentLayout" :data-testid="`opinoia-experience-operational-${experienceId}`">
    <ProductsSidebar />

    <div class="w-full">
      <DocumentTabs />

      <div v-if="!showSkeleton" class="grid grid-cols-[auto_1fr_auto] justify-items-start">
        <ExperienceSidebar :experience-id />
        <NuxtPage class="w-full px-5" />
        <ActionsSidebar :experience-id />
      </div>
      <SkeletonDocument v-else />
    </div>
  </div>
</template>
