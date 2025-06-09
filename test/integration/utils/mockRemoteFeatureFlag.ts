import type { Page } from "@playwright/test";
import type { RemoteFlagNames } from "@/features/experience-shared/composables/useFeatureFlag";

const configCatURLPattern = "^https://cdn-global.configcat.com/.*$";

export const mockRemoteFeatureFlag = async (page: Page, flags: Partial<{ [key in RemoteFlagNames]: boolean }>) => {
  await page.route(new RegExp(configCatURLPattern), async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        f: Object.entries(flags).reduce(
          (acc, [flagName, value]) => ({
            ...acc,
            [flagName]: {
              t: 0,
              v: { b: value },
            },
          }),
          {}
        ),
      }),
    });
  });
};

export const waitForFeatureFlagsRefresh = async (page: Page) => {
  // feature flags are refreshed each 60 seconds, let's wait for a couple of rounds before timing out
  await page.waitForResponse(new RegExp(configCatURLPattern), { timeout: 120 * 60 });
};
