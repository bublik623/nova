import { RuntimeConfig } from "nuxt/schema";

type MockRuntimeConfig = {
  public: Partial<RuntimeConfig["public"]>;
  app: Partial<RuntimeConfig["app"]>;
};

export const mockRuntimePublicConfig: MockRuntimeConfig["public"] = {
  APP_ENV: "test",
  COGNITO_DOMAIN: "cognito-domain-url",
  COGNITO_REDIRECT_URI: "cognito-redirect-url",
  COGNITO_CLIENT_ID: "client-id",
  AUTH_TOKEN: "test-token",
  CHARLIE_CONTENT_MASTER_DATA_SERVICE_BASE_URL: "charlie-master-data-test-url",
  CONTENT_COMMAND_SERVICE_BASE_URL: "test-url",
  CONTENT_ANALYTICS_SERVICE_BASE_URL: "content-analytics-test-url",
  CONTENT_MASTER_DATA_SERVICE_BASE_URL: "content-master-data-test-url",
  CONTENT_QUERY_SERVICE_BASE_URL: "content-query-test-url",
  EXPERIENCE_RAW_SERVICE_BASE_URL: "test-url",
  EXPERIENCE_MASTER_DATA_SERVICE_BASE_URL: "test-url",
  METADATA_EXPERIENCE_SERVICE_BASE_URL: "test-url",
  OFFER_SERVICE_BASE_URL: "test-offer-service-url",
  INVENTORY_SERVICE_BASE_URL: "test-inventory-service-url",
  PICKUP_PLACE_SERVICE_BASE_URL: "test-pickup-place-service-url",
  PICKUP_EXPERIENCE_SERVICE_BASE_URL: "test-pickup-experience-service-url",
  DAM_SERVICE_BASE_URL: "test-dam-service-url",
  WATCH_DEBOUNCE_TIMEOUT: "10",
  SUPPLIER_ID: "test-supplier-id",
  GEO_MASTER_DATA_BASE_URL: "test-geo-masterdata-url",
  CONTRACT_MASTER_DATA_SERVICE_BASE_URL: "test-contract-master-data-url",
  SUPPLIER_ENROLLMENT_SERVICE_BASE_URL: "test-supplier-enrollment-url",
  MAINTENANCE: false,
  CONFIGCAT_SDK_KEY: "test-configcat-key",
};

export function mockUseRuntimeConfig(): MockRuntimeConfig {
  return {
    public: mockRuntimePublicConfig,
    app: {},
  };
}
