import { afterEach, describe, expect, test, vi } from "vitest";
import { useRevisionStore } from "../useRevisionStore";
import { createPinia } from "pinia";
import * as fetchRevisionByFlowObj from "@/features/experience-revision/lib/fetch-revision-by-flow";
import * as computeOptionsByFlowObj from "@/features/experience-revision/lib/compute-options-by-flow";
import * as getSidebarConfigObj from "@/features/experience-revision/lib/get-sidebar-config";
import { ExperienceRevision } from "../../types/revision";

const fetchRevisionByFlowSpy = vi.spyOn(fetchRevisionByFlowObj, "fetchRevisionByFlow");
const computeOptionsByFlowSpy = vi.spyOn(computeOptionsByFlowObj, "computeOptionsByFlow");
const getSidebarConfigSpy = vi.spyOn(getSidebarConfigObj, "getSidebarConfig");

const getParentMasterLanguageSnapshotMock = vi.hoisted(() => vi.fn());
vi.mock("@/features/experience-revision/lib/get-parent-master-language-snapshot", () => ({
  getParentMasterLanguageSnapshot: getParentMasterLanguageSnapshotMock,
}));

describe("useRevisionStore", () => {
  const pinia = createPinia();
  const storeFactory = () => useRevisionStore(pinia);
  let store: ReturnType<typeof storeFactory> | null = null;

  const mockRawValues: ExperienceRevision = {
    productType: "NOVA",
    revisionDate: "2021-10-01",
    refCode: "Test Ref Code",
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

  const mockCurationValues: ExperienceRevision = {
    productType: "NOVA",
    revisionDate: "2021-10-01",
    refCode: "Test Ref Code",
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

  const mockTranslationValues: ExperienceRevision = {
    productType: "NOVA",
    revisionDate: "2021-10-01",
    refCode: "Test Ref Code but in Spanish",
    title: "Test Title but in Spanish",
    supplierName: "Test Supplier but in Spanish",
    externalReferenceCode: "Test Reference but in Spanish",
    seoTitle: "Test SEO Title but in Spanish",
    experienceCategory: ["Category 1 but in Spanish", "Category 2 but in Spanish"],
    experienceInterest: ["Interest 1 but in Spanish", "Interest 2 but in Spanish"],
    promotionalOption: "Test Promotional Option but in Spanish",
    productBrand: "Test Brand but in Spanish",
    ownOffer: "Test Offer but in Spanish",
    location: {
      experience_id: "Test Experience ID but in Spanish",
      address: {
        city: "Test City but in Spanish",
        direction: "Test Address but in Spanish",
        country: "Test Country but in Spanish",
      },
    },
    meetingPointDetails: "Test Meeting Point but in Spanish",
    description: "Test Description but in Spanish",
    seoDescription: "Test SEO Description but in Spanish",
    additionalDescription: "Test Additional Description but in Spanish",
    features: ["Feature 1 but in Spanish", "Feature 2 but in Spanish"],
    highlights: {
      custom: [
        {
          description: "Test Highlight Description but in Spanish",
          name: "Test Highlight Name but in Spanish",
          id: "Test Highlight ID but in Spanish",
          visualization_order: 1,
        },
      ],
      premade: [
        {
          id: "Test Premade ID but in Spanish",
          name: "Test Premade Name but in Spanish",
          visualization_order: 1,
        },
      ],
    },
    importantInformation: {
      custom: [
        {
          description: "Test Important Information Description but in Spanish",
          name: "Test Important Information Name but in Spanish",
          id: "Test Important Information ID but in Spanish",
          visualization_order: 1,
        },
      ],
      premade: [
        {
          id: "Test Premade ID but in Spanish",
          name: "Test Premade Name but in Spanish",
          visualization_order: 1,
        },
      ],
    },
    duration: ["Test Duration but in Spanish"],
    markets: ["Market 1 but in Spanish", "Market 2 but in Spanish"],
    emergencyContact: {
      number: "Test Emergency Contact but in Spanish",
      country_calling_code: "Test Country Code but in Spanish",
    },
    voucherType: "MOBILE",
    infoVoucher: "Test Info Voucher but in Spanish",
  };

  const mockNonDefaultOptions = {
    showAsterix: true,
    showNatGeoField: true,
  };

  const mockTranslationOptions = {
    showAsterix: false,
    showNatGeoField: false,
  };

  const mockSidebarConfig = {
    sections: [
      {
        id: "section-1",
        title: "Section 1",
        fields: [
          {
            id: "field-1",
            title: "Field 1",
            type: "text",
          },
        ],
      },
    ],
  };

  afterEach(() => {
    store = storeFactory();
    vi.resetAllMocks();
  });

  const experienceId = "123";
  const revisionId = "456";
  const masterLanguageRevisionId = "789";

  test('it sets up the store in the "raw" flow correctly', async () => {
    const language = "en";
    const flow = "raw";

    fetchRevisionByFlowSpy.mockImplementationOnce(() => Promise.resolve(mockRawValues));
    computeOptionsByFlowSpy.mockImplementationOnce(() => mockNonDefaultOptions);
    getSidebarConfigSpy.mockImplementationOnce(() => mockSidebarConfig as any);

    store = storeFactory();
    await store.loadRevision(language, flow, experienceId, revisionId);

    expect(fetchRevisionByFlowSpy).toHaveBeenCalledWith(language, flow, revisionId, experienceId);
    expect(computeOptionsByFlowSpy).toHaveBeenCalledWith(flow, mockRawValues);
    expect(getSidebarConfigSpy).toHaveBeenCalledWith(
      language,
      flow,
      experienceId,
      revisionId,
      mockCurationValues,
      mockNonDefaultOptions
    );

    expect(store.rawValues).toEqual(mockRawValues);
    expect(store.rawOptions).toEqual(mockNonDefaultOptions);

    expect(store.flowCode).toEqual(mockRawValues.flowCode);
    expect(store.statusCode).toEqual(mockRawValues.statusCode);
    expect(store.refCode).toEqual(mockRawValues.refCode);
    expect(store.revisionDate).toEqual(mockRawValues.revisionDate);
    expect(store.tabLabel).toMatchInlineSnapshot(`"[01/10/2021] Test Title"`);

    expect(store.sideBarConfig).toStrictEqual(mockSidebarConfig);
  });

  test("it sets up the store in the 'curation' flow correctly", async () => {
    const language = "en";
    const flow = "curation";

    fetchRevisionByFlowSpy.mockImplementationOnce(() => Promise.resolve(mockCurationValues));
    computeOptionsByFlowSpy.mockImplementationOnce(() => mockNonDefaultOptions);
    getSidebarConfigSpy.mockImplementationOnce(() => mockSidebarConfig as any);

    store = storeFactory();
    await store.loadRevision(language, flow, experienceId, revisionId);

    expect(fetchRevisionByFlowSpy).toHaveBeenCalledWith(language, flow, revisionId, experienceId);
    expect(computeOptionsByFlowSpy).toHaveBeenCalledWith(flow, mockCurationValues);
    expect(getSidebarConfigSpy).toHaveBeenCalledWith(
      language,
      flow,
      experienceId,
      revisionId,
      mockCurationValues,
      mockNonDefaultOptions
    );

    expect(store.curationValues).toEqual(mockCurationValues);
    expect(store.curationOptions).toEqual(mockNonDefaultOptions);

    expect(store.flowCode).toEqual(mockCurationValues.flowCode);
    expect(store.statusCode).toEqual(mockCurationValues.statusCode);
    expect(store.refCode).toEqual(mockCurationValues.refCode);
    expect(store.revisionDate).toEqual(mockCurationValues.revisionDate);
    expect(store.tabLabel).toMatchInlineSnapshot(`"[01/10/2021] Test Title"`);

    expect(store.sideBarConfig).toStrictEqual(mockSidebarConfig);
  });

  test("it sets up the store in the 'translation' flow correctly", async () => {
    const language = "es";
    const flow = "translation";

    // Mock the implementation twice
    getParentMasterLanguageSnapshotMock.mockResolvedValueOnce({
      id: masterLanguageRevisionId,
    });
    fetchRevisionByFlowSpy.mockImplementationOnce(() => Promise.resolve(mockTranslationValues));
    fetchRevisionByFlowSpy.mockImplementationOnce(() => Promise.resolve(mockCurationValues));
    computeOptionsByFlowSpy.mockImplementationOnce(() => mockTranslationOptions);
    getSidebarConfigSpy.mockImplementationOnce(() => mockSidebarConfig as any);

    store = storeFactory();
    await store.loadRevision(language, flow, experienceId, revisionId);

    expect(getParentMasterLanguageSnapshotMock).toHaveBeenCalledWith(experienceId, revisionId);
    expect(fetchRevisionByFlowSpy).toHaveBeenNthCalledWith(1, language, flow, revisionId, experienceId);
    expect(fetchRevisionByFlowSpy).toHaveBeenNthCalledWith(2, "en", "curation", masterLanguageRevisionId, experienceId);
    expect(computeOptionsByFlowSpy).toHaveBeenNthCalledWith(1, flow, mockTranslationValues);
    expect(computeOptionsByFlowSpy).toHaveBeenNthCalledWith(2, "curation", mockCurationValues);

    expect(getSidebarConfigSpy).toHaveBeenCalledWith(
      language,
      flow,
      experienceId,
      revisionId,
      mockTranslationValues,
      mockTranslationOptions
    );

    expect(store.translationRevision).toEqual(mockTranslationValues);
    expect(store.translationOptions).toEqual(mockTranslationOptions);

    expect(store.curationValues).toEqual(mockCurationValues);
    expect(store.curationOptions).toBe(undefined);

    expect(store.flowCode).toEqual(mockTranslationValues.flowCode);
    expect(store.statusCode).toEqual(mockTranslationValues.statusCode);
    expect(store.refCode).toEqual(mockTranslationValues.refCode);
    expect(store.revisionDate).toEqual(mockTranslationValues.revisionDate);
    expect(store.tabLabel).toMatchInlineSnapshot(`"[01/10/2021] Test Title but in Spanish"`);

    expect(store.sideBarConfig).toStrictEqual(mockSidebarConfig);
  });

  test("it throws an error when no parent master language snapshot can be found", async () => {
    const language = "es";
    const flow = "translation";

    getParentMasterLanguageSnapshotMock.mockResolvedValueOnce(undefined);

    store = storeFactory();
    await expect(() => store!.loadRevision(language, flow, experienceId, revisionId)).rejects.toThrowError(
      new Error(`can't find parent snapshot of snapshot '${revisionId}' for experience '${experienceId}'`)
    );
  });

  test("it sets up the store in the media flow correctly", async () => {
    const mockMediaValues = mockCurationValues;
    const language = "en";
    const flow = "media";

    fetchRevisionByFlowSpy.mockImplementationOnce(() => Promise.resolve(mockMediaValues));
    computeOptionsByFlowSpy.mockImplementationOnce(() => mockNonDefaultOptions);
    getSidebarConfigSpy.mockImplementationOnce(() => mockSidebarConfig as any);

    store = storeFactory();
    await store.loadRevision(language, flow, experienceId, revisionId);

    expect(fetchRevisionByFlowSpy).toHaveBeenCalledWith(language, flow, revisionId, experienceId);
    expect(computeOptionsByFlowSpy).not.toHaveBeenCalled();
    expect(getSidebarConfigSpy).toHaveBeenCalledWith(language, flow, experienceId, revisionId, mockMediaValues, {});

    expect(store.mediaValues).toEqual(mockMediaValues);
    expect(store.mediaOptions).toEqual({});

    expect(store.flowCode).toEqual(mockMediaValues.flowCode);
    expect(store.statusCode).toEqual(mockMediaValues.statusCode);
    expect(store.refCode).toEqual(mockMediaValues.refCode);
    expect(store.revisionDate).toEqual(mockMediaValues.revisionDate);
    expect(store.tabLabel).toMatchInlineSnapshot(`"[01/10/2021] Test Title"`);

    expect(store.sideBarConfig).toStrictEqual(mockSidebarConfig);
  });

  test("it errors when the flow is not valid", async () => {
    store = storeFactory();
    expect(() => store?.loadRevision("en", "invalid-flow", "123", "456")).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "received": "invalid-flow",
          "code": "invalid_enum_value",
          "options": [
            "raw",
            "curation",
            "translation",
            "media"
          ],
          "path": [],
          "message": "Invalid enum value. Expected 'raw' | 'curation' | 'translation' | 'media', received 'invalid-flow'"
        }
      ]]
    `);
  });
});
