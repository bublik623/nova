import { vi, describe, test, beforeEach, expect } from "vitest";
import { useAsterixServiceAndModalitiesTitleTranslationsListField } from "../useAsterixServiceAndModalitiesTitleTranslationsListField";
import { ServiceAndModalitiesTitleListValue } from "../../types/service-and-modalities-title-list-value";
import { ServiceAndModalitiesTitleTranslations } from "../../queries/useServiceAndModalitiesTitleTranslationsQuery";
import { DataToUpdate } from "../../queries/useServiceAndModalitiesTitleTranslationsMutation";

const queryFactoryMock = vi.hoisted(() => vi.fn());
vi.mock("../../queries/useServiceAndModalitiesTitleTranslationsQuery.ts", () => ({
  useServiceAndModalitiesTitleTranslationsQuery: queryFactoryMock,
}));

const mutationFactoryMock = vi.hoisted(() => vi.fn());
vi.mock("../../queries/useServiceAndModalitiesTitleTranslationsMutation.ts", () => ({
  useServiceAndModalitiesTitleTranslationsMutation: mutationFactoryMock,
}));

const queryData: ServiceAndModalitiesTitleTranslations = {
  asterixServicesTranslations: [
    {
      id: "service-translation-1",
      experience_id: "exp-1",
      language_code: "en",
      code: "SVC-1",
      name: "SVC-1 title",
      flow_code: "MANUAL_TRANSLATION",
      status_code: "TO_BE_EDIT",
      to_be_translated: false,
    },
    {
      id: "service-translation-2",
      experience_id: "exp-1",
      language_code: "en",
      code: "SVC-2",
      name: "SVC-2 title",
      flow_code: "MANUAL_TRANSLATION",
      status_code: "TO_BE_EDIT",
      to_be_translated: false,
    },
  ],
  asterixModalitiesTranslations: [
    {
      id: "modality-translation-1",
      asx_service_code_translation_id: "service-translation-1",
      experience_id: "exp-1",
      language_code: "en",
      asx_modality_code: "MOD-1",
      name: "MOD-1 title",
      flow_code: "MANUAL_TRANSLATION",
      status_code: "TO_BE_EDIT",
      to_be_translated: false,
    },
    {
      id: "modality-translation-2",
      asx_service_code_translation_id: "service-translation-1",
      experience_id: "exp-1",
      language_code: "en",
      asx_modality_code: "MOD-2",
      name: "MOD-2 title (SVC-1)",
      flow_code: "MANUAL_TRANSLATION",
      status_code: "TO_BE_EDIT",
      to_be_translated: false,
    },
    {
      id: "modality-translation-3",
      asx_service_code_translation_id: "service-translation-2",
      experience_id: "exp-1",
      language_code: "en",
      asx_modality_code: "MOD-2",
      name: "MOD-2 title (SVC-2)",
      flow_code: "MANUAL_TRANSLATION",
      status_code: "TO_BE_EDIT",
      to_be_translated: false,
    },
  ],
};
const expectedLastSavedValueFromQueryData = [
  {
    serviceCode: "SVC-1",
    title: "SVC-1 title",
    modalities: [
      {
        modalityCode: "MOD-1",
        title: "MOD-1 title",
      },
      {
        modalityCode: "MOD-2",
        title: "MOD-2 title (SVC-1)",
      },
    ],
  },
  {
    serviceCode: "SVC-2",
    title: "SVC-2 title",
    modalities: [
      {
        modalityCode: "MOD-2",
        title: "MOD-2 title (SVC-2)",
      },
    ],
  },
];
const newFieldValue = [
  {
    serviceCode: "SVC-1",
    title: "EDITED SVC-1 TITLE",
    modalities: [
      {
        modalityCode: "MOD-1",
        title: "EDITED MOD-1 TITLE",
      },
      {
        modalityCode: "MOD-2",
        title: "MOD-2 title (SVC-1)",
      },
    ],
  },
  {
    serviceCode: "SVC-2",
    title: "SVC-2 title",
    modalities: [
      {
        modalityCode: "MOD-2",
        title: "EDITED MOD-2 TITLE (SVC-2)",
      },
    ],
  },
];
const expectedTranslationsFromNewFieldValue: DataToUpdate = {
  servicesTranslationsToUpdate: [{ ...queryData.asterixServicesTranslations[0], name: "EDITED SVC-1 TITLE" }],
  modalitiesTranslationsToUpdate: [
    { ...queryData.asterixModalitiesTranslations[0], name: "EDITED MOD-1 TITLE" },
    { ...queryData.asterixModalitiesTranslations[2], name: "EDITED MOD-2 TITLE (SVC-2)" },
  ],
};

