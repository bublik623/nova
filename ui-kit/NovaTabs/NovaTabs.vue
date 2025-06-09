<template>
  <ul data-testid="nova-tabs" class="NovaTabs">
    <li v-for="item of options" :key="item.title" class="NovaTabs__tab" @click="$emit('select:option', item)">
      <button data-testid="nova-tabs-item" class="NovaTabs__tab" :selected="item.value === selected?.value || null">
        {{ item.title }}
      </button>
    </li>
  </ul>
</template>

<script setup lang="ts">
export interface Option {
  title: string;
  value: string;
}
export interface Props {
  options: Option[];
  selected?: Partial<Option>;
  accentWidth?: number;
}

interface Events {
  (e: "select:option", option: Option): void;
}

defineEmits<Events>();
const props = defineProps<Props>();

const widthBottomAccent = `${props.accentWidth || 100}%`;
</script>

<style lang="scss">
@import "@/assets/scss/utilities";

.NovaTabs {
  display: flex;

  &__tab {
    background: none;
    border: none;
    min-height: rem(32);
    width: 100%;
    height: 100%;
    cursor: pointer;
    position: relative;
    text-wrap: nowrap;

    @include font-regular(12);

    &:hover {
      color: var(--color-primary-100);
    }

    &[selected] {
      color: var(--color-primary-100);

      &::before {
        content: "";
        position: absolute;
        height: 3px;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: v-bind(widthBottomAccent);
        border-radius: 3px 3px 0 0;
        background-color: var(--color-primary-100);
      }
    }
  }
}
</style>
