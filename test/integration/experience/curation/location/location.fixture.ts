import { Page } from "@playwright/test";
import {
  findFieldCity,
  findTextEditor,
  findMap,
  findFieldPlace,
  findFieldMultiSelect,
  findFieldMultiSelectList,
} from "../../raw/location/location.fixture";
import { testId } from "@/utils/test.utils";

export class ExperienceLocationPage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  findFieldCity() {
    return findFieldCity(this.page);
  }

  findMeetingPointRaw() {
    return this.page.locator(testId("location-meeting-point"));
  }

  findMeetingPoint() {
    return findTextEditor(this.page, "curation-location-meeting-point");
  }

  findAddress() {
    return findFieldPlace(this.page, "field-address-input-text");
  }

  findAdditionalCities() {
    return findFieldMultiSelect(this.page, {
      inputTestId: "field-additional-cities-input",
      optionTestId: "option-label",
      selectedItemTestId: "field-additional-cities-selected-item",
      selectedCountTestId: "field-additional-cities-selected-text",
    });
  }

  findAdditionalCitiesList() {
    return findFieldMultiSelectList(this.page, {
      listTestId: "field-selected-additional-cities",
      listItemTestId: "list-item",
      removeButtonTestId: "button-remove-city",
    });
  }

  findVenues() {
    return findFieldMultiSelect(this.page, {
      inputTestId: "field-venues-input",
      optionTestId: "option-label",
      selectedItemTestId: "field-venues-selected-item",
      selectedCountTestId: "field-venues-selected-text",
    });
  }

  findVenuesList() {
    return findFieldMultiSelectList(this.page, {
      listTestId: "field-selected-venues",
      listItemTestId: "list-item",
      removeButtonTestId: "button-remove-item",
    });
  }

  findMap() {
    return findMap(this.page, "field-map");
  }

  findSaveDraftButton() {
    return this.page.locator(testId("document-action-bar-save-content"));
  }
}
