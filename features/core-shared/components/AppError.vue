<script setup lang="ts">
import { NuxtError } from "#app";
import { AppErrorCause } from "@/types/AppErrorsCause";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";

const { $t } = useNuxtApp();

const description = computed(() => {
  switch (props.error.cause) {
    case AppErrorCause.MISSING_PERMISSION:
      return $t(`app-error.${AppErrorCause.MISSING_PERMISSION}.description`);
    case AppErrorCause.JWT_TOKEN:
      return "There seems to be an issue with authentication service. Please log out and try again.";
    case AppErrorCause.SSO_PROXY:
      return "SSO_PROXY There seems to be an issue with authentication service. Please log out and try again.";
    default:
      return $t("app-error.unknown.description");
  }
});

interface Props {
  error: NuxtError;
}

const props = defineProps<Props>();
</script>
<template>
  <div class="h-screen flex justify-center items-center bg-neutral-40">
    <div class="bg-white rounded-2xl w-[480px] h-[230px] flex justify-around items-center flex-col p-4 shadow-popover">
      <NovaIcon name="error-solid" :size="36" />
      <p class="text-[38px] font-bold">Uh-oh...</p>
      <p class="font-bold text-center px-8">
        {{ description }}
      </p>
    </div>
  </div>
</template>
