<template>
  <div v-if="readonly">
    <div v-if="modelValue?.name">
      <span class="text-sm">{{ modelValue.name }}</span>
      <span class="text-xs text-text-80 ml-2">{{ getCountryByCode(modelValue.country_code_alpha2).name }}</span>
    </div>
    <NoContentUtil v-else />
  </div>
  <div v-else ref="wrapperRef" class="CitySelect__wrapper">
    <div
      class="CitySelect__search"
      :disabled="disabled || null"
      :data-open="isDropdownOpen || null"
      :data-invalid="isInvalid === false ? undefined : true"
      @click="openDropdown"
    >
      <nova-icon name="search" :size="18" class="CitySelect__search-icon" />
      <input
        v-if="!selectedOption"
        ref="inputRef"
        type="text"
        class="CitySelect__input"
        data-testid="city-select-input"
        :value="searchText"
        :placeholder="placeholder || $t('experience.location.city.placeholder')"
        :disabled="disabled"
        :data-open="isDropdownOpen || null"
        @input="handleInput"
        @keydown.esc="closeDropdown"
      />
      <div v-else class="CitySelect__selected">
        <span class="CitySelect__selected-city" data-testid="city-select-label">
          {{ selectedOption.name }}
        </span>
        <span class="CitySelect__selected-country" data-testid="city-select-selected-country">
          {{ selectedOption.country_code_alpha2?.toLocaleUpperCase() }}
          {{ getCountryByCode(selectedOption.country_code_alpha2).name }}
        </span>
        <button v-if="!disabled" class="CitySelect__clear" data-testid="city-select-clear" @click="handleClear">
          <NovaIcon name="close" :size="8"></NovaIcon>
        </button>
      </div>
    </div>

    <div v-if="isDropdownOpen" class="CitySelect__dropdown" data-testid="city-select-dropdown">
      <div v-for="(groupOptions, key) in optionsGroupedByCountry" :key="key" class="CitySelect__content">
        <div class="CitySelect__group" data-testid="city-select-country" :data-country="getCountryByCode(key).name">
          <NovaIconFlag :country-code="key"></NovaIconFlag>
          <span class="CitySelect__group-name">{{ getCountryByCode(key).name }}</span>
        </div>
        <ul>
          <li v-for="option in groupOptions" :key="option.name">
            <NovaButton
              theme="light"
              variant="action"
              class="CitySelect__item"
              data-testid="city-select-item"
              :data-city="option.name"
              @keydown.esc="closeDropdown"
              @click="handleSelectOption(option)"
            >
              {{ option.name }}
            </NovaButton>
          </li>
        </ul>
      </div>
      <div v-if="itemCount === 0" class="CitySelect__no-results" data-testid="city-select-no-results">
        {{ $t("common.search.no-items-found") }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useVModel } from "@vueuse/core";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { useDetectClickOutside } from "@/composables/useDetectClickOutside";
import NovaIconFlag from "@/ui-kit/NovaIconFlag/NovaIconFlag.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { City as GeoCity } from "@/types/generated/GeoMasterDataApi";
import { useMasterData } from "@/stores/master-data";
import NoContentUtil from "./NoContentUtil.vue";

export interface FieldCityProps {
  options: GeoCity[];
  modelValue: GeoCity | null;
  placeholder?: string;
  isInvalid?: boolean;
  readonly?: boolean;
  disabled?: boolean;
}

interface Events {
  (e: "update:modelValue", value: FieldCityProps["modelValue"]): void;
}

const props = defineProps<FieldCityProps>();
const emits = defineEmits<Events>();
const { getCountryByCode } = useMasterData();

const wrapperRef = ref<Element | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const selectedOption = useVModel(props, "modelValue", emits, {
  passive: true,
  deep: true,
});
const searchText = ref("");
const isDropdownOpen = ref(false);

const filteredOptionsBySearchText = computed(() => {
  return props.options.filter(
    (option) => option?.name && option.name.toLocaleLowerCase().includes(searchText.value.toLocaleLowerCase())
  );
});

const optionsGroupedByCountry = computed(() => {
  return filteredOptionsBySearchText.value.reduce((group, option) => {
    const countryCode = option.country_code_alpha2;
    group[countryCode] = group[countryCode] ?? [];
    group[countryCode].push(option);
    return group;
  }, {} as Record<string, GeoCity[]>);
});

const itemCount = computed(() => Object.keys(unref(optionsGroupedByCountry)).length);

const openDropdown = async () => {
  if (props.disabled) {
    return;
  }

  isDropdownOpen.value = true;
  await nextTick();
  inputRef.value?.focus();
  if (selectedOption.value) {
    searchText.value = selectedOption.value.name;
  }
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
  searchText.value = "";
};

useDetectClickOutside(wrapperRef, () => {
  closeDropdown();
});

const handleClear = async () => {
  selectedOption.value = null;
  isDropdownOpen.value = true;
  await nextTick();
  inputRef.value?.focus();
  searchText.value = "";
};

const handleSelectOption = (option: GeoCity) => {
  selectedOption.value = option;
  closeDropdown();
};

const handleInput = (event: Event) => {
  isDropdownOpen.value = true;

  const { value } = event.target as HTMLInputElement;
  searchText.value = value;
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.CitySelect {
  &__wrapper {
    position: relative;
  }

  &__search {
    --border-color: var(--border-default-color);

    position: relative;
    cursor: pointer;
    width: 100%;
    border: var(--border-default);
    border-radius: var(--border-radius-default);
    padding: rem(5);
    height: rem(32);
    display: flex;
    align-items: center;
    justify-content: center;
    border-color: var(--border-color);

    &:hover,
    &:focus-within {
      --border-color: var(--color-primary-100);
    }

    &[data-invalid] {
      border-color: var(--color-error-100) !important;
    }
  }

  &__search-icon {
    flex-shrink: 0;
  }

  &__input {
    width: 100%;
    margin: 0 rem(5);
    background-color: transparent;
    outline: none;
    border: none;

    @include font-semibold(14);

    &::placeholder {
      font-style: italic;
      color: var(--color-text-70);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__dropdown {
    width: 100%;
    padding-bottom: rem(5);
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
  }

  &__selected {
    margin-left: rem(8);
    width: 100%;
    @include font-semibold(14);

    display: flex;
    align-items: center;
    gap: rem(8);
    height: rem(33);
  }

  &__selected-country,
  &__selected-city {
    margin-top: rem(2);
  }

  &__selected-country {
    color: var(--color-text-80);
  }

  &__chevron {
    margin-right: rem(5);
  }

  &__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    margin-left: auto;
    padding: 0;
    border: none;
    border-radius: 50%;
    background-color: var(--color-neutral-40);
    color: var(--color-text-100);
    width: rem(16);
    height: rem(16);
    cursor: pointer;
  }

  &__group-name {
    margin-top: rem(2);
    margin-left: rem(4);
  }

  &__group {
    font-size: rem(14);
    color: var(--color-text-80);
    padding: rem(8);
    display: flex;
    align-items: center;
  }

  &__item {
    width: 100%;
    color: var(--color-text-100);
    justify-content: flex-start;
    padding: rem(8) rem(8.5);
    border-radius: 0 !important;
  }

  // separator between country names
  &__content + &__content {
    border-top: rem(1) solid var(--color-neutral-60);
  }

  &__no-results {
    @include font-semibold(12);

    display: flex;
    align-items: center;
    justify-content: center;
    padding: rem(25) 0;
  }
}
</style>
