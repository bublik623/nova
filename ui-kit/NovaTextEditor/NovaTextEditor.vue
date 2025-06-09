<template>
  <div
    v-if="!readonly"
    class="NovaTextEditor"
    :theme="hasError ? 'error' : null"
    :disabled="disabled || null"
    :loading="loading || null"
    data-testid="nova-text-editor"
  >
    <div v-if="loading" class="NovaTextEditor__skeleton skeleton_item" />
    <div v-if="editor" class="NovaTextEditor__header">
      <div class="NovaTextEditor__buttons" data-testid="nova-text-editor-buttons">
        <NovaButtonIcon
          class="mr-1"
          name="bold"
          :size="20"
          :disabled="disabled"
          theme="dark"
          shape="square"
          :selected="editor.isActive('bold')"
          data-testid="nova-text-editor-buttons-bold"
          @click="editor?.chain().focus().toggleBold().run()"
        />
        <NovaButtonIcon
          class="mr-1"
          name="italic"
          :size="20"
          :disabled="disabled"
          theme="dark"
          shape="square"
          :selected="editor.isActive('italic')"
          data-testid="nova-text-editor-buttons-italic"
          @click="editor?.chain().focus().toggleItalic().run()"
        />
        <NovaButtonIcon
          class="mr-1"
          name="underline"
          :size="20"
          :disabled="disabled"
          theme="dark"
          shape="square"
          :selected="editor.isActive('underline')"
          data-testid="nova-text-editor-buttons-underline"
          @click="editor?.commands.toggleUnderline()"
        />
        <NovaButtonIcon
          class="mr-1"
          name="ordered-list"
          :size="20"
          :disabled="disabled"
          theme="dark"
          shape="square"
          :selected="editor.isActive('orderedList')"
          data-testid="nova-text-editor-buttons-ordered-list"
          @click="editor?.commands.toggleOrderedList()"
        />
        <NovaButtonIcon
          name="unordered-list"
          :size="20"
          :disabled="disabled"
          theme="dark"
          shape="square"
          :selected="editor.isActive('bulletList')"
          data-testid="nova-text-editor-buttons-unordered-list"
          @click="editor?.commands.toggleBulletList()"
        />
      </div>
    </div>
    <EditorContent data-testid="nova-text-editor-tiptap-editor" :editor="editor" />
    <div class="NovaTextEditor__characters" data-testid="nova-text-editor-characters">
      <NovaTextMetrics
        :words-count="editor?.storage.characterCount.words() ?? 0"
        :characters-count="editor?.storage.characterCount.characters()"
        :max-characters="maxLength"
      ></NovaTextMetrics>
    </div>
  </div>

  <div v-else class="NovaTextEditorReadonly">
    <slot>
      <RenderHtml v-if="readonlyText.length" :string="readonlyText" />
      <NoContentUtil v-else />
      <NovaButton
        v-if="!notExpandable"
        class="mt-1"
        variant="underlined"
        size="xs"
        data-testid="nova-text-editor-readonly-collapse-button"
        @click="expanded = !expanded"
        >{{ expanded ? $t("common.read-less") : $t("common.read-more") }}</NovaButton
      >
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { useEditor, EditorContent } from "@tiptap/vue-3";
import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { ListItem } from "@tiptap/extension-list-item";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { Placeholder } from "@tiptap/extension-placeholder";
import { CharacterCount } from "@tiptap/extension-character-count";
import { History } from "@tiptap/extension-history";
import { Underline } from "@tiptap/extension-underline";
import NovaButtonIcon from "../NovaButtonIcon/NovaButtonIcon.vue";
import NovaButton from "../NovaButton/NovaButton.vue";
import RenderHtml from "@/components/Utils/RenderHtml/RenderHtml.vue";
import NoContentUtil from "@/features/experience-shared/components/NoContentUtil.vue";
import NovaTextMetrics from "../NovaTextMetrics/NovaTextMetrics.vue";

export interface NovaTextEditorProps {
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  loading?: boolean;
  maxLength?: number;
  readonly?: boolean;
  maxLengthReadonly?: number;
}

interface Events {
  (e: "update:modelValue", value: string): void;
}

const props = withDefaults(defineProps<NovaTextEditorProps>(), {
  placeholder: "Insert your text here...",
  maxLength: 0,
  modelValue: "",
  readonly: false,
  maxLengthReadonly: 226,
});
const emit = defineEmits<Events>();

const editor = useEditor({
  editable: !props.disabled,
  content: props.modelValue,
  extensions: [
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    ListItem,
    BulletList,
    OrderedList,
    History,
    Underline,
    Placeholder.configure({
      placeholder: props.placeholder,
      showOnlyWhenEditable: false,
    }),
    CharacterCount.configure({
      limit: props.maxLength,
    }),
  ],
  editorProps: {
    attributes: {
      class: "NovaTextEditor__content",
    },
  },
  onUpdate: handleUpdate,
});

function handleUpdate() {
  if (editor.value?.getText()) {
    emit("update:modelValue", editor.value?.getHTML());
  } else {
    emit("update:modelValue", "");
  }
}

// readonly
const expanded = ref(false);
const notExpandable = props.modelValue.length <= props.maxLengthReadonly;

const readonlyText = computed(() =>
  expanded.value || notExpandable ? props.modelValue : `${props.modelValue.substring(0, props.maxLengthReadonly)} ...`
);
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.NovaTextEditor {
  --border-color: var(--border-default-color);
  --background-color: #fff;
  --text-color: var(--color-text-100);
  --character-count-color: var(--color-text-80);

  width: 100%;
  border: var(--border-default);
  border-color: var(--border-color);
  border-radius: var(--border-radius-default);
  background-color: var(--background-color);
  color: var(--text-color);
  position: relative;
  @include font-semibold(14);

  &:hover:not([disabled], [theme="error"], :focus-within) {
    --border-color: var(--color-text-80);
  }

  &:focus-within:not([disabled], [theme="error"]) {
    outline: none;

    --border-color: var(--color-primary-100);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: rem(10);
    border-bottom: var(--border-default);
  }

  &__buttons {
    display: flex;
  }

  &__characters {
    position: absolute;
    bottom: -22px;
    right: 0;
  }

  &[theme="error"] {
    --border-color: var(--color-error-100);
  }

  &[disabled] {
    --background-color: var(--color-neutral-10);
  }
}
</style>

<style lang="scss">
@import "@/assets/scss/utilities";

.ProseMirror {
  padding: 10px;
  height: 200px;
  overflow-y: auto;

  em {
    font-style: italic;
  }

  ul {
    padding: 0 1rem;
    list-style: disc;
  }

  ol {
    padding: 0 1rem;
    list-style: decimal;
  }

  &:focus-visible {
    outline: none;
  }

  // placeholder
  // https://tiptap.dev/api/extensions/placeholder
  p.is-editor-empty:first-child::before {
    @include font-semibold(14);

    content: attr(data-placeholder);
    float: left;
    font-style: italic;
    color: var(--color-text-70);
    pointer-events: none;
    height: 0;
  }
}

.NovaTextEditorReadonly {
  @include font-regular(14);
}
</style>
