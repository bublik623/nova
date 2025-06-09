<template>
  <div>
    <div class="selected-pickups__count">
      {{ pickups.length }} {{ $t("experience.pickups.pickup_places.selected_items") }}
    </div>
  </div>
  <div class="">
    <ul class="selected-pickups__list">
      <li v-for="option in pickups" :key="option.id" class="selected-pickups__list-item">
        <div class="pickup-place-item" data-testid="pickup-place-item">
          <div class="pickup-place__wrapper" data-testid="pickup-place-label">
            <div class="pickup-place">
              <span class="pickup-place__name">
                {{ option.name }}
              </span>
              <span class="pickup-place__address">{{ option.address }}</span>
            </div>
          </div>
          <div>
            <NovaButtonIcon
              data-testid="delete-selected-pickup"
              :size="16"
              name="trash"
              theme="dark"
              shape="square"
              @click="emits('delete', option)"
            />
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { PickupPlaceWithId } from "../types/Pickups";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";

export interface FieldPickupsProps {
  pickups: PickupPlaceWithId[];
}

interface Events {
  (e: "pickups", value: FieldPickupsProps["pickups"]): void;
  (e: "delete", value: PickupPlaceWithId): void;
}

defineProps<FieldPickupsProps>();
const emits = defineEmits<Events>();
</script>
<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.pickup-place {
  display: flex;
  flex-wrap: wrap;
  column-gap: rem(5);

  &-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__name {
    @include font-regular(14);

    &[data-selected] {
      color: var(--color-primary-100);
    }
  }

  &__address {
    @include font-regular(12);

    color: var(--color-text-80);
  }

  &__wrapper {
    padding: rem(10) 0;
  }
}

.selected-pickups {
  &__list {
    width: 100%;
    border: 1px solid var(--color-neutral-60);
    border-radius: var(--border-radius-default);
    padding: rem(8) rem(16);
    max-height: rem(235);
    overflow-x: auto;
  }

  &__count {
    @include font-regular(12);

    margin-bottom: rem(8);
  }

  &__list-item + &__list-item {
    border-top: 1px solid var(--color-neutral-60);
  }
}
</style>
