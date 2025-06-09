<template>
  <div class="wrapper">
    <div class="mr-8">
      <div v-for="position in positions" :key="position" class="mt-1">
        <NovaTooltip :position="position">
          <NovaIcon name="info-solid" :size="29" class="cursor-pointer"></NovaIcon>
          <template #content>
            Lorem ipsum dolor sit amet,<br />
            consectetur adipiscing elit. In tempus.
          </template>
        </NovaTooltip>
      </div>
    </div>
    <div>
      <div v-for="position in positions" :key="position" class="mt-1">
        <NovaTooltip :position="position" theme="dark">
          <NovaIcon name="info-solid" :size="29" class="cursor-pointer"></NovaIcon>
          <template #content>
            Lorem ipsum dolor sit amet,<br />
            consectetur adipiscing elit. In tempus.
          </template>
        </NovaTooltip>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaTooltip from "@/ui-kit/NovaTooltip/NovaTooltip.vue";
import { Placement } from "@floating-ui/vue";

const positions: Placement[] = [
  "top",
  "right",
  "bottom",
  "left",
  "top-start",
  "top-end",
  "right-start",
  "right-end",
  "bottom-start",
  "bottom-end",
  "left-start",
  "left-end",
];
</script>

<style>
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 700px;
}
</style>
