<template>
  <div class="DocumentLayout" :data-testid="`nova-experience-raw-${id}`">
    <ProductsSidebar />

    <div :style="{ width: '100%' }">
      <TabNavigation
        :tabs="documentTabsStore.tabs"
        :active-tab="documentTabsStore.getActiveTab()"
        @tab-close="closeTab"
      />
      <div v-if="!pending" class="wrapper">
        <RawDocumentBar
          :id="id"
          :is-opinoia="isOpinoia"
          :experience-documents="experience.documents"
          :status-code="statusCode"
          :reference-code="distributionData?.reference_code || ''"
          :sidebar-categories="sidebarCategories"
        />
        <ExperienceFormWrapper
          :show-save-and-go-next="!!(nextAvailableSection && displaySaveAndGoNextButton)"
          :is-readonly="isReadonly"
          :is-save-enabled="isSaveEnabled"
          :is-saving-draft="isSavingDraft"
          :next-section-route="nextAvailableSection"
          @click:navigate="handleNavigate"
          @click:save-and-navigate="handleSaveAndNavigate"
        >
          <NuxtPage
            :next-section-route="nextAvailableSection"
            :is-saving-draft="isSavingDraft"
            :is-readonly="isReadonly"
            :is-save-enabled="isSaveEnabled"
          />
        </ExperienceFormWrapper>

        <RawActionBar
          :experience-id="id"
          :experience-title="rawExperience?.fields.title.value || ''"
          :status-code="statusCode"
          :is-readonly="isReadonly"
          :show-distribution-level="useFeatureFlag('curation_level')"
          :save-draft-enabled="isSaveEnabled"
          :save-draft-is-loading="isSavingDraft"
          :percentage-completion="percentageCompletion"
          :publish-enabled="checkDocumentValidity(sidebarCategories)"
          :publish-is-loading="false"
          @save-draft="handleSave"
          @publish="handleShowExperienceAttributesModal"
          @delete="showExperienceDeleteModal = true"
          @open-revision="handleOpenRevision"
        />

        <NovaModalConfirm
          :show-modal="showExperienceDeleteModal"
          :title="$t('modal.experience.delete.title')"
          :description="
            $t('modal.experience.delete.description', {
              placeholders: { title: rawExperience?.fields.title.value || '' },
            })
          "
          :cta-confirm-text="$t('modal.experience.delete.confirm')"
          :cta-cancel-text="$t('modal.experience.delete.cancel')"
          :confirm-callback="handleDocumentDelete"
          :cancel-callback="() => (showExperienceDeleteModal = false)"
        />
        <ModalRequiredFields v-model="isRequiredFieldsModalVisible" />
      </div>
      <SkeletonDocument v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonDocument from "@/components/Document/SkeletonDocument/SkeletonDocument.vue";
import TabNavigation from "@/components/Document/TabNavigation/TabNavigation.vue";
import { useDocumentTabs } from "@/stores/document-tabs";
import { ExperienceRawDocument, useExperienceRaw } from "@/stores/experience-raw";
import NovaModalConfirm from "@/ui-kit/NovaModalConfirm/NovaModalConfirm.vue";
import { useNotifications } from "@/stores/notifications";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useFormPercentageCompletion } from "@/features/experience-shared/composables/useFormPercentageCompletion";
import ProductsSidebar from "@/features/experience-shared/components/ProductsSidebar.vue";
import { checkDocumentValidity } from "@/features/experience-shared/utils/check-document-validity";
import ModalRequiredFields from "@/features/experience-shared/components/ModalRequiredFields.vue";
import ExperienceAttributeSelectionModal from "@/features/experience-shared/components/ModalDistributionAttributes.vue";
import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";
import { useAsyncModal } from "@/features/core-shared/composables/useAsyncModal";
import { DistributionContent } from "@/types/generated/ExperienceRawServiceApi";
import { getNextAvailableSection } from "@/features/experience-shared/utils/get-next-available-section";
import { useUnsavedChanges } from "@/features/experience-calendar/composables/useUnsavedChanges";
import { useRawSidebarData } from "@/features/experience-shared/composables/useRawSidebarData";
import { getRevisionUrl } from "@/features/experience-revision/lib/get-revision-url";
import { useExperienceRawQuery } from "@/features/experience-raw/queries/experience-raw-query";
import RawActionBar from "@/features/experience-raw/components/RawActionBar.vue";
import RawDocumentBar from "@/features/experience-raw/components/RawDocumentBar.vue";
import { useRawExperienceStore } from "@/features/experience-raw/stores/useRawExperienceStore";
import { hasPermission } from "@/features/roles/lib/has-permission";
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";
import { usePaxesStore } from "../stores/usePaxesStore";
import ExperienceFormWrapper from "@/features/experience-shared/components/ExperienceFormWrapper.vue";
import { useOpinoiaExperience } from "@/features/opinoia/shared/useOpinoiaExperience";

