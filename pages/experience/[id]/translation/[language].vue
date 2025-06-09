<template>
  <div class="DocumentLayout" :data-testid="`nova-experience-translation-${experienceId}-${languageCode}`">
    <ProductsSidebar />
    <div :style="{ width: '100%' }">
      <DocumentTabNavigation
        :tabs="documentTabsStore.tabs"
        :active-tab="documentTabsStore.getActiveTab()"
        @tab-close="closeTab"
      />

      <div v-if="!pending" class="wrapper">
        <DocumentSidebar :sidebar-categories="sidebarCategories" show-input-text>
          <template #open>
            <div class="DocumentSidebar__header mx-3">
              <h2 class="DocumentSidebar__title" data-testid="document-sidebar-refcode">
                {{ `${$t("experience.common.ref_code")} ${distributionData?.reference_code}` }}
              </h2>
              <ExperienceStatusBadge
                class="mt-2"
                :flow-code="translationStore.translation.flow_code"
                :status-code="translationStore.translation.status_code"
              />
            </div>
          </template>
        </DocumentSidebar>

        <ExperienceFormWrapper
          :is-readonly="isReadonly"
          :is-save-enabled="true"
          :show-save-and-go-next="!!nextAvailableSection"
          :is-saving-draft="isSaving"
          @click:navigate="handleNavigate"
          @click:save-and-navigate="handleSaveAndNavigate"
        >
          <NuxtPage
            :next-section-route="nextAvailableSection"
            :is-saving-draft="isSaving && saveButtonClicked === 'SAVE_DRAFT'"
            :readonly="isReadonly"
            @has-unsaved-changes="updateUnsavedChangesFlag"
          />
        </ExperienceFormWrapper>

        <ActionBar>
          <template v-if="!isReadonly" #actions>
            <ExperienceStatusDropdown :experience-status="statusDropdown" :readonly="true" />
            <DistributionAttributes v-if="useFeatureFlag('curation_level')" readonly class="mt-4" />
            <ActionBarCta
              id="save-content"
              :title="$t('action-bar.translation.save.title')"
              :description="`${$t('action-bar.translation.save.tip')}`"
              :cta-text="$t('action.bar.draft.button')"
              :cta-type="'outline'"
              :cta-loading="isSaving && saveButtonClicked === 'SAVE_DRAFT'"
              :cta-enabled="!!translationStore.translation.title?.trim()"
              @click:action="(saveButtonClicked = 'SAVE_DRAFT'), eventBusTranslation.emit('SAVE')"
            >
              <template #additional-info>
                <ActionBarLastEditDate />
              </template>
            </ActionBarCta>
            <ActionBarCta
              id="send-to-preview"
              :title="$t('action.bar.experience.progress.title')"
              :description="$t('action.bar.translation.content.tip')"
              :cta-text="$t('action.bar.translation.content.button')"
              :cta-enabled="translationStore.validation.formIsValid"
              :cta-loading="isSaving && saveButtonClicked === 'PUBLISH'"
              :percentage-completion="percentageCompletion"
              @click:action="(saveButtonClicked = 'PUBLISH'), eventBusTranslation.emit('SAVE', { publish: true })"
              ><template #additional-info>
                <ActionBarPercentage :percentage="percentageCompletion" class="mt-2" />
              </template>
            </ActionBarCta>
          </template>
          <template #history>
            <ProductHistory>
              <template #activity_log>
                <ActionBarActivity class="w-full" />
              </template>

              <template #version_history>
                <VersionHistory
                  :experience-id="experienceId"
                  :document-content-type="DocumentContentType.TRANSLATION"
                  :language="languageCode"
                  @action:open-revision="handleOpenRevision"
                />
              </template>
            </ProductHistory>
          </template>
        </ActionBar>
      </div>
      <DocumentSkeletonDocument v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import ActionBar from "@/features/experience-shared/components/ActionBar.vue";
