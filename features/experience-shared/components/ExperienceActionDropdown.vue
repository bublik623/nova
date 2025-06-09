<template>
  <div ref="component" class="ActionDropdown">
    <button
      ref="trigger"
      data-testid="experience-action-toggle"
      class="ActionDropdown__toggle"
      :disabled="readonly"
      :data-active="showDropdown || null"
      @click.stop="showDropdown = !showDropdown"
    >
      <NovaIcon name="more" :size="18" />
    </button>
    <Teleport v-if="showDropdown" to="body">
      <NovaDropdown
        ref="floating"
        :show="true"
        :style="floatingStyles"
        class="ActionDropdown__floating"
        :loading="false"
        :options="filteredActionOptions"
        :selected="[selectedStatus]"
        :hide-scrollbar="true"
      >
        <template #default="{ option }">
          <div
            class="ActionDropdown__item"
            :data-testid="`experience-action-${option.value.toLowerCase()}`"
            @click="option.action"
          >
            <NovaIcon v-if="option.icon" :name="option.icon" class="mr-1" :size="18" />
            {{ option.label }}
          </div>
        </template>
      </NovaDropdown>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onClickOutside } from "@vueuse/core";
import { ExperienceState } from "@/features/experience-shared/utils/get-experience-state";
import NovaDropdown from "@/ui-kit/NovaDropdown/NovaDropdown.vue";
import NovaIcon, { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { autoUpdate, useFloating } from "@floating-ui/vue";
import { ExperienceStatusCode } from "@/types/DocumentStatuses";

export interface ExperienceActionDropdownProps {
  status: ExperienceState;
  curationStatus?: ExperienceStatusCode;
  mediaStatus?: ExperienceStatusCode;
  modelValue?: boolean;
  readonly?: boolean;
}

export interface StatusOption {
  label: string;
  icon: Icon;
  value: string;
  action: () => void;
  curationStatus?: ExperienceStatusCode;
  mediaStatus?: ExperienceStatusCode;
}

const { $t } = useNuxtApp();

const component = ref(null);

const props = defineProps<ExperienceActionDropdownProps>();

const emits = defineEmits<{
  (e: "update:status", value: ExperienceState): void;
  (e: "publish"): void;
  (e: "unpublish"): void;
  (e: "edit"): void;
}>();

const actionOptions: StatusOption[] = [
  { label: $t("common.edit"), icon: "edit", value: "edit", action: () => emits("edit") },
  {
    label: $t("common.publish"),
    icon: "check-outline",
    value: "publish",
    action: () => emits("publish"),
    curationStatus: "READY",
    mediaStatus: "READY",
  },
  {
    label: $t("common.unpublish"),
    icon: "circle-info",
    value: "unpublish",
    action: () => emits("unpublish"),
  },
];

const actionOptionFilters = {
  unpublished: (option: { value: string }) => option.value !== "unpublish",
  ready: (option: { value: string }) => option.value !== "publish",
  in_review: (option: { value: string }) => option.value !== "publish",
  draft: (option: { value: string }) => option.value === "edit",
};

const filteredActionOptions = computed(() => {
  return actionOptions.filter((option) => {
    const status = !actionOptionFilters[props.status] || actionOptionFilters[props.status](option);
    const curationStatus = !option.curationStatus || option.curationStatus === props.curationStatus;
    const mediaStatus = !option.mediaStatus || option.mediaStatus === props.mediaStatus;

    return status && curationStatus && mediaStatus;
  });
});

const selectedStatus = computed(
  () => actionOptions.find((option) => option.value === props.status) || actionOptions[0]
);

const showDropdown = defineModel<boolean>({
  default: false,
});

onClickOutside(component, () => (showDropdown.value = false));

const trigger = ref();
const floating = ref();
const { floatingStyles } = useFloating(trigger, floating, {
  placement: "bottom-end",
  open: showDropdown.value,
  whileElementsMounted: autoUpdate,
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.ActionDropdown {
  &__floating {
    width: rem(130);
  }

  &__toggle {
    position: relative;
    margin: 0;
    padding: 0;
    cursor: pointer;
    background-color: transparent;
    border: none;
    display: flex;
    align-items: center;
    height: rem(18);
    width: rem(18);
    border-radius: var(--border-radius-xs);

    &[data-active],
    &:hover {
      background-color: var(--color-primary-10);
    }
  }

  &__item {
    display: flex;
    width: 100%;
    padding: rem(6) rem(8);
    color: var(--color-text-100);
    @include font-regular(12);
  }
}

:deep(.OptionsList__list-item) {
  padding: 0;
}
</style>
