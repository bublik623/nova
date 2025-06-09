<template>
  <div class="DocumentLayout">
    <ProductsSidebar />
    <div class="DocumentView">
      <DocumentTabNavigation
        :tabs="documentTabsStore.tabs"
        :active-tab="documentTabsStore.getActiveTab()"
        @tab-close="closeTab"
      />

      <div v-if="!pending" class="wrapper">
        <DocumentSidebar :sidebar-categories="sidebarCategories">
          <template #open>
            <NovaTabs
              class="mx-3 mt-2 DocumentSidebar__tabs"
              :options="[
                { title: $t('status.flow.curation'), value: `/experience/${id}/curation` },
                { title: $t('status.flow.media'), value: `/experience/${id}/media/visuals` },
              ]"
              :selected="{ value: `/experience/${id}/media/visuals` }"
              @select:option="(option) => router.push(option.value)"
            />
            <div class="DocumentSidebar__header mx-3">
              <h2 class="DocumentSidebar__title" data-testid="document-sidebar-refcode">
                {{ `${$t("experience.common.ref_code")} ${distributionData?.reference_code}` }}
              </h2>
              <ExperienceStatusBadge class="mt-2" flow-code="MEDIA" :status-code="experienceMediaData?.status_code" />
            </div>
          </template>
        </DocumentSidebar>

        <ExperienceFormWrapper :show-save-and-go-next="false">
          <NuxtPage />
        </ExperienceFormWrapper>
        <ActionBar>
          <template #actions>
            <span v-if="!isReadonly">
              <DistributionAttributes v-if="useFeatureFlag('curation_level')" readonly class="mt-4" />
              <ExperienceStatusDropdown :experience-status="statusDropdown" :readonly="true" />
              <ActionBarCta
                id="save-content"
                :title="$t('action-bar.media.save.title')"
                :description="`${$t('action-bar.media.save.tip')}`"
                :cta-text="$t('action-bar.media.save.button')"
                :cta-type="'outline'"
                :cta-enabled="true"
                :cta-loading="savingDocument"
                @click:action="handleSaveMedia"
              >
                <template #additional-info>
                  <ActionBarLastEditDate />
                </template>
              </ActionBarCta>

              <ActionBarCta
                id="publish"
                :title="$t('action.bar.experience.progress.title')"
                :description="$t('action.bar.media.content.tip')"
                :cta-enabled="checkDocumentValidity(sidebarCategories)"
                :cta-text="$t('action.bar.media.content.button')"
                :cta-loading="publishingDocument"
                @click:action="handleSaveMedia(true)"
              >
                <template #additional-info>
                  <ActionBarPercentage :percentage="percentageCompletion" class="mt-2" />
                </template>
              </ActionBarCta>
            </span>
          </template>
          <template #history>
            <ProductHistory>
              <template #activity_log>
                <ActionBarActivity class="w-full" />
              </template>

              <template #version_history>
                <VersionHistory
                  :experience-id="id"
                  :document-content-type="DocumentContentType.MEDIA"
                  @action:open-revision="handleOpenRevision"
                />
              </template>
            </ProductHistory>
          </template>
        </ActionBar>
      </div>
      <SkeletonDocument v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonDocument from "@/components/Document/SkeletonDocument/SkeletonDocument.vue";
import NovaTabs from "@/ui-kit/NovaTabs/NovaTabs.vue";
import ActionBar from "@/features/experience-shared/components/ActionBar.vue";
import ActionBarCta from "@/features/experience-shared/components/ActionBarCta.vue";
import { useNotifications } from "@/stores/notifications";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { storeToRefs } from "pinia";
import ActionBarLastEditDate from "@/features/experience-shared/components/ActionBarLastEditDate.vue";
import { useUnsavedChanges } from "@/features/experience-calendar/composables/useUnsavedChanges";
import ProductsSidebar from "@/features/experience-shared/components/ProductsSidebar.vue";
import { useExperienceMediaStore } from "@/features/experience-media/stores/useExperienceMediaStore";
import { mapSidebarSections } from "@/features/experience-shared/utils/map-sidebar-sections";
import { MappedCategory, SidebarSections } from "@/types/DocumentSidebar";
import { checkDocumentValidity } from "@/features/experience-shared/utils/check-document-validity";
import DocumentSidebar from "@/components/Document/DocumentSidebar/DocumentSidebar.vue";
import ActionBarPercentage from "@/features/experience-shared/components/ActionBarPercentage.vue";
import { useFormPercentageCompletion } from "@/features/experience-shared/composables/useFormPercentageCompletion";
import ExperienceStatusBadge from "@/features/experience-shared/components/ExperienceStatusBadge.vue";
import { getDistributionState, ExperienceState } from "@/features/experience-shared/utils/get-experience-state";
import ExperienceStatusDropdown from "@/features/experience-shared/components/ExperienceStatusDropdown.vue";
import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";
import DistributionAttributes from "@/features/experience-shared/components/DistributionAttributes.vue";
import { ref } from "vue";
import { DistributionContent } from "@/types/generated/ExperienceRawServiceApi";
import { DocumentContentType } from "@/types/DocumentStatuses";
import VersionHistory from "@/features/experience-shared/components/VersionHistory.vue";
import ActionBarActivity from "@/features/experience-activity-log/components/ActionBarActivity.vue";
import ProductHistory from "@/features/experience-shared/components/ProductHistory.vue";
import { useDocumentTabs } from "@/stores/document-tabs";
import { getRevisionUrl } from "@/features/experience-revision/lib/get-revision-url";
import { hasPermission } from "@/features/roles/lib/has-permission";
import ExperienceFormWrapper from "@/features/experience-shared/components/ExperienceFormWrapper.vue";

