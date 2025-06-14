import { describe, expect, it } from "vitest";
import { rolePermissionsMapping } from "./roles-mapping";

// Those tests are more of a guard against accidental changes to the mapping.
describe("roles-mapping", () => {
  it("should export the correct role permissions mapping", () => {
    expect(rolePermissionsMapping).toMatchInlineSnapshot(`
      {
        "nova_admin": {
          "experience.curation.canRead": true,
          "experience.curation.canWrite": true,
          "experience.media.canRead": true,
          "experience.media.canWrite": true,
          "experience.opinoia.operational.canWrite": true,
          "experience.opinoia.raw-commercial.canWrite": true,
          "experience.options.canWrite": true,
          "experience.raw.canRead": true,
          "experience.raw.canSendToReview": true,
          "experience.raw.canWrite": true,
          "experience.translation.canRead": true,
          "experience.translation.canWrite": true,
          "masterdata-management.canWrite": true,
          "masterdata-management.translations.canWrite": true,
          "stop-sales.canWrite": true,
        },
        "nova_copywriter": {
          "experience.curation.canRead": true,
          "experience.curation.canWrite": true,
          "experience.media.canRead": true,
          "experience.media.canWrite": false,
          "experience.opinoia.operational.canWrite": false,
          "experience.opinoia.raw-commercial.canWrite": false,
          "experience.options.canWrite": false,
          "experience.raw.canRead": false,
          "experience.raw.canSendToReview": false,
          "experience.raw.canWrite": false,
          "experience.translation.canRead": true,
          "experience.translation.canWrite": false,
          "masterdata-management.canWrite": false,
          "masterdata-management.translations.canWrite": false,
          "stop-sales.canWrite": false,
        },
        "nova_media_manager": {
          "experience.curation.canRead": true,
          "experience.curation.canWrite": false,
          "experience.media.canRead": true,
          "experience.media.canWrite": true,
          "experience.opinoia.operational.canWrite": false,
          "experience.opinoia.raw-commercial.canWrite": false,
          "experience.options.canWrite": false,
          "experience.raw.canRead": false,
          "experience.raw.canSendToReview": false,
          "experience.raw.canWrite": false,
          "experience.translation.canRead": true,
          "experience.translation.canWrite": false,
          "masterdata-management.canWrite": false,
          "masterdata-management.translations.canWrite": false,
          "stop-sales.canWrite": false,
        },
        "nova_readonly": {
          "experience.curation.canRead": true,
          "experience.curation.canWrite": false,
          "experience.media.canRead": true,
          "experience.media.canWrite": false,
          "experience.opinoia.operational.canWrite": false,
          "experience.opinoia.raw-commercial.canWrite": false,
          "experience.options.canWrite": false,
          "experience.raw.canRead": true,
          "experience.raw.canSendToReview": false,
          "experience.raw.canWrite": false,
          "experience.translation.canRead": true,
          "experience.translation.canWrite": false,
          "masterdata-management.canWrite": false,
          "masterdata-management.translations.canWrite": false,
          "stop-sales.canWrite": false,
        },
        "nova_setup_exec": {
          "experience.curation.canRead": true,
          "experience.curation.canWrite": true,
          "experience.media.canRead": true,
          "experience.media.canWrite": true,
          "experience.opinoia.operational.canWrite": true,
          "experience.opinoia.raw-commercial.canWrite": false,
          "experience.options.canWrite": true,
          "experience.raw.canRead": true,
          "experience.raw.canSendToReview": true,
          "experience.raw.canWrite": true,
          "experience.translation.canRead": true,
          "experience.translation.canWrite": false,
          "masterdata-management.canWrite": false,
          "masterdata-management.translations.canWrite": false,
          "stop-sales.canWrite": true,
        },
        "nova_supply_manager": {
          "experience.curation.canRead": true,
          "experience.curation.canWrite": false,
          "experience.media.canRead": true,
          "experience.media.canWrite": true,
          "experience.opinoia.operational.canWrite": false,
          "experience.opinoia.raw-commercial.canWrite": true,
          "experience.options.canWrite": true,
          "experience.raw.canRead": true,
          "experience.raw.canSendToReview": true,
          "experience.raw.canWrite": true,
          "experience.translation.canRead": true,
          "experience.translation.canWrite": false,
          "masterdata-management.canWrite": false,
          "masterdata-management.translations.canWrite": false,
          "stop-sales.canWrite": false,
        },
        "nova_translator": {
          "experience.curation.canRead": true,
          "experience.curation.canWrite": false,
          "experience.media.canRead": true,
          "experience.media.canWrite": false,
          "experience.opinoia.operational.canWrite": false,
          "experience.opinoia.raw-commercial.canWrite": false,
          "experience.options.canWrite": false,
          "experience.raw.canRead": false,
          "experience.raw.canSendToReview": false,
          "experience.raw.canWrite": false,
          "experience.translation.canRead": true,
          "experience.translation.canWrite": true,
          "masterdata-management.canWrite": false,
          "masterdata-management.translations.canWrite": true,
          "stop-sales.canWrite": false,
        },
      }
    `);
  });
});
