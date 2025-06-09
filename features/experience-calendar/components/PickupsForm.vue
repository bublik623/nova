<template>
  <div class="pickups__wrapper">
    <DocumentFormSection id="pickups.has_pickup_service" required>
      <NovaInputRadioGroup
        v-model="hasPickupsService"
        name="pickup_service.options"
        :options="hasPickupServiceOptions"
        :readonly="readonly"
        :readonly-placeholder="$t('common.no-content')"
      ></NovaInputRadioGroup>
    </DocumentFormSection>

    <template v-if="hasPickupsService">
      <DocumentFormSection id="pickups.places" required>
        <div v-if="isCurationFlow" class="CurationViewType--setup" data-testid="curation-view-type-setup">
          {{ $t("experience.curation.view-type.setup") }}
        </div>
        <FieldPickups v-model="formValues.selectedPickups" :options="data.pickups" :disabled="readonly"></FieldPickups>
        <div class="mt-5">
          <p class="create-pickup__info">{{ $t("experience.create_pickup.add_new_pickup.info") }}</p>
          <NovaButton
            :disabled="readonly"
            data-testid="new-pickup-button"
            class="mt-3"
            size="sm"
            @click="isModalCreatePickupOpen = true"
          >
            &plus;&nbsp; {{ $t("experience.create_pickup.add_new_pickup.button") }}</NovaButton
          >
          <ModalCreatePickup
            v-model="isModalCreatePickupOpen"
            @click:close="isModalCreatePickupOpen = false"
            @pickup-created="(pickup) => emits('pickupCreated', pickup)"
          ></ModalCreatePickup>
        </div>
        <div v-if="formValues.selectedPickups.length" class="mt-5">
          <FieldSelectedPickups :pickups="selectedPickupsSorted" @delete="handleDeletePickup"></FieldSelectedPickups>
        </div>
      </DocumentFormSection>

      <DocumentFormSection id="pickups.contact" :required="false">
        <div v-if="isCurationFlow" class="CurationViewType--setup" data-testid="curation-view-type-setup">
          {{ $t("experience.curation.view-type.setup") }}
        </div>
        <div class="field__contact">
          <div class="form-field">
            <label class="form-field__label" for="input-phone-number">{{ $t("common.field.phone.title") }}</label>
            <NovaPhoneNumber
              id="input-phone-number"
              v-model:number="formValues.contactPhoneNumber.phone_number"
              v-model:prefix="formValues.contactPhoneNumber.phone_prefix"
              v-model:country-code="formValues.contactPhoneNumber.country_iso_code"
              :countries="data.countries"
              :placeholders="{
                phoneNumberInput: $t('common.field.phone.placeholder'),
                phonePrefixSearch: $t('common.field.phone.prefix.placeholder'),
                noItemFound: $t('common.search.no-items-found'),
                readonlyEmpty: $t('common.no-content'),
              }"
              :readonly="readonly"
            />
          </div>
          <div class="form-field">
            <label class="form-field__label" for="input-email">{{ $t("common.field.email.title") }}</label>
            <NovaInputText
              id="email"
              v-model="formValues.contactEmail"
              :disabled="readonly"
              :placeholder="$t('common.field.email.placeholder')"
            ></NovaInputText>
          </div>
        </div>
      </DocumentFormSection>
    </template>
  </div>
</template>

<script lang="ts" setup>
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import FieldPickups from "./FieldPickups.vue";
import { PickupPlaceWithId } from "../types/Pickups";
import FieldSelectedPickups from "./FieldSelectedPickups.vue";
import { ContactNumber } from "@/types/generated/PickupExperienceServiceApi";
import NovaPhoneNumber from "@/ui-kit/NovaPhoneNumber/NovaPhoneNumber.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import { useVModel } from "@vueuse/core";
import { useNuxtApp } from "#app";
import DocumentFormSection from "@/components/Document/FormSection/FormSection.vue";
import { Country } from "@/types/generated/GeoMasterDataApi";
import ModalCreatePickup from "@/features/experience-calendar/components/ModalCreatePickup.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";

export interface PickupsFormValues {
  selectedPickups: PickupPlaceWithId[];
  contactPhoneNumber: ContactNumber;
  contactEmail: string;
}
export interface PickupsFormProps {
  hasPickupService: boolean;
  initialValues: PickupsFormValues;
  data: {
    pickups: PickupPlaceWithId[];
    countries: Country[];
  };
  isCurationFlow?: boolean;
  readonly?: boolean;
}

interface Events {
  (e: "submit", data: PickupsFormValues): void;
  (e: "update:hasPickupService", data: boolean): void;
  (e: "pickupCreated", pickup: PickupPlaceWithId): void;
}

const { $t } = useNuxtApp();
const props = defineProps<PickupsFormProps>();
const emits = defineEmits<Events>();

const isModalCreatePickupOpen = ref(false);
const hasPickupsService = useVModel(props, "hasPickupService", emits, { passive: true, defaultValue: false });
const formValues = reactive<PickupsFormValues>({
  selectedPickups: props.initialValues.selectedPickups,
  contactPhoneNumber: props.initialValues.contactPhoneNumber,
  contactEmail: props.initialValues.contactEmail,
});

const selectedPickupsSorted = computed(() =>
  formValues.selectedPickups.slice().sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  })
);

const hasPickupServiceOptions: {
  label: string;
  value: boolean;
}[] = [
  { label: $t("common.yes"), value: true },
  { label: $t("common.no"), value: false },
];

const handleDeletePickup = (pickupToDelete: PickupPlaceWithId) => {
  formValues.selectedPickups = formValues.selectedPickups.filter(
    (selectedPickup) => selectedPickup.id !== pickupToDelete.id
  );
};

watch(
  formValues,
  () => {
    emits("submit", formValues);
  },
  { deep: true, immediate: true }
);
</script>
<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.pickups {
  &__wrapper {
    display: grid;
    gap: rem(50);
  }
}

.field__contact {
  display: flex;
  gap: rem(16);
  max-width: rem(650);
  width: 100%;
}

.form-field {
  flex: 1;

  &__label {
    @include font-regular(12);

    display: block;
    color: var(--color-text-90);
    margin-bottom: rem(3);
  }
}

.create-pickup__info {
  @include font-regular(14);

  color: var(--color-text-90);
}
</style>