import ActionBarCta from "@/features/experience-shared/components/ActionBarCta.vue";
import ActionBarLastEditDate from "@/features/experience-shared/components/ActionBarLastEditDate.vue";
import ActionBarPercentage from "@/features/experience-shared/components/ActionBarPercentage.vue";
import { MappedCategory, SidebarSections } from "@/types/DocumentSidebar";
import { AvailableLanguage } from "@/types/Language";
import { useExperienceTranslationFlow } from "@/features/experience-translation/composables/useExperienceTranslationFlow";
import { DocumentContentType } from "@/types/DocumentStatuses";
import { translationHighlightArraySchema } from "@/features/experience-translation/schemas";
import { createField, mapSidebarSections } from "@/features/experience-shared/utils/map-sidebar-sections";
import { useFormPercentageCompletion } from "@/features/experience-shared/composables/useFormPercentageCompletion";
import { eventBusTranslation } from "@/features/experience-shared/composables/useEventBus";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useNotifications } from "@/stores/notifications";
import ProductsSidebar from "@/features/experience-shared/components/ProductsSidebar.vue";
import DocumentSidebar from "@/components/Document/DocumentSidebar/DocumentSidebar.vue";
import ExperienceStatusBadge from "@/features/experience-shared/components/ExperienceStatusBadge.vue";
import ExperienceStatusDropdown from "@/features/experience-shared/components/ExperienceStatusDropdown.vue";
import { ExperienceState, getTranslationState } from "@/features/experience-shared/utils/get-experience-state";
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";
import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";
import DistributionAttributes from "@/features/experience-shared/components/DistributionAttributes.vue";
import ActionBarActivity from "@/features/experience-activity-log/components/ActionBarActivity.vue";
import {
  CustomTranslations,
  DistributionContent,
  ExperienceTranslation,
} from "@/types/generated/ExperienceRawServiceApi";
import ProductHistory from "@/features/experience-shared/components/ProductHistory.vue";
import VersionHistory from "@/features/experience-shared/components/VersionHistory.vue";
import { getNextAvailableSection } from "@/features/experience-shared/utils/get-next-available-section";
import { DocumentTab, useDocumentTabs } from "@/stores/document-tabs";
import { useUnsavedChanges } from "@/features/experience-calendar/composables/useUnsavedChanges";
import { getRevisionUrl } from "@/features/experience-revision/lib/get-revision-url";
import { getListDiff } from "@donedeal0/superdiff";
import { useTranslationAsterixIntegrationStore } from "@/features/experience-translation/asterix-integration/stores/useTranslationAsterixIntegrationStore";
import { hasPermission } from "@/features/roles/lib/has-permission";
import ExperienceFormWrapper from "@/features/experience-shared/components/ExperienceFormWrapper.vue";

const route = useRoute();
const router = useRouter();
const { logError } = useLogger();
const notificationStore = useNotifications();
const documentTabsStore = useDocumentTabs();

const experienceId = route.params.id as string;
const languageCode = route.params.language as AvailableLanguage;

const isReadonly = !hasPermission("experience.translation.canWrite");

const { curationStore, curationDocument, translationStore, isSaving } = useExperienceTranslationFlow(
  languageCode,
  experienceId
);
const translationAsterixIntegrationStore = useTranslationAsterixIntegrationStore();

if (route.path.split("/").length === 5) {
  router.push(`${languageCode}/settings`);
}
const saveButtonClicked: Ref<"SAVE_DRAFT" | "PUBLISH" | undefined> = ref();

function handleSaveAndNavigate() {
  eventBusTranslation.emit("SAVE", { nextSectionRoute: nextAvailableSection.value });
}

async function handleNavigate() {
  if (!nextAvailableSection.value) {
    return;
  }
  await router.push(nextAvailableSection.value);
}

const { execute: fetchDocument } = useLazyAsyncData(
  `getTranslationDocument - ${experienceId}`,
  async () => {
    const { getExperienceRawV2ByExperienceId } = useExperienceRawApi();
    try {
      await Promise.all([
        translationStore.loadTranslation(languageCode, experienceId),
        curationStore.getCurationDocument(experienceId),
        getExperienceRawV2ByExperienceId(experienceId),
      ]);
    } catch (err) {
      logError("load-translation", err);
      notificationStore.addNotification({
        theme: "error",
        message: "notifications.error.fetching.single.translation",
      });
    }
  },
  { immediate: false }
);

