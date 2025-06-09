<script setup lang="ts">
import { DocumentType, OpinoiaExperience } from "@/features/opinoia/shared/types";
import DocumentSidebar, { FilteredCategories } from "@/components/Document/DocumentSidebar/DocumentSidebar.vue";
import DocumentStateBadge from "./DocumentStateBadge/DocumentStateBadge.vue";
import DocumentNavigationSelect from "./DocumentNavigationSelect/DocumentNavigationSelect.vue";
import { MappedCategory, SidebarCategoryField } from "@/types/DocumentSidebar";
import { DocumentSidebarSection } from "./types";

export type ExperienceSidebarProps = {
  experience: OpinoiaExperience;
  activeDocumentType: DocumentType;
  activeDocumentSections: DocumentSidebarSection[];
};

const props = defineProps<ExperienceSidebarProps>();

const legacySidebarCategories = computed<FilteredCategories>(() => {
  const mappedCategopriesEntries = props.activeDocumentSections
    .map<MappedCategory>((documentSection) => ({
      id: documentSection.key,
      url: documentSection.url,
      required: documentSection.isRequired,
      icon: documentSection.icon,
      completed: documentSection.isValid,
      fields: documentSection.fields.map<SidebarCategoryField>((field) => ({
        id: field.key,
        required: field.isRequired,
        filled: field.isValid,
        hide: field.isHidden,
      })),
      dropdown: documentSection.showFields,
      disabled: false,
      disabledBy: "",
    }))
    .map((mappedCategory) => [mappedCategory.id, mappedCategory]);

  return Object.fromEntries(mappedCategopriesEntries);
});
</script>

<template>
  <DocumentSidebar :sidebar-categories="legacySidebarCategories" :show-input-text="true">
    <template #open>
      <div class="flex flex-col p-3 pt-4">
        <h1 class="text-md text-ellipsis" data-testid="experience-title">{{ experience.title }}</h1>
        <span class="text-sm text-text-90 mt-2" data-testid="experience-reference-code">{{
          experience.referenceCode
        }}</span>
        <ul class="mt-2">
          <li v-for="document in Object.values(experience.documents)" :key="document.type" class="mb-1">
            <DocumentStateBadge :document-type="document.type" :document-state="document.state" />
          </li>
        </ul>
        <DocumentNavigationSelect
          class="mt-2"
          :experience-id="experience.id"
          :experience-documents="experience.documents"
          :active-document-type="activeDocumentType"
        />
      </div>
      <hr class="mx-3 mb-3 border-neutral-40" />
    </template>
  </DocumentSidebar>
</template>
