<template>
  <div class="DocumentLayout" :data-testid="`experience-curation-${id}`">
    <ProductsSidebar />
    <div :style="{ width: '100%' }">
      <TabNavigation
        :tabs="documentTabsStore.tabs"
        :active-tab="documentTabsStore.getActiveTab()"
        :data-testid="`experience-curation-${id}-tabs`"
        @tab-close="closeTab"
      />
      <div v-if="!pending" class="wrapper">
        <DocumentSidebar show-input-text :sidebar-categories="sidebarCategories">
          <template #open>
            <NovaTabs
              class="mx-3 mt-2 DocumentSidebar__tabs"
              :options="[
                {
                  title: $t('status.flow.curation'),
                  value: route.path,
                },
                {
                  title: $t('status.flow.media'),
                  value: `/experience/${id}/media`,
                },
              ]"
              :selected="{
                title: $t('status.flow.curation'),
                value: route.path,
              }"
              data-testid="sidebar-media-tabs"
              @select:option="(option) => router.push(option.value)"
            />
            <div class="DocumentSidebar__header mx-3">
              <h2 class="DocumentSidebar__title" data-testid="document-sidebar-refcode">
                {{ `${$t("experience.common.ref_code")} ${distributionData?.reference_code}` }}
              </h2>
              <ExperienceStatusBadge
                class="mt-2"
                flow-code="CURATION"
                :status-code="curationDocument.data.status_code"
              />
            </div>

            <SidebarViewSelectors
              v-model:selected-view="curationExperienceStore.selectedView"
              v-model:show-raw-fields="curationExperienceStore.showRawFields"
              class="mx-3 mb-4"
            />

            <div class="border-b mx-3 mb-4" />
          </template>
        </DocumentSidebar>
        <CurationExperienceView
          class="w-full"
          :experience-id="id"
          :distribution-state="distributionState"
          :show-raw-fields="curationExperienceStore.showRawFields"
          :selected-view="curationExperienceStore.selectedView"
          :is-saving-draft="isSaving && saveButtonClicked === 'SAVE_DRAFT'"
          :next-section-route="nextAvailableSection"
          :is-save-enabled="isSaveEnabled"
          :next-available-section="nextAvailableSection"
          :save-button-clicked="saveButtonClicked"
          @update-unsaved-changes-flag="updateUnsavedChangesFlag"
        />

        <CurationActionBar
          :id="id"
          :is-saving="isSaving"
          :is-loading-status="isLoadingStatus"
          :dropdown-statuses="dropdownStatuses"
          :collection-criteria="experienceRawData?.collection_criteria"
          :is-enabled="isEnabled"
          :is-readonly="curationExperienceStore.isReadonly"
          :percentage-completion="percentageCompletion"
          :show-brand-collection-criteria="showBrandCollectionCriteria"
          :is-save-enabled="isSaveEnabled"
          :save-button-clicked="saveButtonClicked"
          :is-sending-to-translation="curationStore.isSendingToTranslation"
          @status-change="handleStatusChange"
          @save-draft="handleSaveDraft"
          @publish-and-translate="handlePublishAndTranslate"
          @publish-without-translation="handlePublishWithoutTranslation"
          @open-revision="handleOpenRevision"
        />
      </div>
      <SkeletonDocument v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref } from "vue";
import SkeletonDocument from "@/components/Document/SkeletonDocument/SkeletonDocument.vue";
import TabNavigation from "@/components/Document/TabNavigation/TabNavigation.vue";
import { useExperienceCuration } from "@/stores/experience-curation";
import { useNotifications } from "@/stores/notifications";
import NovaTabs from "@/ui-kit/NovaTabs/NovaTabs.vue";
import { useExperienceLocationStore } from "@/features/experience-shared/stores/useExperienceLocationStore";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useBookingInformationStore } from "@/features/experience-shared/stores/useBookingInformationStore";
import { eventBusCuration } from "@/features/experience-shared/composables/useEventBus";
import { useRefundPoliciesStore } from "@/features/experience-shared/stores/useRefundPoliciesStore";
import { useFormPercentageCompletion } from "@/features/experience-shared/composables/useFormPercentageCompletion";
import { useActivityLogStore } from "@/features/experience-activity-log/stores/useActivityLogStore";
import ProductsSidebar from "@/features/experience-shared/components/ProductsSidebar.vue";
import { checkDocumentValidity } from "@/features/experience-shared/utils/check-document-validity";
import DocumentSidebar from "@/components/Document/DocumentSidebar/DocumentSidebar.vue";
import ExperienceStatusBadge from "@/features/experience-shared/components/ExperienceStatusBadge.vue";
import { ExperienceState, getDistributionState } from "@/features/experience-shared/utils/get-experience-state";
import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";
import { useDistributionAttributes } from "@/features/experience-shared/composables/useDistributionAttributes";
import { useAsyncModal } from "@/features/core-shared/composables/useAsyncModal";
import ExperienceAttributeSelectionModal from "@/features/experience-shared/components/ModalDistributionAttributes.vue";
import { DistributionContent } from "@/types/generated/ExperienceRawServiceApi";
import { getNextAvailableSection } from "@/features/experience-shared/utils/get-next-available-section";
import { getRevisionUrl } from "@/features/experience-revision/lib/get-revision-url";
import { useUnsavedChanges } from "@/features/experience-calendar/composables/useUnsavedChanges";
import { DocumentTab, useDocumentTabs } from "@/stores/document-tabs";
import { BRAND_TUI_COLLECTION } from "@/features/experience-raw/constants";
import { useSidebarCategories } from "@/features/experience-shared/composables/useSidebarCategoriesCuration";
import {
  RAW_EXPERIENCE_QUERY_KEY,
  useExperienceRawQuery,
} from "@/features/experience-raw/queries/experience-raw-query";
import {
  DISTRIBUTION_CONTENT_QUERY_KEY,
  useDistributionContentQuery,
} from "@/features/experience-raw/queries/distribution-content-query";
import { useQueryClient } from "@tanstack/vue-query";
import { mapRawElementToRawSettingsValue } from "@/features/experience-raw/lib/map-raw-element";
import { useCurationAsterixIntegrationStore } from "@/features/experience-curation/asterix-integration/stores/useCurationAsterixIntegrationStore";
import CurationActionBar from "@/features/experience-curation/components/CurationActionBar.vue";
import CurationExperienceView from "@/features/experience-curation/components/CurationExperienceView.vue";
import { useCurationExperienceStore } from "@/features/experience-curation/stores/useCurationExperienceStore";
import SidebarViewSelectors from "@/features/experience-curation/components/SidebarViewSelectors.vue";

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;
const idRef = computed(() => route.params.id as string); // duplicated to not change too many lines, will be removed soon™

