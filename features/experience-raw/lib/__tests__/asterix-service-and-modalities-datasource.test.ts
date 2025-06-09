import { AsxExperience, ModalityCodes, RawAsterixAdapterInformation } from "@/types/generated/ExperienceRawServiceApi";
import { afterEach, describe, expect, test, vi } from "vitest";
import { useAsterixServiceAndModalitiesDataSource } from "../asterix-service-and-modalities-datasource";

const getAsterixServicesMock = vi.hoisted(() =>
  vi.fn<(query: string, offset: number, limit: number) => Promise<{ data: AsxExperience[] }>>()
);
const getAsterixModalitiesMock = vi.hoisted(() =>
  vi.fn<(serviceCode: string, offset: number, limit: number) => Promise<{ data: ModalityCodes[] }>>()
);

vi.mock("@/composables/useExperienceRawApi", () => {
  return {
    useExperienceRawApi: () => ({
      getAsterixServices: getAsterixServicesMock,
      getAsterixModalities: getAsterixModalitiesMock,
    }),
  };
});

const servicesAndRelatedModalities: RawAsterixAdapterInformation[] = [
  { code: "SVC-1", modality_codes: ["MOD-1", "MOD-2"] },
  { code: "SVC-2", modality_codes: ["MOD-4"] },
];

const serviceOne = { code: "SVC-1", default_name: "Service 1" };
const serviceTwo = { code: "SVC-2", default_name: "Service 2" };

const modalityOne = { code: "MOD-1", default_name: "Modality 1" };
const modalityTwo = { code: "MOD-2", default_name: "Modality 2" };
const modalityThree = { code: "MOD-3", default_name: "Modality 3" };
const modalityFour = { code: "MOD-4", default_name: "Modality 4" };
const modalityFive = { code: "MOD-5", default_name: "Modality 5" };

describe("useAsterixServiceAndModalitiesDataSource", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchServices", () => {
    test("it should use the search Backend API to retrieve the services matching each given service code", async () => {
      getAsterixServicesMock.mockReturnValueOnce(Promise.resolve({ data: [serviceOne] }));
      getAsterixServicesMock.mockReturnValueOnce(Promise.resolve({ data: [serviceTwo] }));

      const { fetchServices } = useAsterixServiceAndModalitiesDataSource();

      const result = await fetchServices(servicesAndRelatedModalities);

      expect(result).toStrictEqual([serviceOne, serviceTwo]);
    });

    describe("the Backend API return more than one service for a given service code", () => {
      test("it should return the first result that correctly match the service code", async () => {
        const serviceOneBis = { code: "SVC-1", default_name: "Service 1 bis" };
        getAsterixServicesMock.mockReturnValueOnce(Promise.resolve({ data: [serviceOne, serviceOneBis] }));
        getAsterixServicesMock.mockReturnValueOnce(Promise.resolve({ data: [serviceTwo] }));

        const { fetchServices } = useAsterixServiceAndModalitiesDataSource();

        const result = await fetchServices(servicesAndRelatedModalities);

        expect(result).toStrictEqual([serviceOne, serviceTwo]);
      });
    });

    describe("the Backend API return no services for a given service code", () => {
      test("it should log the missing service and still return the other matching services", async () => {
        const consoleMock = vi.spyOn(console, "log").mockImplementation(() => undefined);

        getAsterixServicesMock.mockReturnValueOnce(Promise.resolve({ data: [] }));
        getAsterixServicesMock.mockReturnValueOnce(Promise.resolve({ data: [serviceTwo] }));

        const { fetchServices } = useAsterixServiceAndModalitiesDataSource();

        const result = await fetchServices(servicesAndRelatedModalities);

        expect(consoleMock).toHaveBeenCalledWith("could not find Asterix Service with code 'SVC-1'");
        expect(result).toStrictEqual([serviceTwo]);
      });
    });
  });

  describe("searchServices", () => {
    test.each([
      { index: 0, size: 50, expectedOffset: 0, expectedLimit: 50 },
      { index: 1, size: 50, expectedOffset: 50, expectedLimit: 50 },
    ])(
      "it should use the Backend API to search for services matching the given query and return the requested result page",
      async (page: { index: number; size: number; expectedOffset: number; expectedLimit: number }) => {
        getAsterixServicesMock.mockReturnValueOnce(Promise.resolve({ data: [serviceOne, serviceTwo] }));

        const { searchServices } = useAsterixServiceAndModalitiesDataSource();

        const result = await searchServices("a query", page.index, page.size);

        expect(getAsterixServicesMock).toHaveBeenCalledWith("a query", page.expectedOffset, page.expectedLimit);
        expect(result).toStrictEqual([serviceOne, serviceTwo]);
      }
    );
  });

  describe("fetchModalities", () => {
    test("it should use the search Backend API to retrieve the modalities matching each given modality code", async () => {
      getAsterixModalitiesMock.mockReturnValueOnce(Promise.resolve({ data: [modalityOne, modalityTwo] }));
      getAsterixModalitiesMock.mockReturnValueOnce(
        Promise.resolve({ data: [modalityThree, modalityFour, modalityFive] })
      );

      const { fetchModalities } = useAsterixServiceAndModalitiesDataSource();

      const result = await fetchModalities(servicesAndRelatedModalities);

      expect(getAsterixModalitiesMock).toHaveBeenCalledWith("SVC-1", 0, 100);
      expect(getAsterixModalitiesMock).toHaveBeenCalledWith("SVC-2", 0, 100);

      expect(result).toStrictEqual([modalityOne, modalityTwo, modalityFour]);
    });
  });

  describe("searchModalities", () => {
    test.each([
      { index: 0, size: 50, expectedOffset: 0, expectedLimit: 50 },
      { index: 1, size: 50, expectedOffset: 50, expectedLimit: 50 },
    ])(
      "it should use the Backend API to retrieve the requested page of modalities of the given service",
      async (page: { index: number; size: number; expectedOffset: number; expectedLimit: number }) => {
        getAsterixModalitiesMock.mockReturnValueOnce(
          Promise.resolve({ data: [modalityThree, modalityFour, modalityFive] })
        );

        const { searchModalities } = useAsterixServiceAndModalitiesDataSource();

        const result = await searchModalities("SVC-2", "", page.index, page.size);

        expect(getAsterixModalitiesMock).toHaveBeenCalledWith("SVC-2", page.expectedOffset, page.expectedLimit);
        expect(result).toStrictEqual([modalityThree, modalityFour, modalityFive]);
      }
    );

    test.each(["keyword", "KEYWORD"])(
      "it should return only the modalities that includes the given query text in the code or default_name, no matter the casing",
      async (query) => {
        const modalityWithCodeMatchingQuery = { code: "code-including-keyword", default_name: "a name" };
        const modalityWithDefaultNameMatchingQuery = { code: "a code", default_name: "name including keyword etc" };
        getAsterixModalitiesMock.mockReturnValueOnce(
          Promise.resolve({
            data: [
              modalityOne,
              modalityTwo,
              modalityThree,
              modalityFour,
              modalityFive,
              modalityWithCodeMatchingQuery,
              modalityWithDefaultNameMatchingQuery,
            ],
          })
        );

        const { searchModalities } = useAsterixServiceAndModalitiesDataSource();

        const result = await searchModalities("SVC-2", query, 0, 50);

        expect(result).toStrictEqual([modalityWithCodeMatchingQuery, modalityWithDefaultNameMatchingQuery]);
      }
    );
  });
});
