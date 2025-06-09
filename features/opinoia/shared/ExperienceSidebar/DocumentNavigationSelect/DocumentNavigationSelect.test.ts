import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import DocumentNavigationSelect, { DocumentNavigationSelectProps } from "./DocumentNavigationSelect.vue";
import { BaseOption } from "@/types/Option";
import { DocumentType } from "../../types";

const routerMock = { push: vi.fn() };
vi.stubGlobal("useRouter", () => routerMock);

const experienceId = "exp-id";

describe("DocumentNavigationSelect", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("it display a Select input", () => {
    const wrapper = mount(DocumentNavigationSelect, { props: getProps() });

    const selectInput = wrapper.getComponent({ name: "NovaSelect" });

    expect(selectInput).toBeDefined();
  });

  test("it display an option for each of the experience documents", async () => {
    const expectedOptions: BaseOption<DocumentType>[] = [
      { value: "OPERATIONAL", label: "OPERATIONAL" },
      { value: "RAW_COMMERCIAL", label: "RAW_COMMERCIAL" },
    ];

    const wrapper = mount(DocumentNavigationSelect, { props: getProps() });

    const selectInput = wrapper.getComponent({ name: "NovaSelect" });

    expect(selectInput.props()).toEqual(
      expect.objectContaining({
        options: expectedOptions,
      })
    );
  });

  test.each<DocumentType>(["OPERATIONAL", "RAW_COMMERCIAL"])(
    "it select the option related with the active document",
    (activeDocumentType) => {
      const expectedSelectedOption: BaseOption<DocumentType> = {
        value: activeDocumentType,
        label: activeDocumentType,
      };

      const wrapper = mount(DocumentNavigationSelect, { props: getProps({ activeDocumentType }) });

      const selectInput = wrapper.getComponent({ name: "NovaSelect" });

      expect(selectInput.props()).toEqual(
        expect.objectContaining({
          selected: expectedSelectedOption,
        })
      );
    }
  );

  test.each<[DocumentType, DocumentType, string]>([
    ["OPERATIONAL", "RAW_COMMERCIAL", "/experience/exp-id/raw/settings"],
    ["RAW_COMMERCIAL", "OPERATIONAL", "/opinoia/exp-id/operational/configuration"],
  ])(
    "it navigates to the selected document when user select a different option",
    async (activeDocumentType, selectedDocumentType, expectedNavigation) => {
      const wrapper = mount(DocumentNavigationSelect, { props: getProps({ activeDocumentType }) });

      const selectInput = wrapper.getComponent({ name: "NovaSelect" });
      await selectInput.find("[data-testid='select-button']").trigger("click");
      await selectInput.find(`#option-list-item-${selectedDocumentType}`).trigger("click");

      expect(routerMock.push).toHaveBeenCalledWith(expectedNavigation);
    }
  );

  test("it does not navigate when the user click on the option related with the active document", async () => {
    const activeDocumentType: DocumentType = "OPERATIONAL";
    const wrapper = mount(DocumentNavigationSelect, { props: getProps({ activeDocumentType }) });

    const selectInput = wrapper.getComponent({ name: "NovaSelect" });
    await selectInput.find("[data-testid='select-button']").trigger("click");
    await selectInput.find(`#option-list-item-${activeDocumentType}`).trigger("click");

    expect(routerMock.push).not.toHaveBeenCalled();
  });
});

function getProps(override?: Partial<DocumentNavigationSelectProps>): DocumentNavigationSelectProps {
  return {
    experienceId,
    activeDocumentType: "OPERATIONAL",
    experienceDocuments: {
      OPERATIONAL: { type: "OPERATIONAL", state: "IN_CREATION" },
      RAW_COMMERCIAL: { type: "RAW_COMMERCIAL", state: "IN_CREATION" },
    },
    ...override,
  };
}
