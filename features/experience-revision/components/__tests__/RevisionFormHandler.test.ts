import { mount } from "@vue/test-utils";
import { describe, expect, vi, test } from "vitest";
import RevisionFormHandler from "../RevisionFormHandler.vue";

const mockRawForm = () => h("myCustomComponent", "settings raw form");
const mockRawFormProps = { test: 123 };

const getRawFormsMock = {
  settings: {
    is: mockRawForm,
    props: mockRawFormProps,
  },
};

vi.mock("@/features/experience-revision/config/raw.config", () => ({
  getRawForms: () => getRawFormsMock,
}));

const mockCurationForm = () => h("myCustomComponent", "settings curation form");
const mockCurationFormProps = { test: 123 };

const getCurationFormsMock = {
  settings: {
    is: mockCurationForm,
    props: mockCurationFormProps,
  },
};

vi.mock("@/features/experience-revision/config/curation.config", () => ({
  getCurationForms: () => getCurationFormsMock,
}));

const mockTranslationForm = () => h("myCustomComponent", "settings translation form");
const mockTranslationProps = { test: 345 };

const getTranslationFormsMock = {
  settings: {
    is: mockTranslationForm,
    props: mockTranslationProps,
  },
};

vi.mock("@/features/experience-revision/config/translation.config", () => ({
  getTranslationForms: () => getTranslationFormsMock,
}));

const mockMediaForm = () => h("myCustomComponent", "settings media form");
const mockMediaProps = { test: 345 };

const getMediaFormsMock = {
  visuals: {
    is: mockMediaForm,
    props: mockMediaProps,
  },
};

vi.mock("@/features/experience-revision/config/media.config", () => ({
  getMediaForms: () => getMediaFormsMock,
}));

const revisionStoreMock = vi.hoisted(() =>
  vi.fn(() => ({
    flowCode: "curation",
    statusCode: "DRAFT",
    refCode: "REF123",
    revisionDate: "2021-09-01",
    tabLabel: "Test Tab",
    sideBarConfig: { items: [] },
    curationValues: {},
    curationOptions: {},
  }))
);

vi.mock("@/features/experience-revision/store/useRevisionStore", () => ({
  useRevisionStore: revisionStoreMock,
}));

describe("RevisionFormHandler", () => {
  test("it renders the form component that matches the configuration in raw flow", () => {
    const wrapper = mount(RevisionFormHandler, {
      props: {
        flow: "raw",
        form: "settings",
        language: "en",
      },
    });

    const formComponent = wrapper.findComponent(mockRawForm);

    expect(formComponent.exists()).toBe(true);
    expect(formComponent.getCurrentComponent()?.props).toEqual(mockRawFormProps);
  });
  test("it renders the form component that matches the configuration in curation flow", () => {
    const wrapper = mount(RevisionFormHandler, {
      props: {
        flow: "curation",
        form: "settings",
        language: "en",
      },
    });

    const formComponent = wrapper.findComponent(mockCurationForm);

    expect(formComponent.exists()).toBe(true);
    expect(formComponent.getCurrentComponent()?.props).toEqual(mockCurationFormProps);
  });

  test("it renders the form component that matches the configuration in translation flow", () => {
    const wrapper = mount(RevisionFormHandler, {
      props: {
        flow: "translation",
        form: "settings",
        language: "es",
      },
    });

    const formComponent = wrapper.findComponent(mockTranslationForm);

    expect(formComponent.exists()).toBe(true);
    expect(formComponent.getCurrentComponent()?.props).toEqual(mockTranslationProps);
  });

  test("it renders the form component that matches the configuration in media flow", () => {
    const wrapper = mount(RevisionFormHandler, {
      props: {
        flow: "media",
        form: "visuals",
        language: "en",
      },
    });

    const formComponent = wrapper.findComponent(mockMediaForm);

    expect(formComponent.exists()).toBe(true);
    expect(formComponent.getCurrentComponent()?.props).toEqual(mockMediaProps);
  });

  test("it throws an error if the form is not found", () => {
    const wrapperFn = () =>
      mount(RevisionFormHandler, {
        props: {
          flow: "curation",
          form: "invalidForm",
          language: "en",
        },
      });

    expect(wrapperFn).toThrowError("Could not get form component: invalidForm");
  });

  test("it throws an error if the flow is not found", () => {
    const wrapperFn = () =>
      mount(RevisionFormHandler, {
        props: {
          flow: "invalidFlow",
          form: "settings",
          language: "en",
        },
      });

    expect(wrapperFn).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "received": "invalidFlow",
          "code": "invalid_enum_value",
          "options": [
            "raw",
            "curation",
            "translation",
            "media"
          ],
          "path": [],
          "message": "Invalid enum value. Expected 'raw' | 'curation' | 'translation' | 'media', received 'invalidFlow'"
        }
      ]]
    `);
  });
});
