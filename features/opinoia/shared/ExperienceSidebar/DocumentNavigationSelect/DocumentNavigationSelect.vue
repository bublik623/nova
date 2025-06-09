<script setup lang="ts">
import NovaSelect from "@/ui-kit/NovaSelect/NovaSelect.vue";
import { BaseOption } from "@/types/Option";
import { DocumentType, ExperienceDocuments } from "@/features/opinoia/shared/types";

export type DocumentNavigationSelectProps = {
  experienceId: string;
  experienceDocuments: ExperienceDocuments;
  activeDocumentType: DocumentType;
};

const props = defineProps<DocumentNavigationSelectProps>();

const router = useRouter();

const options = computed<BaseOption<DocumentType>[]>(() =>
  Object.values(props.experienceDocuments).map((document) => ({
    value: document.type,
    label: `${document.type}`, // TODO: add localization
  }))
);
const activeOption = computed(() => options.value.find((opt) => opt.value === props.activeDocumentType));

const documentUrls = computed<Record<DocumentType, string>>(() => ({
  OPERATIONAL: `/opinoia/${props.experienceId}/operational/configuration`,
  RAW_COMMERCIAL: `/experience/${props.experienceId}/raw/settings`,
}));

function navigateTo(selectedOption: BaseOption<DocumentType>) {
  if (selectedOption.value === props.activeDocumentType) {
    return;
  }

  router.push(documentUrls.value[selectedOption.value]);
}
</script>

<template>
  <NovaSelect :options="options" :selected="activeOption" @select:option="navigateTo" />
</template>
