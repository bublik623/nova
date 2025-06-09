import { mount, config } from "@vue/test-utils";
import { test, describe, expect, vi } from "vitest";
import { testId } from "@/utils/test.utils";
import DetailCard, { DetailCardTranslation } from "../DetailCard.vue";

config.global.mocks = {
  $t: (s: string) => s,
};

const hasPermissionMock = ref(true);
vi.mock("@/features/roles/lib/has-permission", () => ({
  hasPermission: () => hasPermissionMock.value,
}));
describe("Component", () => {
  test("renders the title and description correctly", () => {
    const title = "Premade Card Title";
    const description = "This is a premade card description.";

    const wrapper = mount(DetailCard, {
      props: {
        title,
        description,
        information: [],
        translations: [],
      },
      global: {
        stubs: {
          NovaIconFlag: true,
          NovaTooltip: true,
          NovaButtonIcon: true,
        },
      },
    });

    expect(wrapper.find(".DetailCard__title").text()).toBe(title);
    expect(wrapper.find(".DetailCard__description").text()).toBe(description);
  });

  test("renders edit button when canEdit is true and emits the correct event", async () => {
    const wrapper = mount(DetailCard, {
      props: {
        title: "Title",
        description: "Description",
        canEdit: true,
      },
      global: {
        stubs: {
          NovaIconFlag: true,
        },
      },
    });

    const editButton = wrapper.find("#edit-button");
    expect(editButton.exists()).toBe(true);
    await editButton.trigger("click");
    expect(wrapper.emitted("click:editMainLanguage")).toBeTruthy();
  });

  test("renders information items correctly", () => {
    const information = [
      { label: "Label 1", value: "Value 1" },
      { label: "Label 2", value: "Value 2" },
    ];

    const wrapper = mount(DetailCard, {
      props: {
        title: "Title",
        description: "Description",
        information,
        translations: [],
      },
      global: {
        stubs: {
          NovaIconFlag: true,
        },
      },
    });

    const infoItems = wrapper.findAll(".DetailCard__information li");

    expect(infoItems).toHaveLength(information.length);
    expect(infoItems[0].find(".DetailCard__subtitle").text()).toBe(information[0].label);
    expect(infoItems[0].find(".DetailCard__description").text()).toBe(information[0].value);
    expect(infoItems[1].find(".DetailCard__subtitle").text()).toBe(information[1].label);
    expect(infoItems[1].find(".DetailCard__description").text()).toBe(information[1].value);
  });

  test("renders translations items correctly", async () => {
    const translations: DetailCardTranslation[] = [
      { language: "us", label: "English", value: "Translation Value" },
      { language: "fr", label: "French", value: undefined },
    ];

    const wrapper = mount(DetailCard, {
      props: {
        title: "Title",
        description: "Description",
        information: [],
        translations,
      },
      global: {
        stubs: {
          NovaIconFlag: true,
        },
      },
    });

    const translationItems = wrapper.findAll(".DetailCard__translation");

    expect(translationItems).toHaveLength(translations.length);
    expect(translationItems[0].find(".DetailCard__subtitle").text()).toContain(translations[0].label);
    expect(translationItems[0].find(".DetailCard__description").text()).toBe(translations[0].value);
    expect(translationItems[1].find(".DetailCard__subtitle").text()).toContain(translations[1].label);
    expect(translationItems[1].find(".DetailCard__description").text()).toContain(
      "masterdata.detail-card.missing-translation"
    );

    // check if the button to add the translation is shown correctly
    expect(translationItems[1].find(testId("add-translation-button")).isVisible()).toBeTruthy();

    // and emits the correct event
    await translationItems[1].find(testId("add-translation-button")).trigger("click");
    const events = wrapper.emitted<Event[]>()["click:addTranslation"];
    expect(events).toBeTruthy();
    expect(events[0][0]).toStrictEqual(translations[1]);
  });

  test("does not render the add translation button when canUpdateTranslations is false", () => {
    hasPermissionMock.value = false;
    const translations: DetailCardTranslation[] = [
      { language: "us", label: "English", value: "Translation Value" },
      { language: "fr", label: "French", value: undefined },
    ];

    const wrapper = mount(DetailCard, {
      props: {
        title: "Title",
        description: "Description",
        information: [],
        translations,
      },
      global: {
        stubs: {
          NovaIconFlag: true,
        },
      },
    });

    const translationItems = wrapper.findAll(".DetailCard__translation");
    const addTranslationButton = translationItems[1].find('[data-testid="add-translation-button"]');
    expect(addTranslationButton.exists()).toBe(false);
  });

  test("renders the add translation button when canUpdateTranslations is true", async () => {
    hasPermissionMock.value = true;
    const translations: DetailCardTranslation[] = [
      { language: "us", label: "English", value: "Translation Value" },
      { language: "fr", label: "French", value: undefined },
    ];

    const wrapper = mount(DetailCard, {
      props: {
        title: "Title",
        description: "Description",
        information: [],
        translations,
      },
      global: {
        stubs: {
          NovaIconFlag: true,
        },
      },
    });

    const translationItems = wrapper.findAll(".DetailCard__translation");
    const addTranslationButton = translationItems[1].find('[data-testid="add-translation-button"]');
    expect(addTranslationButton.exists()).toBe(true);

    await addTranslationButton.trigger("click");
    const events = wrapper.emitted("click:addTranslation");
    expect(events).toBeTruthy();
    expect(events![0][0]).toStrictEqual(translations[1]);
  });
});
