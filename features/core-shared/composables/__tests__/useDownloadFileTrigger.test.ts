import { vi, describe, expect, test, beforeEach } from "vitest";
import { useDownloadFileTrigger } from "../useDownloadFileTrigger";
import { withSetup } from "@/features/testing/utils/withSetup";

const fileName = "a file.ext";
const fileContent = new Blob();
const file = {
  fileName,
  fileContent,
};

const hrefSetterMock = vi.fn();
const anchorElementMock: Partial<HTMLAnchorElement> = {
  setAttribute: vi.fn(),
  set href(value: string) {
    hrefSetterMock(value);
  },
  click: vi.fn(),
};
const createElementMock = vi.fn(() => anchorElementMock as HTMLAnchorElement);

const appendChildMock = vi.fn((node) => node);
const removeChildMock = vi.fn((node) => node);

const originalCreateElement = global.document.createElement.bind(global.document);
global.document.createElement = createElementMock;
global.document.body.appendChild = appendChildMock;
global.document.body.removeChild = removeChildMock;

const objectURL = "an object url";
const createObjectURLMock = vi.fn().mockImplementation(() => objectURL);
global.URL.createObjectURL = createObjectURLMock;

describe("useDownloadFileTrigger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("it should create an anchor when it's constructed", () => {
    const rootContainer = originalCreateElement("div");
    withSetup(rootContainer, useDownloadFileTrigger);

    expect(createElementMock).toHaveBeenCalledWith("a");
  });

  test("it should append the anchor to the body when it's mounted", () => {
    const rootContainer = originalCreateElement("div");
    withSetup(rootContainer, useDownloadFileTrigger);

    expect(appendChildMock).toHaveBeenCalledWith(anchorElementMock);
  });

  test("it should remove the anchor from the body when it's unmounted", () => {
    const rootContainer = originalCreateElement("div");
    const [_, app] = withSetup(rootContainer, useDownloadFileTrigger);

    app.unmount();

    expect(removeChildMock).toHaveBeenCalledWith(anchorElementMock);
  });

  describe("triggerBrowserDownload", () => {
    test("download should trigger the download of the given file", () => {
      const rootContainer = originalCreateElement("div");
      const [composableInstance, _] = withSetup(rootContainer, useDownloadFileTrigger);

      composableInstance!.triggerBrowserDownload(file);

      expect(anchorElementMock.setAttribute).toHaveBeenCalledWith("download", fileName);
      expect(createObjectURLMock).toHaveBeenCalledOnce();
      expect(createObjectURLMock).toHaveBeenCalledWith(fileContent);
      expect(hrefSetterMock).toHaveBeenCalledOnce();
      expect(hrefSetterMock).toHaveBeenCalledWith(objectURL);
      expect(anchorElementMock.click).toHaveBeenCalledOnce();
    });
  });
});
