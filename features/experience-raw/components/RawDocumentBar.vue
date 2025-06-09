<template>
  <DocumentSidebar show-input-text :sidebar-categories="sidebarCategories">
    <template #open>
      <div class="DocumentSidebar__header mx-3">
        <h2 class="DocumentSidebar__title" data-testid="document-sidebar-refcode">
          {{ `${$t("experience.common.ref_code")} ${referenceCode}` }}
        </h2>
        <template v-if="isOpinoia">
          <ul class="mt-2">
            <li v-for="document in Object.values(experienceDocuments)" :key="document.type" class="mb-1">
              <DocumentStateBadge :document-type="document.type" :document-state="document.state" />
            </li>
          </ul>

          <DocumentNavigationSelect
            class="mt-2"
            :experience-id="id"
            :experience-documents="experienceDocuments"
            :active-document-type="'RAW_COMMERCIAL'"
          />
        </template>

        <ExperienceStatusBadge v-else class="mt-2" flow-code="BASE" :status-code="statusCode" />
      </div>
    </template>
  </DocumentSidebar>
</template>

<script setup lang="ts">
import DocumentSidebar, { FilteredCategories } from "@/components/Document/DocumentSidebar/DocumentSidebar.vue";
import ExperienceStatusBadge from "@/features/experience-shared/components/ExperienceStatusBadge.vue";
import DocumentNavigationSelect from "@/features/opinoia/shared/ExperienceSidebar/DocumentNavigationSelect/DocumentNavigationSelect.vue";
import DocumentStateBadge from "@/features/opinoia/shared/ExperienceSidebar/DocumentStateBadge/DocumentStateBadge.vue";
import { ExperienceDocuments } from "@/features/opinoia/shared/types";
import { ExperienceStatusCode } from "@/types/DocumentStatuses";

type Props = {
  statusCode?: ExperienceStatusCode;
  referenceCode: string;
  sidebarCategories: FilteredCategories;
  isOpinoia: boolean;
  id: string;
  experienceDocuments: ExperienceDocuments;
};

defineProps<Props>();
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.DocumentSidebar {
  &__header {
    padding: rem(25) 0;
  }

  &__title {
    @include font-semibold(14);

    color: var(--color-text-90);
  }
}
</style>
