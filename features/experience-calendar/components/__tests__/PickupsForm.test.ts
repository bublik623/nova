import { config, mount, MountingOptions, VueWrapper } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import PickupsForm, { PickupsFormProps, PickupsFormValues } from "../PickupsForm.vue";
import { PickupPlaceWithId } from "../../types/Pickups";
import { testId } from "@/utils/test.utils";
import { Country } from "@/types/generated/GeoMasterDataApi";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (text: string) => text,
}));
config.global.mocks = {
  $t: (text: string) => text,
};

vi.stubGlobal("useId", () => "1");
vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
  }),
}));

const examplePickups: PickupPlaceWithId[] = [
  {
    id: "1",
    supplier_id: "sup1",
    name: "Entity name",
    type: "Hotel",
    latitude: "39.573696612860154",
    longitude: "2.643315064536297",
    city: "London",
    country: "England",
    address: "10 Downing Street. SW1A 2AA. London. England.",
    labels: ["hotel"],
    status: "ACTIVE",
    created_at: "2023-02-01T09:00:22.832Z",
  },
  {
    id: "2",
    supplier_id: "sup2",
    name: "Green Park",
    type: "Hotel",
    latitude: "39.573696612860153",
    longitude: "2.643315064536298",
    city: "London",
    country: "England",
    address: "Green park Street. London. England.",
    labels: ["hotel", "park"],
    status: "ACTIVE",
    created_at: "2023-05-03T08:01:04.304Z",
  },
];

const formDataMock: { pickups: PickupPlaceWithId[]; countries: Country[] } = {
  pickups: examplePickups,
  countries: [
    {
      id: "d67d6f2d-0c46-45d2-b594-5da917767432",
      iso_code_alpha2: "BV",
      iso_code_alpha3: "BVT",
      iso_code_numeric: 74,
      name: "Bouvet Island",
      language_code: "no",
      description: "Bouvet Island",
      country_calling_codes: [55],
    },
    {
      id: "a6de0e47-c5f5-467f-a520-1f426f681d2b",
      iso_code_alpha2: "BR",
      iso_code_alpha3: "BRA",
      iso_code_numeric: 76,
      name: "Brazil",
      language_code: "pt",
      description: "Brazil",
      country_calling_codes: [55],
    },
  ],
};

const defaultProps: PickupsFormProps = {
  initialValues: {
    selectedPickups: [],
    contactEmail: "",
    contactPhoneNumber: { phone_prefix: "", country_iso_code: "", phone_number: "" },
  },
  data: formDataMock,
  hasPickupService: true,
};

describe("PickupsForm", () => {
  let wrapper: VueWrapper<InstanceType<typeof PickupsForm>>;

  const render = (options: MountingOptions<PickupsFormProps> = {}) => {
    wrapper = mount<any>(PickupsForm, {
      props: defaultProps,
      ...options,
      global: {
        stubs: {
          ModalCreatePickup: defineComponent({
            props: {
              modelValue: Boolean,
            },
            template: "<div v-if='modelValue' data-testid='modal-create-pickup'>modal</div>",
          }),
        },
      },
    });
  };

  const findRadioNo = () => wrapper.find(testId("input-radio-false"));
  const findPickupInput = () => wrapper.find(testId("field-pickups-input"));
  const findEmailInput = () => wrapper.find(testId("email-input-text"));
  const findPhoneNumberInput = () => wrapper.find(testId("input-phone-number"));
  const findCurationSetupLabels = () => wrapper.findAll(testId("curation-view-type-setup"));
  const findNewPickupButton = () => wrapper.find(testId("new-pickup-button"));
  const findModal = () => wrapper.find(testId("modal-create-pickup"));
  const findReadonlyRadioGroup = () => wrapper.find(testId("radio-group-pickup_service.options-readonly"));

  test("displays FieldPickups and contact fields when hasPickupsService is true", async () => {
    render();

    expect(findPickupInput().exists()).toBe(true);
    expect(findEmailInput().exists()).toBe(true);
    expect(findPhoneNumberInput().exists()).toBe(true);
  });

  test("does not display FieldPickups and FieldSelectedPickups when hasPickupsService is false", async () => {
    render({
      props: {
        ...defaultProps,
        hasPickupService: false,
      },
    });

    expect(findPickupInput().exists()).toBe(false);
    expect(findEmailInput().exists()).toBe(false);
    expect(findPhoneNumberInput().exists()).toBe(false);
  });

  test("emits 'submit' event with form values when form is updated", async () => {
    render();

    const events = wrapper.emitted<PickupsFormValues[]>()["submit"];

    await findEmailInput().setValue("updated@example.com");

    expect(events[0][0]).toEqual<PickupsFormValues>({
      contactEmail: "updated@example.com",
      contactPhoneNumber: {
        country_iso_code: "",
        phone_number: "",
        phone_prefix: "",
      },
      selectedPickups: [],
    });
  });

  test("emits 'hasPickupService' event when pickup service radio group is updated", async () => {
    render();

    await findRadioNo().setValue(true);

    const events = wrapper.emitted<boolean[]>()["update:hasPickupService"];

    expect(events[0][0]).toBe(false);
  });

  test("in curation flow it should display correct labels", async () => {
    render({
      props: {
        ...defaultProps,
        isCurationFlow: true,
      },
    });

    // all 3 fields should have "setup check" label
    expect(findCurationSetupLabels().length).toBe(2);
  });

  test("displays the modal when new pickup button is clicked", async () => {
    render();

    expect(findModal().exists()).toBe(false);

    await findNewPickupButton().trigger("click");

    expect(findModal().exists()).toBe(true);
  });

  test("if is readonly it should not be editable", async () => {
    render({
      props: {
        ...defaultProps,
        readonly: true,
      },
    });

    expect(findNewPickupButton().attributes("disabled")).toBe("");
    expect(findReadonlyRadioGroup().text()).toBe("common.yes");
    expect(findEmailInput().attributes("disabled")).toBe("");
    expect(findNewPickupButton().attributes("disabled")).toBe("");
  });
});
