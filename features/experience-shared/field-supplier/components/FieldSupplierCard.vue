<template>
  <div
    v-if="isEditing"
    class="flex flex-col w-full"
    :class="{
      'border border-neutral-60 rounded-lg p-5 gap-4 py-4': isEditing,
    }"
  >
    <NovaAlert v-if="isEditing" size="lg" status="warning" class="pb-2">
      <p class="font-light">
        {{ $t("common.field.supplier.reset_warning") }}
      </p>
    </NovaAlert>

    <FieldSupplierSearch v-model="supplierId" :input-id="inputId" />

    <div v-if="selectedSupplier" :class="{ 'mt-4': !isEditing }" :data-supplier-id="selectedSupplier?.id">
      <p class="text-xs font-normal">{{ $t("common.field.supplier.email.title") }}</p>
      <p class="text-sm font-light mt-1">{{ selectedSupplier?.email }}</p>
    </div>

    <div v-if="isEditing" class="flex items-center justify-end gap-3">
      <NovaButton data-testid="field-supplier-cancel-btn" size="sm" variant="outline" @click="handleCancel">{{
        $t("common.cancel")
      }}</NovaButton>
      <NovaButton
        data-testid="field-supplier-save-selection-btn"
        :disabled="!selectedSupplier"
        size="sm"
        variant="contained"
        @click="handleSaveSupplier"
      >
        {{ $t("common.field.supplier.save_selection") }}
      </NovaButton>
    </div>
  </div>

  <div v-else ref="component" class="relative flex flex-col gap-2 text-sm border border-neutral-60 rounded-lg p-5">
    <div class="flex justify-between">
      <div class="w-fit flex flex-col" data-testid="field-supplier-name">
        <p class="font-bold">{{ `${$t("common.field.supplier.name.title")}:` }}</p>
        <p class="text-text-100 font-light">{{ selectedSupplier?.name }}</p>
      </div>

      <div
        v-if="!disabled && !readonly"
        class="gap-1 flex hover:cursor-pointer absolute top-2.5 right-2"
        @click="toggleEdit"
      >
        <NovaButton variant="text" size="sm" data-testid="field-supplier-edit-btn">
          <NovaIcon name="edit" :size="18" class="mr-1" />
          {{ $t("common.edit") }}
        </NovaButton>
      </div>
    </div>

    <p v-if="!selectedSupplier" class="text-xs text-center text-text-90 py-6" data-testid="field-supplier-no-results">
      {{ $t("common.field.supplier.no_results") }}
    </p>

    <div
      v-if="selectedSupplier?.email"
      class="w-fit flex flex-col"
      data-testid="field-supplier-email"
      :data-supplier-id="selectedSupplier?.id"
    >
      <p class="font-bold">{{ `${$t("common.field.supplier.email.title")}:` }}</p>
      <p class="text-text-100 font-light">{{ selectedSupplier?.email }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaAlert from "@/ui-kit/NovaAlert/NovaAlert.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { useSupplierField } from "../composables/useSupplierField";
import FieldSupplierSearch from "./FieldSupplierSearch.vue";
import { useNuxtApp } from "#app";

interface FieldSupplierProps {
  inputId: string;
  modelValue?: string;
  readonly?: boolean;
  disabled?: boolean;
}

type Events = {
  "update:modelValue": [id: string];
};

const props = defineProps<FieldSupplierProps>();
const emit = defineEmits<Events>();

const { $t } = useNuxtApp();

const isEditing = ref(false);

const { selectedSupplier, supplierId } = useSupplierField(props.modelValue);

function toggleEdit() {
  isEditing.value = !isEditing.value;
}

function handleCancel() {
  supplierId.value = props.modelValue;
  toggleEdit();
}

function handleSaveSupplier() {
  toggleEdit();

  if (supplierId.value) {
    emit("update:modelValue", supplierId.value);
  }
}
</script>
