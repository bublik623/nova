<template>
  <section class="DetailCard">
    <div class="DetailCard__header">
      <div class="flex justify-between">
        <span>
          <h2 class="DetailCard__title">{{ title }}</h2>
          <p class="DetailCard__description">{{ description }}</p>
        </span>
        <div v-if="canEdit">
          <NovaTooltip theme="dark">
            <NovaButtonIcon
              id="edit-button"
              name="edit"
              theme="dark"
              :size="20"
              data-testid="edit-category-button"
              shape="square"
              @click="$emit('click:editMainLanguage')"
            />
            <template #content>
              <p>{{ $t("common.edit") }}</p>
            </template>
          </NovaTooltip>
        </div>
      </div>

      <div class="DetailCard__divider my-5" />
    </div>
    <div v-if="information?.length">
      <h2 class="DetailCard__title">{{ $t("masterdata.detail-card.information") }}</h2>
      <ul class="DetailCard__information">
        <li v-for="item in information" :key="item.label">
          <h3 class="DetailCard__subtitle">
            {{ item.label }}
          </h3>
          <p class="DetailCard__description mt-1">
            {{ item.value }}
          </p>
        </li>
      </ul>
      <div class="DetailCard__divider my-5" />
    </div>
    <div v-if="translations?.length">
      <h2 class="DetailCard__title">{{ $t("masterdata.detail-card.translations") }}</h2>
      <ul>
        <li v-for="(item, index) in translations" :key="item.language" class="DetailCard__translation">
          <div v-if="index !== 0" class="DetailCard__divider my-4" style="width: 24px" />
          <h3 class="DetailCard__subtitle mt-4">
            <NovaIconFlag :country-code="item.language" shape="circle" :size="10" /> {{ $t(item.label) }}
          </h3>
          <div v-if="item.value" class="flex justify-between">
            <p class="DetailCard__description mt-4">{{ item.value }}</p>
            <NovaButtonIcon
              data-testid="edit-translation-button"
              name="edit"
              theme="dark"
              :size="20"
              shape="square"
              @click="$emit('click:editTranslation', item)"
            >
              {{ $t("add-translation-button.title") }}
            </NovaButtonIcon>
          </div>
          <div v-else class="DetailCard__description mt-4 font-italic">
            <p>
              {{ $t("masterdata.detail-card.missing-translation") }}
            </p>
            <NovaButton
              v-if="canUpdateTranslations"
              data-testid="add-translation-button"
              variant="outline"
              size="xs"
              @click="$emit('click:addTranslation', item)"
            >
              {{ $t("add-translation-button.title") }}
            </NovaButton>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import NovaIconFlag from "@/ui-kit/NovaIconFlag/NovaIconFlag.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaTooltip from "@/ui-kit/NovaTooltip/NovaTooltip.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import { hasPermission } from "@/features/roles/lib/has-permission";

export interface DetailCardTranslation {
  language: string;
  label: string;
  value: string | undefined;
}

interface Props {
  canEdit?: boolean;
  title: string;
  description?: string;
  information?: {
    label: string;
    value: unknown;
  }[];
  translations?: DetailCardTranslation[];
}

interface Events {
  (e: "click:addTranslation", value: DetailCardTranslation): void;
  (e: "click:editTranslation", value: DetailCardTranslation): void;
  (e: "click:editMainLanguage"): void;
}

const canUpdateTranslations = hasPermission("masterdata-management.translations.canWrite");
defineEmits<Events>();
defineProps<Props>();
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.DetailCard {
  &__title {
    margin-bottom: rem(8);
    @include font-semibold(18);
  }

  &__subtitle {
    color: var(--color-text-90);

    @include font-regular(12);
  }

  &__description {
    margin-bottom: rem(4);
    word-wrap: break-word;
    display: flex;
    align-items: center;
    justify-content: space-between;
    @include font-regular(14);
  }

  &__divider {
    border-bottom: var(--border-default);
  }

  &__information {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
