import { beforeEach, describe, expect, test, vi } from "vitest";
import { QueryClient, UseMutationReturnType } from "@tanstack/vue-query";
import { config, flushPromises, shallowMount } from "@vue/test-utils";
import {
  DataToUpdate,
  useServiceAndModalitiesTitleTranslationsMutation,
} from "../useServiceAndModalitiesTitleTranslationsMutation";
import { AvailableLanguage } from "@/types/Language";

const putServiceCodeTranslationMock = vi.hoisted(() => vi.fn());
const putOptionTranslationMock = vi.hoisted(() => vi.fn());

vi.mock("@/composables/useContentCommandApi", () => ({
  useContentCommandApi: () => ({
    putServiceCodeTranslation: putServiceCodeTranslationMock,
    putOptionTranslation: putOptionTranslationMock,
  }),
}));

let mutation: UseMutationReturnType<void, Error, DataToUpdate, unknown, any> | undefined = undefined;

const dataToUpdate: DataToUpdate = {
  servicesTranslationsToUpdate: [
    {
      id: "service-translation-1",
      experience_id: "exp-id",
      language_code: "en",
      code: "SVC-1",
      name: "SVC-1 title",
      flow_code: "MANUAL_TRANSLATION",
      status_code: "TO_BE_EDIT",
      to_be_translated: false,
    },
    {
      id: "service-translation-2",
      experience_id: "exp-id",
      language_code: "en",
      code: "SVC-2",
      name: "SVC-2 title",
      flow_code: "MANUAL_TRANSLATION",
      status_code: "TO_BE_EDIT",
      to_be_translated: false,
    },
  ],
  modalitiesTranslationsToUpdate: [
    {
      id: "modality-translation-1",
      experience_id: "exp-id",
      language_code: "en",
      name: "MOD-1 title",
      flow_code: "MANUAL_TRANSLATION",
      status_code: "TO_BE_EDIT",
      to_be_translated: false,
    },
    {
      id: "modality-translation-2",
      experience_id: "exp-id",
      language_code: "en",
      name: "MOD-2 title",
      flow_code: "MANUAL_TRANSLATION",
      status_code: "TO_BE_EDIT",
      to_be_translated: false,
    },
  ],
};

describe("useServiceAndModalitiesTitleTranslationsListMutation", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // disable retry otherwise tests that cover error cases would time-out
    config.global.provide.VUE_QUERY_CLIENT = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  test("it puts the given Asterix Services Titles translations", async () => {
    const experienceId = "exp-id";
    const language = "en";

    await setupMutation(ref(experienceId), ref(language));

    await mutation?.mutateAsync(dataToUpdate);

    expect(putServiceCodeTranslationMock).toHaveBeenCalledTimes(2);
    expect(putServiceCodeTranslationMock).toHaveBeenCalledWith(dataToUpdate.servicesTranslationsToUpdate[0]);
    expect(putServiceCodeTranslationMock).toHaveBeenCalledWith(dataToUpdate.servicesTranslationsToUpdate[1]);
  });

  test("it puts the given Asterix Modalities Titles translations", async () => {
    const experienceId = "exp-id";
    const language = "en";

    await setupMutation(ref(experienceId), ref(language));

    await mutation?.mutateAsync(dataToUpdate);

    expect(putOptionTranslationMock).toHaveBeenCalledTimes(2);
    expect(putOptionTranslationMock).toHaveBeenCalledWith(dataToUpdate.modalitiesTranslationsToUpdate[0]);
    expect(putOptionTranslationMock).toHaveBeenCalledWith(dataToUpdate.modalitiesTranslationsToUpdate[1]);
  });

  test("it should set error state and throw error when the Asterix Service Translation endpoint return an error", async () => {
    const experienceId = "an experience id";
    const languageCode = "en";
    const error = {
      code: "ERR_BAD_REQUEST",
      message: "Request failed with status code 400",
    };

    putServiceCodeTranslationMock.mockRejectedValue(error);

    await setupMutation(ref(experienceId), ref(languageCode));

    await expect((async () => await mutation?.mutateAsync(dataToUpdate))()).rejects.toThrow(error.message);

    expect(mutation?.error.value).toBeDefined();
    expect(mutation?.error.value).toStrictEqual(error);
  });

  test("it should set error state and throw error when the Asterix Modalities Translation endpoint return an error", async () => {
    const experienceId = "an experience id";
    const languageCode = "en";
    const error = {
      code: "ERR_BAD_REQUEST",
      message: "Request failed with status code 400",
    };

    putOptionTranslationMock.mockRejectedValue(error);

    await setupMutation(ref(experienceId), ref(languageCode));

    await expect((async () => await mutation?.mutateAsync(dataToUpdate))()).rejects.toThrow(error.message);

    expect(mutation?.error.value).toBeDefined();
    expect(mutation?.error.value).toStrictEqual(error);
  });
});

async function setupMutation(experienceId: Ref<string | undefined>, languageCode: Ref<AvailableLanguage | undefined>) {
  shallowMount(getComponent(experienceId, languageCode));
  await flushPromises();
}

function getComponent(experienceId: Ref<string | undefined>, languageCode: Ref<AvailableLanguage | undefined>) {
  return defineComponent({
    setup: () => {
      mutation = useServiceAndModalitiesTitleTranslationsMutation(experienceId, languageCode);
    },
    template: "<div></div>",
  });
}
