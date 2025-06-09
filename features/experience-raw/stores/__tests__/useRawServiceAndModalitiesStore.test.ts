import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useRawServiceAndModalitiesStore } from "../useRawServiceAndModalitiesStore";
import { createPinia, setActivePinia } from "pinia";
import { AsxExperience, ModalityCodes, RawAsterixAdapterInformation } from "@/types/generated/ExperienceRawServiceApi";

const fetchServicesMock = vi.hoisted(() =>
  vi.fn<(servicesAndRelatedModalities: Array<RawAsterixAdapterInformation>) => Promise<Array<AsxExperience>>>()
);
const searchServicesMock = vi.hoisted(() => vi.fn<(query: string) => Promise<Array<AsxExperience>>>());
const fetchModalitiesMock = vi.hoisted(() =>
  vi.fn<(servicesAndRelatedModalities: Array<RawAsterixAdapterInformation>) => Promise<Array<ModalityCodes>>>()
);
const searchModalitiesMock = vi.hoisted(() =>
  vi.fn<(serviceCode: string, query: string) => Promise<Array<ModalityCodes>>>()
);
vi.mock("@/features/experience-raw/lib/asterix-service-and-modalities-datasource.js", () => {
  return {
    useAsterixServiceAndModalitiesDataSource: () => ({
      fetchServices: fetchServicesMock,
      searchServices: searchServicesMock,
      fetchModalities: fetchModalitiesMock,
      searchModalities: searchModalitiesMock,
    }),
  };
});
const notificationStoreMock = {
  addNotification: vi.fn(),
};
vi.mock("@/stores/notifications", () => ({
  useNotifications: () => notificationStoreMock,
}));
const randomUUIDMock = vi.fn();
vi.stubGlobal("crypto", { randomUUID: randomUUIDMock });