const { addNotification } = useNotifications();
const { logError } = useLogger();
const { $t } = useNuxtApp();

// Reroute to the first default sub-page if the user navigates to the index experience/:id/raw
if (route.path.split("/").length === 4) {
  router.push(`curation/settings`);
}

const experienceRawQuery = useExperienceRawQuery(idRef);
const experienceRawData = computed(() => mapRawElementToRawSettingsValue(experienceRawQuery.data.value));
const distributionContentQuery = useDistributionContentQuery(idRef);
const queryClient = useQueryClient();

const curationExperienceStore = useCurationExperienceStore();

const rawStore = useExperienceRaw();
const curationStore = useExperienceCuration();
const curationDocument = computed(() => curationStore.curationDocuments[id]);
const locationStore = useExperienceLocationStore();
const bookingInfoStore = useBookingInformationStore();
const refundPoliciesStore = useRefundPoliciesStore();
const activityLogStore = useActivityLogStore();
const modalExperienceAttributes = useAsyncModal(ExperienceAttributeSelectionModal, { closeOnOverlayClick: true });
const documentTabsStore = useDocumentTabs();

const isLoadingStatus = ref(false);

const showBrandCollectionCriteria = computed(() => {
  const curationIsTUICollection = curationDocument.value.fields.product_brand.value === BRAND_TUI_COLLECTION;
  const rawIsTUICollection = experienceRawData.value?.product_brand === BRAND_TUI_COLLECTION;

  return curationIsTUICollection && rawIsTUICollection;
});

