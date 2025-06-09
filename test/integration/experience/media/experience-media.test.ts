import { test } from "@playwright/test";
import { ExperienceMediaPage } from "./experience-media.fixture";
import mockApi from "./experience-media.mocks";

let mediaPage: ExperienceMediaPage;

test.beforeEach(async ({ page }) => {
  await mockApi(page);

  mediaPage = new ExperienceMediaPage(page);

  await page.goto("/experience/experience-1/media/visuals");
  await page.waitForSelector(".DocumentLayout");
});

test("Media right action bar", async () => {
  await test.step("the user can navigate to the version history", async () => {
    await mediaPage.page.getByTestId("document-action-bar-history-btn").click();
    await mediaPage.page.getByTestId("product-history-toggle").click();
    await mediaPage.page.getByTestId("document-action-bar-content").getByText("experience.flow_code.BASE").click();
  });
});

// Fixed in https://jira.tuigroup.com/browse/OFF-2480
test.skip("the user should be able to edit and save the gallery images", async () => {
  const galleryImages = ["image-1"];

  // Navigate to page
  await mediaPage.loadPage("experience-1");

  // check if the already existing images are shown
  await mediaPage.checkGalleryImages(galleryImages);

  // Add gallery images
  galleryImages.push("image-2");
  await mediaPage.addGalleryImages(1);
  await mediaPage.checkGalleryImages(galleryImages);

  // // Remove gallery image
  galleryImages.splice(0, 1);
  await mediaPage.removeGalleryImage(0);
  await mediaPage.checkGalleryImages(galleryImages);

  // Sort gallery images
  galleryImages.push("image-4", "image-5");
  await mediaPage.addGalleryImages(3);
  await mediaPage.addGalleryImages(4);
  await mediaPage.sortGalleryImages(0, 2);
  await mediaPage.checkGalleryImages(["image-4", "image-5", "image-2"]);

  await mediaPage.checkTheUnsavedChangesModal();

  // Save
  await mediaPage.addGalleryImages(3);
  await mediaPage.saveDraftBtn.click();
  await mediaPage.checkStatus("IN_REVIEW");

  // publish
  await mediaPage.removeGalleryImage(0);
  await mediaPage.removeGalleryImage(0);
  await mediaPage.isPublishEnabled(false);

  await mediaPage.addGalleryImages(3);
  await mediaPage.isPublishEnabled(true);

  await mediaPage.publishBtn.click();
  await mediaPage.checkStatus("READY");
});
