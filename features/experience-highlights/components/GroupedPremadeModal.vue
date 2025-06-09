<template>
  <div>
    <NovaButton
      data-testid="highlight-manager-premade-list-open-modal"
      size="sm"
      :disabled="!(options.length > 0)"
      @click="show = true"
    >
      {{ $t("experience.highlights.premade.cta") }}
    </NovaButton>
    <NovaModal :show="show" @click:on-overlay="handleClose">
      <div class="PremadeModal">
        <div class="PremadeModal__header">
          <div class="empty-div"></div>
          <h2 class="PremadeModal__title">{{ $t(title) }}</h2>

          <NovaButtonIcon
            data-testid="highlight-manager-premade-list-close-modal"
            name="close"
            shape="square"
            :size="14"
            theme="dark"
            @click="handleClose"
          />
        </div>

        <div class="PremadeModal__search-bar px-4 pb-4 pt-1">
          <div class="PremadeModal__search-bar-box">
            <NovaInputText
              id="premade-modal-search-bar"
              v-model="searchQuery"
              left-icon="search"
              :placeholder="$t('experience.highlights.premade.modal.search.bar.placeholder')"
            />
          </div>
          <div class="PremadeModal__search-bar-box PremadeModal__content-view">
            <div class="mr-1">{{ $t("experience.highlights.premade.content_view") }}</div>
            <NovaButton
              size="xs"
              variant="underlined"
              data-testid="premade-modal-collapse-all"
              @click="openAll = !openAll"
            >
              {{ openAll ? $t("common.action.collapse_all") : $t("common.action.expand_all") }}
            </NovaButton>
          </div>
        </div>

        <div class="PremadeModal__content">
          <div v-if="searchQuery.length && count === 0" class="PremadeModal__no-results mt-4">
            {{ $t("experience.highlights.premade.no_results") }}
          </div>
          <template v-for="[groupId, filteredGroupOptions] in filteredGroups" :key="groupId">
            <GroupedPremadeModalForm
              v-model="localValues"
              :name="hierarchicalGroups.get(groupId)?.name || UNCATEGORIZED_HIERARCHICAL_GROUP_NAME"
              :options="getAllOptionsOfGroup(groupId)"
              :filtered-options="filteredGroupOptions"
              :open="openAll || searchQuery.length > 0"
            />
          </template>
        </div>
        <div class="PremadeModal__footer">
          <NovaButton size="xs" variant="underlined" data-testid="premade-modal-clear-all" @click="handleClearAll">
            {{ $t("common.clear.all_selected") }}
          </NovaButton>
          <NovaButton data-testid="premade-modal-save" size="xs" @click="handleSave">
            {{ $t("common.save") }}
          </NovaButton>
        </div>
      </div>
    </NovaModal>
  </div>
</template>

<script setup lang="ts">
import { ExperienceMasterDataItem } from "@/composables/useExperienceMasterDataApi";
import { HierarchicalGroup } from "@/types/generated/ExperienceMasterDataApi";
import { mapHighlightsToGroups, UNCATEGORIZED_HIERARCHICAL_GROUP_NAME } from "../lib/map-highlights-to-groups";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaModal from "@/ui-kit/NovaModal/NovaModal.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import { cloneDeep } from "lodash";
import GroupedPremadeModalForm from "./GroupedPremadeModalForm.vue";
import { usePremadesFiltering } from "@/features/masterdata-management-shared/composables/usePremadesFiltering";

interface Props {
  options: ExperienceMasterDataItem[];
  hierarchicalGroups: Map<string, HierarchicalGroup>;
  modelValue: Map<string, ExperienceMasterDataItem>;
  title: string;
}

interface Events {
  (e: "update:modelValue", value: Map<string, ExperienceMasterDataItem>): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const show = ref(false);
const searchQuery = ref("");
const openAll = ref(false);

// We need to emit the form changes only on save, not in real time.
const localValues = ref(new Map(cloneDeep(props.modelValue)));
const mappedGroups = mapHighlightsToGroups(props.options);
const { matchingItems, count } = usePremadesFiltering(ref(props.options), searchQuery);
const filteredGroups = computed(() => {
  if (!matchingItems.value) {
    return null;
  }
  return mapHighlightsToGroups(matchingItems.value);
});

function handleClose() {
  show.value = false;
  // Reset the local form on close
  localValues.value = props.modelValue;
}

function handleClearAll() {
  localValues.value?.clear();
}

function handleSave() {
  emits("update:modelValue", cloneDeep(localValues.value));
  show.value = false;
}

function getAllOptionsOfGroup(groupId: string): ExperienceMasterDataItem[] {
  const groupOptions = mappedGroups.get(groupId);

  if (groupOptions === undefined) {
    throw new Error(`Could not find master data items for category with code ${groupId}`);
  }

  return groupOptions;
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.PremadeModal {
  display: block;
  width: rem(640);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: rem(20);
  }

  &__title {
    @include font-bold(14);
  }

  &__search-bar {
    display: grid;
    grid-template-columns: auto rem(200);
    gap: rem(12);
    border-radius: var(--border-radius-default);
    font-size: rem(14);
  }

  &__search-bar-box {
    background-color: var(--color-neutral-10);
    display: flex;
    align-items: center;
    padding: rem(8);
    border-radius: var(--border-radius-default);
  }

  &__content-view {
    display: flex;
    justify-content: space-between;
  }

  &__no-results {
    text-align: center;
    @include font-regular(14);
  }

  &__content {
    height: rem(500);
    overflow: scroll;
    display: flex;
    flex-direction: column;
    gap: rem(8);
    padding: 0 rem(20) rem(20);
  }

  &__footer {
    padding: rem(16) rem(20);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: var(--border-default);
  }
}
</style>
