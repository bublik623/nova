<template>
  <NovaButton
    class="save-and-go-to-next-button"
    data-testid="go-to-next-route-button"
    :loading="loading"
    :disabled="disabled"
    @click="handleClick"
  >
    {{
      props.readonly ? $t("experience-shared.go-to-next-section") : $t("experience-shared.save-and-go-to-next-section")
    }}
    <NovaIcon class="ml-2" name="chevron-right" />
  </NovaButton>
</template>

<script setup lang="ts">
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";

interface Props {
  loading: boolean;
  readonly: boolean;
  disabled: boolean;
}
interface Events {
  (e: "click:navigate"): void;
  (e: "click:save-and-navigate"): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

function handleClick() {
  if (props.readonly) {
    emits("click:navigate");
  } else {
    emits("click:save-and-navigate");
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.save-and-go-to-next-button {
  @include font-bold(16);
}
</style>
