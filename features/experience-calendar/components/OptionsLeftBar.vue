<template>
  <DocumentSidebar id="option" :sidebar-categories="sidebarCategories">
    <template #open>
      <div class="DocumentSidebar">
        <div class="DocumentSidebar__top-bar">
          <NovaButton
            class="DocumentSidebar__back-button"
            data-testid="options-go-back-button"
            variant="text"
            theme="primary"
            size="xs"
            @click="
              $router.push({
                name: `experience-id-${flow}-options`,
                params: { id },
              })
            "
          >
            <NovaIcon class="mr-2" name="arrow-left" :size="13" />
            {{ $t("experience.options.left-sidebar.go-back-button") }}
          </NovaButton>
          <h3 class="mt-1" data-testid="options-experience-title">
            {{ experienceName }}
          </h3>
        </div>

        <div class="DocumentSidebar__header">
          <h2 class="DocumentSidebar__option-name">
            {{ optionName }}
          </h2>
        </div>

        <div v-if="flow === 'curation'" class="DocumentSidebar__filters">
          <div>
            <span>{{ $t("common.view") }}</span>
            <ViewSelect
              :model-value="selectedView"
              data-testid="document-sidebar-view-select"
              @update:model-value="(e) => emits('update:selected-view', e)"
            />
          </div>
        </div>
      </div>
    </template>

    <template #closed>
      <div class="DocumentSidebarClosed">
        <nuxt-link :to="{ name: 'experience-id-raw-options', params: { id } }" class="Sidebar__back">
          <NovaIcon name="chevron-left" :size="16" class="DocumentSidebarClosed__back-icon"></NovaIcon>
        </nuxt-link>
      </div>
    </template>
  </DocumentSidebar>
</template>

<script setup lang="ts">
import DocumentSidebar from "@/components/Document/DocumentSidebar/DocumentSidebar.vue";
import NovaIcon, { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
import ViewSelect, { ViewType } from "@/features/experience-curation/components/ViewSelect.vue";
import { MappedCategory, SidebarSections } from "@/types/DocumentSidebar";
import { useOptionValidation } from "../composables/useOptionValidation";
import { mapSidebarSections } from "@/features/experience-shared/utils/map-sidebar-sections";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { usePickupsStore } from "../store/usePickupsStore";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";

export interface Props {
  selectedView: ViewType;
  id: string;
  flow: string;
  optionId: string;
  optionName: string;
  experienceName: string;
  experienceType: ExperienceType;
  displayPickupPage: boolean;
  validation: {
    optionSettings: ReturnType<typeof useOptionValidation>;
    pricing: boolean;
    availability: boolean;
    customerDetails: boolean;
    pickups: ReturnType<typeof usePickupsStore>;
  };
}

interface Events {
  (e: "update:selected-view", value: ViewType): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

// Sidebar
const baseUrl = `/experience/${props.id}/options/${props.flow}/${props.optionId}`;
const sidebarCategories: ComputedRef<{ [key: string]: MappedCategory }> = computed(() => {
  const sidebar: SidebarSections = {
    option_setting: {
      url: `${baseUrl}/option-settings?view=${props.selectedView}`,
      icon: "option-settings",
      fields: [
        {
          id: "option.name",
          required: true,
          filled: props.validation.optionSettings.fieldIsValid.value("name"),
        },

        {
          id: "option.duration",
          required: true,
          filled: props.validation.optionSettings.fieldIsValid.value("duration"),
          hide: props.selectedView === "commercial",
        },
        {
          id: "option.languages",
          required: true,
          filled:
            props.validation.optionSettings.fieldIsValid.value("multilanguage") &&
            props.validation.optionSettings.fieldIsValid.value("allowed_languages"),
          hide: props.selectedView === "commercial",
        },
        {
          id: "option.capacity",
          required: false,
          filled: props.validation.optionSettings.fieldIsValid.value("capacity_type"),
          hide: props.selectedView === "commercial",
        },
      ],
    },
    pricing: {
      url: `${baseUrl}/pricing?view=${props.selectedView}`,
      icon: "pricing",
      noDropdown: true,
      disabledBy: ["option_setting"],
      fields: [
        {
          id: "pricing",
          required: true,
          filled: props.validation.pricing,
          hide: props.selectedView === "commercial",
        },
      ],
    },
    availability: {
      url: `${baseUrl}/availability?view=${props.selectedView}`,
      icon: "availability",
      noDropdown: true,
      disabledBy: ["option_setting", "pricing"],
      fields: [
        {
          id: "availability",
          required: true,
          filled: props.validation.availability,
          hide: props.selectedView === "commercial",
        },
      ],
    },
    customer_details: {
      url: `${baseUrl}/customer-details`,
      icon: "pricing",
      noDropdown: true,
      disabledBy: [],
      fields: [
        {
          id: "customer-details",
          required: true,
          filled: props.validation.customerDetails,
          hide: props.selectedView === "commercial",
        },
      ],
    },
  };

  if (props.displayPickupPage) {
    const pickups = {
      url: `${baseUrl}/pickups`,
      icon: "transfers" as Icon,
      disabledBy: [],
      fields: [
        {
          id: "pickups.has_pickup_service",
          required: true,
          filled: true,
          hide: props.selectedView === "commercial",
        },
        {
          id: "pickups.places",
          required: true,
          filled: !!props.validation.pickups.fields.selectedPickups.value,
          hide: props.selectedView === "commercial" || !props.validation.pickups.hasPickupService,
        },
        {
          id: "pickups.contact",
          required: false,
          filled: !!props.validation.pickups.fields.contactEmail.value,
          hide: props.selectedView === "commercial" || !props.validation.pickups.hasPickupService,
        },
      ],
    };

    sidebar.pickups = pickups;
  }

  if (
    props.experienceType === ExperienceType.CALENDAR_NO_TIMESLOTS ||
    props.experienceType === ExperienceType.CALENDAR_TIMESLOTS
  ) {
    sidebar.option_setting.fields.splice(2, 0, {
      id: "option.pricing-definition",
      required: false,
      filled: props.validation.optionSettings.fieldIsValid.value("pricing_type_allowed"),
      hide: props.selectedView === "commercial",
    });
  }

  return mapSidebarSections(sidebar);
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.DocumentSidebar {
  &__header {
    margin: rem(15) rem(12) 0 rem(12);
    padding-bottom: rem(12);
    border-bottom: 1px solid var(--color-neutral-40);
  }

  &__option-name {
    @include font-semibold(14);
  }

  &__filters {
    margin: rem(12) rem(12) 0 rem(12);
    padding-bottom: rem(12);
    border-bottom: 1px solid var(--color-neutral-20);

    @include font-regular(12);

    & > div {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }

  &__top-bar {
    padding: rem(10) rem(12);
    background-color: var(--color-neutral-20);
    color: var(--color-text-90);

    @include font-regular(12);

    // optically align arrow icon
    & svg {
      margin-bottom: 2px;
    }
  }

  &__back-button {
    text-decoration: none;
  }
}

.DocumentSidebarClosed {
  width: 100%;
  border-bottom: 1px solid var(--color-neutral-40);
  padding-top: rem(10);
  display: flex;
  justify-content: center;
  height: rem(40);

  svg {
    color: var(--color-text-100);
  }
}
</style>
