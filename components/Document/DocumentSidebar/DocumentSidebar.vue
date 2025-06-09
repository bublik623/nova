<template>
  <div class="Sidebar" :open="open || null" data-testid="sidebar-wrapper">
    <template v-if="open">
      <div class="Sidebar__slot">
        <slot name="open"></slot>

        <div ref="inputText" class="mb-4 mx-3 search-input">
          <NovaInputText
            v-if="showInputText"
            id="list-search"
            v-model="searchValue"
            left-icon="search"
            :placeholder="$t('sidebar.search.placeholder')"
          />
        </div>
      </div>

      <div class="Sidebar__sections" data-testid="sidebar-sections">
        <ul>
          <li v-for="category in filteredNavigationGroup" :key="category.id" class="Sidebar__sections-item">
            <DocumentSidebarSection
              v-if="!category.disabled"
              :category="category"
              :open="!category.disabled && openedSections[category.id]"
              @click:toggle="(e: string) => (openedSections[e] = !openedSections[e])"
            />
            <NovaTooltip v-else position="top" theme="dark">
              <DocumentSidebarSection :category="category" :open="false" />
              <template #content>
                <div>
                  {{ $t("experience.sidebar.disabled.tooltip") }}
                  <p>
                    {{ $t(`experience.sidebar.${sidebarCategories[category.id]?.disabledBy}`) }}
                  </p>
                </div>
              </template>
            </NovaTooltip>
          </li>
        </ul>
      </div>

      <div class="Sidebar__footer">
        <NovaTooltip position="top-start">
          <NovaButton variant="action" size="xxs">
            <NovaIcon name="circle-info" :size="15" />
          </NovaButton>
          <template #content>
            <ul class="Sidebar__legend">
              <li>
                <span class="mr-2 circle">
                  <NovaIcon name="circle-dotted" :size="16" />
                </span>
                {{ $t("sidebar.legend.not.required.not.completed") }}
              </li>
              <li>
                <span class="mr-2 circle" required />
                {{ $t("sidebar.legend.required.not.completed") }}
              </li>
              <li>
                <span class="mr-2 circle">
                  <NovaIcon name="lock" :size="16" />
                </span>
                {{ $t("sidebar.legend.disabled") }}
              </li>
              <li>
                <span class="mr-2 circle" completed>
                  <NovaIcon name="check" :size="9" />
                </span>
                {{ $t("sidebar.legend.completed") }}
              </li>
              <li>
                <span class="mr-2 circle" has-change="true">
                  <NovaIcon name="check" :size="9" />
                </span>
                {{ $t("sidebar.legend.has_changes") }}
              </li>
            </ul>
          </template>
        </NovaTooltip>

        <NovaButton
          class="Sidebar__collapse-btn"
          data-testid="sidebar-btn-collapse"
          variant="action"
          size="xxs"
          @click="open = false"
        >
          <NovaIcon
            :style="{
              margin: '-2px',
            }"
            name="chevrons-left"
            :size="18"
          />
          <span class="ml-1">
            {{ $t("sidebar.button.close") }}
          </span>
        </NovaButton>
      </div>
    </template>
    <template v-else>
      <div class="ClosedSidebar" data-testid="sidebar-closed">
        <div class="ClosedSidebar__slot">
          <slot name="closed" />
          <div v-if="showInputText" class="ClosedSidebar__search-icon">
            <NovaButtonIcon
              name="search"
              :size="22"
              class="ClosedSidebar__icon"
              theme="dark"
              @click="handleClickSearchBtn"
            />
          </div>
        </div>
        <div class="ClosedSidebar__content">
          <div v-for="(category, key) in sidebarCategories" :key="key" class="ClosedSidebar__nav">
            <NovaButtonIcon
              v-if="category"
              :name="category.icon"
              theme="dark"
              class="ClosedSidebar__icon"
              :selected="category.url.includes($route.path)"
              :size="22"
              :disabled="filteredNavigationGroup[key].disabled"
              @click="$router.push(category.url)"
            />
            <span v-if="filteredNavigationGroup[key].completed" class="ClosedSidebar__icon--check">
              <NovaIcon name="check" :size="6" />
            </span>
          </div>
        </div>
        <div class="ClosedSidebar__footer">
          <NovaButton variant="action" size="xxs" theme="light" data-testid="sidebar-btn-collapse" @click="open = true">
            <NovaIcon
              name="chevrons-right"
              :size="18"
              :style="{
                margin: '-2px',
              }"
            />
          </NovaButton>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, ref, reactive, watch } from "vue";
import { useNuxtApp } from "#app";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaTooltip from "@/ui-kit/NovaTooltip/NovaTooltip.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import DocumentSidebarSection from "@/components/Document/SidebarSection/SidebarSection.vue";
import { MappedCategory } from "@/types/DocumentSidebar";

export interface Props {
  showInputText?: boolean;
  sidebarCategories: FilteredCategories;
}

export type FilteredCategories = {
  [key: string]: MappedCategory;
};
const { $t } = useNuxtApp();
const route = useRoute();
const props = defineProps<Props>();
const open = ref(true);
const searchValue = ref("");

