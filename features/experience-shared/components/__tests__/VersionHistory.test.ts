import { config, shallowMount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { DocumentContentType } from "@/types/DocumentStatuses";
import VersionHistory from "../VersionHistory.vue";

const testId = "123";

config.global.mocks = {
  $t: (s: string) => s,
};

const useVersionHistoryStoreMock = {
  experienceFlow: DocumentContentType.RAW,
  setExperienceId: vi.fn(),
  setFlow: vi.fn(),
  history: {
    versions: [
      {
        snapshotId: "60ae2878-0626-430c-ad1c-cd798d978432",
        authorName: "unknown",
        date: "2024-04-11T11:13:50.475",
        flowCode: "BASE",
        statusCode: "SENT_TO_REVIEW",
        options: {
          shouldDisplayBadge: true,
        },
      },
      {
        snapshotId: "77e4ab26-496e-4e52-9527-7efe70d06e98",
        authorName: "unknown",
        date: "2024-04-11T11:10:34.992",
        flowCode: "BASE",
        statusCode: "SENT_TO_REVIEW",
      },
      {
        snapshotId: "b0413310-4bbc-4055-94e6-85dc91a34b5c",
        authorName: "unknown",
        date: "2024-04-11T10:38:44.99",
        flowCode: "BASE",
        statusCode: "UP_TO_DATE",
      },
      {
        snapshotId: "f1e4d7e7-1b3f-4b6a-9d2a-0c6b1f6b1e9c",
        authorName: "unknown",
        date: "2024-04-11T10:38:44.99",
        flowCode: "BASE",
        statusCode: "UP_TO_DATE",
      },
    ],
  },
  isFetching: false,
  shouldDisplayBadge: vi.fn(() => true),
};

vi.mock("@/features/experience-shared/stores/useVersionHistoryStore", () => ({
  useVersionHistoryStore: () => useVersionHistoryStoreMock,
}));

describe("VersionHistory", () => {
  const testCases = [
    [DocumentContentType.RAW],
    [DocumentContentType.EDITORIAL],
    [DocumentContentType.TRANSLATION],
    [DocumentContentType.MEDIA],
  ] as const;

  test.each(testCases)(
    "should setup the store and display the cards for the %s flow correctly",
    (documentContentType) => {
      const wrapper = shallowMount(VersionHistory, {
        props: {
          documentContentType,
          experienceId: testId,
        },
      });

      const items = wrapper.findAllComponents({
        name: "VersionHistoryVersionCard",
      });

      expect(useVersionHistoryStoreMock.setExperienceId).toHaveBeenCalledWith(testId);
      expect(useVersionHistoryStoreMock.setFlow).toHaveBeenCalledWith(documentContentType);

      expect(items.length).toBe(useVersionHistoryStoreMock.history.versions.length);

      items.map((item, index) => {
        expect(item.props("version")).toBe(useVersionHistoryStoreMock.history.versions[index]);
      });
    }
  );

  test("should display the current and latest published badges correctly", () => {
    const wrapper = shallowMount(VersionHistory, {
      props: {
        documentContentType: DocumentContentType.RAW,
        experienceId: testId,
      },
    });

    const items = wrapper.findAllComponents({
      name: "VersionHistoryVersionCard",
    });

    expect(items[0].props("showBadge")).toBe(true); // always render the most current
  });

  test("it should compute the correct currently active version", () => {
    const wrapper = shallowMount(VersionHistory, {
      props: {
        documentContentType: DocumentContentType.RAW,
        experienceId: testId,
        currentRevisionId: useVersionHistoryStoreMock.history.versions[0].snapshotId,
      },
    });

    const items = wrapper.findAllComponents({
      name: "VersionHistoryVersionCard",
    });

    expect(items[0].props("isActive")).toBe(true);
    expect(items[1].props("isActive")).toBe(false);
  });

  test("it should not display the open icon on the currently opened version", () => {
    const wrapper = shallowMount(VersionHistory, {
      props: {
        documentContentType: DocumentContentType.RAW,
        experienceId: testId,
        currentRevisionId: useVersionHistoryStoreMock.history.versions[0].snapshotId,
      },
    });

    const items = wrapper.findAllComponents({
      name: "VersionHistoryVersionCard",
    });

    expect(items[0].props("showActionView")).toBe(false);
    expect(items[1].props("showActionView")).toBe(true);
  });
});
