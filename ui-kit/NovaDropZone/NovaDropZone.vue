<template>
  <div
    class="NovaDropZone"
    data-testid="nova-drop-zone"
    :active="active"
    @drop.prevent="(e) => onFileAdd(e.dataTransfer?.files)"
    @dragenter.prevent="active = true"
    @dragover.prevent="active = true"
    @dragleave.prevent="active = false"
  >
    <input
      ref="input"
      type="file"
      class="NovaDropZone__input"
      data-testid="nova-drop-zone-input"
      :accept="options?.acceptedFiles"
      @change="(e) => onFileAdd((e.target as HTMLInputElement).files)"
    />
    <slot :drop-zone-active="active">Upload file</slot>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import accept from "attr-accept";

export interface NovaDropZoneOptions {
  /**
   * List of file types accepted, separated by comma, see here for more info: https://www.npmjs.com/package/attr-accept
   */
  acceptedFiles?: string;
  /**
   * Maximum filesize (in byte) allowed
   */
  maxSize?: number;
}

export interface Props {
  options?: NovaDropZoneOptions;
}

interface Events {
  (e: "error", msg: string): void;
  (e: "file:added", file: File): void;
  (e: "file:rejected", errors: string[]): void;
}

const emit = defineEmits<Events>();
const props = defineProps<Props>();
const defaultOptions: NovaDropZoneOptions = {
  maxSize: 5000000,
};
const active = ref(false);

const input = ref<HTMLInputElement | null>(null);
defineExpose({ input });

function onFileAdd(files?: FileList | null) {
  active.value = false;
  if (files) {
    if (files.length > 1) {
      emit("error", "You can only upload one item");
      return;
    }
    const file = files[0];

    const errors = hasErrors(file);
    if (errors.length < 1) {
      emit("file:added", files[0]);
    } else {
      emit("file:rejected", errors);
    }
  }
}

function hasErrors(file: File) {
  const errors = [];
  const { acceptedFiles, maxSize } = { ...defaultOptions, ...props.options };

  if (acceptedFiles && !accept(file, acceptedFiles)) {
    errors.push("File extension not supported");
  }

  if (maxSize && file.size > maxSize) {
    errors.push(`The maximum supported size is ${maxSize / 100000}MB.`);
  }

  return errors;
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.NovaDropZone {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &__input {
    width: 100%;
    height: 100%;
    opacity: 0;
    position: absolute;
    cursor: pointer;
  }

  &[active="true"] {
    border: var(--border-primary);
  }
}
</style>