const distributionData = ref<DistributionContent | undefined>(undefined);
const distributionState = ref<ExperienceState>("draft");
const statusDropdown = computed(() => {
  return {
    distribution: distributionState.value,
  };
});
const { getDistributionContent } = useExperienceRawApi();
const { execute: fetchDistributionContent } = useLazyAsyncData(
  `getDistributionContent-${experienceId}`,
  async () => {
    try {
      const { data } = await getDistributionContent(experienceId);
      // distribution data for the current language
      const translationDistributionData = data.translation_content_list?.find(
        (content) => content.language_code === languageCode
      );
      distributionState.value = getTranslationState({
        experienceDate: translationDistributionData?.distribution_date,
        experienceStatus: translationDistributionData?.distribution_status,
      });

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

// Data loading
const { pending } = useLazyAsyncData(`load-translation-${experienceId}`, async () => {
  await fetchDistributionContent();
  await fetchDocument();
});

watch(
  () =>
    !pending.value ? translationStore.translation?.title || curationDocument?.value?.fields.title.value : undefined,
  (newTabLabel, oldTabLabel) => {
    if (newTabLabel === oldTabLabel) {
      return;
    }

    documentTabsStore.addOrUpdateTab({ experienceId }, newTabLabel ?? "...", route.path);
  },
  { immediate: true }
);

watch(
  () => route.path,
  (newRoutePath, oldRoutePath) => {
    if (newRoutePath === oldRoutePath) {
      return;
    }

    documentTabsStore.updateTabPath({ experienceId }, newRoutePath);
  }
);

function closeTab(tabToClose: DocumentTab) {
  const nextRoute = documentTabsStore.closeTabAndGetNextRoutePath(tabToClose);

  router.push(nextRoute);
}

const areCommercialFieldsUpdated = (translationField: keyof ExperienceTranslation): boolean => {
  if (translationStore.isTranslationPublished) {
    return false;
  }

  if (!curationStore.latestEnglishSnapshot || !curationStore.secondLastEnglishSnapshot) {
    return false;
  }

  return (
    curationStore.latestEnglishSnapshot?.experience_translation?.[translationField] !==
    curationStore.secondLastEnglishSnapshot?.experience_translation?.[translationField]
  );
};

const areCustomFieldsUpdated = (customField: keyof CustomTranslations): boolean => {
  if (translationStore.isTranslationPublished) {
    return false;
  }

  if (!curationStore.latestEnglishSnapshot || !curationStore.secondLastEnglishSnapshot) {
    return false;
  }

  const diff = getListDiff(
    curationStore.secondLastEnglishSnapshot?.customs?.[customField] || [],
    curationStore.latestEnglishSnapshot?.customs?.[customField] || []
  );

  return diff.status !== "equal";
};

// sidebar logic and data
const sidebarCategories = computed<{ [key: string]: MappedCategory }>(() => {
  const baseUrl = `/experience/${experienceId}/translation/${languageCode}`;
  const enableDifferentProductTypes = useFeatureFlag("enableDifferentProductTypes");
  const productType = enableDifferentProductTypes ? distributionData?.value?.experience_source || "NOVA" : "NOVA";
  const isLoadedInAsterix = productType === "ASX";

  const sidebarSections: SidebarSections = {
    settings: {
      url: `${baseUrl}/settings`,
      icon: "settings",
      fields: [
        {
          id: "title",
          required: true,
          filled: !!translationStore.translation?.title,
          hasChange: areCommercialFieldsUpdated("title"),
        },
        {
          id: "seo_title",
          required: true,
          filled: !!translationStore.translation?.seo_title,
          hasChange: areCommercialFieldsUpdated("seo_title"),
        },
      ],
    },
    location: {
      url: `${baseUrl}/location`,
      icon: "location",
      fields: [
        {
          id: "meeting_point_details",
          required: false,
          filled: !!translationStore.translation?.meeting_point_details,
          hasChange: areCommercialFieldsUpdated("meeting_point_details"),
        },
      ],
    },
    content_generation: {
      url: `${baseUrl}/content-generation`,
      icon: "content-generator",
      fields: [
        {
          id: "description",
          required: true,
          filled: !!translationStore.translation?.text1,
          hasChange: areCommercialFieldsUpdated("text1"),
        },
        {
          id: "seo_description",
          required: true,
          filled: !!translationStore.translation?.seo_description,
          hasChange: areCommercialFieldsUpdated("seo_description"),
        },
        {
          id: "additional_description",
          required: false,
          filled: !!translationStore.translation?.text2,
          hasChange: areCommercialFieldsUpdated("text2"),
        },
        {
          id: "highlights",
          required: true,
          filled: translationHighlightArraySchema.safeParse(translationStore.translation.custom_highlights).success,
          hasChange: areCustomFieldsUpdated("custom_highlights"),
        },
        {
          id: "included",
          required: true,
          filled: translationHighlightArraySchema.safeParse(translationStore.translation.custom_included).success,
          hasChange: areCustomFieldsUpdated("custom_included"),
        },
        {
          id: "non_included",
          required: false,
          filled: translationHighlightArraySchema.safeParse(translationStore.translation.custom_non_included).success,
          hasChange: areCustomFieldsUpdated("custom_non_included"),
        },
        {
          id: "important_information",
          required: false,
          filled: translationHighlightArraySchema.safeParse(translationStore.translation.custom_important_information)
            .success,
          hasChange: areCustomFieldsUpdated("custom_important_information"),
        },
      ],
    },
    customer_information: {
      url: `${baseUrl}/customer-information`,
      icon: "customer-info",
      fields: [
        {
          id: "info_voucher",
          required: false,
          filled: !!translationStore.translation.info_voucher,
          hasChange: areCommercialFieldsUpdated("info_voucher"),
        },
      ],
    },
    asterix_integration: {
      url: `${baseUrl}/asterix-integration`,
      icon: "asterix-integration",
      noDropdown: false,
      hide: !isLoadedInAsterix,
      fields: [
        createField(
          "asterix_integration",
          { required: true, value: false },
          { filled: translationAsterixIntegrationStore.fieldStatus[0].isValid }
        ),
      ],
    },
  };

  return mapSidebarSections(sidebarSections);
});

const nextAvailableSection = computed(() => getNextAvailableSection(sidebarCategories.value, route.path));

const fieldList = computed(() =>
  Object.values(sidebarCategories.value)
    .map((s) => s.fields)
    .flat()
);
const percentageCompletion = useFormPercentageCompletion(fieldList);

function handleOpenRevision(revisionId: string) {
  const path = getRevisionUrl(experienceId, revisionId, "translation", languageCode);
  router.push(path);
}

// unsaved changes modal
const { hasUnsavedChanges } = useUnsavedChanges({
  cancelCallback: async () => {
    await refreshNuxtData();
  },
  confirmCallback: async () => {
    eventBusTranslation.emit("SAVE");
  },
});
useBrowserExitMessage(hasUnsavedChanges);

function updateUnsavedChangesFlag(updatedUnsavedChangesFlagValue: boolean) {
  hasUnsavedChanges.value = updatedUnsavedChangesFlagValue;
}

const unsubscribeFromTranslationBus = eventBusTranslation.on((event, opt) => {
  if (event !== "SAVED") {
    return;
  }

  console.log("opt", opt);

  if (opt?.nextSectionRoute) {
    console.log("nextSectionRoute", opt.nextSectionRoute);
    router.push(opt.nextSectionRoute);
  }
});

onBeforeUnmount(() => unsubscribeFromTranslationBus());
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.wrapper {
  display: grid;
  grid-template-columns: auto 1fr auto;
}

.DocumentSidebar {
  &__header {
    padding-top: rem(25);
    padding-bottom: rem(16);
    margin-bottom: rem(16);
    border-bottom: 1px solid var(--color-neutral-40);
  }

  &__title {
    color: var(--color-text-90);

    @include font-semibold(14);
  }
}
</style>
