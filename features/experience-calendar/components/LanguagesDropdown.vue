<template>
  <div ref="component" class="LanguagesDropdown">
    <button
      class="LanguagesDropdownToggle"
      aria-haspopup="listbox"
      :disabled="disabled"
      aria-labelledby="languages-dropdown-label"
      data-testid="languages-dropdown-button"
      :open="dropdownOpen || null"
      :invalid="hasDropdownError || hasInnerElementError || null"
      @click="toggleDropdown(!dropdownOpen)"
      @keydown.esc="toggleDropdown(false)"
    >
      <span v-if="modelValue && modelValue[0]" id="languages-dropdown-label">{{ sortedSelectedLanguages }}</span>
      <span v-else id="languages-dropdown-label" class="LanguagesDropdownToggle__placeholder">{{
        $t("languages.dropdown.placeholder")
      }}</span>

      <nova-icon name="chevron-down" :open="dropdownOpen || null" :size="14" />

      <span v-show="hasInnerElementError" class="LanguagesDropdownToggle__error">{{ $t("common.missing.info") }}</span>
    </button>

    <div v-if="dropdownOpen" class="LanguagesDropdownMenu">
      <div class="LanguagesDropdownMenu__header">
        <span data-testid="languages-dropdown-selected-counter"
          >{{ modelValue?.length || "0" }} {{ $t("common.dropdown.header.selected") }}</span
        >
        <NovaButton
          variant="underlined"
          size="xs"
          data-testid="languages-dropdown-clear-btn"
          style="margin-right: -10px"
          @click="$emit('update:modelValue', [])"
          >{{ $t("common.dropdown.clear.button") }}</NovaButton
        >
      </div>
      <div class="LanguagesDropdownMenu__header">
        <span>{{ $t("language.dropdown.header.language") }}</span>
        <span v-if="limitedCapacity">{{ $t(`language.dropdown.header.${type}`) }}</span>
      </div>
      <ul>
        <li
          v-for="language in sortedAllowedLanguages"
          :key="language"
          data-testid="languages-dropdown-item"
          class="LanguagesDropdownMenu__item"
        >
          <NovaCheckbox
            :label="$t(`common.language.${language}`)"
            :value="language"
            :status="isChecked(language) ? 'checked' : 'unchecked'"
            @update:status="handleSelectLanguage(language)"
          />
          <NovaInputNumber
            v-if="limitedCapacity"
            :id="`${language}-input-number`"
            :min-value="0"
            :disabled="!isChecked(language)"
            :is-invalid="modelValue?.find((el) => el.language === language)?.capacity === 0"
            :model-value="modelValue?.find((el) => el.language === language)?.capacity ?? 0"
            @update:model-value="(e) => handleInputCapacity(e, language)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaInputNumber from "@/ui-kit/NovaInputNumber/NovaInputNumber.vue";
import { useDetectClickOutside } from "@/composables/useDetectClickOutside";
import { Ticket } from "@/types/generated/OfferServiceApiOld";
import { AvailableLanguage } from "@/types/Language";

export interface Props {
  modelValue: Ticket["languages"];
  limitedCapacity?: boolean;
  disabled?: boolean;
  validationErrors?: Record<string, any>;
  type?: "person" | "group";
  allowedLanguages: AvailableLanguage[];
}
const component = ref<Element | null>(null);

interface Events {
  (e: "update:modelValue", val: Ticket["languages"]): void;
}
useDetectClickOutside(component, () => {
  toggleDropdown(false);
});
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const dropdownOpen = ref(false);
const toggleDropdown = (show: boolean) => {
  dropdownOpen.value = show;
};
const isChecked = (language: AvailableLanguage) => {
  return props.modelValue?.find((el) => el.language === language);
};
const hasDropdownError = computed(() => !!props.validationErrors?._errors.length);
const hasInnerElementError = computed(() => Object.entries(props.validationErrors ?? {}).length > 1);

const handleSelectLanguage = (language: AvailableLanguage) => {
  let newValue = props.modelValue || [];

  if (!isChecked(language) && props.limitedCapacity) {
    newValue?.push({ language, capacity: 0 });
  } else if (!isChecked(language)) {
    newValue?.push({ language });
  } else {
    newValue = newValue.filter((el) => el.language !== language);
  }

  emits("update:modelValue", newValue);
};

function handleInputCapacity(e: number, language: AvailableLanguage) {
  const newValue = props.modelValue || [];
  const index = props.modelValue?.findIndex((el) => el.language === language);
  newValue[index as number].capacity = e;
  emits("update:modelValue", newValue);
}

const { $t } = useNuxtApp();

const sortByLanguageName = (firstLanguageCode: string, secondLanguageCode: string) =>
  $t(`common.language.${firstLanguageCode}`)
    .toLowerCase()
    .localeCompare($t(`common.language.${secondLanguageCode}`).toLowerCase());

const sortedAllowedLanguages = computed(() => [...props.allowedLanguages].sort(sortByLanguageName));

const sortedSelectedLanguages = computed(() => {
  if (!props.modelValue?.length) return "";

  return [...props.modelValue]
    .sort((a, b) => sortByLanguageName(a.language, b.language))
    .map((el) => capitalizeFirstLetter(el.language as string))
    .join(", ");
});
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.LanguagesDropdown {
  position: relative;
}

.LanguagesDropdownToggle {
  position: relative;
  width: 100%;
  cursor: pointer;
  background-color: transparent;
  outline: none;
  border: var(--border-default);
  border-radius: var(--border-radius-default);
  padding: rem(5) rem(10);
  @include font-semibold(14);

  display: flex;
  align-items: center;
  justify-content: space-between;

  &:disabled {
    background: var(--color-neutral-10);
    cursor: not-allowed;
  }

  &:focus-visible,
  &:hover:not([disabled]),
  &[open] {
    border: var(--border-primary);
  }

  &[invalid] {
    border-color: var(--color-error-100);
  }

  &__placeholder {
    font-style: italic;
    color: var(--color-text-70);
  }

  .svg-icon {
    margin-left: rem(10);
    transition: transform 0.2s;

    &[open] {
      transform: rotate(180deg);
    }
  }

  &__error {
    position: absolute;
    left: 0;
    bottom: -14px;
    color: var(--color-error-110);
    @include font-regular(12);
  }
}

.LanguagesDropdownMenu {
  width: 100%;
  min-width: rem(265);
  max-height: rem(400);
  overflow-x: hidden;
  position: absolute;
  top: calc(100% + 4px);
  border: var(--border-default);
  border-radius: var(--border-radius-default);
  box-shadow: var(--box-shadow-popover);
  background-color: var(--color-white);
  z-index: var(--z-index-dropdown);
  display: flex;
  flex-direction: column;

  &__header {
    padding: rem(7) rem(20) rem(7) rem(5);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-grey-90);
    color: var(--color-text-90);
    @include font-regular(12);
  }

  &__item {
    height: rem(40);
    padding: 0 rem(20) 0 rem(7);
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:hover {
      background: var(--color-grey-70);
    }
  }
}
</style>
