<template>
  <InlineComponent></InlineComponent>
</template>

<script setup lang="ts">
import { visualDomDiff } from "visual-dom-diff";

export type DiffHtmlProps = {
  value: string;
  oldValue: string;
};

const props = defineProps<DiffHtmlProps>();

const classes = useCssModule("classes");

function htmlStringToNode(htmlString: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  return doc.body;
}

const getDiffedHtml = (newValue: string, oldValue: string) => {
  const oldNode = htmlStringToNode(oldValue);
  const newNode = htmlStringToNode(newValue);
  const diffNode = visualDomDiff(oldNode, newNode, { addedClass: classes.added, removedClass: classes.removed });
  const div = document.createElement("div");
  div.appendChild(diffNode);
  return div.innerHTML;
};

const InlineComponent = () => h("div", { class: "diff-html", innerHTML: getDiffedHtml(props.value, props.oldValue) });
</script>

<style module="classes" lang="scss">
.removed {
  background: var(--color-error-90);
  color: var(--color-error-100);
  text-decoration: line-through;
}

.added {
  background: var(--color-success-10);
  color: var(--color-success-100);
  text-decoration: underline;
}
</style>
