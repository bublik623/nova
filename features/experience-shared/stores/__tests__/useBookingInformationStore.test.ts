import { describe, expect, test, vi } from "vitest";
import { createPinia } from "pinia";
import { ExperienceBookingInformation } from "@/types/generated/MetadataExperiencesApi";
import { useBookingInformationStore } from "../useBookingInformationStore";
import { hasPermission } from "@/features/roles/lib/has-permission";

vi.mock("@/features/roles/lib/has-permission");
const hasPermissionMock = vi.mocked(hasPermission);

hasPermissionMock.mockImplementation(() => true);

const metadataServiceMock = {
  updateBookingInfo: vi.fn(),
  createBookingInfo: vi.fn(),
  getBookingInfo: vi.fn(),
};

vi.mock("@/composables/useMetadataExperienceApi.ts", () => ({
  useMetadataExperienceApi: () => metadataServiceMock,
}));

const mockBookingInfo: ExperienceBookingInformation[] = [
  {
    id: "test-id",
    booking_information: {
      voucher_type: "PRINTED",
    },
    experience_id: "random-experience-id",
  },
];

describe("useBookingInformationStore", () => {
  describe("loadBookingInfo", () => {
    test("it should get the booking info", async () => {
      metadataServiceMock.getBookingInfo = vi.fn().mockResolvedValueOnce({
        data: { ...mockBookingInfo },
      });

      const pinia = createPinia();
      const store = useBookingInformationStore(pinia);

      await store.loadBookingInfo("random-experience-id");

      expect(store.bookingInfoFields.voucher_type.value).toBe(mockBookingInfo[0].booking_information.voucher_type);
    });

    test("if the entity in the metadata service not exist, it should do a POST", async () => {
      metadataServiceMock.getBookingInfo = vi.fn().mockResolvedValue({
        data: [undefined],
      });
      metadataServiceMock.createBookingInfo = vi.fn().mockResolvedValue({
        headers: { location: "/asd/12345" },
      });
      const pinia = createPinia();
      const store = useBookingInformationStore(pinia);

      await store.loadBookingInfo("random-experience-id");
      expect(metadataServiceMock.createBookingInfo).toBeCalledWith({
        booking_information: {
          voucher_type: "MOBILE",
        },
        experience_id: "random-experience-id",
      });
      expect(store.bookingInfoFields.voucher_type.value).toBe("MOBILE");

      // checking if the id is saved correctly in the store
      // and checking the saveBookingInfo at the same time
      store.bookingInfoFields.voucher_type.value = "PRINTED";
      await store.saveBookingInfo("random-experience-id");
      expect(metadataServiceMock.updateBookingInfo).toBeCalledWith("12345", {
        booking_information: {
          voucher_type: "PRINTED",
          emergency_contact_number: {
            country_calling_code: "",
            number: "",
          },
        },
        experience_id: "random-experience-id",
      });
    });

    test("if entity does not exist, and the user does not have the permission, it shouldn't POST", async () => {
      metadataServiceMock.getBookingInfo = vi.fn().mockResolvedValue({
        data: [undefined],
      });
      metadataServiceMock.createBookingInfo = vi.fn().mockResolvedValue({
        headers: { location: "/asd/12345" },
      });
      hasPermissionMock.mockImplementationOnce(() => false);

      const pinia = createPinia();
      const store = useBookingInformationStore(pinia);

      await store.loadBookingInfo("random-experience-id");
      expect(metadataServiceMock.createBookingInfo).not.toBeCalled();
      expect(store.bookingInfoFields.voucher_type.value).toBe("MOBILE");
    });
  });

  describe("initFields", () => {
    test("initFields should initialize the fields with the data", async ({ expect }) => {
      const pinia = createPinia();
      const store = useBookingInformationStore(pinia);
      store.initFields({
        emergency_contact_number: { country_calling_code: "90", number: "5459991122" },
        voucher_type: "MOBILE",
      });
      expect(store.bookingInfoFields.voucher_type.value).toBe("MOBILE");
      expect(store.bookingInfoFields.emergency_contact.value).toEqual({
        country_calling_code: "90",
        number: "5459991122",
      });
    });
  });

  describe("getBookingInfoPayload", () => {
    test("getBookingInfoPayload should return the default payload", () => {
      const pinia = createPinia();
      const store = useBookingInformationStore(pinia);
      const payload = store.getBookingInfoPayload();
      expect(payload).toEqual({
        booking_information: {
          voucher_type: "MOBILE",
          emergency_contact_number: {
            country_calling_code: "",
            number: "",
          },
        },
      });
    });
    test("getBookingInfoPayload should return the payload with emergency_contact_number", () => {
      const pinia = createPinia();
      const store = useBookingInformationStore(pinia);
      store.initFields({
        emergency_contact_number: { country_calling_code: "90", number: "5459991122" },
        voucher_type: "MOBILE",
      });
      const payload = store.getBookingInfoPayload();
      expect(payload).toEqual<Partial<ExperienceBookingInformation>>({
        booking_information: {
          voucher_type: "MOBILE",
          emergency_contact_number: {
            country_calling_code: "90",
            number: "5459991122",
          },
        },
      });
    });
  });
});
