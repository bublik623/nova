import { Page } from "@playwright/test";

/**
 *
 * @description checks if a given locator is intersecting
 * the current viewport. https://stackoverflow.com/a/68848306
 */
export async function isIntersectingViewport(selector: string, page: Page): Promise<boolean> {
  return await page.$eval(selector, async (element) => {
    const visibleRatio: number = await new Promise((resolve) => {
      const observer = new IntersectionObserver((entries) => {
        resolve(entries[0].intersectionRatio);
        observer.disconnect();
      });
      observer.observe(element);
    });
    return visibleRatio > 0;
  });
}
