<template>
  <div class="flex">
    <ProductsSidebar />
    <div :style="{ width: '100%' }">
      <DocumentTabNavigation
        :tabs="documentTabsStore.tabs"
        :active-tab="documentTabsStore.getActiveTab()"
        @tab-close="closeTab"
      />
      <div v-if="!pending" class="wrapper">
        <OptionsLeftBar
          :id="id"
          :selected-view="selectedView"
          :option-id="optionId"
          :flow="flow"
          :option-name="optionStore.state.option?.name || ''"
          :experience-name="experienceName"
          :display-pickup-page="displayPickupPage"
          :validation="{
            optionSettings: validation,
            availability: optionStore.availabilitiesAreValid,
            pricing: pricingStore.isPricingFormValid,
            customerDetails: customerDetailsStore.isFormValid,
            pickups: pickupsStore,
          }"
          :experience-type="experience.data.offerExperience!.type"
          @update:selected-view="(e) => (selectedView = e)"
        />
        <NuxtPage :selected-view="selectedView" :is-readonly="isReadonly" />
      </div>
      <DocumentSkeletonDocument v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";
import { useExperienceRaw } from "@/stores/experience-raw";
import { useExperienceOptionsStore } from "@/features/experience-calendar/store/useExperienceOptionsStore";
import { useNotifications } from "@/stores/notifications";
import { ViewType } from "@/features/experience-curation/components/ViewSelect.vue";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import OptionsLeftBar from "@/features/experience-calendar/components/OptionsLeftBar.vue";
import { usePricingStore } from "@/features/experience-calendar/store/usePricingStore";
import { useOptionValidation } from "@/features/experience-calendar/composables/useOptionValidation";
import { useCustomerDetailsStore } from "@/features/experience-calendar/store/useCustomerDetailsStore";
import { usePickupsStore } from "@/features/experience-calendar/store/usePickupsStore";
import ProductsSidebar from "@/features/experience-shared/components/ProductsSidebar.vue";
import { useDocumentTabs } from "@/stores/document-tabs";
import { hasPermission } from "@/features/roles/lib/has-permission";
import { displayPickupPage } from "@/features/experience-calendar/constants/pickup-page.constants";

const route = useRoute();
const router = useRouter();
const { id, optionId, flow } = route.params as Record<string, string>;

const optionStore = useExperienceOptionsStore();
const pricingStore = usePricingStore();
const customerDetailsStore = useCustomerDetailsStore();
const pickupsStore = usePickupsStore();
const notificationStore = useNotifications();
const { logError } = useLogger();
const documentTabsStore = useDocumentTabs();

const isReadonly = !hasPermission("experience.options.canWrite");

// reroute to the first default sub-page if the user navigates to the index experience-raw/:id
if (route.path.split("/").length === 6) {
  router.push(`${optionId}/option-settings`);
}

// we are using the raw service here, but I'm not sure about it.
// Can we open operational content from a curation flow?
const experienceRawStore = useExperienceRaw();

const { execute: fetchOptions } = useLazyAsyncData(
  `get-experience-${id}-options`,
  async () => {
    try {
      await experienceRawStore.getRawDocument(id);
      await optionStore.loadOptionData(id, optionId, experience.value.data.offerExperience!.type);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      logError("load-option", err);
      notificationStore.addNotification({
        theme: "error",
        message: "notifications.error.loading.option",
      });
    }
  },
  { immediate: false }
);

const { getDistributionContent } = useExperienceRawApi();
const { execute: fetchDistributionContent } = useLazyAsyncData(
  `getDistributionContent-${id}`,
  async () => {
    try {
      const { data } = await getDistributionContent(id);
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
const { pending } = useLazyAsyncData(`load-option-${optionId}`, async () => {
  await fetchDistributionContent();
  await fetchOptions();
});

const experience = computed(() => experienceRawStore.rawContents[id]);
const experienceName = computed(() => experience.value?.data.commercial.title);

watch(
  () => experience.value?.fields.title.value,
  (newExperienceTitle, oldExperienceTitle) => {
    if (newExperienceTitle === oldExperienceTitle) {
      return;
    }

    documentTabsStore.addOrUpdateTab({ experienceId: id }, newExperienceTitle ?? "...", route.path);
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

function closeTab(tabToClose: DocumentTab) {
  const nextRoute = documentTabsStore.closeTabAndGetNextRoutePath(tabToClose);

  router.push(nextRoute);
}

const optionDocument = computed(() => optionStore.state.option);

// Validation
const validation = useOptionValidation(optionDocument, {
  immediate: true,
});

const selectedView = useRouteQuery<ViewType>("view", "all", {
  route,
  router,
});

// Sidebar
const baseUrl = `/experience/${id}/options/${flow}/${optionId}`;

// rerouting to options settings because the other pages are empty if the view is curation
watch(selectedView, () => {
  if (selectedView.value === "commercial") {
    router.push({
      path: `${baseUrl}/option-settings`,
      query: {
        view: selectedView.value,
      },
    });
  }
});
</script>
<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.wrapper {
  display: grid;
  justify-items: start;
  grid-template-columns: auto 1fr auto;
}
</style>
