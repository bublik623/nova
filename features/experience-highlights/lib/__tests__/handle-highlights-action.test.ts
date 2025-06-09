import { describe, expect, test } from "vitest";
import { GenericHighlight, HighlightsKey } from "@/types/Highlights";
import { ManageableItemsActions } from "@/types/ManageableItems";
import { handleHighlightActions } from "../handle-highlights-action";
import { CustomHighlightOptions } from "../commit-custom-highlights";

const TEST_ID = "test-id";

const customHighlightOptions: CustomHighlightOptions = {
  curationFlowCode: "CURATION",
  toBeEditedStatusCode: "TO_BE_EDIT",
};

describe("handleHighlightsActions", () => {
  test("it parses all the actions correctly", () => {
    const noAction = handleHighlightActions(TEST_ID, "highlights", [mockGenericHighlight()], customHighlightOptions);

    expect(noAction).toEqual([]);
    const noop = handleHighlightActions(TEST_ID, "highlights", [mockGenericHighlight("NOOP")], customHighlightOptions);

    expect(noop).toEqual([]);

    const edit = handleHighlightActions(TEST_ID, "highlights", [mockGenericHighlight("EDIT")], customHighlightOptions);

    expect(edit).toEqual([
      {
        id: "id",
        endpoint: "custom-highlights",
        item: {
          experience_id: "test-id",
          language_code: "lang",
          flow_code: "CURATION",
          status_code: "TO_BE_EDIT",
          name: "name",
          visualization_order: 0,
          code: "code",
        },
        action: "put",
      },
    ]);

    const create = handleHighlightActions(
      TEST_ID,
      "highlights",
      [mockGenericHighlight("CREATE")],
      customHighlightOptions
    );

    expect(create).toEqual([
      {
        endpoint: "custom-highlights",
        item: {
          experience_id: "test-id",
          language_code: "lang",
          flow_code: "CURATION",
          status_code: "TO_BE_EDIT",
          name: "name",
          visualization_order: 0,
          code: "code",
        },
        action: "post",
      },
    ]);

    const del = handleHighlightActions(TEST_ID, "highlights", [mockGenericHighlight("DELETE")], customHighlightOptions);

    expect(del).toEqual([
      {
        id: "id",
        endpoint: "custom-highlights",
        action: "del",
      },
    ]);
  });

  test("it handle errors correctly", () => {
    const editError = () =>
      handleHighlightActions(
        TEST_ID,
        "highlights",
        // @ts-expect-error expected error
        [{ ...mockGenericHighlight("EDIT"), id: undefined }],
        customHighlightOptions
      );

    expect(editError).toThrowError("Cannot edit a custom highlight that has no id!");

    const delError = () =>
      handleHighlightActions(
        TEST_ID,
        "highlights",
        // @ts-expect-error expected error
        [{ ...mockGenericHighlight("DELETE"), id: undefined }],
        customHighlightOptions
      );

    expect(delError).toThrowError("Cannot delete a custom highlight that has no id!");

    const defaultError = () =>
      handleHighlightActions(
        TEST_ID,
        "highlights",
        // @ts-expect-error expected error
        [mockGenericHighlight("no-action")],
        customHighlightOptions
      );

    expect(defaultError).toThrowError("Could not handle custom highlights action! Highlight id: id, action: no-action");

    const removeError = () =>
      handleHighlightActions(
        TEST_ID,
        "highlights",

        [mockGenericHighlight("REMOVE")],
        customHighlightOptions
      );

    expect(removeError).toThrowError("The REMOVE action must not be processed by the commit function. Id: id");
  });

  // it parses all the endpoints correctly
  test("it parses all the endpoints correctly", () => {
    const cases: [HighlightsKey, string][] = [
      ["highlights", "custom-highlights"],
      ["important_information", "custom-important-information"],
      ["included", "custom-included"],
      ["non_included", "custom-non-included"],
      ["important_information", "custom-important-information"],
    ];

    cases.forEach(([key, str]) => {
      expect(handleHighlightActions(TEST_ID, key, [mockGenericHighlight("EDIT")], customHighlightOptions)).toEqual([
        {
          id: "id",
          endpoint: str,
          item: {
            experience_id: "test-id",
            language_code: "lang",
            flow_code: "CURATION",
            status_code: "TO_BE_EDIT",
            name: "name",
            visualization_order: 0,
            code: "code",
          },
          action: "put",
        },
      ]);
    });

    const keyError = () =>
      handleHighlightActions(
        TEST_ID,
        // @ts-expect-error expected error
        "wrong-key",
        [mockGenericHighlight("EDIT")],
        customHighlightOptions
      );

    expect(keyError).toThrowError("Could not define api key for custom highlights! Requested key: wrong-key");
  });

  test("it orders correctly", () => {
    const ordering = handleHighlightActions(
      TEST_ID,
      "highlights",
      [
        mockGenericHighlight("NOOP"),
        mockGenericHighlight("EDIT"),
        mockGenericHighlight("CREATE"),
        mockGenericHighlight("DELETE"),
        mockGenericHighlight("NOOP"),
        mockGenericHighlight("EDIT"),
        mockGenericHighlight("CREATE"),
        mockGenericHighlight("DELETE"),
      ],
      customHighlightOptions
    );

    expect(ordering).toEqual([
      {
        id: "id",
        endpoint: "custom-highlights",
        item: {
          experience_id: "test-id",
          language_code: "lang",
          flow_code: "CURATION",
          status_code: "TO_BE_EDIT",
          name: "name",
          visualization_order: 1,
          code: "code",
        },
        action: "put",
      },
      {
        endpoint: "custom-highlights",
        item: {
          experience_id: "test-id",
          language_code: "lang",
          flow_code: "CURATION",
          status_code: "TO_BE_EDIT",
          name: "name",
          visualization_order: 2,
          code: "code",
        },
        action: "post",
      },
      {
        id: "id",
        endpoint: "custom-highlights",
        action: "del",
      },
      {
        id: "id",
        endpoint: "custom-highlights",
        item: {
          experience_id: "test-id",
          language_code: "lang",
          flow_code: "CURATION",
          status_code: "TO_BE_EDIT",
          name: "name",
          visualization_order: 4,
          code: "code",
        },
        action: "put",
      },
      {
        endpoint: "custom-highlights",
        item: {
          experience_id: "test-id",
          language_code: "lang",
          flow_code: "CURATION",
          status_code: "TO_BE_EDIT",
          name: "name",
          visualization_order: 5,
          code: "code",
        },
        action: "post",
      },
      {
        id: "id",
        endpoint: "custom-highlights",
        action: "del",
      },
    ]);
  });
});

function mockGenericHighlight(action?: ManageableItemsActions): GenericHighlight {
  return {
    id: "id",
    name: "name",
    visualization_order: 0,
    action,
    code: "code",
    description: "desc",
    language_code: "lang",
  };
}