const router = useRouter();
const route = useRoute();
const id = route.params.id as string;

const experienceMediaStore = useExperienceMediaStore();
const { experienceTitle, fields, experienceMediaData } = storeToRefs(experienceMediaStore);
const { addNotification } = useNotifications();
const { logError } = useLogger();
const documentTabsStore = useDocumentTabs();

watch(
  experienceTitle,
  (newExperienceTitle, oldExperienceTitle) => {
    if (newExperienceTitle === oldExperienceTitle) {
      return;
    }

    documentTabsStore.addOrUpdateTab({ experienceId: id }, newExperienceTitle ?? "...", route.path);
  },
  { immediate: true }
);

function closeTab(tabToClose: DocumentTab) {
  const nextRoute = documentTabsStore.closeTabAndGetNextRoutePath(tabToClose);

  router.push(nextRoute);
}

const isReadonly = !hasPermission("experience.media.canWrite");

const savingDocument = ref(false);
const publishingDocument = ref(false);

const distributionData = ref<DistributionContent | undefined>(undefined);
const distributionState = ref<ExperienceState>("draft");
const statusDropdown = computed(() => {
  return {
    distribution: distributionState.value,
  };
});
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

// reroute to the first default sub-page if the user navigates to the index experience/:id/media
if (route.path.split("/").length === 4) {
  router.push(`media/visuals`);
}

const { getExperienceRawV2ByExperienceId } = useExperienceRawApi();
const { execute: fetchDocument } = useLazyAsyncData(
  `getMediaCurationDocument - ${id}`,
  async () => {
    try {
      await Promise.all([experienceMediaStore.loadExperienceMedia(id), getExperienceRawV2ByExperienceId(id)]);
    } catch (error) {
      logError("load-media", error);
      console.log(error);
      addNotification({
        theme: "error",
        message: "notifications.error.fetching.media",
      });
    }
  },
  { immediate: false }
);

// Data loading
const { pending } = useLazyAsyncData(`load-media-${id}`, async () => {
  await fetchDistributionContent();
  await fetchDocument();
});

// unsaved changes modal
const { hasUnsavedChanges } = useUnsavedChanges({
  cancelCallback: async () => {
    hasUnsavedChanges.value = false;
    await refreshNuxtData();
  },
  confirmCallback: async () => {
    await handleSaveMedia();
  },
});

const firstLoad = ref(true);
watch(
  // watch all the stores used in the page
  () => fields.value.gallery,
  () => {
    // needed to not trigger the watcher when media document load
    if (!firstLoad.value) {
      hasUnsavedChanges.value = true;
    }
    firstLoad.value = false;
  },
  {
    deep: true,
  }
);
useBrowserExitMessage(hasUnsavedChanges);

async function handleSaveMedia(publish = false) {
  try {
    savingDocument.value = !publish;
    publishingDocument.value = publish;

    await experienceMediaStore.updateExperienceMedia(id, { publish });

    hasUnsavedChanges.value = false;
    addNotification({
      theme: "success",
      message: "notifications.success.saving.media",
    });
  } catch (err) {
    logError(publish ? "publish-media" : "update-media", err);
    addNotification({
      theme: "error",
      message: "notifications.error.saving.media",
    });
  } finally {
    savingDocument.value = false;
    publishingDocument.value = false;
  }
}

const baseUrl = `/experience/${id}/media`;
const sidebarCategories: ComputedRef<{ [key: string]: MappedCategory }> = computed(() => {
  const sidebar: SidebarSections = {
    visuals: {
      url: `${baseUrl}/visuals`,
      icon: "gallery",
      fields: [
        {
          id: "gallery",
          required: fields.value.gallery.required,
          filled: fieldValidator(fields.value.gallery),
        },
      ],
    },
  };
  return mapSidebarSections(sidebar);
});

function handleOpenRevision(revisionId: string) {
  const path = getRevisionUrl(id, revisionId, "media");
  router.push(path);
}

const fieldList = computed(() =>
  Object.values(sidebarCategories.value)
    .map((s) => s.fields)
    .flat()
);
const percentageCompletion = useFormPercentageCompletion(fieldList);
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.wrapper {
  display: grid;
  justify-items: start;
  grid-template-columns: auto 1fr auto;
}

.main-wrapper {
  width: 100%;
}

.form {
  max-width: rem(1056);
  padding: rem(20) 0;
  display: flex;
  flex-direction: column;
  row-gap: rem(40);
  margin: 0 var(--content-margin-sm);
}

@include start-from(desktop-md) {
  .form {
    margin: 0 var(--content-margin-md);
  }
}
@include start-from(desktop-lg) {
  .form {
    margin: 0 var(--content-margin-lg);
  }
}

.DocumentSidebar {
  &__header {
    padding-top: rem(24);
    padding-bottom: rem(16);
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
