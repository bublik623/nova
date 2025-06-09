import { config, mount, shallowMount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import AdvancedSearchTableCuration, {
  Props as AdvancedSearchTableCurationProps,
} from "@/features/advanced-search/components/AdvancedSearchTable/AdvancedSearchTableCuration.vue";
import * as detectItemScrollableComposable from "@/composables/useDetectItemScrollable";
import { testId } from "@/utils/test.utils";
import { TypedDistributionContentSearchHit } from "@/features/advanced-search/types/seach-hit-overrides";

const routerMock = {
  push: vi.fn(),
};

config.global.mocks = {
  $t: (s: string) => s,
  $router: routerMock,
};

const masterDataStoreMock = {
  getCityByCode: vi.fn(() => ({ name: "city" })),
};

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataStoreMock,
}));
const items: TypedDistributionContentSearchHit[] = [
  {
    content: {
      id: "e546e541-e43c-45de-80f5-431eab027279",
      supplier_id: "082d65c7-3d18-484b-9dc5-6e33ef73be49",
      reference_code: "EXP0013534",
      global_status: "NOT_READY",
      experience_media: {
        id: "488d3125-fd45-4ece-ae9d-f7af7b07852f",
        flow_code: "MEDIA",
        status_code: "TO_BE_EDIT",
        distribution_status: "NOT_READY",
        creation_date: "2024-01-12T09:22:53",
        updated_date: "2024-01-12T09:22:53",
      },
      experience_content: [
        {
          supplier_id: "test",
          experience_id: "e546e541-e43c-45de-80f5-431eab027279",
          language_code: "en",
          experience_translation: {
            name: "test",
            id: "6e70a9e3-1a8c-46ec-bea5-155f7dfe84f2",
            title: "0003f471-baf2-4b07-9769-8db4cd46c355",
            text1:
              "<p>Lorem casa ipsum dolor sit amet ed eiusmod tempor incidunt ut labore et dolore magna aliqua ed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliqua, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua casa. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure casa reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exerci casa tationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id es casa t laborum.</p>",
            text2: "<p>Any Additional description</p>",
            info_voucher: "<p>Any Voucher instructions</p>",
            automatic_translation: false,
            curation_quality: false,
            flow_code: "CURATION",
            status_code: "IN_REVIEW",
            distribution_status: "NOT_READY",
            creation_date: "2024-01-12T09:22:53",
            updated_date: "2024-01-23T14:04:37",
          },
          custom_highlights: [
            {
              id: "16ee7bb6-5b39-4aad-bed2-dbbcad400d52",
              code: "local-5muf884wn95",
              name: "Any custom highlights",
              visualization_order: 1,
              automatic_translation: false,
              flow_code: "CURATION",
              status_code: "TO_BE_EDIT",
              creation_date: "2024-01-12T09:22:53",
              updated_date: "2024-01-12T09:22:53",
            },
          ],
          custom_included: [
            {
              id: "16a702c2-d9d5-4778-bcd1-321641d5863a",
              code: "local-1fv04pihbhr",
              name: "Any custom included",
              visualization_order: 1,
              automatic_translation: false,
              flow_code: "CURATION",
              status_code: "TO_BE_EDIT",
              creation_date: "2024-01-12T09:22:53",
              updated_date: "2024-01-12T09:22:53",
            },
          ],
          custom_non_included: [
            {
              id: "8f206ab3-21a2-4e13-9e65-80ead183f6ea",
              code: "local-7ykim9l318j",
              name: "Any custom non-included",
              visualization_order: 1,
              automatic_translation: false,
              flow_code: "CURATION",
              status_code: "TO_BE_EDIT",
              creation_date: "2024-01-12T09:22:53",
              updated_date: "2024-01-12T09:22:53",
            },
          ],
          custom_important_information: [
            {
              id: "d07394e0-75a2-4b42-906f-3d22a41cc5f6",
              code: "local-4j9n9j6mfj",
              name: "Any custom important information",
              visualization_order: 1,
              automatic_translation: false,
              flow_code: "CURATION",
              status_code: "TO_BE_EDIT",
              creation_date: "2024-01-12T09:22:53",
              updated_date: "2024-01-12T09:22:53",
            },
          ],
        },
        {
          experience_id: "e546e541-e43c-45de-80f5-431eab027279",
          language_code: "es",
          supplier_id: "test",
          experience_translation: {
            id: "6e70a9e3-1a8c-46ec-bea5-155f7dfe84f2",
            name: "test",
            title: "0003f471-baf2-4b07-9769-8db4cd46c355",
            text1:
              "<p>Lorem casa ipsum dolor sit amet ed eiusmod tempor incidunt ut labore et dolore magna aliqua ed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliqua, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua casa. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure casa reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exerci casa tationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id es casa t laborum.</p>",
            text2: "<p>Any Additional description</p>",
            info_voucher: "<p>Any Voucher instructions</p>",
            automatic_translation: false,
            curation_quality: false,
            flow_code: "CURATION",
            status_code: "IN_REVIEW",
            distribution_status: "NOT_READY",
            creation_date: "2024-01-12T09:22:53",
            updated_date: "2024-01-23T14:04:37",
          },
        },
        {
          experience_id: "e546e541-e43c-45de-80f5-431eab027279",
          language_code: "it",
          supplier_id: "test",
          experience_translation: {
            name: "test",
            id: "6e70a9e3-1a8c-46ec-bea5-155f7dfe84f2",
            title: "0003f471-baf2-4b07-9769-8db4cd46c355",
            text1:
              "<p>Lorem casa ipsum dolor sit amet ed eiusmod tempor incidunt ut labore et dolore magna aliqua ed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliquaed eiusmod tempor incidunt ut labore et dolore magna aliqua, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua casa. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure casa reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exerci casa tationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id es casa t laborum.</p>",
            text2: "<p>Any Additional description</p>",
            info_voucher: "<p>Any Voucher instructions</p>",
            automatic_translation: false,
            curation_quality: false,
            flow_code: "CURATION",
            status_code: "IN_REVIEW",
            distribution_status: "NOT_READY",
            creation_date: "2024-01-12T09:22:53",
            updated_date: "2024-01-23T14:04:37",
          },
        },
      ],
      functional_content: {
        experience_location: {
          id: "edb63783-c0b5-46c4-9c49-8c75c8b5c9df",
          address: {
            direction: "Croatia, Brsečinska ulica, Dubrovnik, Croatia",
            city: "DBV",
            postal_code: "20000",
            country: "Croatia",
          },
          latitude: "42.651711",
          longitude: "18.0858801",
        },
      },
    },
    highlight_fields: {},
  },
  {
    content: {},
    highlight_fields: {},
  },
];

