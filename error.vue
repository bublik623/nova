<script setup lang="ts">
import { NuxtError } from "nuxt/app";
import AppError from "./features/core-shared/components/AppError.vue";
import AppHeader from "./features/core-shared/components/AppHeader.vue";

interface Props {
  error: NuxtError;
}

defineProps<Props>();
</script>

<template>
  <AppHeader />
  <AppError class="pb-[--header-height]" :error />
</template>
