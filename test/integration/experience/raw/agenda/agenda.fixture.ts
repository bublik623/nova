import { expect, Locator, Page } from "@playwright/test";
import { ExperienceRawPage } from "../experience-raw.fixture";
import { inventoryServiceUrl } from "../experience-raw.mocks";
import { mockSlots } from "../experience-raw.data";
import { ref } from "vue";

export class AgendaPage extends ExperienceRawPage {
  filterCollapse: Locator;
  filterApplyBtn: Locator;

  constructor(page: Page) {
    super(page);

    this.filterCollapse = this.findByText("experience.agenda.filters.title");
    this.filterApplyBtn = this.findByTestId("agenda-date-filter-apply");
  }

  async selectOptionFilter(optionIdx: number) {
    await this.findByTestId("multi-select-trigger").nth(0).click();
    await this.findByTestId("multi-select-item").nth(optionIdx).locator("input").click();
  }

  async selectTimeslotFilter(timeslotIdx: number) {
    await this.findByTestId("multi-select-trigger").nth(1).click();
    await this.findByTestId("multi-select-item").nth(timeslotIdx).locator("input").click();
  }

  async selectShowClosedFilter() {
    await this.find("input.checkbox-container__checkbox").nth(0).click();
  }

  async checkFilters(expected: string) {
    const requestPromise = this.page.waitForRequest(`${inventoryServiceUrl}/slots*`);
    await this.filterApplyBtn.click();
    const request = await requestPromise;

    // Check that the request url contains the correct filters
    expect(request.url()).toContain(expected);
  }

  async updateSlotCapacity(slotIndex: number, newCapacity: number) {
    const slot = this.findByTestId("nova-collapse").nth(slotIndex);

    await slot.locator("[data-testid='resultrow-actions']").locator("button").click();

    await this.findByTestId("slot-availability-input-input-number").fill(newCapacity.toString());

    const requestPromise = this.page.waitForRequest(`${inventoryServiceUrl}/slots/update-capacity*`);
    await slot.locator("[data-testid='resultrow-actions']").locator("[data-testid='result-table-save']").click();
    const request = await requestPromise;

    expect(request.postDataJSON()).toEqual({
      id: "12345",
      capacity: newCapacity,
    });
  }

  async updateSlotStatus(slotIndex: number) {
    const slot = this.findByTestId("nova-collapse").nth(slotIndex);

    const requestPromise = this.page.waitForRequest(`${inventoryServiceUrl}/slots/enabling`);

    await slot.locator("button.NovaSwitch").click();

    const request = await requestPromise;

    expect(request.postDataJSON()).toEqual({
      timeslice_ids: ["789"],
      enable: false,
    });
  }

  async updateAllSlotsStatus(newStatus: boolean) {
    // adding 100+ mocked slots
    const newMockedSlots: { timeslice_id: string; aggregation_id: string }[] = [];
    for (let i = 0; i < 101; i++) {
      newMockedSlots.push({
        ...mockSlots[0],
        timeslice_id: mockSlots[0].timeslice_id + i,
        aggregation_id: mockSlots[0].aggregation_id + i,
      });
    }

    await this.page.route(`${inventoryServiceUrl}/slots*`, async (route, req) => {
      const method = req.method();
      const url = req.url();

      if (method === "GET") {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(newMockedSlots),
        });
      } else {
        throw new Error(`No mocked route for ${method} - ${url}`);
      }
    });

    await this.filterCollapse.click();
    await this.filterApplyBtn.click();

    await this.find("#checkbox-select-all-checkbox").click();

    const reqNumber = ref(0);

    // check if the page make 2 different request to get the slots
    this.page.on("request", (req) => {
      if (!req.url().includes("enabling")) {
        reqNumber.value++;
      }
    });

    const requestPromise = this.page.waitForRequest((request) =>
      request.url().includes(newMockedSlots.slice(-1)[0].timeslice_id)
    );

    if (newStatus) {
      await this.findByTestId("agenda.open-selected.button").click();
    } else {
      await this.findByTestId("agenda.close-selected.button").click();
    }

    await requestPromise;

    expect(reqNumber.value).toBe(2);
  }
}
