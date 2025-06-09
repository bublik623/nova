import { describe, expect, it } from "vitest";
import { getChangedValues } from "../get-changed-values";

describe("getChangedValues", () => {
  it("should return updated values", () => {
    const originalData = {
      functional: {
        highlights: ["1", "2"],
      },
      commercial: {
        title: "",
      },
    };

    const updatedData = {
      functional: {
        highlights: ["updated_highlights"],
      },
      commercial: {
        title: "updated_title",
      },
    };

    const result = getChangedValues(originalData, updatedData);

    expect(result).toEqual({
      functional: {
        highlights: ["updated_highlights"],
      },
      commercial: {
        title: "updated_title",
      },
    });
  });

  it("should return added values", () => {
    const originalData = {
      functional: {
        id: "",
      },
    };

    const updatedData = {
      functional: {
        highlights: ["updated_highlights"],
      },
    };

    const result = getChangedValues(originalData, updatedData);

    expect(result).toEqual({
      functional: {
        highlights: ["updated_highlights"],
      },
    });
  });

  it("should return an empty object if properties are removed from updatedData", () => {
    const originalData = {
      functional: {
        asterix_id: "",
        highlights: ["1", "2"],
      },
    };

    const updatedData = {
      functional: {
        asterix_id: "",
      },
    };

    const result = getChangedValues(originalData, updatedData);

    expect(result).toEqual({});
  });

  it("should remove items from array", () => {
    const originalData = {
      functional: {
        highlights: ["1", "2", "3"],
      },
    };

    const updatedData = {
      functional: {
        highlights: ["2"],
      },
    };

    const result = getChangedValues(originalData, updatedData);

    expect(result).toEqual({
      functional: {
        highlights: ["2"],
      },
    });
  });

  it("should reflect changes in array items", () => {
    const originalData = {
      functional: {
        highlights: ["1", "2"],
      },
    };

    const updatedData = {
      functional: {
        highlights: ["one", "two"],
      },
    };

    const result = getChangedValues(originalData, updatedData);

    expect(result).toEqual({
      functional: {
        highlights: ["one", "two"],
      },
    });
  });

  it("should return an empty object if no changes are made to the original data", () => {
    const originalData = {
      supplier_id: "",
      functional: {
        asterix_id: "",
        highlights: ["1", "2"],
      },
      commercial: {
        title: "",
      },
    };

    const updatedData = {
      supplier_id: "",
      functional: {
        asterix_id: "",
        highlights: ["1", "2"],
      },
      commercial: {
        title: "",
      },
    };

    const result = getChangedValues(originalData, updatedData);

    expect(result).toEqual({});
  });
});
