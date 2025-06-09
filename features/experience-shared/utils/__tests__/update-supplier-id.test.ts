import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateSupplierIdForPickups } from "../update-supplier-id";

const mockOptions = [{ id: "option1" }, { id: "option2" }];

const mockOfferServiceApi = {
  getOptions: vi.fn().mockResolvedValue({ data: mockOptions }),
};
vi.mock("@/composables/useOfferServiceApi", () => ({
  useOfferServiceApi: () => mockOfferServiceApi,
}));

const mockPickups = {
  option1: { id: "pickup1", name: "Pickup 1" },
  option2: { id: "pickup2", name: "Pickup 2" },
} as const;

const mockPickupExperienceApi = {
  getPickupsByOptionId: vi.fn((optionId: keyof typeof mockPickups) => {
    return Promise.resolve({ data: mockPickups[optionId] });
  }),
  updatePickup: vi.fn().mockResolvedValue({}),
};

vi.mock("@/features/experience-calendar/api/usePickupExperienceApi", () => ({
  usePickupExperienceApi: () => mockPickupExperienceApi,
}));

describe("updateSupplierIdForPickups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update supplier_id for all pickups associated with the experience options", async () => {
    mockOfferServiceApi.getOptions.mockResolvedValue({ data: mockOptions });

    const experienceId = "exp123";
    const newSupplierId = "supplier456";

    await updateSupplierIdForPickups(experienceId, newSupplierId);

    expect(mockOfferServiceApi.getOptions).toHaveBeenCalledWith(experienceId);
    expect(mockPickupExperienceApi.getPickupsByOptionId).toHaveBeenCalledWith("option1");
    expect(mockPickupExperienceApi.getPickupsByOptionId).toHaveBeenCalledWith("option2");
    expect(mockPickupExperienceApi.updatePickup).toHaveBeenCalledWith("pickup1", {
      name: "Pickup 1",
      supplier_id: newSupplierId,
    });
    expect(mockPickupExperienceApi.updatePickup).toHaveBeenCalledWith("pickup2", {
      name: "Pickup 2",
      supplier_id: newSupplierId,
    });
  });

  it("it should not trigger pickup updates if there are no pickups", async () => {
    mockOfferServiceApi.getOptions.mockResolvedValue({ data: [] });

    const experienceId = "exp123";
    const newSupplierId = "supplier";

    await updateSupplierIdForPickups(experienceId, newSupplierId);

    expect(mockOfferServiceApi.getOptions).toHaveBeenCalledWith(experienceId);
    expect(mockPickupExperienceApi.getPickupsByOptionId).not.toHaveBeenCalled();
    expect(mockPickupExperienceApi.updatePickup).not.toHaveBeenCalled();
  });
});