describe("useAsterixServiceAndModalitiesTitleTranslationsListField", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("lastSavedValue", () => {
    test("it should be an empty array before the data is retrieved for the first time", () => {
      const query = { data: ref<ServiceAndModalitiesTitleTranslations>() };
      queryFactoryMock.mockReturnValue(query);

      const field = useAsterixServiceAndModalitiesTitleTranslationsListField(ref("exp-id"), ref("en"));

      expect(field.lastSavedValue.value).toStrictEqual([]);
    });

    test("it should be updated when data from the query change", () => {
      const query = { data: ref<ServiceAndModalitiesTitleTranslations>() };
      queryFactoryMock.mockReturnValue(query);

      const field = useAsterixServiceAndModalitiesTitleTranslationsListField(ref("exp-id"), ref("en"));

      query.data.value = queryData;

      expect(field.lastSavedValue.value).toStrictEqual(expectedLastSavedValueFromQueryData);
    });
  });

  describe("isSaving", () => {
    beforeEach(() => {
      const query = { data: ref<ServiceAndModalitiesTitleTranslations>() };
      queryFactoryMock.mockReturnValue(query);

      const mutationIsPending = ref(false);
      const mutation = {
        isPending: mutationIsPending,
        mutateAsync: () => (mutationIsPending.value = true),
      };
      mutationFactoryMock.mockReturnValue(mutation);
    });

    test("it should be false while data is not being saved", () => {
      const field = useAsterixServiceAndModalitiesTitleTranslationsListField(ref("exp-id"), ref("en"));

      expect(field.isSaving.value).toBe(false);
    });

    test("it should be true while data is being saved", () => {
      const field = useAsterixServiceAndModalitiesTitleTranslationsListField(ref("exp-id"), ref("en"));

      const newData: ServiceAndModalitiesTitleListValue = [
        { serviceCode: "SVC-1", title: "svc title", modalities: [{ modalityCode: "MOD-1", title: "mod title" }] },
      ];

      // not awaiting the promise: we want to test what happen while it's still pending
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      field.save(newData);

      expect(field.isSaving.value).toBe(true);
    });
  });

  describe("save", () => {
    const mutateAsyncMock = vi.fn();

    beforeEach(() => {
      const query = { data: ref<ServiceAndModalitiesTitleTranslations>(queryData) };
      queryFactoryMock.mockReturnValue(query);

      const mutation = {
        isPending: ref(false),
        mutateAsync: mutateAsyncMock,
      };
      mutationFactoryMock.mockReturnValue(mutation);
    });

    test("it should do nothing when no title translation is different from the last saved value", async () => {
      const field = useAsterixServiceAndModalitiesTitleTranslationsListField(ref("exp-id"), ref("en"));

      await field.save(expectedLastSavedValueFromQueryData);

      expect(mutateAsyncMock).not.toHaveBeenCalled();
    });

    test("it should save only the title translations that are different from the last saved value", async () => {
      const field = useAsterixServiceAndModalitiesTitleTranslationsListField(ref("exp-id"), ref("en"));

      await field.save(newFieldValue);

      expect(mutateAsyncMock).toHaveBeenCalledWith(expectedTranslationsFromNewFieldValue);
    });
  });
});
