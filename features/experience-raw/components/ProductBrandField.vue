<template>
  <NovaInputRadioGroup
    :model-value="productBrand"
    layout="vertical"
    name="product_brand.options"
    :options="options"
    :readonly="isReadonly"
    :readonly-placeholder="placeholder"
    @update:model-value="$emit('update:productBrand', String($event))"
  />

  <div v-if="productBrand === BRAND_TUI_COLLECTION" class="ml-16 mt-8 pl-6 border-l-4 rounded-l">
    <FormSection id="collection-criteria">
      <div class="grid gap-8">
        <div>
          <h3 class="text-sm">{{ $t("experience.collection-criteria.exceptional-experiences") }}</h3>
          <NovaTextEditor
            data-testid="collection-criteria-exceptional-experiences"
            class="mt-4"
            :model-value="exceptionalExperiences"
            :readonly="isReadonly"
            @update:model-value="$emit('update:exceptionalExperiences', $event)"
          />
        </div>

        <div>
          <h3 class="text-sm">{{ $t("experience.collection-criteria.created-with-care") }}</h3>
          <NovaTextEditor
            data-testid="collection-criteria-created-with-care"
            class="mt-4"
            :model-value="createdWithCare"
            :readonly="isReadonly"
            @update:model-value="$emit('update:createdWithCare', $event)"
          />
        </div>

        <div>
          <h3 class="text-sm">
            {{ $t("experience.collection-criteria.best-value-guaranteed") }}
          </h3>
          <NovaTextEditor
            class="mt-4"
            data-testid="collection-criteria-best-value-guaranteed"
            :model-value="bestValueGuaranteed"
            :readonly="isReadonly"
            @update:model-value="$emit('update:bestValueGuaranteed', $event)"
          />
        </div>
      </div>
    </FormSection>
  </div>
</template>

<script setup lang="ts">
import { RadioOption } from "@/ui-kit/NovaInputRadio/NovaInputRadio.vue";
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import { BRAND_TUI_COLLECTION } from "@/features/experience-raw/constants";
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import NovaTextEditor from "@/ui-kit/NovaTextEditor/NovaTextEditor.vue";

export interface ProductBrandFieldProps {
  productBrand?: string;
  exceptionalExperiences?: string;
  createdWithCare?: string;
  bestValueGuaranteed?: string;
  options: RadioOption[];
  isReadonly?: boolean;
  placeholder: string;
}

interface Events {
  (e: "update:productBrand", value: string): void;
  (e: "update:exceptionalExperiences", value: string): void;
  (e: "update:createdWithCare", value: string): void;
  (e: "update:bestValueGuaranteed", value: string): void;
}

defineProps<ProductBrandFieldProps>();
defineEmits<Events>();
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";
</style>
