<template>
  <div>
    <NovaModal :show="isModalVisible">
      <div class="Modal" data-testid="modal-create-pickup">
        <div class="Modal__header">
          <h2 class="Modal__title">
            {{ $t("experience.create_pickup.modal.title") }}
          </h2>
          <div class="Modal__close">
            <NovaButtonIcon
              name="close"
              shape="square"
              :size="14"
              theme="dark"
              data-testid="create-pickup-modal-close-btn"
              @click="emit('click:close')"
            />
          </div>
        </div>

        <div class="Modal__content">
          <div class="form">
            <DocumentFormSection id="create_pickup.type" required>
              <NovaSelect
                data-testid="create-pickup-type"
                :selected="formFields.selectedPickupType"
                :options="pickupTypeOptions"
                :max-height="140"
                :placeholder="$t('experience.create_pickup.type.placeholder')"
                @select:option="(option) => (formFields.selectedPickupType = option)"
              ></NovaSelect>
            </DocumentFormSection>

            <DocumentFormSection id="create_pickup.address" required>
              <FieldPlaceSearch
                :model-value="formFields.address.direction"
                field-id="create-pickup-address"
                :placeholder="$t('experience.create_pickup.address.placeholder')"
                @clear="handleClearDirection"
                @select="handleSelectPlace"
              ></FieldPlaceSearch>
              <div v-if="formFields.address.latitude > 0" class="mt-4" style="height: 240px">
                <FieldMap
                  map-id="create-pickup-map"
                  :center="{ lat: formFields.address.latitude, lng: formFields.address.longitude }"
                ></FieldMap>
              </div>
            </DocumentFormSection>

            <DocumentFormSection id="create_pickup.name" required>
              <NovaInputText
                id="create-pickup-name"
                v-model="formFields.name"
                :placeholder="$t('experience.create_pickup.name.placeholder')"
                :error="nameError"
              ></NovaInputText>
            </DocumentFormSection>
          </div>
        </div>

        <div class="Modal__footer">
          <div class="footer__actions">
            <NovaButton
              size="xs"
              :disabled="isClearButtonDisabled"
              variant="underlined"
              data-testid="create-pickup-clear-all"
              @click="handleClearAll"
            >
              {{ $t("common.actions.clear_all.text") }}
            </NovaButton>
            <NovaButton
              :disabled="isSaveButtonDisabled"
              size="xs"
              variant="contained"
              data-testid="create-pickup-add-pickup"
              @click="handleCreate"
            >
              {{ $t("experience.create_pickup.add_pickup") }}
            </NovaButton>
          </div>
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
import { useVModel, whenever } from "@vueuse/core";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaSelect from "@/ui-kit/NovaSelect/NovaSelect.vue";
import { Option } from "@/types/Option";
import FieldPlaceSearch, { SelectedPlace } from "./FieldPlaceSearch.vue";
import FieldMap from "./FieldMap.vue";
import { usePickupPlaceApi } from "../api/usePickupPlaceApi";
import { PickupPlaceWithId } from "../types/Pickups";
import { PickupPlace } from "@/types/generated/PickupPlaceServiceApi";

export interface ModalCreatePickupProps {
  modelValue: boolean;
}

export interface ModalCreatePickupEvents {
  (e: "update:modelValue", value: boolean): void;
  (e: "click:close"): void;
  (e: "pickupCreated", pickup: PickupPlaceWithId): void;
}

const { $t } = useNuxtApp();
const props = defineProps<ModalCreatePickupProps>();
const emit = defineEmits<ModalCreatePickupEvents>();

const notificationStore = useNotifications();
const pickupPlaceApi = usePickupPlaceApi();
const runtimeConfig = useRuntimeConfig();

const isLoading = ref(false);
const isModalVisible = useVModel(props, "modelValue", emit);
const pickupTypeOptions: { value: PickupPlace["type"]; label: PickupPlace["type"] }[] = [
  { value: "Hotel", label: "Hotel" },
  { value: "Port", label: "Port" },
  { value: "Airport", label: "Airport" },
  { value: "Other", label: "Other" },
];
const pickupPlacesData = ref<PickupPlace[]>([]);