watch(
  () => curationDocument.value?.fields.title.value ?? experienceRawData?.value.title ?? "...",
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

const handleStatusChange = async (status: "publish" | "unpublish") => {
  isLoadingStatus.value = true;
  try {
    if (status === "publish") {
      await curationStore.publishCurationExperience(id, true);
    } else {
      await curationStore.unpublishCurationExperience(id);
    }
    addNotification({
      theme: "success",
      message: "notifications.success.saving.document",
    });
  } catch (error) {
    addNotification({
      theme: "error",
      message: "notifications.error.saving.document",
    });
    // eslint-disable-next-line no-console
    console.error(error);
  } finally {
    isLoadingStatus.value = false;
  }
};

async function handleSaveDraft() {
  saveButtonClicked.value = "SAVE_DRAFT";
  await distributionAttributes.saveData(id);
  eventBusCuration.emit("SAVE", { id });
}

async function handlePublishAndTranslate() {
  const featureFlagEnabled = useFeatureFlag("curation_level");
  if (!featureFlagEnabled) {
    eventBusCuration.emit("SAVE", { id, publish: true, redirect: true, translate: true });
  } else {
    const isAccepted = await modalExperienceAttributes.openModal({});
    if (isAccepted) {
      saveButtonClicked.value = "TRANSLATE";
      await distributionAttributes.saveData(id);
      eventBusCuration.emit("SAVE", { id, publish: true, redirect: true, translate: true });
    }
  }
}

async function handlePublishWithoutTranslation() {
  const featureFlagEnabled = useFeatureFlag("curation_level");
  if (!featureFlagEnabled) {
    eventBusCuration.emit("SAVE", { id, publish: true });
  } else {
    const isAccepted = await modalExperienceAttributes.openModal({});
    if (isAccepted) {
      saveButtonClicked.value = "UPDATE";
      await distributionAttributes.saveData(id);
      eventBusCuration.emit("SAVE", { id, publish: true });
    }
  }
}

const isAsterixIntegration = computed(() => route.name === "experience-id-curation-asterix-integration");
const asterixIntegrationStore = useCurationAsterixIntegrationStore();

const isSaveEnabled = computed(() => {
  return (
    Boolean(curationDocument.value?.fields?.title?.value.trim()) &&
    Boolean(distributionContentQuery.data.value?.supplier_id?.trim()) &&
    (!isAsterixIntegration.value || asterixIntegrationStore.canSave)
  );
});

const saveButtonClicked: Ref<"SAVE_DRAFT" | "TRANSLATE" | "UPDATE" | undefined> = ref();

const nextAvailableSection = computed(() => getNextAvailableSection(sidebarCategories.value, route.path));

const distributionState = ref<ExperienceState>("draft");
const dropdownStatuses = computed(() => {
  return {
    distribution: distributionState.value,
    curation: curationDocument.value.data?.status_code,
  };
});

const distributionAttributes = useDistributionAttributes();
const distributionData = ref<DistributionContent | undefined>(undefined);
const { getDistributionContent } = useExperienceRawApi();
const { execute: fetchDistributionContent } = useLazyAsyncData(
  `getDistributionContent-${id}`,
  async () => {
    try {
      const { data } = await getDistributionContent(id);
      distributionState.value = getDistributionState(data);
      distributionData.value = data;
      return data;
    } catch (error) {
      logError("get-distribution-content", error);
      // eslint-disable-next-line no-console
      console.log(error);
      addNotification({
        theme: "error",
        message: "notifications.error.fetching.document",
      });
    }
  },
  { immediate: false }
);

const { execute: fetchDocument } = useLazyAsyncData(
  `load-curation-${id}`,
  async () => {
    await Promise.all([rawStore.getRawDocument(id), curationStore.getCurationDocument(id)]).catch((error) => {
      logError("load-curation", error);
      // eslint-disable-next-line no-console
      console.log(error);
      addNotification({
        theme: "error",
        message: "notifications.error.fetching.document",
      });
    });
  },
  { immediate: false }
);

// Data loading
const { pending } = useLazyAsyncData(`load-curation-${id}`, async () => {
  await fetchDistributionContent();
  await fetchDocument();
});

const isSaving = computed(
  () => curationStore.isSaving || locationStore.isSaving || bookingInfoStore.isSaving || refundPoliciesStore.isSaving
);

const isEnabled = computed(() => {
  return checkDocumentValidity(sidebarCategories.value);
});

const { sidebarCategories } = useSidebarCategories();

const fieldList = computed(() =>
  Object.values(sidebarCategories.value)
    .map((s) => s.fields)
    .flat()
);
const percentageCompletion = useFormPercentageCompletion(fieldList);

function handleOpenRevision(revisionId: string) {
  const path = getRevisionUrl(id, revisionId, "curation");
  router.push(path);
}

onUnmounted(() => {
  locationStore.$reset();
  bookingInfoStore.$reset();
  refundPoliciesStore.$reset();
  activityLogStore.$reset();
});

// unsaved changes modal
const { hasUnsavedChanges } = useUnsavedChanges({
  cancelCallback: async () => {
    hasUnsavedChanges.value = false;
    await refreshNuxtData();
  },
  confirmCallback: async () => {
    eventBusCuration.emit("SAVE");
  },
});

useBrowserExitMessage(hasUnsavedChanges);

function updateUnsavedChangesFlag(updatedUnsavedChangesFlagValue: boolean) {
  hasUnsavedChanges.value = updatedUnsavedChangesFlagValue;
}

function closeTab(tabToClose: DocumentTab) {
  const nextRoute = documentTabsStore.closeTabAndGetNextRoutePath(tabToClose);

  router.push(nextRoute);
}

const unsubscribeFromCurationBus = eventBusCuration.on((event, opt) => {
  try {
    if (event !== "SAVED") {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: [RAW_EXPERIENCE_QUERY_KEY],
    });

    void queryClient.invalidateQueries({
      queryKey: [DISTRIBUTION_CONTENT_QUERY_KEY],
    });

    hasUnsavedChanges.value = false;

    if (opt?.nextSection) {
      router.push(opt.nextSection);
    }
    if (opt?.redirect) {
      documentTabsStore.closeTabByDocumentId({ experienceId: id });
      router.push("/");
    }
  } catch (error) {
    logError("update-curation", error);
    console.error(error);
    throw error;
  }
});

onBeforeUnmount(() => unsubscribeFromCurationBus());
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.wrapper {
  display: grid;
  justify-items: start;
  grid-template-columns: auto 1fr auto;
}

.DocumentSidebar {
  &__header {
    padding-top: rem(25);
    padding-bottom: rem(16);
    margin-bottom: rem(16);
    border-bottom: 1px solid var(--color-neutral-40);
  }

  &__tabs {
    border-bottom: 1px solid var(--color-neutral-40);
  }

  &__title {
    color: var(--color-text-90);

    @include font-semibold(14);
  }
}
</style>
