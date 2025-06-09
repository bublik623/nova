import { beforeEach, describe, expect, test, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { VersionHistory, useVersionHistoryStore } from "../useVersionHistoryStore";
import { DocumentContentType } from "@/types/DocumentStatuses";
import { RawSnapshot } from "@/types/generated/ExperienceRawServiceApi";

const rawSnapshots: { data: RawSnapshot[] } = {
  data: [
    {
      id: "07d500d2-0c6e-452c-967e-d317e8295db4",
      snapshot_date: "2024-03-12T12:29:01.392",
      version_id: "v1",
      user_version: "unknown",
      raw: {
        experience_id: "77e6a67b-34f2-4af7-8876-19dfb24f9c7d",
        commercial: {
          title: "Title",
        },
        flow_code: "BASE",
        status_code: "UP_TO_DATE",
      },
    },
    {
      id: "51f590f0-8dac-42f3-a1e5-98430484e32c",
      snapshot_date: "2024-03-12T12:29:01.332",
      version_id: "v1",
      user_version: "unknown",
      raw: {
        experience_id: "9b1d7693-39e5-4476-917e-e7d138f76575",
        commercial: {
          title: "Title 2",
        },
        flow_code: "BASE",
        status_code: "UP_TO_DATE",
      },
    },
    {
      id: "51f590f0-8dac-42f3-a1e5-98430484e32c",
      snapshot_date: "2024-03-12T12:29:01.332",
      version_id: "v1",
      user_version: "unknown",
      raw: {
        experience_id: "9b1d7693-39e5-4476-917e-e7d138f76575",
        commercial: {
          title: "Title 2",
        },
        flow_code: "BASE",
        status_code: "UP_TO_DATE",
      },
    },
  ],
};
const expectedVersionHistoryFromRawSnapshots: VersionHistory = {
  versions: [
    {
      snapshotId: "07d500d2-0c6e-452c-967e-d317e8295db4",
      authorName: "unknown",
      date: "2024-03-12T12:29:01.392",
      flowCode: "BASE",
      statusCode: "UP_TO_DATE",
      options: {
        shouldDisplayBadge: true,
      },
    },
    {
      snapshotId: "51f590f0-8dac-42f3-a1e5-98430484e32c",
      authorName: "unknown",
      date: "2024-03-12T12:29:01.332",
      flowCode: "BASE",
      statusCode: "UP_TO_DATE",
      options: {
        shouldDisplayBadge: false,
      },
    },
    {
      snapshotId: "51f590f0-8dac-42f3-a1e5-98430484e32c",
      authorName: "unknown",
      date: "2024-03-12T12:29:01.332",
      flowCode: "BASE",
      statusCode: "UP_TO_DATE",
      options: {
        shouldDisplayBadge: false,
      },
    },
  ],
};

const translationSnapshot = {
  data: [
    {
      id: "050199b7-1ea8-4085-9264-7d0b53babf2c",
      user_version: "userqa",
      modified_by_user: "userqa",
      language_code: "es",
      status_code: "READY",
      flow_code: "CURATION",
      creation_date: "2024-03-12T12:29:01.336",
    },
    {
      id: "9a1ec73f-1ed6-4126-9e17-e59886adea09",
      user_version: "userqa",
      modified_by_user: "userqa",
      language_code: "es",
      status_code: "READY",
      flow_code: "MANUAL_TRANSLATION",
      creation_date: "2024-03-12T12:29:01.264",
    },
  ],
};

const mediaSnapshot = {
  data: [
    {
      creation_date: "2024-03-12T12:29:01.336",
      updated_date: "2024-03-12T12:29:01.336",
      id: "050199b7-1ea8-4085-9264-7d0b53babf2c",
      experience_id: "77e6a67b-34f2-4af7-8876-19dfb24f9c7d",
      supplier_id: "082d65c7-3d18-484b-9dc5-6e33ef73be49",
      version_id: "v4",
      version_status: "ACTIVE",
      user_version: "userqa",
      media: {
        status_code: "READY",
        flow_code: "MEDIA",
      },
    },
    {
      creation_date: "2024-03-12T12:29:01.264",
      updated_date: "2024-03-12T12:29:01.291",
      id: "9a1ec73f-1ed6-4126-9e17-e59886adea09",
      experience_id: "77e6a67b-34f2-4af7-8876-19dfb24f9c7d",
      short_reference_code: "EXP0044958",
      supplier_id: "082d65c7-3d18-484b-9dc5-6e33ef73be49",
      version_id: "v3",
      version_status: "ARCHIVED",
      user_version: "userqa",
      media: {
        status_code: "TO_BE_EDIT",
        flow_code: "MEDIA",
      },
    },
  ],
};
const expectedVersionHistoryFromSnapshots: VersionHistory = {
  versions: [
    {
      snapshotId: "050199b7-1ea8-4085-9264-7d0b53babf2c",
      authorName: "userqa",
      date: "2024-03-12T12:29:01.336",
      flowCode: "CURATION",
      statusCode: "READY",
      options: {
        shouldDisplayBadge: true,
      },
    },
    {
      snapshotId: "9a1ec73f-1ed6-4126-9e17-e59886adea09",
      authorName: "userqa",
      date: "2024-03-12T12:29:01.264",
      flowCode: "MANUAL_TRANSLATION",
      statusCode: "READY",
      options: {
        shouldDisplayBadge: false,
      },
    },
  ],
};

const expectedTranslationVersionHistoryFromSnapshots: VersionHistory = {
  versions: [
    {
      snapshotId: "050199b7-1ea8-4085-9264-7d0b53babf2c",
      authorName: "userqa",
      date: "2024-03-12T12:29:01.336",
      flowCode: "CURATION",
      statusCode: "READY",
      options: {
        shouldDisplayBadge: true,
      },
    },
    {
      snapshotId: "9a1ec73f-1ed6-4126-9e17-e59886adea09",
      authorName: "userqa",
      date: "2024-03-12T12:29:01.264",
      flowCode: "MANUAL_TRANSLATION",
      statusCode: "READY",
      options: {
        shouldDisplayBadge: false,
      },
    },
  ],
};

const expectedVersionHistoryFromMediaSnapshots: VersionHistory = {
  versions: [
    {
      snapshotId: "050199b7-1ea8-4085-9264-7d0b53babf2c",
      authorName: "userqa",
      date: "2024-03-12T12:29:01.336",
      flowCode: "MEDIA",
      statusCode: "READY",
      options: {
        shouldDisplayBadge: true,
      },
    },
    {
      snapshotId: "9a1ec73f-1ed6-4126-9e17-e59886adea09",
      authorName: "userqa",
      date: "2024-03-12T12:29:01.264",
      flowCode: "MEDIA",
      statusCode: "TO_BE_EDIT",
      options: {
        shouldDisplayBadge: false,
      },
    },
  ],
};

const useExperienceRawApiMock = {
  getAllRawSnapshots: vi.fn(),
  getAllTranslationSnapshots: vi.fn(),
  getAllMediaSnapshots: vi.fn(),
};

vi.mock("@/composables/useExperienceRawApi.ts", () => ({
  useExperienceRawApi: () => useExperienceRawApiMock,
}));

describe("useVersionHistoryStore", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setActivePinia(createPinia());
  });

  describe("actions", () => {
    describe("setExperienceId", () => {
      test("it should set given experience id", () => {
        const experienceId = "an experience id";

        const versionHistoryStore = useVersionHistoryStore();

        expect(versionHistoryStore.experienceId).toBeUndefined();

        versionHistoryStore.setExperienceId(experienceId);

        expect(versionHistoryStore.experienceId).toBe(experienceId);
      });
    });
    describe("setFlow", () => {
      test("it should set given flow", () => {
        const flow = DocumentContentType.EDITORIAL;

        const versionHistoryStore = useVersionHistoryStore();

        expect(versionHistoryStore.experienceFlow).toBeUndefined();

        versionHistoryStore.setFlow(flow);

        expect(versionHistoryStore.experienceFlow).toBe(flow);
      });
    });
  });

  describe("getters", () => {
    describe("history", () => {
      test("it should return undefined when flow is undefined", () => {
        const experienceId = "an experience id";

        const versionHistoryStore = useVersionHistoryStore();

        versionHistoryStore.setExperienceId(experienceId);

        expect(versionHistoryStore.history).toBeUndefined();
        expect(useExperienceRawApiMock.getAllRawSnapshots).not.toHaveBeenCalled();
        expect(useExperienceRawApiMock.getAllTranslationSnapshots).not.toHaveBeenCalled();
      });

      test("it should return undefined when experienceId is undefined", () => {
        const flow = DocumentContentType.EDITORIAL;

        const versionHistoryStore = useVersionHistoryStore();

        versionHistoryStore.setFlow(flow);

        expect(versionHistoryStore.history).toBeUndefined();
        expect(useExperienceRawApiMock.getAllRawSnapshots).not.toHaveBeenCalled();
        expect(useExperienceRawApiMock.getAllTranslationSnapshots).not.toHaveBeenCalled();
      });

      test("it should return undefined when both experienceId and flow are undefined", () => {
        const versionHistoryStore = useVersionHistoryStore();

        expect(versionHistoryStore.history).toBeUndefined();
        expect(useExperienceRawApiMock.getAllRawSnapshots).not.toHaveBeenCalled();
        expect(useExperienceRawApiMock.getAllTranslationSnapshots).not.toHaveBeenCalled();
      });

      test("it should return the default language of en", () => {
        const versionHistoryStore = useVersionHistoryStore();

        expect(versionHistoryStore.experienceLanguage).toBe("en");
      });

      test("it should return VersionHistory containing VersionInfo from Raw Snapshots when flow is RAW and experienceId is given", async () => {
        const experienceId = "an experience id";
        const flow = DocumentContentType.RAW;

        useExperienceRawApiMock.getAllRawSnapshots.mockReturnValue(Promise.resolve(rawSnapshots));

        const versionHistoryStore = useVersionHistoryStore();

        expect(versionHistoryStore.history).toBeUndefined();

        versionHistoryStore.setExperienceId(experienceId);
        versionHistoryStore.setFlow(flow);

        await flushPromises();

        expect(versionHistoryStore.history).toStrictEqual(expectedVersionHistoryFromRawSnapshots);
        expect(useExperienceRawApiMock.getAllRawSnapshots).toHaveBeenCalledOnce();
        expect(useExperienceRawApiMock.getAllRawSnapshots).toHaveBeenCalledWith(experienceId);
        expect(useExperienceRawApiMock.getAllTranslationSnapshots).not.toHaveBeenCalled();
      });

      test("it should return VersionHistory containing VersionInfo from Snapshots when flow is EDITORIAL and experienceId is given", async () => {
        const experienceId = "an experience id";
        const flow = DocumentContentType.EDITORIAL;

        useExperienceRawApiMock.getAllTranslationSnapshots.mockReturnValue(Promise.resolve(translationSnapshot));

        const versionHistoryStore = useVersionHistoryStore();

        expect(versionHistoryStore.history).toBeUndefined();

        versionHistoryStore.setExperienceId(experienceId);
        versionHistoryStore.setFlow(flow);

        await flushPromises();

        expect(versionHistoryStore.history).toStrictEqual(expectedVersionHistoryFromSnapshots);
        expect(useExperienceRawApiMock.getAllRawSnapshots).not.toHaveBeenCalled();
        expect(useExperienceRawApiMock.getAllTranslationSnapshots).toHaveBeenCalledOnce();
        expect(useExperienceRawApiMock.getAllTranslationSnapshots).toHaveBeenCalledWith(experienceId, "en");
      });

      test("it should return VersionHistory containing VersionInfo from Snapshots when flow is TRANSLATION and both language and experienceId is given", async () => {
        const experienceId = "an experience id";
        const flow = DocumentContentType.TRANSLATION;
        const language = "es";

        useExperienceRawApiMock.getAllTranslationSnapshots.mockReturnValue(Promise.resolve(translationSnapshot));

        const versionHistoryStore = useVersionHistoryStore();

        expect(versionHistoryStore.history).toBeUndefined();

        versionHistoryStore.setExperienceId(experienceId);
        versionHistoryStore.setFlow(flow);
        versionHistoryStore.setLanguage(language);

        await flushPromises();

        expect(versionHistoryStore.history).toStrictEqual(expectedTranslationVersionHistoryFromSnapshots);
        expect(useExperienceRawApiMock.getAllRawSnapshots).not.toHaveBeenCalled();
        expect(useExperienceRawApiMock.getAllTranslationSnapshots).toHaveBeenCalledOnce();
        expect(useExperienceRawApiMock.getAllTranslationSnapshots).toHaveBeenCalledWith(experienceId, language);
      });

      test("it should return VersionHistory containing VersionInfo from Snapshots when flow is MEDIA and experienceId is given", async () => {
        const experienceId = "an experience id";
        const flow = DocumentContentType.MEDIA;

        useExperienceRawApiMock.getAllMediaSnapshots.mockReturnValue(Promise.resolve(mediaSnapshot));

        const versionHistoryStore = useVersionHistoryStore();

        expect(versionHistoryStore.history).toBeUndefined();

        versionHistoryStore.setExperienceId(experienceId);
        versionHistoryStore.setFlow(flow);

        await flushPromises();

        expect(versionHistoryStore.history).toStrictEqual(expectedVersionHistoryFromMediaSnapshots);
        expect(useExperienceRawApiMock.getAllRawSnapshots).not.toHaveBeenCalled();
        expect(useExperienceRawApiMock.getAllTranslationSnapshots).not.toHaveBeenCalled();
        expect(useExperienceRawApiMock.getAllMediaSnapshots).toHaveBeenCalledOnce();
        expect(useExperienceRawApiMock.getAllMediaSnapshots).toHaveBeenCalledWith(experienceId);
      });

      test("it should compute wether or not to show the badge for a given experience", async () => {
        const experienceId = "an experience id";
        const flow = DocumentContentType.RAW;

        useExperienceRawApiMock.getAllRawSnapshots.mockReturnValue(Promise.resolve(rawSnapshots));

        const versionHistoryStore = useVersionHistoryStore();

        expect(versionHistoryStore.history).toBeUndefined();

        versionHistoryStore.setExperienceId(experienceId);
        versionHistoryStore.setFlow(flow);

        await flushPromises();

        // Only the current snapshot/latest snapshot with UP_TO_DATE status should display the badge
        expect(versionHistoryStore.history?.versions[0].options?.shouldDisplayBadge).toBe(true);
        expect(versionHistoryStore.history?.versions[1].options?.shouldDisplayBadge).toBe(false);
        expect(versionHistoryStore.history?.versions[2].options?.shouldDisplayBadge).toBe(false);
      });
    });
  });
});
