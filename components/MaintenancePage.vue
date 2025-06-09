<template>
  <AppLogo data-testid="header-tui-logo" class="AppLogo" />

  <div class="maintenance">
    <NovaIcon class="mb-4" name="warning-solid" :size="64" />

    <div class="title mb-4" data-testid="maintenance__title">{{ $t("maintenance.title") }}</div>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="description" v-html="$t('maintenance.description')" />
  </div>
</template>

<script setup lang="ts">
import AppLogo from "@/features/core-shared/components/AppLogo.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.AppLogo {
  margin: 0 rem(15);
  position: absolute;
}

.maintenance {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
  text-align: center;

  .title,
  .description {
    width: 447px;
  }

  .title {
    @include font-bold(38);

    line-height: rem(44);
  }

  .description {
    @include font-regular(16);

    line-height: rem(22);
  }
}
</style>