const config = useRuntimeConfig();
const route = useRoute();
const id = route.params.id as string;
const idRef = computed(() => route.params.id as string); // duplicated to not change too many lines, will be removed soon™
const documentTabsStore = useDocumentTabs();
const showExperienceDeleteModal = ref(false);
const router = useRouter();
const notificationStore = useNotifications();
const { logError } = useLogger();
const isPaxEnabled = useFeatureFlag("pax_enabled");

const experienceRawQuery = useExperienceRawQuery(idRef);
const experience = useOpinoiaExperience(idRef);

const experienceRawStore = useExperienceRaw();
const rawExperience = computed<ExperienceRawDocument | null>(() => experienceRawStore.rawContents[id]);

const newRawExperienceStore = useRawExperienceStore();

const statusCode = computed(() => experienceRawQuery.data.value?.status_code);
const isReadonly = !hasPermission("experience.raw.canWrite");
const isOpinoia = computed(() => newRawExperienceStore.productType === "INTERNAL");

const modalExperienceAttributes = useAsyncModal(ExperienceAttributeSelectionModal, { closeOnOverlayClick: true });

const handleShowExperienceAttributesModal = async () => {
  const featureFlagEnabled = useFeatureFlag("curation_level");
  if (!featureFlagEnabled) {
    await handlePublish();
  } else {
    const isAccepted = await modalExperienceAttributes.openModal({});
    if (isAccepted) {
      await handlePublish();
    }
  }
};

// reroute to the first default sub-page if the user navigates to the index experience/:id/raw
if (route.path.split("/").length === 4) {
  router.push(`raw/settings`);
}

const isRequiredFieldsModalVisible = ref(false);
onBeforeRouteUpdate((to, from, next) => {
  // Allow navigation if the page path remains the same (hash changes only)
  if (to.path === from.path) {
    next();
    return;
  }
  // Block navigation if 'title' or 'supplier id' are missing
  if (!rawExperience.value?.fields.title.value?.trim() || !rawExperience?.value.fields.supplier_id.value?.trim()) {
    isRequiredFieldsModalVisible.value = true;
  } else {
    // Allow navigation if both 'title' and 'supplier_id' are present
    next();
  }
});

// Data loading
const distributionData = ref<DistributionContent | undefined>(undefined);
const { getDistributionContent } = useExperienceRawApi();
const { execute: fetchDistributionContent } = useLazyAsyncData(
  `getDistributionContent-${id}`,
  async () => {
    try {
      const { data } = await getDistributionContent(id);
      distributionData.value = data;
      return data;
    } catch (error) {
      logError("get-distribution-content", error);
      // eslint-disable-next-line no-console
      console.log(error);
      notificationStore.addNotification({
        theme: "error",
        message: "notifications.error.fetching.document",
      });
    }
  },
  { immediate: false }
);

const { execute: fetchDocument } = useLazyAsyncData(
  `get-raw-document-${id}`,
  async () => {
    await experienceRawStore.getRawDocument(id).catch((error) => {
      logError("load-raw", error);
      notificationStore.addNotification({
        theme: "error",
        message: "notifications.error.fetching.document",
      });
      console.error(error);

      throw error;
    });
  },
  { immediate: false }
);

// Data loading
const { pending } = useLazyAsyncData(`load-raw-${id}`, async () => {
  await fetchDistributionContent();
  await fetchDocument();
});

