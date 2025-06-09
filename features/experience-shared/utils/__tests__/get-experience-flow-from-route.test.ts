import { describe, it, expect } from "vitest";
import { DocumentContentType } from "@/types/DocumentStatuses";
import type { RouteLocationNormalizedGeneric } from "vue-router";
import { getExperienceFlowFromRoute } from "../get-experience-flow-from-route";

describe("getExperienceFlowFromUrl", () => {
  it("should return undefined if route name is undefined", () => {
    const route = { name: undefined } as RouteLocationNormalizedGeneric;
    expect(getExperienceFlowFromRoute(route)).toBeUndefined();
  });

  it("should return undefined if route name does not match any substring", () => {
    const route = { name: "unknown-route" } as RouteLocationNormalizedGeneric;
    expect(getExperienceFlowFromRoute(route)).toBeUndefined();
  });

  it("should return DocumentContentType.RAW when route name includes 'experience-id-raw'", () => {
    const route = { name: "my-experience-id-raw-test" } as RouteLocationNormalizedGeneric;
    expect(getExperienceFlowFromRoute(route)).toBe(DocumentContentType.RAW);
  });

  it("should return DocumentContentType.EDITORIAL when route name includes 'experience-id-curation'", () => {
    const route = { name: "experience-id-curation-test" } as RouteLocationNormalizedGeneric;
    expect(getExperienceFlowFromRoute(route)).toBe(DocumentContentType.EDITORIAL);
  });

  it("should return DocumentContentType.TRANSLATION when route name includes 'experience-id-translation'", () => {
    const route = { name: "foo-experience-id-translation-test" } as RouteLocationNormalizedGeneric;
    expect(getExperienceFlowFromRoute(route)).toBe(DocumentContentType.TRANSLATION);
  });

  it("should return DocumentContentType.MEDIA when route name includes 'experience-id-media'", () => {
    const route = { name: "experience-id-media-test" } as RouteLocationNormalizedGeneric;
    expect(getExperienceFlowFromRoute(route)).toBe(DocumentContentType.MEDIA);
  });

  it("should return flow from params if a valid params.flow is provided, ignoring route name", () => {
    const route = {
      name: "experience-id-curation-test",
      params: { flow: "RAW" },
    } as unknown as RouteLocationNormalizedGeneric;
    expect(getExperienceFlowFromRoute(route)).toBe(DocumentContentType.RAW);
  });

  it("should normalize params.flow to lowercase before parsing", () => {
    const route = {
      name: "unrelated-route",
      params: { flow: "eDiToRiAl" },
    } as unknown as RouteLocationNormalizedGeneric;
    expect(getExperienceFlowFromRoute(route)).toBe(DocumentContentType.EDITORIAL);
  });

  it("should fallback to routeName mapping if params.flow is provided but invalid", () => {
    const route = {
      name: "experience-id-translation-test",
      params: { flow: "invalid" },
    } as unknown as RouteLocationNormalizedGeneric;
    expect(getExperienceFlowFromRoute(route)).toBe(DocumentContentType.TRANSLATION);
  });

  it("should fallback to routeName mapping if params.flow is not a string", () => {
    const route = {
      name: "experience-id-media-test",
      params: { flow: 123 },
    } as unknown as RouteLocationNormalizedGeneric;
    expect(getExperienceFlowFromRoute(route)).toBe(DocumentContentType.MEDIA);
  });
});
