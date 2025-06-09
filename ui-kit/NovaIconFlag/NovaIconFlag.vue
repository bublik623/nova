<template>
  <div class="NovaIconFlag" :shape="shape || 'square'">
    <img :src="dynamicPath" :alt="dynamicIcon" class="NovaIconFlag__icon" :width="size.width" :height="size.height" />
  </div>
</template>

<script lang="ts" setup>
export interface Props {
  countryCode: string;
  size?: number;
  shape?: "square" | "circle";
}

const availableFlags = new Set([
  "placeholder",
  "be",
  "br",
  "de",
  "dk",
  "en",
  "es",
  "eu",
  "fi",
  "fr",
  "gi",
  "gr",
  "hr",
  "it",
  "ma",
  "me",
  "mt",
  "nl",
  "no",
  "pl",
  "pt",
  "ru",
  "se",
  "si",
  "tr",
  "us",
  "cz",
]);

const props = withDefaults(defineProps<Props>(), {
  shape: "square",
  size: 20,
});

const dynamicIcon = computed(() => (availableFlags.has(props.countryCode) ? props.countryCode : "placeholder"));
const dynamicPath = computed(
  () => new URL(`../../public/images/flags/flag-${dynamicIcon.value}.svg`, import.meta.url).href
);

const size = computed(() => {
  if (props.shape === "square") {
    return {
      height: `${props.size * 0.7}px`,
      width: `${props.size}px`,
    };
  }

  return {
    height: `${props.size}px`,
    width: `${props.size}px`,
  };
});
</script>
<style scoped lang="scss">
@import "@/assets/scss/utilities";

.NovaIconFlag {
  height: v-bind("size.height");
  width: v-bind("size.width");
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &__icon {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  &[shape="circle"] {
    border-radius: 50%;
  }
}
</style>
