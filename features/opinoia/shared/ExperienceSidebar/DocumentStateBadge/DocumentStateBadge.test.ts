import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import DocumentStateBadge from "./DocumentStateBadge.vue";
import { DocumentType, DocumentState } from "../../types";

describe("DocumentStateBadge", () => {
  test.each<[DocumentType, string]>([
    ["OPERATIONAL", "pin"],
    ["RAW_COMMERCIAL", "flow-base"],
  ])("it display the icon of the document type %s", (documentType: DocumentType, expectedIconName: string) => {
    const wrapper = mount(DocumentStateBadge, {
      props: { documentType, documentState: "IN_CREATION" },
    });

    const icon = wrapper.findComponent({ name: "NovaIcon" });

    expect(icon.props()).toEqual(expect.objectContaining({ name: expectedIconName }));
  });

  test.each<[DocumentType, string]>([
    ["OPERATIONAL", "Operational"],
    ["RAW_COMMERCIAL", "Raw commercial"],
  ])("it display the name of the document type %s", (documentType: DocumentType, expectedDocumentTypeName: string) => {
    const wrapper = mount(DocumentStateBadge, {
      props: { documentType, documentState: "IN_CREATION" },
    });

    expect(wrapper.text()).toMatch(new RegExp(`^${expectedDocumentTypeName}`));
  });

  test.each([["IN_CREATION" as DocumentState, "In creation"]])(
    "it display the name of the state %s",
    (documentState: DocumentState, documentName: string) => {
      const wrapper = mount(DocumentStateBadge, { props: { documentType: "OPERATIONAL", documentState } });

      expect(wrapper.text()).toMatch(new RegExp(`${documentName}$`));
    }
  );
});