const supplierList = [
  {
    id: "supplier-1",
    name: "Supplier 1",
    email: "supplier1@example.com",
  },
  {
    id: "supplier-2",
    name: "Supplier 2",
    email: "supplier2@example.com",
  },
];

const isExperienceSelectedMock = vi.fn<[string], boolean>();

const props = {
  supplierList,
  items,
  isExperienceSelected: isExperienceSelectedMock,
  areAllSelected: false,
  areSomeSelected: false,
  pending: false,
  visibleLanguages: [],
  activeSortKey: "title",
  activeSortDirection: "asc",
} satisfies AdvancedSearchTableCurationProps;

const thSelectors = {
  th_checkbox: "adv-search-th-checkbox",
  th_langs: "adv-search-th-langs",
  th_title: "adv-search-th-title",
  th_ref_code: "adv-search-th-ref-code",
  th_status: "adv-search-th-status",
  th_modified: "adv-search-th-modified",
  th_supplier: "adv-search-th-supplier",
  th_country: "adv-search-th-country",
  th_city: "adv-search-th-city",
  th_created: "adv-search-th-created",
};

const tdSelectors = {
  td_checkbox: "adv-search-td-checkbox",
  td_langs: "adv-search-td-langs",
  td_title: "adv-search-td-title",
  td_ref_code: "adv-search-td-ref-code",
  td_status: "adv-search-td-status",
  td_modified: "adv-search-td-modified",
  td_supplier: "adv-search-td-supplier",
  td_country: "adv-search-td-country",
  td_city: "adv-search-td-city",
  td_created: "adv-search-td-created",
};

