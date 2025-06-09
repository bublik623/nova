<template>
  <div class="NoOptionsAdded my-4">
    {{ $t("experience.highlights.no_options_added") }}
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.NoOptionsAdded {
  @include font-regular(14);

  color: var(--color-text-70);
  text-align: center;
}
</style>
