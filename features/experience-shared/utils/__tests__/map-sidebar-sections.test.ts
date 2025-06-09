import { describe, expect, it, test } from "vitest";
import { createField, mapSidebarSections } from "../map-sidebar-sections";
import { fieldValidator } from "@/utils/field-validator";

describe("mapSidebarSections", () => {
  test("it should map correctly the sections", () => {
    const mappedSections = mapSidebarSections({
      requiredSectionCompleted: {
        url: `section1/url`,
        icon: "options",
        noDropdown: true,
        fields: [
          {
            id: "field-1",
            required: false,
            filled: false,
          },
          {
            id: "field-2",
            required: true,
            filled: true,
          },
          {
            id: "field-3",
            required: true,
            filled: true,
          },
        ],
      },
      requiredSectionNotCompleted: {
        url: `section1/url`,
        icon: "options",
        disabledBy: ["requiredSectionCompleted"],
        fields: [
          {
            id: "field-1",
            required: false,
            filled: false,
          },
          {
            id: "field-2",
            required: true,
            filled: true,
          },
          {
            id: "field-3",
            required: true,
            filled: false,
          },
        ],
      },
      nonRequiredSectionCompleted: {
        url: `section1/url`,
        icon: "options",
        disabledBy: ["requiredSectionNotCompleted"],
        fields: [
          {
            id: "field-1",
            required: false,
            filled: true,
          },
          {
            id: "field-2",
            required: false,
            filled: true,
          },
        ],
      },
      nonRequiredSectionNotCompleted: {
        url: `section1/url`,
        icon: "options",
        disabledBy: ["requiredSectionNotCompleted", "nonRequiredSectionCompleted"],
        fields: [
          {
            id: "field-1",
            required: false,
            filled: true,
          },
          {
            id: "field-2",
            required: false,
            filled: false,
          },
        ],
      },
      sectionHidden: {
        url: `section1/url`,
        icon: "options",
        fields: [],
        hide: true,
      },
    });

    // if one field in the section is required all the section must be required
    expect(mappedSections.requiredSectionCompleted.required).toBe(true);
    expect(mappedSections.requiredSectionNotCompleted.required).toBe(true);
    // if all the fields are not required the section is not required too
    expect(mappedSections.nonRequiredSectionCompleted.required).toBe(false);
    expect(mappedSections.nonRequiredSectionNotCompleted.required).toBe(false);

    // if the section is required only the required fields need be filled
    expect(mappedSections.requiredSectionCompleted.completed).toBe(true);
    expect(mappedSections.requiredSectionNotCompleted.completed).toBe(false);
    // if the section is not required all the fields need to be filled
    expect(mappedSections.nonRequiredSectionNotCompleted.completed).toBe(false);
    expect(mappedSections.nonRequiredSectionCompleted.completed).toBe(true);

    // if one ore more fields in the disabledBy property are not completed the section should be disabled
    expect(mappedSections.nonRequiredSectionNotCompleted.disabled).toBe(true);
    expect(mappedSections.nonRequiredSectionCompleted.disabled).toBe(true);
    expect(mappedSections.requiredSectionNotCompleted.disabled).toBe(false);

    // check the dropdown property
    expect(mappedSections.requiredSectionCompleted.dropdown).toBe(false);
    expect(mappedSections.requiredSectionNotCompleted.dropdown).toBe(true);

    // check the disabledBy property (should be the last section is disabled by)
    expect(mappedSections.nonRequiredSectionNotCompleted.disabledBy).toBe("nonRequiredSectionCompleted");
    expect(mappedSections.nonRequiredSectionCompleted.disabledBy).toBe("requiredSectionNotCompleted");
    expect(mappedSections.requiredSectionNotCompleted.disabledBy).toBe("requiredSectionCompleted");
  });

  test("it should not create the section if the hide property is true", () => {
    const mappedSections = mapSidebarSections({
      sectionHidden: {
        url: `section1/url`,
        icon: "options",
        fields: [],
        hide: true,
      },
      sectionNotHidden: {
        url: `section1/url`,
        icon: "options",
        fields: [],
        hide: false,
      },
    });
    expect(mappedSections.sectionNotHidden).toBeTruthy();
    expect(mappedSections.sectionHidden).toBeFalsy();
  });
});

describe("createField", () => {
  it("should create a field with default values", () => {
    const id = "test-id";
    const field = { required: true, filled: false, value: undefined };
    const result = createField(id, field);

    expect(result).toEqual({
      id: "test-id",
      required: true,
      filled: false,
      hide: false,
    });
  });

  it("should override the values if provided in provideValue", () => {
    const id = "test-id";
    const field = { required: true, value: "", hide: false };
    const provideValue = { hide: true, filled: true };

    const result = createField(id, field, provideValue);

    expect(result).toEqual({
      id: "test-id",
      required: true,
      filled: true,
      hide: true,
    });
  });

  it("should correctly use fieldValidator for filled property", () => {
    const id = "test-id";
    const field = { required: true, value: "123" };

    const result = createField(id, field);
    const validation = fieldValidator(field);

    expect(result).toEqual({
      id: "test-id",
      required: true,
      filled: validation,
      hide: false,
    });
  });

  it("should correctly use fieldValidator for not filled property", () => {
    const id = "test-id";
    const field = { required: true, value: [] };

    const result = createField(id, field);
    const validation = fieldValidator(field);

    expect(result).toEqual({
      id: "test-id",
      required: true,
      filled: validation,
      hide: false,
    });
  });
});