const selectors = {
  spinner: "nova-spinner",
  noItemsMsg: "adv-search-table-curation-no-items-warning",
  items: "adv-search-table-item",
  itemsLink: "adv-search-td-title-link",
};

describe("AdvancedSearchTableCuration", () => {
  beforeEach(() => {
    vi.spyOn(detectItemScrollableComposable, "useDetectItemScrollable").mockReturnValueOnce({
      isHorizontallyScrollable: ref(true),
      isVerticallyScrollable: ref(true),
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("it should mount correctly", () => {
    const wrapper = shallowMount(AdvancedSearchTableCuration, { props });

    Object.values(thSelectors).forEach((el) => {
      expect(wrapper.find(testId(el)).exists()).toBeTruthy();
    });

    Object.values(tdSelectors).forEach((el) => {
      expect(wrapper.findAll(testId(el)).length).toBe(2);
    });

    expect(wrapper.find(testId(selectors.spinner)).exists()).toBe(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((wrapper.vm as any).scrollShadowOpacity).toBe(1);
  });

  describe("when the user clicks on the title", () => {
    test("it should redirect to the curation page", async () => {
      const wrapper = shallowMount(AdvancedSearchTableCuration, { props });

      await wrapper.findAll(testId(selectors.itemsLink))[0].trigger("click");
      expect(routerMock.push).toHaveBeenCalledWith(`/experience/${items[0].content.id}/curation/settings`);
    });
  });

  describe("when there are no items", () => {
    test("it should show a message", () => {
      const propsWithoutItemsAndNotPending = { ...props, items: [], pending: false };

      const wrapper = shallowMount(AdvancedSearchTableCuration, { props: propsWithoutItemsAndNotPending });

      expect(wrapper.find(testId(selectors.noItemsMsg)).exists()).toBe(true);
    });
  });

  describe("when the table is not scrollable", () => {
    test("it should hide the scroll shadow", () => {
      const propsWithoutItemsAndNotPending = { ...props, items: [], pending: false };
      vi.spyOn(detectItemScrollableComposable, "useDetectItemScrollable").mockReturnValueOnce({
        isHorizontallyScrollable: ref(false),
        isVerticallyScrollable: ref(false),
      });

      const wrapper = mount(AdvancedSearchTableCuration, { props: propsWithoutItemsAndNotPending });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).scrollShadowOpacity).toBe(0);
    });
  });

  describe("when visible language set is not given or empty", () => {
    test("it should show all translation", async () => {
      const wrapper = shallowMount(AdvancedSearchTableCuration, { props });

      (wrapper.vm as any).toggleOpen("e546e541-e43c-45de-80f5-431eab027279");

      await nextTick();

      const translationRowComponents = wrapper.findAllComponents({ name: "AdvancedSearchTranslationRow" });
      const visibleTranslations = translationRowComponents.map(
        (component) => component.props("translation").language_code
      );
      expect(visibleTranslations.length).toBe(2);
      expect(visibleTranslations).toContain("es");
      expect(visibleTranslations).toContain("it");
    });
  });

  describe("when visible language set is given", () => {
    test("translation for the included languages should be shown automatically", async () => {
      const wrapper = shallowMount(AdvancedSearchTableCuration, { props });
      await wrapper.setProps({ visibleLanguages: ["es"] });

      await nextTick();

      const translationRowComponents = wrapper.findAllComponents({ name: "AdvancedSearchTranslationRow" });
      expect(translationRowComponents.length).toBe(1);
      expect(translationRowComponents[0].props("translation").language_code).toBe("es");
    });
  });
});
