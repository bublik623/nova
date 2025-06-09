import { describe, it, expect } from "vitest";
import { generateOfferExperiencePayload } from "../offer-experience-utils";
import { Experience as OfferExperience } from "@/types/generated/OfferServiceApiOld";
import { INSTANT_DURATION } from "@/constants/date.constants";

describe("generateOfferExperiencePayload", () => {
  it("should return updated fields when there are changes", () => {
    const getInitialFields = (): Partial<OfferExperience> => ({
      confirmation_time: "",
      cutoff_time: "",
      supplier: "supplier-id",
    });
    const mapFieldsToService = (): Partial<OfferExperience> => ({
      confirmation_time: "24H",
      cutoff_time: "12H",
      supplier: "new-supplier-id",
    });
    const getCutoffTime = () => "12H";
    const isInstantConfirmation = false;

    const result = generateOfferExperiencePayload(
      getInitialFields,
      mapFieldsToService,
      getCutoffTime,
      isInstantConfirmation
    );

    expect(result.payload).toEqual({
      confirmation_time: "24H",
      cutoff_time: "12H",
      supplier: "new-supplier-id",
    });
  });

  it("should return null when there are no changes", () => {
    const initialFields: Partial<OfferExperience> = {
      confirmation_time: "24H",
      cutoff_time: "12H",
    };
    const getInitialFields = () => initialFields;
    const mapFieldsToService = () => initialFields; // No changes
    const getCutoffTime = () => "12H";
    const isInstantConfirmation = false;

    const result = generateOfferExperiencePayload(
      getInitialFields,
      mapFieldsToService,
      getCutoffTime,
      isInstantConfirmation
    );

    expect(result.payload).toBeNull();
  });

  it("should override supplier ID if supplierIdOverride is provided", () => {
    const getInitialFields = (): Partial<OfferExperience> => ({
      confirmation_time: "24H",
      cutoff_time: "12H",
      supplier: "original-supplier-id",
    });
    const mapFieldsToService = (overrideSupplierId?: string): Partial<OfferExperience> => ({
      ...getInitialFields(),
      supplier: overrideSupplierId ? overrideSupplierId : "original-supplier-id",
    });
    const getCutoffTime = () => "12H";
    const isInstantConfirmation = false;
    const supplierIdOverride = "new-supplier-id";

    const result = generateOfferExperiencePayload(
      getInitialFields,
      mapFieldsToService,
      getCutoffTime,
      isInstantConfirmation,
      supplierIdOverride
    );

    expect(result.payload).toEqual({
      confirmation_time: "24H",
      cutoff_time: "12H",
      supplier: "new-supplier-id",
    });
  });

  describe("supplier ID changes", () => {
    it("should set isSupplierChanged as true when supplier ID is changed", () => {
      const getInitialFields = (): Partial<OfferExperience> => ({
        supplier: "original-supplier-id",
      });
      const mapFieldsToService = (): Partial<OfferExperience> => ({
        supplier: "new-supplier-id",
      });
      const result = generateOfferExperiencePayload(getInitialFields, mapFieldsToService, () => "12H", false, "24H");

      expect(result.isSupplierChanged).toBe(true);
    });

    it("should set isSupplierChanged as false when supplier ID is not changed", () => {
      const getInitialFields = (): Partial<OfferExperience> => ({
        supplier: "original-supplier-id",
      });
      const mapFieldsToService = (): Partial<OfferExperience> => ({
        supplier: "original-supplier-id",
      });
      const result = generateOfferExperiencePayload(getInitialFields, mapFieldsToService, () => "12H", false, "24H");

      expect(result.isSupplierChanged).toBe(false);
    });
  });

  describe("instant Confirmation changes", () => {
    it("should set confirmation_time to INSTANT_DURATION when instant confirmation is true", () => {
      const getInitialFields = (): Partial<OfferExperience> => ({
        confirmation_time: "",
        cutoff_time: "12H",
        supplier: "supplier-id",
      });
      const mapFieldsToService = (): Partial<OfferExperience> => ({
        confirmation_time: "24H",
        cutoff_time: "12H",
        supplier: "supplier-id",
      });
      const getCutoffTime = () => "12H";
      const isInstantConfirmation = true; // Instant confirmation is enabled

      const result = generateOfferExperiencePayload(
        getInitialFields,
        mapFieldsToService,
        getCutoffTime,
        isInstantConfirmation
      );

      expect(result.payload).toEqual({
        confirmation_time: INSTANT_DURATION,
        cutoff_time: "12H",
        supplier: "supplier-id",
      });
    });

    it("should use provided confirmation_time when instant confirmation is false", () => {
      const getInitialFields = (): Partial<OfferExperience> => ({
        confirmation_time: "",
        cutoff_time: "12H",
        supplier: "supplier-id",
      });
      const mapFieldsToService = (): Partial<OfferExperience> => ({
        confirmation_time: "24H",
        cutoff_time: "12H",
        supplier: "supplier-id",
      });
      const getCutoffTime = () => "12H";
      const isInstantConfirmation = false; // Instant confirmation is disabled

      const result = generateOfferExperiencePayload(
        getInitialFields,
        mapFieldsToService,
        getCutoffTime,
        isInstantConfirmation
      );

      expect(result.payload).toEqual({
        confirmation_time: "24H", // Confirmation time should match the provided value
        cutoff_time: "12H",
        supplier: "supplier-id",
      });
    });
  });
});
