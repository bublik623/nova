import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import { hasPermission } from "@/features/roles/lib/has-permission";
import { useCurationExperienceStore } from "./useCurationExperienceStore";
import { setActivePinia, createPinia } from "pinia";
import { userShouldDefaultToCommercialView, VIEW_TYPE_ALL, VIEW_TYPE_COMMERCIAL } from "../lib/viewTypeUtils";
import { useRouteQuery } from "@vueuse/router";

const hasPermissionMock = hasPermission as Mock;

vi.mock("@/features/roles/lib/has-permission");
vi.mock("@vueuse/router");
vi.mock("../lib/viewTypeUtils");

const useRouteQueryMock = vi.mocked(useRouteQuery);
const userShouldDefaultToCommercialViewMock = vi.mocked(userShouldDefaultToCommercialView);

describe("useCurationExperienceStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  test('it should call hasPermission with "experience.curation.canWrite"', () => {
    useCurationExperienceStore();
    expect(hasPermissionMock).toHaveBeenCalledWith("experience.curation.canWrite");
  });

  test('it should return isReadonly as true if the user does not have the "experience.curation.canWrite" permission', () => {
    hasPermissionMock.mockReturnValue(false);
    const store = useCurationExperienceStore();

    expect(store.isReadonly).toBe(true);
  });

  test('it should return isReadonly as false if the user does have have the "experience.curation.canWrite" permission', () => {
    hasPermissionMock.mockReturnValue(true);
    const store = useCurationExperienceStore();

    expect(store.isReadonly).toBe(false);
  });

  test("it should return showRawFields true as default", () => {
    const store = useCurationExperienceStore();

    expect(store.showRawFields).toBe(true);
  });

  test("showRawField should be able to be toggled", () => {
    const store = useCurationExperienceStore();

    store.showRawFields = false;
    expect(store.showRawFields).toBe(false);
  });

  test("it should return selectedView as VIEW_TYPE_ALL as default", () => {
    useCurationExperienceStore();

    expect(useRouteQueryMock).toHaveBeenCalledWith("view", VIEW_TYPE_ALL);
  });

  test('it should return isCommercialView as false if selectedView is not "VIEW_TYPE_COMMERCIAL"', () => {
    useRouteQueryMock.mockReturnValueOnce(ref(VIEW_TYPE_ALL));
    const store = useCurationExperienceStore();

    expect(store.isCommercialView).toBe(false);
  });

  test('it should return isCommercialView as true if selectedView is "VIEW_TYPE_COMMERCIAL"', () => {
    useRouteQueryMock.mockReturnValueOnce(ref(VIEW_TYPE_COMMERCIAL));
    const store = useCurationExperienceStore();

    expect(store.isCommercialView).toBe(true);
  });

  test('it should set selectedView to "VIEW_TYPE_COMMERCIAL" if userShouldDefaultToCommercialView is true', () => {
    useRouteQueryMock.mockReturnValueOnce(ref(VIEW_TYPE_ALL));
    userShouldDefaultToCommercialViewMock.mockReturnValue(true);
    const store = useCurationExperienceStore();

    expect(store.selectedView).toBe(VIEW_TYPE_COMMERCIAL);
  });
});
