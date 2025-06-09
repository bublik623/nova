<template>
  <div
    v-if="experienceStatus.distribution !== 'draft'"
    ref="component"
    class="StatusDropdown"
    data-testid="experience-status-dropdown"
  >
    <span class="StatusDropdown__label">{{ $t("action.bar.draft.title") }}</span>
    <NovaDropdown
      :options="filteredActionOptions"
      :show="showDropdown"
      :selected="[selectedStatus]"
      :hide-scrollbar="true"
      @select:option="onDropdownSelection"
    >
      <template #toggle>
        <button
          data-testid="status-dropdown-toggle"
          class="StatusDropdown__toggle"
          :class="{ 'is-readonly': readonly || isButtonDisabled }"
          :disabled="isLoading || isButtonDisabled"
          @click="showDropdown = !showDropdown"
        >
          <span class="StatusDropdown__status-icon mr-2">
            <NovaSpinner v-if="isLoading" :size="14" />
            <NovaIcon v-else :name="selectedStatus.icon" />
          </span>
          <span>{{ isLoading ? $t("common.loading") : selectedStatus.label }}</span>
          <span v-if="filteredActionOptions.length" class="StatusDropdown__chevron ml-2">
            <NovaIcon :name="showDropdown ? 'chevron-up' : 'chevron-down'" :size="8" />
          </span>
        </button>
      </template>
      <template #default="{ option }">
        <div class="StatusDropdown__item" :data-testid="`status-action-${option.value.toLowerCase()}`">
          <NovaIcon v-if="option.icon" :name="option.icon" class="mr-1" />
          {{ option.label }}
        </div>
      </template>
    </NovaDropdown>
  </div>
  <div class="StatusDropdown__border" />
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useVModel } from "@vueuse/core";
import { useDetectClickOutside } from "@/composables/useDetectClickOutside";
import { ExperienceState } from "@/features/experience-shared/utils/get-experience-state";
import NovaDropdown from "@/ui-kit/NovaDropdown/NovaDropdown.vue";
import NovaIcon, { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { ExperienceStatusCode } from "@/types/DocumentStatuses";
import NovaSpinner from "@/ui-kit/NovaSpinner/NovaSpinner.vue";

export type DropdownStatuses = {
  distribution: ExperienceState;
  curation?: ExperienceStatusCode;
};

export interface ExperienceStatusDropdownProps {
  experienceStatus: DropdownStatuses;
  readonly?: boolean;
  modelValue?: boolean;
  isLoading?: boolean;
}

interface StatusOption {
  label: string;
  icon: Icon;
  value: string;
}

const { $t } = useNuxtApp();

const component = ref(null);

const props = defineProps<ExperienceStatusDropdownProps>();

const emits = defineEmits<{
  (e: "update:status", value: ExperienceState): void;
  (e: "update:modelValue", value: boolean): void;
  (e: "publish"): void;
  (e: "unpublish"): void;
}>();

const statusOptions: StatusOption[] = [
  { label: $t("experience.distribution_status.published"), icon: "success-solid", value: "ready" },
  { label: $t("experience.distribution_status.in_review"), icon: "live-warning", value: "in_review" },
  { label: $t("experience.distribution_status.unpublished"), icon: "error-solid", value: "unpublished" },
];

const actionOptions: StatusOption[] = [
  { label: $t("common.publish"), icon: "success-solid", value: "publish" },
  { label: $t("common.unpublish"), icon: "error-solid", value: "unpublish" },
];

const filteredActionOptions = computed(() => {
  if (props.experienceStatus.distribution === "ready" || props.experienceStatus.distribution === "in_review") {
    return actionOptions.filter((option) => option.value === "unpublish");
  } else if (props.experienceStatus.distribution === "unpublished" && props.experienceStatus.curation === "READY") {
    return actionOptions.filter((option) => option.value === "publish");
  }
  return [];
});

const selectedStatus = computed(
  () => statusOptions.find((option) => option.value === props.experienceStatus.distribution) || statusOptions[0]
);

const showDropdown = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: false,
});

const onDropdownSelection = (option: StatusOption) => {
  if (option.value === "publish") {
    emits("publish");
  } else if (option.value === "unpublish") {
    emits("unpublish");
  }
  showDropdown.value = false;
};

const isButtonDisabled = computed(() => {
  return props.readonly || !filteredActionOptions.value.length;
});

useDetectClickOutside(component, () => {
  showDropdown.value = false;
});
</script>

<style lang="scss" scoped>
@import "assets/scss/utilities/index";

.StatusDropdown {
  display: flex;
  align-items: center;
  margin: 1rem 0.75rem 0.75rem 0;
  width: 100%;
  justify-content: space-between;

  &__label {
    @include font-bold(12);
  }

  &__status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: rem(16);
  }

  &__toggle {
    margin: 0;
    padding: 0;
    display: flex;
    border: none;
    background-color: transparent;
    text-align: center;
    color: var(--color-text-100);
    cursor: pointer;
    align-items: center;
    @include font-semibold(12);

    &:disabled {
      cursor: not-allowed;
    }

    &.is-readonly {
      cursor: auto;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    @include font-regular(12);
  }

  &__chevron {
    width: rem(8);
  }

  &__border {
    border-bottom: rem(1) solid var(--color-neutral-40);
  }
}

:deep(.OptionsList__list-item) {
  padding: rem(8);
}
</style>
