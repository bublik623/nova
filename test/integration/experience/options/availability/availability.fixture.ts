import { Locator, Page, expect } from "@playwright/test";
import { ShortDayNames } from "@/types/DateTypes";
import { testId } from "@/utils/test.utils";

export const selectors = {
  // availability
  availabilityCard: '[data-testid^="availability-card"]',
  availabilityNameInput: testId("availability_name-input-text"),
  availabilityDateInput: testId("availability_dates-input-date-input"),
  addAvailability: testId("add-availability"),
  deleteAvailability: testId("delete-availability"),
  clearAvailability: testId("clear-availability"),
  scheduleCheckbox: (key: ShortDayNames) => `#checkbox-${key}`,
  // day card and timeslots
  availabilityDayCard: testId("availability-day-card"),
  addTimeSlot: testId("add-time-slot"),
  timeSlotItem: testId("time-slot-item"),
  duplicateTimeSlot: testId("slot-item-duplicate"),
  deleteTimeSlot: testId("slot-item-delete"),
  clearTimeSlot: testId("slot-item-clear"),
  duplicateSaveBtn: ".DuplicateModal__btn",
  validityInput: testId("availability.expiration-days-input-number"),
  validityDateInput: testId("availability_expiration-date-input-date-input"),
  timeSlotHourInput: (id: number) => testId(`${id}-slot-item-time-hours-input`),
  timeSlotMinutesInput: (id: number) => testId(`${id}-slot-item-time-minutes-input`),
  pricingInput: testId("pricing-dropdown-toggle"),
  languagesDropdownTrigger: testId("languages-dropdown-button"),
  duplicateEveryInput: (id: number) => testId(`${id}-slot-item-duplicate-every-input-number`),
  duplicateHourInput: (id: number) => testId(`${id}-slot-item-duplicate-hour-input-number`),
  duplicateMinutesInput: (id: number) => testId(`${id}-slot-item-duplicate-minutes-input-number`),
  copySettingsBtn: testId("copy-settings-btn"),
  // others
  collapseTitle: testId("nova-collapse-title"),
  modalConfirm: testId("modal-save-btn"),
  sidebarCheckmarks: testId("sidebar-section-circle-category"),
  // CTA
  saveDraftBtn: testId("document-action-bar-save-content"),
  completeBtn: testId("document-action-bar-complete-option"),
};

export class ExperienceAvailabilityPage {
  private page: Page;

  availabilityCards: Locator;

  constructor(page: Page) {
    this.page = page;

    this.availabilityCards = this.findByTestId(selectors.availabilityCard);
  }

  findByTestId(dataTestId: string) {
    return this.page.locator(dataTestId);
  }

  async checkPageValidity(shouldBeValid: boolean) {
    const saveDraftBtn = this.findByTestId(selectors.saveDraftBtn);
    const completeBtn = this.findByTestId(selectors.completeBtn);

    if (shouldBeValid) {
      expect(await saveDraftBtn.isEnabled()).toBe(true);
      expect(await completeBtn.isEnabled()).toBe(true);
      expect(await this.findByTestId(selectors.sidebarCheckmarks).nth(2).getByTestId("icon-check").isVisible());
    } else {
      expect(await saveDraftBtn.isDisabled()).toBe(true);
      expect(await completeBtn.isDisabled()).toBe(true);
      expect(await this.findByTestId(selectors.sidebarCheckmarks).nth(2).getByTestId("icon-check").isHidden());
    }
  }

  /**
   * Find an availability card by the given index
   */
  findAvailabilityCard(index: number) {
    const card = this.availabilityCards.nth(index);

    const findEl = (elementSelector: string) => card.locator(elementSelector);

    const finders = availabilityCardFinders(card);

    return {
      ...finders,
      findDayCards: () => findEl(selectors.availabilityDayCard),
      findDayCard(index: number) {
        const dayCard = this.findDayCards().nth(index);
        return dayCardFinders(dayCard);
      },
      findScheduleCheckbox: (key: ShortDayNames) => findEl(selectors.scheduleCheckbox(key)),
    };
  }

  findAddAvailabilityButton() {
    return this.page.locator(selectors.addAvailability);
  }

  async checkTimeslot(
    timeslot: ReturnType<typeof timeSlotFinders>,
    hours: string,
    minutes: string,
    pricingName?: string
  ) {
    expect(await timeslot.findHourInput().inputValue()).toBe(hours);
    expect(await timeslot.findMinutesInput().inputValue()).toBe(minutes);
    expect(await timeslot.findPricingInput().innerText()).toContain(pricingName ?? "pricing.dropdown.placeholder");
  }

  async selectTimeslotHour(timeslot: ReturnType<typeof timeSlotFinders>, hours: string) {
    await timeslot.findHourInput().click();
    await this.page.getByTestId(`options-list-list-item-${hours}`).click();
  }

  async selectTimeslotMinutes(timeslot: ReturnType<typeof timeSlotFinders>, minutes: string) {
    await timeslot.findMinutesInput().click();
    await this.page.getByTestId(`options-list-list-item-${minutes}`).click();
  }
}

// elements inside of a day card
const dayCardFinders = (dayCard: Locator) => {
  return {
    findAddTimeSlotButton: () => dayCard.locator(selectors.addTimeSlot),
    findTimeSlots: () => dayCard.locator(selectors.timeSlotItem),
    findTimeSlot(index: number) {
      const realIndex = --index;
      const timeSlot = this.findTimeSlots().nth(realIndex);
      return timeSlotFinders(timeSlot, realIndex);
    },
    findCopySettings: () => dayCard.locator(selectors.copySettingsBtn),
  };
};

// elements inside of a timeslot
const timeSlotFinders = (timeSlotItem: Locator, index: number) => {
  const findEl = (elementSelector: string) => timeSlotItem.locator(elementSelector);

  return {
    findClear: () => findEl(selectors.clearTimeSlot),
    findDelete: () => findEl(selectors.deleteTimeSlot),
    findOpenDuplicateModal: () => findEl(selectors.duplicateTimeSlot),
    findSaveDuplicateBtn: () => findEl(selectors.duplicateSaveBtn),
    findHourInput: () => findEl(selectors.timeSlotHourInput(index)),
    findMinutesInput: () => findEl(selectors.timeSlotMinutesInput(index)),
    findPricingInput: () => findEl(selectors.pricingInput),
    findLanguagesDropdownTrigger: () => findEl(selectors.languagesDropdownTrigger),
    findDuplicateEveryInput: () => findEl(selectors.duplicateEveryInput(index)),
    findDuplicateHourInput: () => findEl(selectors.duplicateHourInput(index)),
    findDuplicateMinutesInput: () => findEl(selectors.duplicateMinutesInput(index)),
  };
};

// elements inside of an availability card
const availabilityCardFinders = (availabilityCard: Locator) => {
  const findEl = (elementSelector: string) => availabilityCard.locator(elementSelector);

  return {
    findDeleteButton: () => findEl(selectors.deleteAvailability),
    findClearButton: () => findEl(selectors.clearAvailability),
    findTitle: () => findEl(selectors.collapseTitle).nth(0), // first collapse title is the availability title and the other titles are nested day titles(days of week)
    findNameInput: () => findEl(selectors.availabilityNameInput),
    findDatesFrom: () => findEl(selectors.availabilityDateInput).nth(0),
    findDatesTo: () => findEl(selectors.availabilityDateInput).nth(1),
    findValidityInput: () => findEl(selectors.validityInput),
    findValidityDateInput: () => findEl(selectors.validityDateInput),
  };
};
