import type { Page, Request } from "@playwright/test";

interface MockRequestOptions {
  headers?: Record<string, string>;
  responseBody?: unknown;
}

const statusCodeMap = {
  GET: 200,
  POST: 201,
  PUT: 204,
  PATCH: 204,
  DELETE: 204,
};

type HttpMethod = keyof typeof statusCodeMap;

export async function mockRequest<T>(
  page: Page,
  url: string | RegExp,
  method?: HttpMethod,
  options?: MockRequestOptions,
  responseProvider?: (request: Request) => { body?: T; headers?: { [key: string]: string } }
) {
  await page.route(url, async (route, req) => {
    if (method && req.method().toLowerCase() === method.toLowerCase()) {
      const responseBody = responseProvider?.(req)?.body ?? options?.responseBody ?? "";
      const responseHeaders = responseProvider?.(req)?.headers ?? options?.headers ?? "";

      await route.fulfill({
        status: statusCodeMap[method],
        body: JSON.stringify(responseBody),
        headers: {
          ...(responseHeaders ?? {}),
          "Access-Control-Expose-Headers": "*",
        },
      });
    } else {
      await route.continue();
    }
  });
}

export async function mockRequests(
  page: Page,
  url: string | RegExp,
  options: Partial<Record<HttpMethod, MockRequestOptions>>
) {
  await page.route(url, async (route, req) => {
    const method = req.method().toUpperCase() as HttpMethod;
    if (options[method]) {
      await route.fulfill({
        status: statusCodeMap[method],
        body: JSON.stringify(options[method]?.responseBody ?? ""),
        headers: {
          ...(options[method]?.headers ?? {}),
          "Access-Control-Expose-Headers": "*",
        },
      });
    } else {
      await route.continue();
    }
  });
}
