<!-- eslint-disable vue/no-v-html -->
<template>
  <span v-html="cleanHTML(string)"></span>
</template>
<script setup lang="ts">
import { cleanHTML } from "@/utils/clean-html";
export interface Props {
  string: string;
}
defineProps<Props>();
</script>
