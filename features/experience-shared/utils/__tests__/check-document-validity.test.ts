import { describe, expect, test } from "vitest";
import { MappedCategory } from "@/types/DocumentSidebar";
import { checkDocumentValidity } from "../check-document-validity";

describe("checkDocumentValidity", () => {
  test("should return true if all required fields are filled", () => {
    const documentSections: { [key: string]: MappedCategory } = {
      section: {
        id: "section1",
        url: "/section1",
        disabled: false,
        fields: [
          {
            id: "field1",
            title: "Field 1",
            required: true,
            filled: true,
          },
          {
            id: "field2",
            title: "Field 2",
            required: true,
            filled: true,
          },
          {
            id: "field2",
            title: "Field 2",
            required: false,
            filled: false,
          },
        ],
        required: true,
        completed: true,
        icon: "your-icon",
        disabledBy: "",
        dropdown: false,
      },
    };

    const isValid = checkDocumentValidity(documentSections);

    expect(isValid).toBe(true);
  });

  test("should return false if a required field is not filled", () => {
    const documentSections: { [key: string]: MappedCategory } = {
      section1: {
        id: "section1",
        url: "/section1",
        disabled: false,
        fields: [
          {
            id: "field1",
            title: "Field 1",
            required: true,
            filled: true,
          },
          {
            id: "field2",
            title: "Field 2",
            required: true,
            filled: false, // required field not filled
          },
        ],
        required: true,
        completed: false,
        icon: "your-icon",
        disabledBy: "",
        dropdown: false,
      },
    };

    const isValid = checkDocumentValidity(documentSections);

    expect(isValid).toBe(false);
  });
});
