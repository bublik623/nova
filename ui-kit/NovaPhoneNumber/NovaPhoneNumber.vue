<template>
  <div
    v-if="!readonly"
    ref="element"
    class="PhoneNumber"
    :open="dropdownOpen || null"
    :error="!!error || null"
    :disabled="disabled || null"
  >
    <NovaDropdown
      :show="dropdownOpen"
      :options="filteredOptions"
      :max-height="200"
      @keypress.enter="() => handleSelectOption(filteredOptions[0])"
      @select:option="handleSelectOption"
    >
      <template #toggle>
        <div v-if="!dropdownOpen" class="PhoneNumber__main">
          <div class="CountryCode">
            <button class="CountryCode__toggle" data-testid="country-code-btn" @click="handleOpenDropdown">
              <NovaIconFlag
                :country-code="selectedCountry?.iso_code_alpha2.toLowerCase() || 'placeholder'"
                :size="20"
                :data-testid="`country-flag-${selectedCountry?.iso_code_alpha2.toLowerCase()}`"
                class="CountryCode__flag"
              />
              <nova-icon name="chevron-down" :size="14" />
            </button>
            <span class="ml-2" data-testId="phone-number-prefix">
              {{ formatPrefix(selectedCountry?.country_calling_codes[0]) }}
            </span>
          </div>
          <div class="InputNumber LeftBorder">
            <input
              :id="id"
              ref="inputNumber"
              type="tel"
              data-testid="input-phone-number"
              :aria-disabled="disabled"
              :placeholder="placeholders?.phoneNumberInput"
              :value="number"
              @input="handleInput"
            />
            <NovaButtonIcon
              v-if="(!!number || !!prefix) && !disabled"
              data-testid="input-phone-clear"
              name="close"
              :size="10"
              @click="handleClearNumber"
            />
          </div>
        </div>
        <div v-else class="PhoneNumber__main">
          <div class="InputNumber">
            <nova-icon name="search" :size="18" class="ml-1" />
            <input
              ref="inputCountryCode"
              v-model="searchQuery"
              data-testid="input-search-country-code"
              :placeholder="placeholders?.phonePrefixSearch"
              type="text"
            />
            <div class="InputNumber__icon" @click="dropdownOpen = false">
              <nova-icon name="chevron-up" :size="14" />
            </div>
          </div>
        </div>
      </template>

      <template #default="{ option }">
        <div class="PhoneNumber__option">
          <NovaIconFlag :country-code="option.value" :size="20" class="mr-2" />
          {{ option.label }}
        </div>
      </template>

      <template #empty>
        <div class="PhoneNumber__no-options">
          {{ placeholders?.noItemFound }}
        </div>
      </template>
    </NovaDropdown>
    <span class="PhoneNumber__error">{{ error }}</span>
  </div>
  <div v-else>
    <div class="PhoneNumber__readonly">
      <span v-if="prefix" class="PhoneNumber__readonly-flag">
        <NovaIconFlag
          :country-code="selectedCountry?.iso_code_alpha2.toLowerCase() || 'placeholder'"
          :data-testid="`country-flag-${selectedCountry?.iso_code_alpha2.toLowerCase()}`"
          :size="20"
          class="mr-2"
        />
        <p data-testId="phone-number-prefix">{{ formatPrefix(selectedCountry?.country_calling_codes[0]) }}</p>
      </span>
      <NovaDivider orientation="vertical" />
      <span v-if="number" data-testId="phone-number"> {{ number }} </span>
      <span v-else class="PhoneNumber__readonly-placeholder">{{ placeholders?.readonlyEmpty }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import NovaDropdown from "../NovaDropdown/NovaDropdown.vue";
import NovaIcon from "../NovaIcon/NovaIcon.vue";
import NovaIconFlag from "../NovaIconFlag/NovaIconFlag.vue";
import NovaButtonIcon from "../NovaButtonIcon/NovaButtonIcon.vue";
import { ref, computed, nextTick } from "vue";
import { Country } from "@/types/generated/GeoMasterDataApi";
import { ListOption } from "@/types/Option";
import { formatPrefix } from "@/utils/format-prefix";
import { onClickOutside } from "@vueuse/core";
import NovaDivider from "../NovaDivider/NovaDivider.vue";
export interface Props {
  id?: string;
  countries: Country[];
  prefix?: string | number;
  number?: string;
  countryCode?: Country["iso_code_alpha2"];
  error?: string;
  disabled?: boolean;
  placeholders?: {
    phoneNumberInput?: string;
    phonePrefixSearch?: string;
    noItemFound?: string;
    readonlyEmpty?: string;
  };
  readonly?: boolean;
}

interface Events {
  (e: "update:prefix", value: Props["prefix"]): void;
  (e: "update:number", value: Props["number"]): void;
  (e: "update:countryCode", value: Props["countryCode"]): void;
}

const emits = defineEmits<Events>();
const props = defineProps<Props>();
const searchQuery = ref("");

const dropdownOpen: Ref<boolean> = ref(false);
const inputCountryCode: Ref<HTMLInputElement | null> = ref(null);
const inputNumber: Ref<HTMLInputElement | null> = ref(null);
const element = ref<HTMLDivElement>();

const selectedCountry = computed(() => {
  if (props.prefix) {
    return findCountryByPrefix(Number(props.prefix));
  }

  return undefined;
});

// The country calling code is not unique anymore so we use the ISO code
// as a primary key, and then extract the calling code from the country object
const options = props.countries.map((country) => {
  return {
    label: `${country.iso_code_alpha2} ${country.name} (${formatPrefix(country.country_calling_codes[0])})`,
    value: country.iso_code_alpha2.toLowerCase(),
  };
});

const filteredOptions = computed(() => {
  return options.filter((option) => {
    const searchFor = searchQuery.value.toLowerCase();
    return option.label.toLowerCase().includes(searchFor);
  });
});

function findCountryByPrefix(prefix: number) {
  return props.countries.find((country) => country.country_calling_codes.includes(prefix));
}

function findCountryByISO(ISO: string) {
  return props.countries.find((country) => country.iso_code_alpha2.toLowerCase() === ISO.toLowerCase());
}

onClickOutside(element, () => (dropdownOpen.value = false));

const handleOpenDropdown = async () => {
  searchQuery.value = "";
  dropdownOpen.value = true;
  await nextTick();
  inputCountryCode.value?.focus();
};

const handleSelectOption = async (option: ListOption) => {
  dropdownOpen.value = false;

  const country = findCountryByISO(option.value);

  if (country == null) {
    throw new Error(`Could not find country with ISO code ${option.value}`);
  }

  emits("update:prefix", country?.country_calling_codes[0]);
  emits("update:countryCode", option.value.toLocaleUpperCase());

  await nextTick();
  inputNumber.value?.focus();
};

const handleInput = (event: Event) => {
  if (event.target) {
    const { value } = event.target as HTMLInputElement;
    emits("update:number", value);
  }
};

const handleClearNumber = () => {
  emits("update:number", "");
  emits("update:prefix", "");
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.PhoneNumber {
  border: var(--border-default);
  border-radius: var(--border-radius-default);
  color: var(--color-text-100);
  @include font-regular(14);

  &__main {
    height: rem(32);
    display: flex;
    justify-content: space-between;
  }

  &[open] {
    border-color: var(--color-primary-100);
  }

  &[error] {
    border-color: var(--color-error-110);
  }

  &[disabled] {
    background: var(--color-neutral-10);
    color: var(--color-text-70);
    cursor: not-allowed;

    .Dropdown {
      pointer-events: none;
    }

    svg {
      color: var(--color-text-70);
    }
  }

  &__option {
    margin-left: -5px;
  }

  &__error {
    position: absolute;
    color: var(--color-error-110);
    @include font-regular(12);
  }

  &__no-options {
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__readonly {
    display: flex;
    color: var(--color-text-100);
    font-style: normal;
    @include font-regular(14);

    &-flag {
      display: flex;
      align-items: center;
      border-right: 1px solid var(--color-text-70);
      padding-right: rem(8);
      margin-right: rem(8);
    }

    &-placeholder {
      font-style: italic;
      color: var(--color-text-70);
    }
  }
}

.CountryCode {
  max-width: rem(120);
  display: flex;
  align-items: center;

  &__toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 rem(8);
    gap: rem(8);
    border-radius: var(--border-radius-default);
    height: rem(34);
    position: relative;
    left: -1px;
    border: 1px solid transparent;
    cursor: pointer;
    background: none;

    &:hover {
      border-color: var(--color-primary-100);
    }
  }
}

.InputNumber {
  width: 100%;
  padding: rem(7);
  display: flex;
  align-items: center;

  input {
    all: unset;
    width: 100%;
    padding-left: rem(8);

    &::placeholder {
      font-style: italic;
      color: var(--color-text-70);
    }
  }

  &__icon {
    cursor: pointer;
    display: flex;
    margin-right: rem(3);
  }
}

.InputNumber.LeftBorder {
  input {
    border-left: 1px solid var(--color-text-70);
  }
}
</style>
