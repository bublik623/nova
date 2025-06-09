<template>
  <div class="text-xs grid grid-cols-2 gap-4">
    <span data-testid="document-sidebar-view-label">{{ $t("common.view") }}</span>
    <ViewSelect v-model="selectedView" data-testid="document-sidebar-view-select" />
    <span data-testid="document-sidebar-raw-fields-label">{{ $t("action.bar.raw.content.title") }}</span>
    <NovaSwitch v-model="showRawFields" data-testid="document-sidebar-raw-fields-toggle" />
  </div>
</template>

<script setup lang="ts">
import NovaSwitch from "@/ui-kit/NovaSwitch/NovaSwitch.vue";
import ViewSelect, { ViewType } from "./ViewSelect.vue";
import { VIEW_TYPE_ALL } from "../lib/viewTypeUtils";

const selectedView = defineModel<ViewType>("selectedView", { default: VIEW_TYPE_ALL });
const showRawFields = defineModel<boolean>("showRawFields", {
  default: true,
});
</script>
