<template>
  <component
    :is="dynamicIcon"
    :style="{
      height: `${size ?? 16}px`,
      width: 'auto',
      fill: 'currentColor',
    }"
  />
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from "vue";

export type Icon =
  | "alert"
  | "arrow-left"
  | "arrow-right"
  | "arrow-rotate-left"
  | "availability"
  | "bars"
  | "bell"
  | "binoculars"
  | "book-check"
  | "bus"
  | "calendar-check"
  | "calendar"
  | "castle"
  | "chat"
  | "check"
  | "chevron-down"
  | "chevron-expand"
  | "chevron-left"
  | "chevron-right"
  | "chevron-up"
  | "chevrons-left"
  | "chevrons-right"
  | "circle-info"
  | "close"
  | "clear"
  | "edit"
  | "floppy-disk"
  | "grid"
  | "grip-dots"
  | "handshake"
  | "history"
  | "lock"
  | "location"
  | "map"
  | "minus"
  | "person-flag"
  | "plus"
  | "sailboat"
  | "ship"
  | "search"
  | "sliders"
  | "spinner"
  | "thumbtack"
  | "ticket-event"
  | "ticket"
  | "trash"
  | "flow-curation"
  | "flow-base"
  | "flow-translation"
  | "flow-media"
  | "circle-dotted"
  | "underline"
  | "bold"
  | "italic"
  | "ordered-list"
  | "unordered-list"
  | "van-shuttle"
  | "image"
  | "additional-services"
  | "content-generator"
  | "customer-info"
  | "options"
  | "option-settings"
  | "pricing"
  | "settings"
  | "transfers"
  | "circle-info-solid"
  | "duplicate"
  | "info-solid"
  | "warning-solid"
  | "success-solid"
  | "error-solid"
  | "live-warning"
  | "draft"
  | "gallery"
  | "logout"
  | "languages"
  | "more"
  | "check-outline"
  | "download"
  | "file-upload"
  | "sort-arrow"
  | "preview"
  | "asterix-integration"
  | "user"
  | "api-connection"
  | "pin"
  | "configuration"
  | "allotment";

export interface Props {
  name: Icon;
  size?: number;
}

const props = defineProps<Props>();

const dynamicIcon = computed(() => {
  const iconName = props.name;
  return defineAsyncComponent(() => import(`../../assets/svg/icon-${iconName}.svg`));
});
</script>
