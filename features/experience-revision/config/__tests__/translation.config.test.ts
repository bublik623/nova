import { describe, expect, test } from "vitest";
import { getTranslationForms, getTranslationSections } from "../translation.config";
import { RevisionValues } from "../../types/revision";
import TranslationSettingsForm from "@/features/experience-translation/forms/TranslationSettingsForm.vue";
import TranslationLocationFormVue from "@/features/experience-translation/forms/TranslationLocationForm.vue";
import TranslationContentGenerationFormVue from "@/features/experience-translation/forms/TranslationContentGenerationForm.vue";
import TranslationCustomerInformationFormVue from "@/features/experience-translation/forms/TranslationCustomerInformationForm.vue";

describe("getTranslationForms", () => {
  test("should return the correct forms", () => {
    const language = "es";
    const values: RevisionValues = {
      title: "Test Title but in spanish",
      seoTitle: "Test SEO Title but in spanish",
    };

    const curationValues: RevisionValues = {
      title: "Test Title",
      seoTitle: "Test SEO Title",
    };

    const form = getTranslationForms(language, values, curationValues);

    expect(form.settings.is).toBe(TranslationSettingsForm);
    expect(form.settings.props).toMatchInlineSnapshot(`
      {
        "curationValues": {
          "seo_title": "Test SEO Title",
          "title": "Test Title",
        },
        "initialValues": {
          "seo_title": "Test SEO Title but in spanish",
          "title": "Test Title but in spanish",
        },
        "language": "es",
        "readonly": true,
      }
    `);

    expect(form.location.is).toBe(TranslationLocationFormVue);
    expect(form.location.props).toMatchInlineSnapshot(`
      {
        "curationValues": {
          "meeting_point_details": undefined,
        },
        "hasDiff": false,
        "initialValues": {
          "meeting_point_details": undefined,
        },
        "language": "es",
        "readonly": true,
      }
    `);

    expect(form["content-segmentation"].is).toBe(TranslationContentGenerationFormVue);
    expect(form["content-segmentation"].props).toMatchInlineSnapshot(`
      {
        "curationValues": {
          "custom_highlights": [],
          "custom_important_information": [],
          "custom_included": [],
          "custom_non_included": [],
          "premade_highlights": [],
          "premade_important_information": [],
          "premade_included": [],
          "premade_non_included": [],
          "seo_description": undefined,
          "text1": undefined,
          "text2": undefined,
        },
        "hasDiff": false,
        "initialValues": {
          "custom_highlights": [],
          "custom_important_information": [],
          "custom_included": [],
          "custom_non_included": [],
          "premade_highlights": [],
          "premade_important_information": [],
          "premade_included": [],
          "premade_non_included": [],
          "seo_description": undefined,
          "text1": undefined,
          "text2": undefined,
        },
        "language": "es",
        "readonly": true,
      }
    `);

    expect(form["customer-info"].is).toBe(TranslationCustomerInformationFormVue);
    expect(form["customer-info"].props).toMatchInlineSnapshot(`
      {
        "curationValues": {
          "info_voucher": undefined,
        },
        "hasDiff": false,
        "initialValues": {
          "info_voucher": undefined,
        },
        "language": "es",
        "readonly": true,
      }
    `);
  });
});

describe("getTranslationSections", () => {
  test("should return the correct sections", () => {
    const language = "es";
    const baseUrl = "/base-url";
    const values: RevisionValues = {
      title: "Test Title",
      supplierName: "Test Supplier",
      externalReferenceCode: "Test Reference",
      seoTitle: "Test SEO Title",
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
      seoDescription: "Test SEO Description",
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
      markets: ["Market 1", "Market 2"],
      emergencyContact: {
        number: "Test Emergency Contact",
        country_calling_code: "Test Country Code",
      },
      voucherType: "MOBILE",
      infoVoucher: "Test Info Voucher",
    };

    const sections = getTranslationSections(baseUrl, language, values);

    expect(sections).toMatchInlineSnapshot(`
      {
        "content-segmentation": {
          "completed": false,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": true,
          "fields": [
            {
              "filled": true,
              "id": "description",
              "required": true,
            },
            {
              "filled": true,
              "id": "seo_description",
              "required": true,
            },
            {
              "filled": true,
              "id": "additional_description",
              "required": false,
            },
            {
              "filled": true,
              "id": "highlights",
              "required": true,
            },
            {
              "filled": false,
              "id": "included",
              "required": true,
            },
            {
              "filled": false,
              "id": "non_included",
              "required": false,
            },
            {
              "filled": true,
              "id": "important_information",
              "required": false,
            },
          ],
          "icon": "content-generator",
          "id": "content-segmentation",
          "required": true,
          "url": "/base-url/es/content-segmentation",
        },
        "customer-info": {
          "completed": true,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": true,
          "fields": [
            {
              "filled": true,
              "id": "info_voucher",
              "required": false,
            },
          ],
          "icon": "customer-info",
          "id": "customer-info",
          "required": false,
          "url": "/base-url/es/customer-info",
        },
        "location": {
          "completed": true,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": true,
          "fields": [
            {
              "filled": true,
              "id": "meeting_point_details",
              "required": false,
            },
          ],
          "icon": "location",
          "id": "location",
          "required": false,
          "url": "/base-url/es/location",
        },
        "settings": {
          "completed": true,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": true,
          "fields": [
            {
              "filled": true,
              "id": "title",
              "required": true,
            },
            {
              "filled": true,
              "id": "seo_title",
              "required": false,
            },
          ],
          "icon": "settings",
          "id": "settings",
          "required": true,
          "url": "/base-url/es/settings",
        },
      }
    `);
  });
});
