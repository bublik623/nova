<template>
  <div class="wrapper">
    <div class="header">
      <TypologyBar
        :search-query="searchQuery"
        :title="title"
        :categories="subTitle"
        show-add-new-btn
        @update:search-query="(evt) => (searchQuery = evt)"
        @click:add-btn="handleCreateItem"
        @click:create-category="handleCreateCategory"
      />
    </div>

    <div class="section">
      <div class="card leftCard">
        <ul v-if="anyItemToDisplay" class="list">
          <li
            v-for="[categoryCode, categoryItems] in mappedCategories"
            :key="categoryCode"
            :ref="route.path"
            class="mb-2"
          >
            <GroupedPremadeCollapsable
              v-if="categoryItems.length"
              :id="getCategoryURL(categoryCode)"
              :name="
                masterDataStore.hierarchicalGroups.get(categoryCode)?.name || UNCATEGORIZED_HIERARCHICAL_GROUP_NAME
              "
              :options="categoryItems"
              :to="getCategoryURL(categoryCode)"
              :open="searchQuery.length > 0 || isCurrentCategory(categoryCode)"
              @vue:mounted="handleScroll(categoryCode)"
              @vue:updated="handleScroll(categoryCode)"
            />
          </li>
        </ul>

        <div v-else-if="noItemsMatchingQuery" class="card-empty">
          <p>{{ $t("masterdata-management.items-card.no_results") }}</p>
        </div>

        <div v-else class="card-empty">
          <p class="card-empty__title">
            {{ $t(`masterdata-management.items-card.empty.title`) }}
          </p>
          <p>{{ $t("masterdata-management.items-card.empty.subtitle") }}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="card p-16">
        <template v-if="!!route.params.category">
          <div>
            <NuxtPage />
          </div>
        </template>
        <template v-else>
          <div class="card-empty">
            <p class="card-empty__title">
              {{ $t(`masterdata-management.detail-card.empty.title.${anyItemToDisplay ? "choose" : "create"}`) }}
            </p>
            <p>{{ $t("masterdata-management.detail-card.empty.subtitle") }}</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TypologyBar from "@/features/masterdata-management-shared/components/TypologyBar.vue";
import CreatePremadeItem from "@/features/masterdata-management-commercial-content/components/CreatePremadeItem.vue";
import { useMasterData } from "@/stores/master-data";
import {
  UNCATEGORIZED_HIERARCHICAL_GROUP_NAME,
  mapHighlightsToGroups,
} from "@/features/experience-highlights/lib/map-highlights-to-groups";
import GroupedPremadeCollapsable from "@/features/masterdata-management-commercial-content/components/GroupedPremadeCollapsable.vue";
import { useNotifications } from "@/stores/notifications";
import CreateCategoryDialog from "@/features/masterdata-management-commercial-content/components/CreateCategoryDialog.vue";
import { useAsyncModal } from "@/features/core-shared/composables/useAsyncModal";
import { createPremadeCategory } from "@/features/masterdata-management-commercial-content/lib/create-premade-category";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useRoute, useRouter } from "vue-router";
import { ExperienceMasterDataEndpoint } from "@/composables/useExperienceMasterDataApi";
import { usePremadesFiltering } from "@/features/masterdata-management-shared/composables/usePremadesFiltering";
import { createMultiplePremadeItems } from "@/features/masterdata-management-commercial-content/lib/create-multiple-premade-items";

const route = useRoute();
const router = useRouter();

const masterdata = useExperienceMasterDataApi();
const masterDataStore = useMasterData();
const { $t } = useNuxtApp();
const { data, pending } = useLazyAsyncData(`get-${route.params.endpoint}`, async () => {
  const premadeItems = await masterdata.getPremades(route.params.endpoint as ExperienceMasterDataEndpoint, {
    language_code: "en",
  });

  return premadeItems.data;
});
const searchQuery = ref("");
const { matchingItems, count } = usePremadesFiltering(data, searchQuery);

const notifications = useNotifications();
const { logError } = useLogger();

const anyItemToDisplay = computed(() => count.value > 0 || pending.value);
const noItemsMatchingQuery = computed(() => !anyItemToDisplay.value && searchQuery.value !== "");

const title = $t(`masterdata-management.premade-${route.params.endpoint}.typology-bar.title`);
const subTitle = computed(() => {
  const itemsNumber = data.value?.length;

  return itemsNumber ? itemsNumber + " " + $t("common.items") : "";
});

const mappedCategories = computed(() => mapHighlightsToGroups(matchingItems?.value || []));

const baseUrl = `/masterdata-management/commercial-content/${route.params.endpoint}`;

function getCategoryURL(categoryCode: string) {
  return `${baseUrl}/${categoryCode}`;
}

function isCurrentCategory(categoryCode: string) {
  return route.params.category === categoryCode;
}

function handleScroll(categoryCode: string) {
  if (isCurrentCategory(categoryCode)) {
    scrollTo(categoryCode);
  }
}
function scrollTo(categoryCode: string) {
  const el = document.getElementById(getCategoryURL(categoryCode));

  el?.scrollIntoView({
    block: "start",
  });
}

async function handleCreateItem() {
  const modal = useAsyncModal(CreatePremadeItem);
  const currentCategory = masterDataStore.hierarchicalGroups.get(String(route.params.category));
  await modal.openModal({
    categoryOptions: masterDataStore.getHierarchicalGroupsByPremadesList(data?.value || []),
    currentCategory: currentCategory,
    handler: async (items, category) => {
      try {
        const newItems = await createMultiplePremadeItems(String(route.params.endpoint), items, category);

        const lastItem = `${baseUrl}/${category}/${newItems.at(-1)}`;

        // Refresh nuxt data so the item we just added shows up.
        await refreshNuxtData();

        // redirect to the last item we created
        router.push({
          path: lastItem,
        });

        notifications.addNotification({
          theme: "success",
          message: "notifications.success.creating.document",
        });
      } catch (error) {
        logError("create-premade-item");
        notifications.addNotification({
          theme: "error",
          message: "notifications.error.creating.document",
        });
      }
    },
  });
}

async function handleCreateCategory() {
  const modal = useAsyncModal(CreateCategoryDialog);

  await modal.openModal({
    handler: async (categoryName, items) => {
      try {
        const categoryCode = await createPremadeCategory(String(route.params.endpoint), categoryName, items);

        // we need to refresh the page to have the new category in the list
        // we also need to refresh the hc groups in the store
        await Promise.all([refreshNuxtData(), masterDataStore.fetchHierarchicalGroups()]);

        router.push({ path: `${baseUrl}/${categoryCode}` });

        notifications.addNotification({
          type: "toast",
          message: "masterdata.commercial.add-items-category.success",
          theme: "success",
        });
      } catch (error) {
        notifications.addNotification({
          type: "toast",
          message: "notifications.error.creating.document",
          theme: "error",
        });
        logError("create-premade-category", error);
        throw error;
      }
    },
  });
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.wrapper {
  display: grid;
  grid-template-columns: repeat(2, [col-start] 1fr);

  .header {
    grid-column: col-start / span 2;
  }

  .section {
    height: 84vh;
    padding: rem(16);
    overflow: hidden;

    & .card {
      border: var(--border-default);
      border-radius: var(--border-radius-default);
      height: 100%;
      overflow-y: scroll;

      &.leftCard {
        border-color: transparent;
      }

      &-empty {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        color: var(--color-text-70);

        @include font-regular(14);

        &__title {
          @include font-semibold(16);
        }
      }
    }
  }
}

.p-16 {
  padding: rem(16);
}
</style>
