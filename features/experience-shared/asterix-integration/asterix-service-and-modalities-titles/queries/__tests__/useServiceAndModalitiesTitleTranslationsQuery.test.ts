import { vi, describe, test, expect, beforeEach } from "vitest";
import {
  ServiceAndModalitiesTitleTranslations,
  useServiceAndModalitiesTitleTranslationsQuery,
} from "../useServiceAndModalitiesTitleTranslationsQuery";
import { AvailableLanguage } from "@/types/Language";
import { config, flushPromises, shallowMount } from "@vue/test-utils";
import { QueryClient, UseQueryReturnType } from "@tanstack/vue-query";
import { OptionTranslation, ServiceCodeTranslation } from "@/types/generated/ContentCommandApi";

const getServiceCodeTranslationsMock = vi.hoisted(() => vi.fn());
const getOptionTranslationsMock = vi.hoisted(() => vi.fn());

vi.mock("@/composables/useContentCommandApi", () => ({
  useContentCommandApi: () => ({
    getServiceCodeTranslations: getServiceCodeTranslationsMock,
    getOptionTranslations: getOptionTranslationsMock,
  }),
}));

let query: UseQueryReturnType<ServiceAndModalitiesTitleTranslations, Error> | undefined = undefined;

const servicesTranslations: Array<ServiceCodeTranslation> = [
  {
    id: "service-translation-1",
    experience_id: "exp-id",
    language_code: "en",
    code: "SVC-1",
    name: "english service translation of SVC-1",
    flow_code: "MANUAL_TRANSLATION",
    status_code: "TO_BE_EDIT",
    to_be_translated: false,
  },
  {
    id: "service-translation-2",
    experience_id: "exp-id",
    language_code: "en",
    code: "SVC-2",
    name: "english service translation of SVC-2",
    flow_code: "MANUAL_TRANSLATION",
    status_code: "TO_BE_EDIT",
    to_be_translated: false,
  },
];
const optionsTranslations: Array<OptionTranslation> = [
  {
    id: "option-translation-1",
    experience_id: "exp-id",
    language_code: "en",
    asx_service_code_translation_id: servicesTranslations[0].id,
    asx_modality_code: "MOD-1",
    name: "english modality translation of MOD-1",
    flow_code: "MANUAL_TRANSLATION",
    status_code: "TO_BE_EDIT",
    to_be_translated: false,
  },
  {
    id: "option-translation-2",
    experience_id: "exp-id",
    language_code: "en",
    asx_service_code_translation_id: servicesTranslations[0].id,
    asx_modality_code: "MOD-2",
    name: "english modality translation of MOD-2",
    flow_code: "MANUAL_TRANSLATION",
    status_code: "TO_BE_EDIT",
    to_be_translated: false,
  },
  {
    id: "option-translation-3",
    experience_id: "exp-id",
    language_code: "en",
    asx_service_code_translation_id: servicesTranslations[1].id,
    asx_modality_code: "MOD-3",
    name: "english modality translation of MOD-3",
    flow_code: "MANUAL_TRANSLATION",
    status_code: "TO_BE_EDIT",
    to_be_translated: false,
  },
  {
    id: "option-translation-4",
    experience_id: "exp-id",
    language_code: "en",
    asx_service_code_translation_id: servicesTranslations[1].id,
    asx_modality_code: "MOD-4",
    name: "english modality translation of MOD-4",
    flow_code: "MANUAL_TRANSLATION",
    status_code: "TO_BE_EDIT",
    to_be_translated: false,
  },
  {
    id: "option-translation-5",
    experience_id: "exp-id",
    language_code: "en",
    asx_service_code_translation_id: servicesTranslations[1].id,
    asx_modality_code: "MOD-5",
    name: "english modality translation of MOD-5",
    flow_code: "MANUAL_TRANSLATION",
    status_code: "TO_BE_EDIT",
    to_be_translated: false,
  },
];

