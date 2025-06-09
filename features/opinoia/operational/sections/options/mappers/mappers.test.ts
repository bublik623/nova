// option-api-adapter.test.ts
import { describe, expect, vi, beforeEach, test, Mock } from "vitest";
import { mapToNewOptionApiPayload, mapToExistingOptionApiPayload, mapToOptionPaxesApiPayload } from "./mappers";
import type { Option as DomainOption } from "../types";

vi.mock("@/utils/convert-duration", () => ({
  convertHoursToDuration: vi.fn(),
}));
const { convertHoursToDuration } = await import("@/utils/convert-duration");

describe("mappers", () => {
  const mockExperienceId = "exp_12345";

  const baseDomainOption: DomainOption = {
    id: "opt_67890",
    title: "Standard Test Option",
    code: "STD_OPT_001",
    duration: 2,
    paxTypes: ["ADULT", "CHILD"],
    subchannels: "all",
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("mapToNewOptionApiPayload", () => {
    const newOptionInput: DomainOption = {
      ...baseDomainOption,
    };

    test("should correctly map basic fields and apply defaults from a valid Option", () => {
      const mockedDurationOutput = "MOCKED_DURATION_FOR_3_HOURS";
      (convertHoursToDuration as Mock).mockReturnValueOnce(mockedDurationOutput);

      const result = mapToNewOptionApiPayload(mockExperienceId, newOptionInput);

      expect(result.name).toBe(newOptionInput.title);
      expect(result.code).toBe(newOptionInput.code);
      expect(result.experience).toBe(mockExperienceId);
      expect(result.duration).toBe(mockedDurationOutput);
      expect(result.capacity_type).toBe("shared");
      expect(result.multilanguage).toBe(false);
      expect(result.pricing_type_allowed).toBe("person");
      expect(result).not.toHaveProperty("id");
      expect(convertHoursToDuration).toHaveBeenCalledWith(newOptionInput.duration);
    });

    test("should remove the code property if input code is an empty string", () => {
      const optionWithEmptyCode: DomainOption = { ...newOptionInput, code: "" };

      const result = mapToNewOptionApiPayload(mockExperienceId, optionWithEmptyCode);
      expect(result).not.toHaveProperty("code");
    });

    test("should remove the code property if input code is null", () => {
      const optionWithNullCode: DomainOption = {
        ...newOptionInput,
        code: null as unknown as string,
      };

      const result = mapToNewOptionApiPayload(mockExperienceId, optionWithNullCode);
      expect(result).not.toHaveProperty("code");
    });

    test("should set duration to undefined if input duration is undefined", () => {
      const optionWithNoDuration: DomainOption = { ...newOptionInput, duration: undefined };

      const result = mapToNewOptionApiPayload(mockExperienceId, optionWithNoDuration);

      expect(result.duration).toBeUndefined();
      expect(convertHoursToDuration).not.toHaveBeenCalled();
    });
  });

  describe("mapToExistingOptionApiPayload", () => {
    const editedOptionInput: DomainOption = {
      ...baseDomainOption,
    };

    test("should correctly map fields, include ID, and apply defaults", () => {
      const mockedDurationOutput = "MOCKED_DURATION_FOR_4.75_HOURS";
      (convertHoursToDuration as Mock).mockReturnValueOnce(mockedDurationOutput);

      const result = mapToExistingOptionApiPayload(mockExperienceId, editedOptionInput);

      expect(result.id).toBe(editedOptionInput.id);
      expect(result.name).toBe(editedOptionInput.title);
      expect(result.code).toBe(editedOptionInput.code);
      expect(result.experience).toBe(mockExperienceId);
      expect(result.duration).toBe(mockedDurationOutput);
      expect(result.capacity_type).toBe("shared");
      expect(result.multilanguage).toBe(false);
      expect(result.pricing_type_allowed).toBe("person");
      expect(convertHoursToDuration).toHaveBeenCalledWith(editedOptionInput.duration);
    });

    test("should remove code property if empty", () => {
      const optionWithEmptyCode: DomainOption = { ...editedOptionInput, code: "" };

      const result = mapToExistingOptionApiPayload(mockExperienceId, optionWithEmptyCode);

      expect(result).not.toHaveProperty("code");
    });

    test("should set duration to undefined if input duration is undefined", () => {
      const optionWithNoDuration: DomainOption = { ...editedOptionInput, duration: undefined };

      const result = mapToExistingOptionApiPayload(mockExperienceId, optionWithNoDuration);

      expect(result.duration).toBeUndefined();
      expect(convertHoursToDuration).not.toHaveBeenCalled();
    });
  });

  describe("mapToOptionPaxesApiPayload", () => {
    test('should return an empty pax_list when option.paxTypes is "all"', () => {
      const optionWithAllPaxes: DomainOption = {
        ...baseDomainOption,
        paxTypes: "all",
      };

      const result = mapToOptionPaxesApiPayload(optionWithAllPaxes);

      expect(result.option_id).toBe(optionWithAllPaxes.id);
      expect(result.pax_list).toEqual([]);
    });

    test("should map an array of paxType codes to pax_list objects", () => {
      const paxTypeCodes = ["ADULT", "CHILD", "INFANT"];
      const optionWithSpecificPaxes: DomainOption = {
        ...baseDomainOption,
        id: "opt_pax_specific_id",
        paxTypes: paxTypeCodes,
      };

      const result = mapToOptionPaxesApiPayload(optionWithSpecificPaxes);

      expect(result.option_id).toBe(optionWithSpecificPaxes.id);
      expect(result.pax_list).toEqual([{ pax_code: "ADULT" }, { pax_code: "CHILD" }, { pax_code: "INFANT" }]);
    });

    test("should return an empty pax_list when option.paxTypes is an empty array", () => {
      const optionWithEmptyPaxArray: DomainOption = {
        ...baseDomainOption,
        id: "opt_pax_empty_array_id",
        paxTypes: [],
      };

      const result = mapToOptionPaxesApiPayload(optionWithEmptyPaxArray);

      expect(result.option_id).toBe(optionWithEmptyPaxArray.id);
      expect(result.pax_list).toEqual([]);
    });
  });
});
