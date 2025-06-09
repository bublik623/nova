import { vi } from "vitest";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";

vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);
