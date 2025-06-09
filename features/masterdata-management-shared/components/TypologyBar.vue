<template>
  <div class="TypologyBar">
    <div class="TypologyBar__head">
      <div class="flex">
        <div class="TypologyBar__title">{{ title }}</div>
        <div class="TypologyBar__categories">{{ categories }}</div>
      </div>
      <div v-if="missingTranslations" class="TypologyBar__translations">{{ missingTranslations }}</div>
    </div>
    <div class="flex mt-2 search">
      <NovaInputText
        :id="title.replaceAll(' ', '-').toLowerCase()"
        left-icon="search"
        :model-value="searchQuery"
        :placeholder="$t('common.search.placeholder')"
        @update:model-value="(evt) => $emit('update:searchQuery', evt)"
      />
      <div v-if="showAddNewBtn" ref="component" class="TypologyBar__add-btn">
        <NovaDropdown
          :show="showDropdown"
          :options="[
            {
              label: $t('masterdata.detail-card.item'),
              value: 'click:addBtn',
            },
            {
              label: $t('masterdata.detail-card.category'),
              value: 'click:createCategory',
            },
          ]"
          @select:option="(e) => handleSelect(e.value)"
        >
          <template #toggle>
            <NovaButton data-testid="typology-bar-add-new-button" size="sm" @click="showDropdown = !showDropdown">
              {{ $t("common.add-new") }}

              <NovaIcon
                class="ml-2"
                name="chevron-down"
                :class="{
                  'rotate-180': showDropdown,
                }"
              />
            </NovaButton>
          </template>
        </NovaDropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaDropdown from "@/ui-kit/NovaDropdown/NovaDropdown.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import { useDetectClickOutside } from "@/composables/useDetectClickOutside";
import { hasPermission } from "@/features/roles/lib/has-permission";

export interface Props {
  title: string;
  categories: string;
  missingTranslations?: string;
  searchQuery: string;
}

interface Events {
  (e: "update:searchQuery", value: string): void;
  (e: "click:addBtn"): void;
  (e: "click:createCategory"): void;
}

defineProps<Props>();
const emits = defineEmits<Events>();

const component = ref<Element | null>(null);
const showDropdown = ref(false);

const showAddNewBtn = hasPermission("masterdata-management.canWrite");

useDetectClickOutside(component, () => {
  showDropdown.value = false;
});

function handleSelect(e: string) {
  if (e === "click:addBtn") {
    emits("click:addBtn");
  } else if (e === "click:createCategory") {
    emits("click:createCategory");
  } else {
    throw new Error(`Event not supported: ${e}`);
  }
}
</script>
<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.TypologyBar {
  border-bottom: 1px solid var(--color-neutral-40);
  padding: rem(16);

  &__head {
    display: flex;
    justify-content: space-between;
  }

  &__title {
    color: var(--color-text-100);

    @include font-semibold(18);
  }

  &__categories {
    color: var(--color-text-90);
    margin-left: rem(32);

    @include font-regular(14);
  }

  &__translations {
    color: var(--color-text-100);

    @include font-regular(14);
  }

  &__add-btn {
    margin-left: rem(12);
    white-space: nowrap;
    display: flex;

    .Button {
      height: rem(32);
    }

    &::before {
      margin-right: rem(12);
      content: "";
      border-right: 1px solid var(--color-neutral-60);
    }
  }
}

.search :deep(.InputText) {
  background-color: var(--color-neutral-30);
}
</style>
