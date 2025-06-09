import test, { expect } from "@playwright/test";
import { OpinoiaOperationalPage } from "./experience-opinoia-operational.fixture";
import mockApi from "./experience-opinoia-operational.mocks";
let operationalPage: OpinoiaOperationalPage;

test.beforeEach(async ({ page: p }) => {
  await mockApi(p);

  await p.goto("/opinoia/experience-1/operational/configuration");
  operationalPage = new OpinoiaOperationalPage(p);
});

test("the user should be able to see al the fields and values", async () => {
  await test.step("the left bar should be rendered correctly", async () => {
    expect(await operationalPage.refCode.innerText()).toBe("EXP0000001");
    expect(await operationalPage.page.getByTestId("sidebar-section-button").count()).toBe(4);
  });

  await test.step("the right action bar should be rendered correctly", async () => {
    expect(await operationalPage.findByTestId("document-action-bar").isVisible()).toBe(true);
  });

  await test.step("the tabs are present", async () => {
    expect(await operationalPage.findByTestId("document-tab-navigation").isVisible()).toBe(true);
  });
});
