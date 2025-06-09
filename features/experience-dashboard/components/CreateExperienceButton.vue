<template>
  <div>
    <NovaButton
      size="sm"
      class="Dashboard__button"
      data-testid="dashboard-new-experience-btn"
      @click="showModal = true"
    >
      <p class="Dashboard__button__text">
        {{ $t("dashboard.btn.create.new.raw.content") }}
      </p>
    </NovaButton>

    <NovaModal :show="showModal">
      <div class="ModalNewExperience" data-testid="modal-create-experience">
        <p class="ModalNewExperience__title">
          {{ $t("experience.new.experience") }}
        </p>
        <NovaAlert
          v-if="showSupplierNotValidBanner"
          variant="solid"
          status="error"
          size="sm"
          class="my-4"
          data-testid="experience-supplier-not-valid-banner"
        >
          {{ $t("experience.supplier_not_valid.banner") }}
        </NovaAlert>
        <p class="ModalNewExperience__description mt-2 mb-4">
          {{ $t("new.experience.modal.description") }}
        </p>

        <div class="grid grid-cols-1 divide-y divide-neutral-40">
          <div v-if="enableDifferentProductTypes" class="py-4 grid gap-1">
            <p class="text-xs font-normal">{{ $t("experience.product_type.title") }}</p>
            <NovaSelect
              :options="productTypeOptions"
              :selected="selectedProductTypeOption"
              :max-height="300"
              :placeholder="$t('experience.product_type.input.placeholder')"
              @select:option="(opt) => (selectedProductTypeOption = opt)"
            ></NovaSelect>
          </div>

          <NovaInputText id="modal-create-experience" v-model="experienceTitle" class="py-4" label="Title">
          </NovaInputText>

          <div class="py-4 grid gap-1">
            <p class="text-xs font-normal">{{ $t("experience.supplier_name.title") }}</p>
            <FieldSupplierSearch v-model="supplierId" input-id="supplier-name" />
          </div>
        </div>

        <div class="ModalNewExperience__buttons mt-4">
          <NovaButton
            data-testid="modal-create-experience-cancel-button"
            variant="underlined"
            size="sm"
            @click="(showModal = false), (experienceTitle = '')"
            >{{ $t("new.experience.modal.cancel") }}</NovaButton
          >
          <NovaButton
            data-testid="modal-create-experience-create-button"
            size="sm"
            :style="{
              width: '117px',
            }"
            :disabled="isLoading || isDisabled"
            :loading="isLoading"
            class="ml-4"
            @click="handleCreateRawContent"
          >
            {{ $t("new.experience.modal.create") }}</NovaButton
          >
        </div>
      </div>
    </NovaModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useNotifications } from "@/stores/notifications";
import NovaModal from "@/ui-kit/NovaModal/NovaModal.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { SupplierWithoutEventsError, useExperienceRawApi } from "@/composables/useExperienceRawApi";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";
import NovaSelect from "@/ui-kit/NovaSelect/NovaSelect.vue";
import { useNuxtApp } from "#app";
import { AvailableProductOptions } from "@/features/experience-shared/types/AvailableProductTypes";
import NovaAlert from "@/ui-kit/NovaAlert/NovaAlert.vue";
import FieldSupplierSearch from "@/features/experience-shared/field-supplier/components/FieldSupplierSearch.vue";
import { getExperienceLinkByPermissions } from "@/features/experience-dashboard/lib/get-experience-link-by-permissions";
import { hasPermission } from "@/features/roles/lib/has-permission";

const showModal = ref(false);
const experienceTitle = ref("");
const supplierId = ref("");
const isLoading = ref(false);

const router = useRouter();
const notificationStore = useNotifications();
const { logError } = useLogger();
const experienceRawApi = useExperienceRawApi();
const selectedProductTypeOption = ref();
const enableDifferentProductTypes = computed(() => useFeatureFlag("enableDifferentProductTypes"));

const { $t } = useNuxtApp();

const productTypeOptions = computed(() => {
  const enabledProductType: AvailableProductOptions = [{ label: $t("product-type.option-label.nova"), value: "NOVA" }];
  const canCreateOpinoiaExperience = hasPermission("experience.opinoia.raw-commercial.canWrite");

  if (useFeatureFlag("enable_product_type_asx")) {
    enabledProductType.push({ label: $t("product-type.option-label.asx"), value: "ASX" });
  }
  if (useFeatureFlag("enable_product_type_sip")) {
    enabledProductType.push({ label: $t("product-type.option-label.sip"), value: "SIP" });
  }
  if (useFeatureFlag("enable_product_type_opinoia") && canCreateOpinoiaExperience) {
    enabledProductType.push({ label: $t("product-type.option-label.opinoia"), value: "INTERNAL" });
  }

  return enabledProductType;
});

watch(showModal, () => {
  if (showModal.value) {
    showSupplierNotValidBanner.value = false;
  } else {
    selectedProductTypeOption.value = undefined;
  }
});

const isDisabled = computed(
  () =>
    !experienceTitle.value.trim() ||
    !supplierId.value ||
    (enableDifferentProductTypes.value && !selectedProductTypeOption.value)
);

const showSupplierNotValidBanner = ref<boolean>(false);

async function handleCreateRawContent() {
  isLoading.value = true;
  const selectedExperienceSource = enableDifferentProductTypes.value ? selectedProductTypeOption.value.value : "NOVA";

  try {
    const { data: experienceId } = await experienceRawApi.createDistributionContent({
      supplier_id: supplierId.value,
      experience_source: selectedExperienceSource,
    });

    if (!experienceId) {
      throw new Error("[FE] something went wrong when creating the experience");
    }

    await experienceRawApi.createExperienceRaw(experienceId, experienceTitle.value);

    notificationStore.addNotification({
      theme: "success",
      message: "notifications.success.creating.document",
    });

    const path = getExperienceLinkByPermissions({
      experienceId,
      experienceSource: selectedExperienceSource,
    });

    await router.push(path);
  } catch (error: any) {
    if (error instanceof SupplierWithoutEventsError) {
      showSupplierNotValidBanner.value = true;
    } else {
      logError("create-raw", error);
    }
    notificationStore.addNotification({
      theme: "error",
      message: "notifications.error.creating.document",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.ModalNewExperience {
  padding: rem(24);
  width: rem(548);

  &__title {
    @include font-bold(16);

    color: var(--color-text-100);
    text-align: center;
  }

  &__description {
    @include font-regular(14);

    color: var(--color-text-90);
    text-align: center;
  }

  &__buttons {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
