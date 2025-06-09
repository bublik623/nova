<template>
  <NovaAlert v-if="lock?.locked" status="error">
    <h2 class="text-sm font-bold">{{ $t("common.attention") }}</h2>

    <p class="text-sm">{{ lock.message }}</p>
  </NovaAlert>
</template>

<script setup lang="ts">
import { useExperienceLockStore } from "@/features/experience-lock/stores/useExperienceLockStore";
import NovaAlert from "@/ui-kit/NovaAlert/NovaAlert.vue";

interface Props {
  flow: "raw" | "editorial";
}

const props = defineProps<Props>();

const store = useExperienceLockStore();
const lock = computed(() => store.getOne(`experience.activity-cooldown.${props.flow}`));
</script>