const filteredNavigationGroup = computed(() => {
  return Object.keys(props.sidebarCategories).reduce((acc: FilteredCategories, key: string) => {
    const category = props.sidebarCategories[key];

    const categoryHasChange = category.fields.some((field) => field.hasChange);

    const filteredFields = category.fields.filter((field) => {
      const translation = $t(`experience.${field.id}.title`);
      field.title = translation;
      return cleanString(translation.toLowerCase()).includes(searchValue.value.toLowerCase());
    });

    if (filteredFields.length > 0 && filteredFields.some((f) => !f.hide)) {
      acc[key] = {
        ...category,
        fields: filteredFields.filter((f) => !f.hide),
        selected: category.url.includes(route.path),
        hasChange: categoryHasChange,
      };
    }
    return acc;
  }, {});
});

function cleanString(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/gi, "");
}

const inputText: Ref<HTMLElement | null> = ref(null);

const handleClickSearchBtn = async () => {
  open.value = true;
  // focus on the searchbar
  await nextTick();
  if (inputText.value) {
    const searchBar: HTMLInputElement | null = inputText.value?.querySelector("#list-search");
    searchBar?.focus();
  }
};

// generating an object with keys = categoryIds : values = boolean so we can use it to handle the opening of the sections
const openedSections: { [key: string]: boolean } = reactive({});

function handleRouteChanges() {
  Object.entries(props.sidebarCategories).forEach((el) => {
    openedSections[el[0] as keyof typeof openedSections] = el[1].url.includes(route.path) && el[1].dropdown;
  });
}

watch(
  () => route.path,
  () => {
    handleRouteChanges();
  },
  { immediate: true }
);

// opening all the sections when the user is filtering and resetting to the initial state when he finish
let previousState = { ...openedSections };
watch(searchValue, (curr, prev) => {
  if (!prev) {
    previousState = { ...openedSections };
    Object.entries(props.sidebarCategories).forEach((el) => {
      openedSections[el[0] as keyof typeof openedSections] = true;
    });
  } else if (!curr) {
    Object.entries(props.sidebarCategories).forEach((el) => {
      openedSections[el[0] as keyof typeof openedSections] = previousState[el[0] as keyof typeof previousState];
    });
  }
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.Sidebar {
  position: sticky;
  top: calc(var(--header-height) + var(--tab-navigation-height));
  height: var(--window-height);
  border-right: 1px solid var(--color-grey-90);
  display: flex;
  width: var(--width-document-sidebars-closed-sm);
  flex-direction: column;

  .search-input :deep(.InputText) {
    background-color: var(--color-neutral-30);
  }

  &__sections {
    overflow-x: hidden;

    &-item {
      position: relative;
      margin-bottom: rem(12);
    }
  }

  &__footer {
    @include font-semibold(12);

    display: flex;
    margin-top: auto;
    padding: rem(12) 0;
    justify-content: space-between;
    align-items: center;

    &-btn {
      cursor: pointer;
      background-color: transparent;
      border: none;
      padding: 0;
      margin-bottom: 4px;
      color: var(--color-text-100);
      position: absolute;
      bottom: rem(6);
      left: rem(2);
    }
  }

  &__legend {
    li {
      display: flex;
      padding: rem(4);
      align-items: center;
    }
  }

  &[open] {
    width: rem(232);

    .Sidebar__sections {
      padding: 0 rem(12) 0;
    }

    .Sidebar__footer {
      padding: rem(12);
    }

    .Sidebar__collapse-btn {
      @include font-semibold(12);
    }
  }
}

:deep(.circle) {
  height: rem(16);
  min-width: rem(16);
  border-radius: 50%;
  color: var(--color-grey-100);

  &[required] {
    border: 1px solid var(--color-grey-100);
  }

  &[completed],
  &[has-change="true"] {
    background: var(--color-success-100);
    color: var(--color-white);
    border: none;
  }

  &[selected][required]:not([completed]) {
    border: 1px solid var(--color-primary-100);
  }

  &[selected]:not([completed], [has-change="true"]) {
    color: var(--color-primary-100);
  }

  &[has-change="true"] {
    background: var(--color-warning-100);
  }

  svg {
    margin-top: 50%;
    margin-left: 50%;
    transform: translate(-50%, -50%);
  }
}

.ClosedSidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__search-icon {
    border-bottom: 1px solid var(--color-grey-100);
    padding-bottom: rem(12);
    position: absolute;
    bottom: 0;
  }

  &__slot {
    min-height: rem(130);
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
  }

  &__nav {
    position: relative;
    margin: rem(12) 0;
  }

  &__icon {
    &--check {
      background: var(--color-success-100);
      position: absolute;
      top: rem(3);
      right: rem(3);
      width: rem(10);
      height: rem(10);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;

      svg {
        color: var(--color-white);
      }
    }
  }

  &__footer {
    padding-bottom: rem(12);
    margin-top: auto;
  }
}

@include start-from(desktop-md) {
  .Sidebar {
    width: var(--width-document-sidebars-closed-md);
  }
}

@include start-from(desktop-lg) {
  .Sidebar {
    width: var(--width-document-sidebars-closed-lg);
  }
}
</style>