describe("useServiceAndModalitiesTitleTranslationsQuery", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // disable retry otherwise tests that cover error cases would time-out
    config.global.provide.VUE_QUERY_CLIENT = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  test("it should return undefined when experienceId is undefined", async () => {
    const experienceId = ref<string>();
    const languageCode = ref<AvailableLanguage>("en");

    await setupQuery(experienceId, languageCode);

    expect(query).not.toBeUndefined();
    expect(query?.data.value).toBeUndefined();

    expect(getServiceCodeTranslationsMock).not.toHaveBeenCalled();
    expect(getOptionTranslationsMock).not.toHaveBeenCalled();
  });

  test("it should return undefined when languageCode is undefined", async () => {
    const experienceId = ref<string>("an experience id");
    const languageCode = ref<AvailableLanguage>();

    await setupQuery(experienceId, languageCode);

    expect(query).not.toBeUndefined();
    expect(query?.data.value).toBeUndefined();

    expect(getServiceCodeTranslationsMock).not.toHaveBeenCalled();
    expect(getOptionTranslationsMock).not.toHaveBeenCalled();
  });

  test("it should fetch service code translations for the given experience id and language", async () => {
    const experienceId = "an experience id";
    const languageCode = "en";

    await setupQuery(ref(experienceId), ref(languageCode));

    expect(query).not.toBeUndefined();
    expect(getServiceCodeTranslationsMock).toHaveBeenCalledWith(experienceId, languageCode);
  });

  test("it should set error state when the service code translation endpoint return an error", async () => {
    const experienceId = "an experience id";
    const languageCode = "en";
    const error = {
      code: "ERR_BAD_REQUEST",
      message: "Request failed with status code 400",
    };

    getServiceCodeTranslationsMock.mockRejectedValue(error);
    getOptionTranslationsMock.mockResolvedValue({ data: optionsTranslations });

    await setupQuery(ref(experienceId), ref(languageCode));

    expect(query).not.toBeUndefined();
    expect(query!.status.value).toBe("error");
    expect(query!.isError.value).toBe(true);
    expect(query!.error.value).toStrictEqual(error);
  });

  test("it should fetch options (modalities) translations for the given experience id and language", async () => {
    const experienceId = "an experience id";
    const languageCode = "en";

    await setupQuery(ref(experienceId), ref(languageCode));

    expect(query).not.toBeUndefined();
    expect(getOptionTranslationsMock).toHaveBeenCalledWith(experienceId, languageCode);
  });

  test("it should set error state when the options (modalities) translations endpoint return an error", async () => {
    const experienceId = "an experience id";
    const languageCode = "en";
    const error = {
      code: "ERR_BAD_REQUEST",
      message: "Request failed with status code 400",
    };

    getServiceCodeTranslationsMock.mockReturnValue({ data: servicesTranslations });
    getOptionTranslationsMock.mockRejectedValue(error);

    await setupQuery(ref(experienceId), ref(languageCode));

    expect(query).not.toBeUndefined();
    expect(query!.status.value).toBe("error");
    expect(query!.isError.value).toBe(true);
    expect(query!.error.value).toStrictEqual(error);
  });

  test("it should return the fetched data", async () => {
    const experienceId = "an experience id";
    const languageCode = "en";

    getServiceCodeTranslationsMock.mockResolvedValueOnce({ data: servicesTranslations });
    getOptionTranslationsMock.mockResolvedValueOnce({ data: optionsTranslations });

    await setupQuery(ref(experienceId), ref(languageCode));

    expect(query).not.toBeUndefined();
    expect(query?.data.value).toStrictEqual({
      asterixServicesTranslations: servicesTranslations,
      asterixModalitiesTranslations: optionsTranslations,
    });
  });
});

async function setupQuery(experienceId: Ref<string | undefined>, languageCode: Ref<AvailableLanguage | undefined>) {
  shallowMount(getComponent(experienceId, languageCode));
  await flushPromises();
}

function getComponent(experienceId: Ref<string | undefined>, languageCode: Ref<AvailableLanguage | undefined>) {
  return defineComponent({
    setup: () => {
      query = useServiceAndModalitiesTitleTranslationsQuery(experienceId, languageCode);
    },
    template: "<div></div>",
  });
}
