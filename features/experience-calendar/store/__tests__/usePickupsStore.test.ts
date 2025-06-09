import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia } from "pinia";
import { usePickupsStore } from "../../store/usePickupsStore";
import { Pickup } from "@/types/generated/PickupExperienceServiceApi";
import { PickupPlaceWithId } from "../../types/Pickups";

const exampleOptionPickup = {
  id: "1",
  option_id: "option-id",
  pickup_place_ids: ["1"],
  status: "ACTIVE",
  supplier_id: "sup1",
};

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

const pickupExperienceApiMock = {
  getPickupsByOptionId: vi.fn(() => Promise.resolve({ data: {} })),
  createPickup: vi.fn(() => Promise.resolve({ data: {} })),
  updatePickup: vi.fn(() => Promise.resolve({ data: {} })),
  deletePickup: vi.fn(() => Promise.resolve({ data: {} })),
};

vi.mock("@/features/auth/useAuthStore", () => ({
  useAuthStore: () => ({ userUuid: "supplier-id-mock" }),
}));

vi.mock("@/features/experience-calendar/api/usePickupExperienceApi", () => ({
  usePickupExperienceApi: () => pickupExperienceApiMock,
}));

const pickupPlaceApiMock = {
  getPickupPlaces: vi.fn(() => Promise.resolve({ data: examplePickups })),
};

vi.mock("@/features/experience-calendar/api/usePickupPlaceApi", () => ({
  usePickupPlaceApi: () => pickupPlaceApiMock,
}));

describe("usePickupsStore", () => {
  beforeEach(() => {
    pickupExperienceApiMock.getPickupsByOptionId = vi.fn().mockResolvedValue({
      data: exampleOptionPickup,
    });
    vi.clearAllMocks();
  });

  test("isFormValid - no pickup service", () => {
    const pinia = createPinia();
    const store = usePickupsStore(pinia);
    store.hasPickupService = false;
    store.fields.selectedPickups.value = [];

    expect(store.isFormValid).toBe(true);
  });

  test("isFormValid - pickup service", () => {
    const pinia = createPinia();
    const store = usePickupsStore(pinia);
    store.hasPickupService = true;
    store.fields.selectedPickups.value = [];

    expect(store.isFormValid).toBe(false);
  });

  test("isFormValid - pickup service with data", () => {
    const pinia = createPinia();
    const store = usePickupsStore(pinia);
    store.hasPickupService = true;
    store.fields.selectedPickups.value = [examplePickups[0]];

    expect(store.isFormValid).toBe(true);
  });

  test("isFormValid - no pickup service at load", () => {
    pickupExperienceApiMock.getPickupsByOptionId.mockResolvedValueOnce({ data: {} });
    const pinia = createPinia();
    const store = usePickupsStore(pinia);

    store.hasPickupService = true;

    expect(store.isFormValid).toBe(false);
  });

  test("loadPickupPlaces - success", async () => {
    const pinia = createPinia();
    const store = usePickupsStore(pinia);

    await store.loadPickupPlaces();

    expect(store.pickupPlacesData).toEqual(examplePickups);
    expect(pickupPlaceApiMock.getPickupPlaces).toHaveBeenCalled();
  });

  test("loads the data and initializes fields", async () => {
    const pinia = createPinia();
    const store = usePickupsStore(pinia);

    await store.loadData("option-1");

    expect(store.fields.selectedPickups.value).toEqual([examplePickups[0]]);
  });

  test("save form - new pickup", async () => {
    const pinia = createPinia();
    const store = usePickupsStore(pinia);

    store.hasPickupService = true;
    store.fields.selectedPickups.value = [examplePickups[0]];

    await store.saveForm("option-id");

    expect(store.isSaving).toBe(false);
    expect(pickupExperienceApiMock.createPickup).toHaveBeenCalledWith({
      option_id: "option-id",
      pickup_place_ids: ["1"],
      supplier_id: "supplier-id-mock",
    } as Omit<Pickup, "id">);
  });

  test("save form - it does not save if there are no changes", async () => {
    const pinia = createPinia();
    const store = usePickupsStore(pinia);

    await store.saveForm("option-id");

    expect(pickupExperienceApiMock.createPickup).toHaveBeenCalledTimes(0);
    expect(pickupExperienceApiMock.updatePickup).toHaveBeenCalledTimes(0);
    expect(pickupExperienceApiMock.deletePickup).toHaveBeenCalledTimes(0);
  });

  test("save form - update existing pickups", async () => {
    pickupExperienceApiMock.getPickupsByOptionId = vi.fn().mockResolvedValue({
      data: exampleOptionPickup,
    });

    const pinia = createPinia();
    const store = usePickupsStore(pinia);

    await store.loadData("option-1");
    store.fields.contactPhoneNumber.value = {
      country_iso_code: "TR",
      phone_number: "1112223344",
      phone_prefix: "+90",
    };
    store.fields.contactEmail.value = "hello@gmail.com";

    await store.saveForm("option-id");

    expect(pickupExperienceApiMock.updatePickup).toHaveBeenCalledWith("1", {
      contact_form: {
        contact_email: "hello@gmail.com",
        contact_number: {
          country_iso_code: "TR",
          phone_number: "1112223344",
          phone_prefix: "+90",
        },
      },
      option_id: "option-id",
      pickup_place_ids: ["1"],
      supplier_id: "supplier-id-mock",
    });
  });

  test("save form - delete a pickup", async () => {
    pickupExperienceApiMock.getPickupsByOptionId = vi.fn().mockResolvedValue({
      data: exampleOptionPickup,
    });

    const pinia = createPinia();
    const store = usePickupsStore(pinia);

    await store.loadData("option-1");
    store.hasPickupService = false;

    await store.saveForm("option-id");

    expect(pickupExperienceApiMock.deletePickup).toHaveBeenCalledWith("1");
  });
});