interface AddressFieldValues {
  city: string;
  country: string;
  direction: string;
  latitude: number;
  longitude: number;
}

const getEmptyAddress = (): AddressFieldValues => {
  return {
    latitude: 0,
    longitude: 0,
    direction: "",
    city: "",
    country: "",
  };
};

interface FormFields {
  selectedPickupType: Option | undefined;
  address: AddressFieldValues;
  name: string;
}

const formFields = reactive<FormFields>({
  selectedPickupType: undefined,
  address: getEmptyAddress(),
  name: "",
});

async function handleSelectPlace(selected: SelectedPlace) {
  const city =
    selected.item.address_components?.find((item) => {
      return item.types.find((type) => type === "locality" || type === "administrative_area_level_1");
    })?.long_name || "";

  const country =
    selected.item.address_components?.find((item) => {
      return item.types.find((type) => type === "country");
    })?.long_name || "";

  formFields.address = {
    direction: selected.address,
    latitude: selected.lat,
    longitude: selected.lng,
    city,
    country,
  };
}

const isPickupNameExist = computed(() => {
  return pickupPlacesData.value.some(
    (pickupPlace) => pickupPlace.name.toLocaleLowerCase() === formFields.name.toLocaleLowerCase()
  );
});

const isClearButtonDisabled = computed(() => {
  return (
    !formFields.name && !formFields.address.direction && !formFields.address.direction && !formFields.selectedPickupType
  );
});

const isSaveButtonDisabled = computed(() => {
  return !formFields.name || !formFields.address.direction || !formFields.selectedPickupType || isPickupNameExist.value;
});

const nameError = computed(() => {
  return isPickupNameExist.value ? $t("experience.create_pickup.name.error.exist") : "";
});

function handleClearDirection() {
  formFields.address = getEmptyAddress();
}

async function handleClearAll() {
  formFields.name = "";
  formFields.address = getEmptyAddress();
  formFields.selectedPickupType = undefined;
}

function mapFormToPayload(): PickupPlace {
  return {
    supplier_id: runtimeConfig.public.SUPPLIER_ID,
    name: formFields.name,
    type: formFields.selectedPickupType?.value as PickupPlace["type"],
    latitude: formFields.address.latitude.toString(),
    longitude: formFields.address.longitude.toString(),
    city: formFields.address.city,
    country: formFields.address.country,
    address: formFields.address.direction,
    status: "ACTIVE",
  };
}

async function handleCreate() {
  isLoading.value = true;

  try {
    const pickupPlace = mapFormToPayload();

    const { data } = await pickupPlaceApi.createPickupPlace(pickupPlace);

    if (!data) {
      throw new Error("[FE] something went wrong when creating the pickup");
    }

    notificationStore.addNotification({
      theme: "success",
      message: "notifications.success.creating.document",
    });

    handleClearAll();

    const pickup: PickupPlaceWithId = { ...pickupPlace, id: data };
    emit("pickupCreated", pickup);
  } catch (error) {
    notificationStore.addNotification({
      theme: "error",
      message: "notifications.error.creating.document",
    });
  } finally {
    isLoading.value = false;
  }
}

async function loadData() {
  try {
    const { data } = await pickupPlaceApi.getPickupPlaces();
    pickupPlacesData.value = data;
  } catch (error) {
    notificationStore.addNotification({
      theme: "error",
      message: "notifications.error.fetching.document",
    });
  }
}

whenever(isModalVisible, loadData);
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.Modal {
  width: rem(755);

  &__content {
    overflow: auto;
    height: 100%;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: rem(20);
    margin-bottom: rem(10);
    position: relative;
  }

  &__close {
    position: absolute;
    right: rem(20);
  }

  &__title {
    @include font-bold(16);

    color: var(--color-text-100);
    text-align: center;
  }

  &__footer {
    display: flex;
    align-items: center;
    border-top: 1px solid var(--color-neutral-60);
  }
}

.form {
  display: grid;
  gap: rem(32);
  padding: rem(32) rem(20);
}

.footer {
  &__actions {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: rem(64);
    padding: rem(20);
  }
}
</style>
