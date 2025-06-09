import { config, shallowMount } from "@vue/test-utils";
import NovaTextEditor from "@/ui-kit/NovaTextEditor/NovaTextEditor.vue";
import FieldPlaceSearch from "@/features/experience-calendar/components/FieldPlaceSearch.vue";
import FieldVenuesList from "@/features/experience-shared/components/FieldVenuesList.vue";
import { City, Venue } from "@/types/generated/GeoMasterDataApi";
import RawLocationForm, { RawLocationFormProps } from "../RawLocationForm.vue";
import { describe, it, expect } from "vitest";
import { StatusCode } from "@/types/generated/ExperienceRawServiceApi";
import { RawStatusCode } from "@/types/DocumentStatuses";

config.global.mocks = {
  $t: (s: string) => s,
};

config.global.renderStubDefaultSlot = true;

describe("RawLocationForm.vue", () => {
  const defaultProps: RawLocationFormProps = {
    hasCoordinates: true,
    modelValue: {
      city: null,
      additionalCities: [],
      venues: [],
      address: {
        direction: "",
        latitude: 0,
        longitude: 0,
        postalCode: "",
      },
      meetingPointDetails: "",
    },
    options: {
      isReadonly: false,
      statusCode: "DRAFT" as StatusCode,
    },
    masterdata: {
      cities: [] as City[],
      venuesList: [] as Venue[],
      selectedVenueList: [] as Venue[],
    },
    requiredFields: [],
  };

  it("renders correctly with default props", () => {
    const wrapper = shallowMount(RawLocationForm, {
      props: defaultProps,
      global: {
        stubs: {
          DocumentFormSection: true,
          FieldCity: true,
          FieldAdditionalCities: true,
          FieldAdditionalCitiesList: true,
          NovaTextEditor: true,
          FieldPlaceSearch: true,
          FieldMap: true,
          FieldVenues: true,
          FieldVenuesList: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("emits handleSelectPlace event when FieldPlaceSearch emits select", async () => {
    const wrapper = shallowMount(RawLocationForm, {
      props: defaultProps,
      global: {
        stubs: {
          DocumentFormSection: true,
          FieldCity: true,
          FieldAdditionalCities: true,
          FieldAdditionalCitiesList: true,
          NovaTextEditor: true,
          FieldPlaceSearch: true,
          FieldMap: true,
          FieldVenues: true,
          FieldVenuesList: true,
        },
      },
    });

    const fieldPlaceSearch = wrapper.findComponent(FieldPlaceSearch);

    fieldPlaceSearch.vm.$emit("select", { place: "test place" });

    expect(wrapper.emitted("handleSelectPlace")).toBeTruthy();
    expect(wrapper.emitted("handleSelectPlace")![0]).toEqual([{ place: "test place" }]);
  });

  it("emits handleDirectionTextChange event when FieldPlaceSearch emits update:model-value", async () => {
    const wrapper = shallowMount(RawLocationForm, {
      props: defaultProps,
      global: {
        stubs: {
          DocumentFormSection: true,
          FieldCity: true,
          FieldAdditionalCities: true,
          FieldAdditionalCitiesList: true,
          NovaTextEditor: true,
          FieldPlaceSearch: true,
          FieldMap: true,
          FieldVenues: true,
          FieldVenuesList: true,
        },
      },
    });

    const fieldPlaceSearch = wrapper.findComponent(FieldPlaceSearch);
    fieldPlaceSearch.vm.$emit("update:model-value", "new direction");

    expect(wrapper.emitted("handleDirectionTextChange")).toBeTruthy();
    expect(wrapper.emitted("handleDirectionTextChange")![0]).toEqual(["new direction"]);
  });

  it("emits handleRemoveVenue event when FieldVenuesList emits remove", async () => {
    const wrapper = shallowMount(RawLocationForm, {
      props: defaultProps,
      global: {
        stubs: {
          DocumentFormSection: true,
          FieldCity: true,
          FieldAdditionalCities: true,
          FieldAdditionalCitiesList: true,
          NovaTextEditor: true,
          FieldPlaceSearch: true,
          FieldMap: true,
          FieldVenues: true,
          FieldVenuesList: true,
        },
      },
    });

    const fieldVenuesList = wrapper.findComponent(FieldVenuesList);
    fieldVenuesList.vm.$emit("remove", { venue: "test venue" });

    expect(wrapper.emitted("handleRemoveVenue")).toBeTruthy();
    expect(wrapper.emitted("handleRemoveVenue")![0]).toEqual([{ venue: "test venue" }]);
  });

  it("disables meeting point during curation", () => {
    const wrapper = shallowMount(RawLocationForm, {
      props: {
        ...defaultProps,
        options: {
          ...defaultProps.options,
          statusCode: RawStatusCode.BEING_CURATED,
        },
      },
      global: {
        stubs: {
          DocumentFormSection: true,
          FieldCity: true,
          FieldAdditionalCities: true,
          FieldAdditionalCitiesList: true,
          NovaTextEditor: true,
          FieldPlaceSearch: true,
          FieldMap: true,
          FieldVenues: true,
          FieldVenuesList: true,
        },
      },
    });

    const novaTextEditor = wrapper.findComponent(NovaTextEditor);

    expect(novaTextEditor.props("disabled")).toBe(true);
  });
});
