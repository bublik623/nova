<template>
  <div class="DocumentLayout" :data-testid="`nova-experience-revision-${revisionId}`">
    <ProductsSidebar />
    <div class="w-full">
      <TabNavigation
        :tabs="documentTabsStore.tabs"
        :active-tab="documentTabsStore.getActiveTab()"
        @tab-close="closeTab"
      />
      <DocumentSkeletonDocument v-if="status === 'pending'" />
      <div v-else class="wrapper">
        <DocumentSidebar show-input-text :sidebar-categories="store.sideBarConfig.items">
          <template #open>
            <div class="DocumentSidebar__header mx-3">
              <h2 class="DocumentSidebar__title" data-testid="document-sidebar-refcode">
                {{ `${$t("experience.common.ref_code")} ${store?.refCode}` }}
              </h2>
              <ExperienceStatusBadge
                v-if="shouldDisplayBadge"
                class="mt-2"
                :flow-code="store.flowCode"
                :status-code="store.statusCode"
              />
            </div>
          </template>
        </DocumentSidebar>
        <ExperienceFormWrapper
          :show-save-and-go-next="!!nextAvailableSection"
          :is-readonly="true"
          :is-save-enabled="true"
          :is-saving-draft="false"
          @click:navigate="() => nextAvailableSection && $router.push(nextAvailableSection)"
        >
          <NovaAlert v-if="!shouldDisplayBadge" class="mb-6" status="warning">
            <UtilsRenderHtml :string="alertText" />
          </NovaAlert>
          <NuxtPage />
        </ExperienceFormWrapper>

        <ActionBar initial-section="HISTORY">
          <template #history>
            <ProductHistory>
              <template #activity_log>
                <ActionBarActivity class="w-full" />
              </template>
              <template #version_history>
                <VersionHistory
                  :experience-id="experienceId"
                  :document-content-type="safeDocumentContentType"
                  :current-revision-id="revisionId"
                  :language="language as AvailableLanguage"
                  @action:open-revision="handleOpenRevision"
                />
              </template>
            </ProductHistory>
          </template>
        </ActionBar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DocumentSidebar from "@/components/Document/DocumentSidebar/DocumentSidebar.vue";
import TabNavigation from "@/components/Document/TabNavigation/TabNavigation.vue";
import ActionBar from "@/features/experience-shared/components/ActionBar.vue";
import ExperienceStatusBadge from "@/features/experience-shared/components/ExperienceStatusBadge.vue";
import ProductsSidebar from "@/features/experience-shared/components/ProductsSidebar.vue";
import { DocumentContentType } from "@/types/DocumentStatuses";
import ProductHistory from "@/features/experience-shared/components/ProductHistory.vue";
import VersionHistory from "@/features/experience-shared/components/VersionHistory.vue";
import ActionBarActivity from "@/features/experience-activity-log/components/ActionBarActivity.vue";
import { useRevisionStore } from "@/features/experience-revision/store/useRevisionStore";
import { useVersionHistoryStore } from "@/features/experience-shared/stores/useVersionHistoryStore";
import { getRevisionUrl } from "@/features/experience-revision/lib/get-revision-url";
import NovaAlert from "@/ui-kit/NovaAlert/NovaAlert.vue";
import { getNextAvailableSection } from "@/features/experience-shared/utils/get-next-available-section";
import { DocumentTab, useDocumentTabs } from "@/stores/document-tabs";
import ExperienceFormWrapper from "@/features/experience-shared/components/ExperienceFormWrapper.vue";
import { AvailableLanguage } from "@/types/Language";

const { $t } = useNuxtApp();
const router = useRouter();
const route = useRoute();
const { id: experienceId, revisionId, flow, language = "en" } = route.params as Record<string, string>;

const store = useRevisionStore();
const versionHistoryStore = useVersionHistoryStore();

const { status } = useLazyAsyncData(() => store.loadRevision(language, flow, experienceId, revisionId));

const shouldDisplayBadge = versionHistoryStore.history?.versions.find((v) => v.snapshotId === revisionId)?.options
  ?.shouldDisplayBadge;

const documentTabsStore = useDocumentTabs();

watch(
  () => store.tabLabel,
  (newTabLabel, oldTabLabel) => {
    if (newTabLabel === oldTabLabel) {
      return;
    }

    documentTabsStore.addOrUpdateTab({ experienceId, revisionId: revisionId }, newTabLabel, route.path);
  }
);

watch(
  () => route.path,
  (newRoutePath, oldRoutePath) => {
    if (newRoutePath === oldRoutePath) {
      return;
    }

    documentTabsStore.updateTabPath({ experienceId, revisionId: revisionId }, newRoutePath);
  }
);

function closeTab(tabToClose: DocumentTab) {
  const nextRoute = documentTabsStore.closeTabAndGetNextRoutePath(tabToClose);

  router.push(nextRoute);
}

const alertText = computed(() =>
  $t("experience.revision.outdated_alert_text", {
    placeholders: { d: new Date(store.revisionDate ?? "").toLocaleDateString("en-gb") },
  })
);

const safeDocumentContentType = computed(() => {
  switch (flow) {
    case "raw":
      return DocumentContentType.RAW;
    case "curation":
      return DocumentContentType.EDITORIAL;
    case "translation":
      return DocumentContentType.TRANSLATION;
    case "media":
      return DocumentContentType.MEDIA;
    default:
      throw new Error(`Invalid flow: ${flow}`);
  }
});

const nextAvailableSection = computed(() => getNextAvailableSection(store.sideBarConfig.items, route.path));

function handleOpenRevision(revisionId: string) {
  const path = getRevisionUrl(experienceId, revisionId, flow, language);
  router.push(path);
}
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
    padding: rem(25) 0;
  }

  &__title {
    @include font-semibold(14);

    color: var(--color-text-90);
  }
}
</style>