describe("useRawServiceAndModalitiesStore", () => {
  function getServices(override: Partial<AsxExperience> = {}) {
    return [
      { code: "SVC-1", default_name: "Service 1", ...override },
      { code: "SVC-2", default_name: "Service 2", ...override },
      { code: "SVC-3", default_name: "Service 3", ...override },
      { code: "SVC-4", default_name: "Service 4", ...override },
    ];
  }

  const modalities = [
    { code: "MOD-1", default_name: "Modality 1" },
    { code: "MOD-2", default_name: "Modality 2" },
    { code: "MOD-3", default_name: "Modality 3" },
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("initSelectedServicesAndModalities", () => {
    test("it should retrieve the service and the modalities for each entry of the given input and update the state", async () => {
      const experienceId = "an experience id";
      const initialServiceAndModalitiesCodes = [
        { code: "SVC-2", modality_codes: ["MOD-1", "MOD-3"] },
        { code: "SVC-3", modality_codes: ["MOD-2"] },
      ];
      const services = getServices();
      const expectedState = [
        { id: "a random id 1", service: services[1], modalities: [modalities[0], modalities[2]] },
        { id: "a random id 2", service: services[2], modalities: [modalities[1]] },
      ];

      fetchServicesMock.mockReturnValueOnce(Promise.resolve([services[1], services[2]]));
      fetchModalitiesMock.mockReturnValueOnce(Promise.resolve([modalities[0], modalities[2], modalities[1]]));

      randomUUIDMock.mockReturnValueOnce("a random id 1");
      randomUUIDMock.mockReturnValueOnce("a random id 2");

      const store = useRawServiceAndModalitiesStore();

      await store.initSelectedServicesAndModalities(experienceId, initialServiceAndModalitiesCodes);

      expect(store.selectedServicesAndModalities).toStrictEqual(expectedState);
    });
  });

  describe("addNew", () => {
    test("it should add a new service and modalities entry with a randomly generated id", () => {
      randomUUIDMock.mockReturnValueOnce("a random id");

      const store = useRawServiceAndModalitiesStore();

      expect(store.selectedServicesAndModalities.length).toBe(0);

      store.addNew();

      expect(store.selectedServicesAndModalities.length).toBe(1);
      expect(store.selectedServicesAndModalities[0]).toEqual(
        expect.objectContaining({ id: "a random id", service: undefined, modalities: expect.arrayContaining([]) })
      );
    });
  });

  describe("remove", () => {
    test("it should remove the service and modalities entry that match the given id when it exists", () => {
      const store = useRawServiceAndModalitiesStore();
      store.selectedServicesAndModalities = [
        { id: "id-1", service: undefined, modalities: [] },
        { id: "id-2", service: undefined, modalities: [] },
      ];

      store.remove("id-1");

      expect(store.selectedServicesAndModalities.length).toBe(1);
      expect(store.selectedServicesAndModalities[0]).toEqual(
        expect.objectContaining({ id: "id-2", service: undefined, modalities: expect.arrayContaining([]) })
      );
    });

    test("it should throw an error when no entry match the given id", () => {
      const store = useRawServiceAndModalitiesStore();
      store.selectedServicesAndModalities = [
        { id: "id-1", service: undefined, modalities: [] },
        { id: "id-2", service: undefined, modalities: [] },
      ];

      expect(() => store.remove("id-5")).toThrowError(
        `can't find service and related modalities matching the given id: 'id-5'`
      );
    });
  });

  describe("getAvailableServices", async () => {
    test("it should search the available service with the given query and return as selectable (can_be_selected = true) the asterix services that aren't linked to any nova experience", async () => {
      const store = useRawServiceAndModalitiesStore();
      store.selectedServicesAndModalities = [
        { id: "id-1", service: undefined, modalities: [] },
        { id: "id-2", service: undefined, modalities: [] },
      ];
      const services = getServices();
      const expectedResult = services.map((service) => ({
        ...service,
        can_be_selected: true,
        reference_code: undefined,
      }));

      searchServicesMock.mockReturnValueOnce(Promise.resolve(services));

      const result = await store.getAvailableServices("id-1", "a query");

      expect(searchServicesMock).toHaveBeenCalledWith("a query", 0, 100);
      expect(result).toStrictEqual(expectedResult);
    });

    test("it should search the available service with the given query and return as non selectable (can_be_selected = false) the asterix services that are already linked to a different nova selection", async () => {
      const store = useRawServiceAndModalitiesStore();
      store.selectedServicesAndModalities = [
        { id: "id-1", service: undefined, modalities: [] },
        { id: "id-2", service: undefined, modalities: [] },
      ];
      const services = getServices({ reference_code: "REFERENCE CODE OF DIFFERENT EXPERIENCE" });
      const expectedResult = services.map((service) => ({
        ...service,
        can_be_selected: false,
        reference_code: "REFERENCE CODE OF DIFFERENT EXPERIENCE",
      }));

      searchServicesMock.mockReturnValueOnce(Promise.resolve(services));

      const result = await store.getAvailableServices("id-1", "a query");

      expect(result).toStrictEqual(expectedResult);
    });

    test("it should search the available service with the given query and return as non selectable (can_be_selected = false) the asterix services that are already linked to the same nova experience but different entries", async () => {
      const store = useRawServiceAndModalitiesStore();
      const allServices = getServices();
      const serviceSelectedOnDifferentEntry = allServices[0];
      const serviceNotSelected = [...allServices];
      serviceNotSelected.splice(0, 1);
      store.experienceReferenceCode = "REFERENCE CODE OF CURRENT EXPERIENCE";
      store.selectedServicesAndModalities = [
        { id: "id-1", service: undefined, modalities: [] },
        { id: "id-2", service: serviceSelectedOnDifferentEntry, modalities: [] },
      ];
      const expectedResult = [
        {
          ...serviceSelectedOnDifferentEntry,
          can_be_selected: false,
          reference_code: "REFERENCE CODE OF CURRENT EXPERIENCE",
        },
        ...serviceNotSelected.map((service) => ({
          ...service,
          can_be_selected: true,
          reference_code: undefined,
        })),
      ];

      searchServicesMock.mockReturnValueOnce(Promise.resolve(allServices));

      const result = await store.getAvailableServices("id-1", "a query");

      expect(result.sort()).toStrictEqual(expectedResult.sort());
    });

    test("it should throw an error when no entry match the given id", async () => {
      const store = useRawServiceAndModalitiesStore();

      await expect(async () => await store.getAvailableServices("id-1", "a query")).rejects.toThrowError(
        `can't find service and related modalities matching the given id: 'id-1'`
      );
    });
  });

  describe("setSelectedService", () => {
    test("it should set the given service in the entry identified by the given id", () => {
      const store = useRawServiceAndModalitiesStore();
      const services = getServices();
      store.selectedServicesAndModalities = [{ id: "id-1", service: services[0], modalities: [] }];

      store.setSelectedService("id-1", services[1]);

      expect(store.selectedServicesAndModalities[0].service).toStrictEqual(services[1]);
    });

    test("it should remove the modalities from the entry identified by the given id when the given service is different from the one already selected", () => {
      const store = useRawServiceAndModalitiesStore();
      const services = getServices();
      store.selectedServicesAndModalities = [
        {
          id: "id-1",
          service: services[0],
          modalities: [
            { code: "MOD-1", default_name: "a name" },
            { code: "MOD-2", default_name: "another name" },
          ],
        },
      ];

      store.setSelectedService("id-1", services[1]);

      expect(store.selectedServicesAndModalities[0].modalities.length).toBe(0);
    });

    test("it should NOT remove the modalities from the entry identified by the given id when the given service is the same as the one already selected", () => {
      const store = useRawServiceAndModalitiesStore();
      const services = getServices();
      store.selectedServicesAndModalities = [
        {
          id: "id-1",
          service: services[0],
          modalities: [
            { code: "MOD-1", default_name: "a name" },
            { code: "MOD-2", default_name: "another name" },
          ],
        },
      ];

      store.setSelectedService("id-1", services[0]);

      expect(store.selectedServicesAndModalities[0].modalities).toStrictEqual([
        { code: "MOD-1", default_name: "a name" },
        { code: "MOD-2", default_name: "another name" },
      ]);
    });

    test("it should throw an error when no entry match the given id", () => {
      const store = useRawServiceAndModalitiesStore();
      const services = getServices();

      expect(() => store.setSelectedService("id-1", services[1])).toThrowError(
        `can't find service and related modalities matching the given id: 'id-1'`
      );
    });
  });

  describe("getAvailableModalities", () => {
    test("it should search the available modalities linked to the service of the entry matching the given id", async () => {
      const store = useRawServiceAndModalitiesStore();
      const services = getServices();
      store.selectedServicesAndModalities = [
        { id: "id-1", service: services[0], modalities: [] },
        { id: "id-2", service: undefined, modalities: [] },
      ];

      searchModalitiesMock.mockReturnValueOnce(Promise.resolve(modalities));

      const result = await store.getAvailableModalities("id-1", "a query");

      expect(searchModalitiesMock).toHaveBeenCalledWith(services[0].code, "a query", 0, 100);
      expect(result).toStrictEqual(modalities);
    });

    test("it should throw error when no service is set in the entry matching the given id", async () => {
      const store = useRawServiceAndModalitiesStore();
      const services = getServices();
      store.selectedServicesAndModalities = [
        { id: "id-1", service: undefined, modalities: [] },
        { id: "id-2", service: undefined, modalities: [] },
      ];

      searchServicesMock.mockReturnValueOnce(Promise.resolve(services));

      await expect(async () => await store.getAvailableModalities("id-1", "a query")).rejects.toThrowError(
        "can't get available modalities when a service is not set"
      );

      expect(searchServicesMock).not.toHaveBeenCalled();
    });

    test("it should throw an error when no entry match the given id", async () => {
      const store = useRawServiceAndModalitiesStore();

      await expect(async () => await store.getAvailableModalities("id-1", "a query")).rejects.toThrowError(
        `can't find service and related modalities matching the given id: 'id-1'`
      );
    });
  });

  describe("hasAnySelectedModality", () => {
    test("it should return true when the entry matching the given id have at least one modality selected", () => {
      const store = useRawServiceAndModalitiesStore();
      const services = getServices();
      store.selectedServicesAndModalities = [{ id: "id-1", service: services[0], modalities: [modalities[0]] }];

      const result = store.hasAnySelectedModality("id-1");
      expect(result).toBe(true);
    });

    test("it should return false when the entry matching the given id have no modality selected", () => {
      const store = useRawServiceAndModalitiesStore();
      const services = getServices();
      store.selectedServicesAndModalities = [{ id: "id-1", service: services[0], modalities: [] }];

      const result = store.hasAnySelectedModality("id-1");
      expect(result).toBe(false);
    });

    test("it should throw an error when no entry match the given id", () => {
      const store = useRawServiceAndModalitiesStore();

      expect(() => store.hasAnySelectedModality("id-1")).toThrowError(
        `can't find service and related modalities matching the given id: 'id-1'`
      );
    });
  });

  describe("toggleModalitySelection", () => {
    test("it should add the given modality to the entry matching the given id if it's not already there", async () => {
      const store = useRawServiceAndModalitiesStore();
      const services = getServices();
      store.selectedServicesAndModalities = [{ id: "id-1", service: services[0], modalities: [modalities[0]] }];

      store.toggleModalitySelection("id-1", modalities[1]);

      expect(store.selectedServicesAndModalities[0].modalities[1]).toStrictEqual(modalities[1]);
    });

    test("it should remove the given modality from the entry matching the given id if it's already there", async () => {
      const store = useRawServiceAndModalitiesStore();
      const services = getServices();
      store.selectedServicesAndModalities = [{ id: "id-1", service: services[0], modalities: [modalities[0]] }];

      store.toggleModalitySelection("id-1", modalities[0]);

      expect(store.selectedServicesAndModalities[0].modalities.length).toBe(0);
    });

    test("it should throw an error when no entry match the given id", async () => {
      const store = useRawServiceAndModalitiesStore();

      expect(() => store.toggleModalitySelection("id-1", modalities[0])).toThrowError(
        `can't find service and related modalities matching the given id: 'id-1'`
      );
    });
  });

  describe("removeModality", () => {
    test("it should remove the given modality from the entry matching the given id", async () => {
      const store = useRawServiceAndModalitiesStore();
      const services = getServices();
      store.selectedServicesAndModalities = [{ id: "id-1", service: services[0], modalities: [modalities[0]] }];

      store.removeModality("id-1", modalities[0]);

      expect(store.selectedServicesAndModalities[0].modalities.length).toBe(0);
    });

    test("it should do nothing when the given modality does not exist in entry matching the given id", async () => {
      const store = useRawServiceAndModalitiesStore();
      const services = getServices();
      store.selectedServicesAndModalities = [{ id: "id-1", service: services[0], modalities: [modalities[0]] }];

      store.removeModality("id-1", modalities[1]);

      expect(store.selectedServicesAndModalities[0].modalities).toStrictEqual([modalities[0]]);
    });

    test("it should throw an error when no entry match the given id", async () => {
      const store = useRawServiceAndModalitiesStore();

      expect(() => store.removeModality("id-1", modalities[0])).toThrowError(
        `can't find service and related modalities matching the given id: 'id-1'`
      );
    });
  });

  describe("removeAllModalities", () => {
    test("it should remove all the modalities from the entry matching the given id", async () => {
      const store = useRawServiceAndModalitiesStore();
      const services = getServices();
      store.selectedServicesAndModalities = [{ id: "id-1", service: services[0], modalities: [...modalities] }];

      store.removeAllModalities("id-1");

      expect(store.selectedServicesAndModalities[0].modalities.length).toBe(0);
    });

    test("it should throw an error when no entry match the given id", async () => {
      const store = useRawServiceAndModalitiesStore();

      expect(() => store.removeAllModalities("id-1")).toThrowError(
        `can't find service and related modalities matching the given id: 'id-1'`
      );
    });
  });
});
