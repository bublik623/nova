import { config, mount, shallowMount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import VersionHistoryVersionCard from "../VersionHistoryVersionCard.vue";
import { DocumentContentType } from "@/types/DocumentStatuses";
import { VersionInfo } from "../../stores/useVersionHistoryStore";

config.global.mocks = {
  $t: (s: string) => s,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const version: VersionInfo = {
  authorName: "John Doe",
  date: "2021-09-01T00:00:00Z",
  flowCode: "BASE",
  snapshotId: "123",
  statusCode: "READY",
};

describe("VersionHistoryCard", () => {
  const testCases = [
    [DocumentContentType.RAW, "base-content", true],
    [DocumentContentType.EDITORIAL, "curated-content", true],
    [DocumentContentType.TRANSLATION, "translation-content", false],
    [DocumentContentType.MEDIA, "media-content", false],
  ] as const;

  test.each(testCases)("should render %s correctly", (flow, contentKey, showBadge) => {
    const wrapper = shallowMount(VersionHistoryVersionCard, {
      props: {
        flow,
        version,
        showBadge,
      },
    });

    expect(wrapper.text()).toContain("John Doe");
    expect(wrapper.text()).toContain("01/09/2021 - 00:00");
    expect(wrapper.text()).toContain(`experience.version-history.${contentKey}`);

    expect(wrapper.findComponent("experience-status-badge-stub").exists()).toBe(showBadge);
  });

  test('it should emit the event "action:view" if the button is clicked', async () => {
    const wrapper = mount(VersionHistoryVersionCard, {
      props: {
        flow: DocumentContentType.RAW,
        showBadge: false,
        version,
        showActionView: true,
      },
    });

    const button = wrapper.find('[data-testid="version-card-action-view"]');
    await button.trigger("click");

    expect(wrapper.emitted("action:open-revision")![0]).toEqual(["123"]);
  });

  test("it should have the correct class when the card is active", () => {
    const wrapper = shallowMount(VersionHistoryVersionCard, {
      props: {
        flow: DocumentContentType.RAW,
        showBadge: false,
        version,
        showActionView: false,
        isActive: true,
      },
    });

    expect(wrapper.html()).toContain("border-secondary-100 outline outline-4 outline-secondary-30");
  });
});
