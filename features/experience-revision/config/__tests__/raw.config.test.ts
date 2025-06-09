import { describe, test, expect } from "vitest";
import RevisionSettingsForm from "../../components/RevisionSettingsForm.vue";
import RevisionLocationForm from "../../components/RevisionLocationForm.vue";
import RevisionContentSegmentationForm from "../../components/RevisionContentSegmentationForm.vue";
import RevisionCustomerInfoForm from "../../components/RevisionCustomerInfoForm.vue";
import RevisionRawAsterixIntegrationForm from "../../asterix-integration/raw/RevisionRawAsterixIntegrationForm.vue";
import { ExperienceRevision } from "../../types/revision";
import { getRawForms, getRawSections } from "../raw.config";

describe("getRawForms", () => {
  test("should return the correct forms", () => {
    const values: ExperienceRevision = {
      productType: "NOVA",
      title: "Test Title",
    };
    const options = {
      showNatGeoField: true,
    };
    const requiredFields = ["title"];

    const forms = getRawForms(values, options, requiredFields);

    expect(forms.settings.is).toBe(RevisionSettingsForm);
    expect(forms.settings.props.values).toBe(values);
    expect(forms.settings.props.options).toBe(options);
    expect(forms.settings.props.requiredFields).toBe(requiredFields);
    expect(forms.settings.props.flow).toBe("raw");

    expect(forms.location.is).toBe(RevisionLocationForm);
    expect(forms.location.props.values).toBe(values);
    expect(forms.location.props.options).toBe(options);
    expect(forms.location.props.requiredFields).toBe(requiredFields);

    expect(forms["content-segmentation"].is).toBe(RevisionContentSegmentationForm);
    expect(forms["content-segmentation"].props.values).toBe(values);
    expect(forms["content-segmentation"].props.options).toBe(options);
    expect(forms["content-segmentation"].props.requiredFields).toBe(requiredFields);

    expect(forms["customer-info"].is).toBe(RevisionCustomerInfoForm);
    expect(forms["customer-info"].props.values).toBe(values);
    expect(forms["customer-info"].props.options).toBe(options);
    expect(forms["customer-info"].props.requiredFields).toBe(requiredFields);

    expect(forms["asterix-integration"].is).toBe(RevisionRawAsterixIntegrationForm);
    expect(forms["asterix-integration"].props.values).toBe(values);
    expect(forms["asterix-integration"].props.options).toBe(options);
    expect(forms["asterix-integration"].props.requiredFields).toBe(requiredFields);
  });
});

describe("getCurationSections", () => {
  test("should return the correct sections", () => {
    const baseUrl = "/base-url";
    const values: ExperienceRevision = {
      productType: "NOVA",
      title: "Test Title",
      supplierName: "Test Supplier",
      externalReferenceCode: "Test Reference",
      experienceCategory: ["Category 1", "Category 2"],
      experienceInterest: ["Interest 1", "Interest 2"],
      promotionalOption: "Test Promotional Option",
      productBrand: "Test Brand",
      ownOffer: "Test Offer",
      location: {
        experience_id: "Test Experience ID",
        address: {
          city: "Test City",
          direction: "Test Address",
          country: "Test Country",
        },
      },
      meetingPointDetails: "Test Meeting Point",
      description: "Test Description",
      additionalDescription: "Test Additional Description",
      features: ["Feature 1", "Feature 2"],
      highlights: {
        custom: [
          {
            description: "Test Highlight Description",
            name: "Test Highlight Name",
            id: "Test Highlight ID",
            visualization_order: 1,
          },
        ],
        premade: [
          {
            id: "Test Premade ID",
            name: "Test Premade Name",
            visualization_order: 1,
          },
        ],
      },
      importantInformation: {
        custom: [
          {
            description: "Test Important Information Description",
            name: "Test Important Information Name",
            id: "Test Important Information ID",
            visualization_order: 1,
          },
        ],
        premade: [
          {
            id: "Test Premade ID",
            name: "Test Premade Name",
            visualization_order: 1,
          },
        ],
      },
      duration: ["Test Duration"],
      emergencyContact: {
        number: "Test Emergency Contact",
        country_calling_code: "Test Country Code",
      },
      voucherType: "MOBILE",
      infoVoucher: "Test Info Voucher",
    };

    const options = {
      showAdditionalDescription: true,
    };

    const sections = getRawSections(baseUrl, values, options);

    expect(sections).toEqual({
      settings: {
        url: "/base-url/settings",
        icon: "settings",
        id: "settings",
        required: true,
        completed: true,
        disabled: false,
        disabledBy: undefined,
        dropdown: true,
        fields: [
          { id: "title", required: true, filled: true },
          { id: "supplier_name", required: true, filled: true },
          { id: "external_reference_code", required: false, filled: true },
          { id: "categories", required: false, filled: true },
          { id: "promotional_options", required: false, filled: true },
          { id: "product_brand", required: false, filled: true },
          { id: "own_offer", required: false, filled: true },
        ],
      },
      location: {
        url: "/base-url/location",
        icon: "location",
        id: "location",
        required: true,
        completed: true,
        disabled: false,
        disabledBy: undefined,
        dropdown: true,
        fields: [
          { id: "location.city", required: true, filled: true },
          { id: "location.address", required: false, filled: true },
          { id: "location.meeting-point", required: false, filled: true },
        ],
      },
      "content-segmentation": {
        url: "/base-url/content-segmentation",
        icon: "content-generation",
        id: "content-segmentation",
        required: true,
        completed: false,
        disabled: false,
        disabledBy: undefined,
        dropdown: true,
        fields: [
          { id: "description", required: true, filled: true },
          { id: "additional_description", required: false, filled: true, hide: true },
          { id: "features", required: false, filled: true },
          { id: "highlights", required: true, filled: true },
          { id: "included", required: true, filled: false },
          { id: "non_included", required: false, filled: false },
          { id: "important_information", required: false, filled: true },
          { id: "duration", required: true, filled: true },
        ],
      },
      "customer-info": {
        url: "/base-url/customer-info",
        icon: "customer-info",
        id: "customer-info",
        required: true,
        completed: true,
        disabled: false,
        disabledBy: undefined,
        dropdown: true,
        fields: [
          { id: "emergency_contact", required: false, filled: true },
          { id: "voucher_type", required: true, filled: true },
          { id: "info_voucher", required: false, filled: true },
        ],
      },
    });
  });
});