watch(
  () => rawExperience.value?.fields.title.value ?? "...",
  (newTabLabel, oldTabLabel) => {
    if (newTabLabel === oldTabLabel) {
      return;
    }

    documentTabsStore.addOrUpdateTab({ experienceId: id }, newTabLabel, route.path);
  },
  { immediate: true }
);

watch(
  () => route.path,
  (newRoutePath, oldRoutePath) => {
    if (newRoutePath === oldRoutePath) {
      return;
    }

    documentTabsStore.updateTabPath({ experienceId: id }, newRoutePath);
  }
);

// Document actions
async function handleDocumentDelete() {
  try {
    await experienceRawStore.deleteRawDocument(id);

    // Workaround: lag between ERS and CQS
    await new Promise((resolve) => {
      setTimeout(() => {
        notificationStore.addNotification({
          theme: "success",
          message: "notifications.success.deleting.document",
        });

        documentTabsStore.closeTabByDocumentId({ experienceId: id });
        router.push("/");
        resolve(null);
      }, +config.public.REFRESH_TIMEOUT);
    });
  } catch (err) {
    logError("delete-raw", err);
    notificationStore.addNotification({
      theme: "error",
      message: "notifications.error.deleting.document",
    });
  }
}

const paxesStore = usePaxesStore();
// TODO: https://jira.tuigroup.com/browse/OFF-4369
const isPricingAndAvailabilityRoute = computed(() => route.name === "experience-id-raw-pricing-and-availability");
const isSaveEnabled = computed(() => {
  const isSaveEnabled = newRawExperienceStore.hasTitleAndSupplier;
  if (isPaxEnabled && isPricingAndAvailabilityRoute.value) {
    return isSaveEnabled && paxesStore.canSave;
  }
  return isSaveEnabled;
});
const isSavingDraft = computed(() => newRawExperienceStore.isSaving);

// Sidebar
const displaySaveAndGoNextButton = computed<boolean>(() => {
  const isOptions = route.fullPath.endsWith("options");
  const isAgenda = route.fullPath.endsWith("agenda");
  const isEither = isOptions || isAgenda;

  return !isEither;
});

const nextAvailableSection = computed(() => getNextAvailableSection(sidebarCategories.value, route.path));
const sidebarCategories = useRawSidebarData(id);

async function handleSave() {
  await newRawExperienceStore.save();
}

async function handleSaveAndNavigate() {
  await handleSave();
  await handleNavigate();
}

async function handleNavigate() {
  const next = nextAvailableSection.value;
  if (next) {
    await router.push(next);
  }
}

async function handlePublish() {
  await newRawExperienceStore.publish();

  documentTabsStore.closeTabByDocumentId({ experienceId: id });
  await router.push("/");
}

async function handleOpenRevision(revisionId: string) {
  const path = getRevisionUrl(id, revisionId, "raw");
  await router.push(path);
}

// Percentage Completion
const fieldList = computed(() =>
  Object.values(sidebarCategories.value)
    .map((s) => s.fields)
    .flat()
);

const percentageCompletion = useFormPercentageCompletion(fieldList);

onUnmounted(() => {
  newRawExperienceStore.$reset();
});

// unsaved changes modal
const { hasUnsavedChanges } = useUnsavedChanges({
  cancelCallback: async () => {
    hasUnsavedChanges.value = false;
    await refreshNuxtData();
    newRawExperienceStore.$reset();
  },
  confirmCallback: async () => {
    await handleSave();
  },
});

useBrowserExitMessage(hasUnsavedChanges);

watch(
  () => newRawExperienceStore.hasChanges,
  (hasChanges) => {
    hasUnsavedChanges.value = hasChanges;
  }
);

function closeTab(tabToClose: DocumentTab) {
  const nextRoute = documentTabsStore.closeTabAndGetNextRoutePath(tabToClose);

  router.push(nextRoute);
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.wrapper {
  display: grid;
  justify-items: start;
  grid-template-columns: auto 1fr auto;
}

.DocumentSidebar {
  &__header {
    padding: rem(25) 0;
  }

  &__title {
    @include font-semibold(14);

    color: var(--color-text-90);
  }
}

.ActionBar__footer {
  .delete-experience-button {
    @include font-semibold(12);
  }
}
</style>
