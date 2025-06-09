import {
  mapMediaSnapshotValues,
  mapRawSnapshotValues,
  mapSnapshotValues,
} from "@/features/experience-revision/lib/map-values";
import { Snapshot } from "@/types/Snapshots";
import { DistributionContent, RawSnapshot } from "@/types/generated/ExperienceRawServiceApi";
import { describe, expect, test, vi } from "vitest";
import * as utilsMock from "@/utils/additional-services-utils";

const masterDataStoreMock = {
  suppliers: [
    {
      id: "SUPPLIER123",
      name: "SUPPLIER123",
    },
  ],
  getHighlightByCode: vi.fn(),
};
vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataStoreMock,
}));

vi.mock("@/utils/uuid", () => ({
  uuid: () => "uuid-mock",
}));

const addServiceSpy = vi.spyOn(utilsMock, "getSelectedAdditionalServices").mockImplementation(() => "Test Service");

const mockSnapshot = {
  creation_date: "2024-06-20T07:04:04.698Z",
  updated_date: "2024-07-15T09:20:36.611Z",
  id: "16257219-c5d1-4c5e-8548-1437f7174824",
  experience_id: "182368a2-2879-4a43-b5f7-94fdc3e59641",
  reference_code: "EXP0016118",
  supplier_id: "082d65c7-3d18-484b-9dc5-6e33ef73be49",
  version_id: "v1",
  version_status: "ARCHIVED",
  user_version: "userqa.nova",
  experience_commercial_information: {
    experience_media: {
      id: "f1ea3518-47dd-4559-bc78-6a0147963bc8",
      flow_code: "MEDIA",
      status_code: "TO_BE_EDIT",
      images: [
        {
          file_name: "thumb_4582441_cover.jpg",
          preview_url: "https://tuigroup.fotoware.cloud/fotoweb/embed/2023/05/45dac52404b547ad8d416c917f53720c.jpg",
          visualization_order: 1,
          image_type: "GALLERY",
          creation_date: "2024-05-24T08:33:36.996",
          updated_date: "2024-05-24T08:33:36.996",
        },
      ],
    },
    translations: [
      {
        language_code: "en",
        experience_translation: {
          id: "80f4b554-2572-40de-8101-73b0cc3f03cd",
          title: "14f34aa5-5f26-4c4d-b628-d79fdbd29252",
          text1: "<p>Any description</p>",
          text2: "<p>Any Additional description</p>",
          seo_title: "Seo meta title test",
          seo_description: "<p>Any description seo</p>",
          info_voucher: "<p>Any Voucher instructions</p>",
          meeting_point_details: "<p>Any Meeting point details</p>",
          flow_code: "CURATION",
          status_code: "READY",
          curation_quality: "false",
          creation_date: "2024-06-20T07:03:51.557Z",
          updated_date: "2024-06-20T07:04:04.427Z",
        },
        customs: {
          custom_highlights: [
            {
              id: "839c572c-55b9-4099-ad14-f359aa506bfb",
              code: "local-ldbww1hbnaa",
              name: "Any custom highlights",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "CURATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_included: [
            {
              id: "eafd6938-02b0-4c07-9eb5-35f8fc2aa77f",
              code: "local-priegw62uff",
              name: "Any custom included",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "CURATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_non_included: [
            {
              id: "bc56a952-cb36-40b8-8e18-7f709925d370",
              code: "local-5ix4q1bbx15",
              name: "Any custom non-included",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "CURATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_important_information: [
            {
              id: "3f10a833-87f2-4bf4-aaba-4cf29f7dccb9",
              code: "local-46jtkk3bzku",
              name: "Any custom important information",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "CURATION",
              status_code: "TO_BE_EDIT",
            },
          ],
        },
      },
      {
        language_code: "it",
        experience_translation: {
          id: "0fcfe9cd-5b32-4e49-bc93-77e14a9a4c77",
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
          curation_quality: "false",
          creation_date: "2024-06-20T07:04:04.133Z",
          updated_date: "2024-06-20T07:04:04.133Z",
        },
        customs: {
          custom_highlights: [
            {
              id: "5a7d980a-68c7-4bbc-aab4-76a180176bbd",
              code: "local-ldbww1hbnaa",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_included: [
            {
              id: "5a90937f-d0c2-49c7-a863-a9a283737533",
              code: "local-priegw62uff",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_non_included: [
            {
              id: "add517f6-c784-4286-87af-ed0ed9635210",
              code: "local-5ix4q1bbx15",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_important_information: [
            {
              id: "c984e722-e7ea-4c73-859c-9ce49f90a30d",
              code: "local-46jtkk3bzku",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
        },
      },
      {
        language_code: "de",
        experience_translation: {
          id: "75d1e590-2c57-46bf-82e2-7d90c2313f12",
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
          curation_quality: "false",
          creation_date: "2024-06-20T07:04:04.135Z",
          updated_date: "2024-06-20T07:04:04.135Z",
        },
        customs: {
          custom_highlights: [
            {
              id: "b7e050b2-e40d-4e50-be44-bb6019551f3d",
              code: "local-ldbww1hbnaa",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_included: [
            {
              id: "e8b66587-0a2c-4fc8-b499-b2b5c03aaf65",
              code: "local-priegw62uff",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_non_included: [
            {
              id: "b795a8a3-dba1-49e0-a021-ca856d1d6f9c",
              code: "local-5ix4q1bbx15",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_important_information: [
            {
              id: "19753343-f4eb-408c-b614-940ad808cba8",
              code: "local-46jtkk3bzku",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
        },
      },
      {
        language_code: "fr",
        experience_translation: {
          id: "3c688577-370c-4f6e-99e2-600ebf30377e",
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
          curation_quality: "false",
          creation_date: "2024-06-20T07:04:04.137Z",
          updated_date: "2024-06-20T07:04:04.137Z",
        },
        customs: {
          custom_highlights: [
            {
              id: "44d66b8e-085f-49bf-9d8e-dcb1a78ca324",
              code: "local-ldbww1hbnaa",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_included: [
            {
              id: "d2f449a3-a345-4238-9309-2a647078fc9e",
              code: "local-priegw62uff",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_non_included: [
            {
              id: "dfc073d2-3ca8-41e2-bf05-6aef9c6704c2",
              code: "local-5ix4q1bbx15",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_important_information: [
            {
              id: "7b078f99-4e84-4890-8401-a0ccab5b5c20",
              code: "local-46jtkk3bzku",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
        },
      },
      {
        language_code: "nl",
        experience_translation: {
          id: "b7ec8df9-aae3-4ecf-ae0e-5e923e352c45",
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
          curation_quality: "false",
          creation_date: "2024-06-20T07:04:04.139Z",
          updated_date: "2024-06-20T07:04:04.139Z",
        },
        customs: {
          custom_highlights: [
            {
              id: "6db3d625-2b00-4767-a833-2bd59496738a",
              code: "local-ldbww1hbnaa",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_included: [
            {
              id: "079341e4-aed1-4a40-bbf2-2ab046b64dcf",
              code: "local-priegw62uff",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_non_included: [
            {
              id: "bb1662ee-ff2a-4c28-9232-98f67174dea4",
              code: "local-5ix4q1bbx15",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_important_information: [
            {
              id: "b6ca91b1-9b3a-4aa7-a3de-ae928d116214",
              code: "local-46jtkk3bzku",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
        },
      },
      {
        language_code: "pl",
        experience_translation: {
          id: "9e3492b6-a207-4166-b1c9-c4e541569e14",
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
          curation_quality: "false",
          creation_date: "2024-06-20T07:04:04.140Z",
          updated_date: "2024-06-20T07:04:04.140Z",
        },
        customs: {
          custom_highlights: [
            {
              id: "7e68000c-3d4e-4691-b8a8-ad8e278a4f17",
              code: "local-ldbww1hbnaa",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_included: [
            {
              id: "6bfceeb0-bbad-49ee-a109-87a57bff2f3e",
              code: "local-priegw62uff",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_non_included: [
            {
              id: "edd56126-b248-4045-bc12-b331c3b464c6",
              code: "local-5ix4q1bbx15",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_important_information: [
            {
              id: "a78f2d01-0e40-414f-8d10-e0f1553f5b1f",
              code: "local-46jtkk3bzku",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
        },
      },
      {
        language_code: "pt",
        experience_translation: {
          id: "5fe5b738-b873-42bc-b62e-b4824479fe59",
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
          curation_quality: "false",
          creation_date: "2024-06-20T07:04:04.177Z",
          updated_date: "2024-06-20T07:04:04.177Z",
        },
        customs: {
          custom_highlights: [
            {
              id: "3e786fd3-a0d3-44e7-b5a3-ab53c6398c50",
              code: "local-ldbww1hbnaa",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_included: [
            {
              id: "465c330f-0ffd-43bd-a32f-6d01d3b82919",
              code: "local-priegw62uff",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_non_included: [
            {
              id: "db95a45f-b1b4-480f-951e-77144f50170d",
              code: "local-5ix4q1bbx15",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_important_information: [
            {
              id: "5c431851-c6d6-4f33-bd34-b98d3d9b86b4",
              code: "local-46jtkk3bzku",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
        },
      },
      {
        language_code: "ru",
        experience_translation: {
          id: "55521d3a-9c3a-48d6-a326-5e9f4cfae557",
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
          curation_quality: "false",
          creation_date: "2024-06-20T07:04:04.179Z",
          updated_date: "2024-06-20T07:04:04.179Z",
        },
        customs: {
          custom_highlights: [
            {
              id: "79c10795-2ae8-4bdd-9580-ef4f35a9a30d",
              code: "local-ldbww1hbnaa",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_included: [
            {
              id: "423cf85d-3000-4d47-a860-5f565b6c6e49",
              code: "local-priegw62uff",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_non_included: [
            {
              id: "916790ed-a835-49c0-8486-cecea1868d78",
              code: "local-5ix4q1bbx15",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_important_information: [
            {
              id: "fe2f3271-7b22-4933-8146-9dae5fc8f54d",
              code: "local-46jtkk3bzku",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
        },
      },
      {
        language_code: "dk",
        experience_translation: {
          id: "e4302e37-cdef-444b-8ba4-e5f6c1090639",
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
          curation_quality: "false",
          creation_date: "2024-06-20T07:04:04.183Z",
          updated_date: "2024-06-20T07:04:04.183Z",
        },
        customs: {
          custom_highlights: [
            {
              id: "f956fdf3-d51c-4bc8-b0c5-d806e7fc09e1",
              code: "local-ldbww1hbnaa",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_included: [
            {
              id: "c9d15534-01a6-4fff-b4ed-1794fa2e2fdd",
              code: "local-priegw62uff",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_non_included: [
            {
              id: "695698ee-1907-4b04-87d5-2bf944c13a18",
              code: "local-5ix4q1bbx15",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_important_information: [
            {
              id: "6c3bec01-358b-43e6-a7bc-d36be7ebb3fd",
              code: "local-46jtkk3bzku",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
        },
      },
      {
        language_code: "no",
        experience_translation: {
          id: "20a1f7fa-964a-4637-bc0e-55dde4be87a1",
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
          curation_quality: "false",
          creation_date: "2024-06-20T07:04:04.184Z",
          updated_date: "2024-06-20T07:04:04.184Z",
        },
        customs: {
          custom_highlights: [
            {
              id: "fb9b21dd-680f-4166-b60a-091dc6cc6890",
              code: "local-ldbww1hbnaa",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_included: [
            {
              id: "1fed7559-3633-468c-8b34-b093b51b10c2",
              code: "local-priegw62uff",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_non_included: [
            {
              id: "3e963621-2228-418d-aee6-a060c68e64ce",
              code: "local-5ix4q1bbx15",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_important_information: [
            {
              id: "521b1e52-4153-4665-ab9a-e11c1a6b72d8",
              code: "local-46jtkk3bzku",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
        },
      },
      {
        language_code: "fi",
        experience_translation: {
          id: "dc3c208a-7dfa-45b2-8df3-a20a5954fcd6",
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
          curation_quality: "false",
          creation_date: "2024-06-20T07:04:04.187Z",
          updated_date: "2024-06-20T07:04:04.187Z",
        },
        customs: {
          custom_highlights: [
            {
              id: "4d9b7bdd-ba93-49bb-902a-1513107fde37",
              code: "local-ldbww1hbnaa",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_included: [
            {
              id: "4e4725ea-1532-4d0a-aedc-6473a5916057",
              code: "local-priegw62uff",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_non_included: [
            {
              id: "22f39da7-2b24-431f-a734-c16c91e9dff2",
              code: "local-5ix4q1bbx15",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_important_information: [
            {
              id: "faad6a85-5752-4b2d-88a1-fe0ff3fc4e14",
              code: "local-46jtkk3bzku",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
        },
      },
      {
        language_code: "se",
        experience_translation: {
          id: "2a94e87d-290c-4dc9-b6c7-7e920df14c1e",
          flow_code: "MANUAL_TRANSLATION",
          status_code: "TO_BE_EDIT",
          curation_quality: "false",
          creation_date: "2024-06-20T07:04:04.189Z",
          updated_date: "2024-06-20T07:04:04.189Z",
        },
        customs: {
          custom_highlights: [
            {
              id: "9d0bc961-360c-433d-84f2-dd5290b5a135",
              code: "local-ldbww1hbnaa",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_included: [
            {
              id: "91916958-4dc4-40fb-8221-58f33eecd4c7",
              code: "local-priegw62uff",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_non_included: [
            {
              id: "766db2f4-02ec-4ba0-ad59-a1112a8a4aaa",
              code: "local-5ix4q1bbx15",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
          custom_important_information: [
            {
              id: "91132885-759b-4a0f-a6a3-577e9c08b342",
              code: "local-46jtkk3bzku",
              automatic_translation: false,
              visualization_order: 1,
              flow_code: "MANUAL_TRANSLATION",
              status_code: "TO_BE_EDIT",
            },
          ],
        },
      },
      {
        language_code: "es",
        experience_translation: {
          id: "d6d6dd71-5914-407b-91d4-f1aaa743e7ee",
          title: "14f34aa5-5f26-4c4d-b628-d79fdbd29252",
          text1: "<p>Cualquier descripción</p>",
          text2: "<p>Cualquier descripción adicional</p>",
          seo_title: "Prueba de metatítulos SEO",
          seo_description: "<p>Cualquier descripción SEO</p>",
          info_voucher: "<p>Cualquier instrucción del cupón</p>",
          meeting_point_details: "<p>Cualquier detalle del punto de encuentro.</p>",
          flow_code: "AUTOTRANSLATION",
          status_code: "IN_REVIEW",
          curation_quality: "false",
          creation_date: "2024-06-20T07:04:04.405Z",
          updated_date: "2024-06-20T07:04:04.405Z",
        },
        customs: {
          custom_highlights: [
            {
              id: "52cb0d7c-c355-4056-b9ab-eb1678b6b46f",
              code: "local-ldbww1hbnaa",
              name: "Cualquier resaltado personalizado",
              automatic_translation: true,
              visualization_order: 1,
              flow_code: "AUTOTRANSLATION",
              status_code: "IN_REVIEW",
            },
          ],
          custom_included: [
            {
              id: "56d439d6-1e2e-44f2-a60c-d020ef82f0a6",
              code: "local-priegw62uff",
              name: "Cualquier costumbre incluida",
              automatic_translation: true,
              visualization_order: 1,
              flow_code: "AUTOTRANSLATION",
              status_code: "IN_REVIEW",
            },
          ],
          custom_non_included: [
            {
              id: "cbf41dff-61f3-401e-875c-ae3a5f835b2b",
              code: "local-5ix4q1bbx15",
              name: "Cualquier costumbre no incluida",
              automatic_translation: true,
              visualization_order: 1,
              flow_code: "AUTOTRANSLATION",
              status_code: "IN_REVIEW",
            },
          ],
          custom_important_information: [
            {
              id: "82ba9280-04c5-412d-b209-1aecb4544eb7",
              code: "local-46jtkk3bzku",
              name: "Cualquier información importante personalizada",
              automatic_translation: true,
              visualization_order: 1,
              flow_code: "AUTOTRANSLATION",
              status_code: "IN_REVIEW",
            },
          ],
        },
      },
    ],
  },
  experience_functional_information: {
    additional_services: {
      id: "a322137c-fcba-4d19-9135-4f7fc7211326",
      codes: [
        "BRAND_TUI_COLLECTION",
        "OWN_OFFER_TUI_DESIGNED_OPERATED",
        "PROMOTIONAL_SPECIAL",
        "FEATURE_AUDIOGUIDE",
        "DURATION_UP_2",
      ],
      creation_date: "2024-06-20T07:03:51.546Z",
      updated_date: "2024-06-20T07:04:03.400Z",
    },
    categories: {
      id: "284bf0ec-8ae3-48b5-91ac-db2bee6e50a4",
      codes: ["BOAT_TRIPS"],
      creation_date: "2024-06-20T07:03:51.548Z",
      updated_date: "2024-06-20T07:04:03.411Z",
    },
    interests: {
      id: "8b6d81ec-aef5-40f3-9836-6a0030f79c3e",
      codes: ["WALKING_TOUR"],
      creation_date: "2024-06-20T07:03:51.547Z",
      updated_date: "2024-06-20T07:04:03.406Z",
    },
    markets: {
      id: "fc829040-33e8-4df8-97c3-7a22864576a4",
      codes: ["bo-2b"],
      creation_date: "2024-06-20T07:03:27.955Z",
      updated_date: "2024-06-20T07:04:03.420Z",
    },
    booking_information: {
      id: "9592347c-5514-4164-b055-eba34b0dfc5c",
      experience_id: "182368a2-2879-4a43-b5f7-94fdc3e59641",
      information: {
        voucher_type: "MOBILE",
        emergency_contact_number: { country_calling_code: "212", number: "0699999999" },
      },
      creation_date: "2024-06-20T07:03:11.786Z",
      updated_date: "2024-06-20T07:03:30.879Z",
    },
    booking_questions: [
      {
        id: "ce9eca98-926a-40f2-8618-cbcdd2beaf8b",
        option_id: "0ed4c0a1-ed03-4776-95be-e9633a0d28a6",
        questions: [
          { code: "firstname", is_mandatory: true, is_apply_all: false },
          { code: "lastname", is_mandatory: true, is_apply_all: false },
          { code: "departureTime", is_mandatory: true, is_apply_all: false },
          { code: "dateOfBirth", is_mandatory: true, is_apply_all: false },
          { code: "passport", is_mandatory: true, is_apply_all: false },
          { code: "numberOfParticipants", is_mandatory: true, is_apply_all: false },
          { code: "nationality", is_mandatory: true, is_apply_all: false },
        ],
        creation_date: "2024-06-20T07:03:40.125Z",
        updated_date: "2024-06-20T07:03:48.132Z",
      },
    ],
    location: {
      id: "4b4f1e50-9a09-4d0d-8161-7fc84e071ec5",
      experience_id: "182368a2-2879-4a43-b5f7-94fdc3e59641",
      latitude: "42.651711",
      longitude: "18.0858801",
      address: {
        direction: "Croatia, Brsečinska ulica, Dubrovnik, Croatia",
        city: "DBV",
        postal_code: "20000",
        country: "Croatia",
      },
      creation_date: "2024-06-20T07:03:24.225Z",
      updated_date: "2024-06-20T07:03:24.225Z",
    },
  },
} as unknown as Snapshot;

const mockRawSnapshot = {
  id: "1deb23f5-837a-4385-8fb6-23fa19d572d1",
  snapshot_date: "2024-07-30T09:18:53.147Z",
  version_id: "v1",
  user_version: "tommaso.bartolucci",
  raw: {
    id: "8411db45-6dc9-44ba-bcd6-f1c34c29d893",
    experience_id: "6ab12cef-b5bf-4719-ba23-d89edc79af08",
    functional: {
      external_reference_code: "test ref code",
      highlights: ["a072b698-34b2-4fef-9e96-57adf697f729"],
      included: ["dcb8c816-fc33-4e19-9850-4781b6e7cd45"],
      non_included: ["88cc56f4-29a8-42bb-b15f-20c35a2160c0"],
      important_information: ["de79fe25-5180-4c10-a1b1-5424bc19051b"],
      additional_services: [
        "BRAND_TUI_COLLECTION",
        "OWN_OFFER_TUI_DESIGNED_OPERATED",
        "PROMOTIONAL_SPECIAL",
        "FEATURE_AUDIOGUIDE",
        "FEATURE_FREE_CANCELLATION",
        "DURATION_UP_2",
      ],
      categories: ["BOAT_TRIPS"],
      interests: ["WALKING_TOUR"],
      location: {
        latitude: "43.8657155",
        longitude: "10.2500486",
        address: {
          direction: "Viareggio, Province of Lucca, Italy",
          city: "DBV",
          postal_code: "55049",
          country: "Croatia",
        },
      },
      markets: ["bo-2b"],
      booking_information: {
        voucher_type: "MOBILE",
        emergency_contact_number: { country_calling_code: "39", number: "132342424" },
      },
    },
    commercial: {
      title: "1805906d-b861-4380-bf6e-e06d5c8a6657",
      description: "<p>Any description</p>",
      additional_description: "<p>Any Additional description</p>",
      info_voucher: "<p>Any Voucher instructions</p>",
      meeting_point_details: "<p>Any Meeting point details</p>",
      custom_highlights: [{ code: "local-s1971laoi7", name: "Any custom highlights", visualization_order: 1 }],
      custom_included: [{ code: "local-zkzj17qrxzo", name: "Any custom included", visualization_order: 1 }],
      custom_non_included: [{ code: "local-xwoyn15szim", name: "Any custom non-included", visualization_order: 1 }],
      custom_important_information: [
        { code: "local-c7sjz441zy", name: "Any custom important information", visualization_order: 1 },
      ],
    },
    flow_code: "BASE",
    status_code: "SENT_TO_REVIEW",
    creation_date: "2024-05-24T08:32:26.945Z",
    updated_date: "2024-07-30T09:18:53.151Z",
    collection_criteria: {
      exceptional_experiences: "<p>test tui col</p>",
      created_with_care: "<p>test tui col</p>",
      best_value_guaranteed: "<p>test tui col</p>",
    },
  },
} as unknown as RawSnapshot;

const mockDistributionContent: DistributionContent = {
  experience_source: "NOVA",
  reference_code: "REF123",
  supplier_id: "SUPPLIER123",
};

describe("mapRawSnapshotValues", () => {
  test("should map raw snapshot values correctly", () => {
    const result = mapRawSnapshotValues(mockRawSnapshot, mockDistributionContent);

    expect(result).toMatchInlineSnapshot(`
      {
        "additionalDescription": "<p>Any Additional description</p>",
        "collectionCriteria": {
          "bestValueGuaranteed": "<p>test tui col</p>",
          "createdWithCare": "<p>test tui col</p>",
          "exceptionalExperiences": "<p>test tui col</p>",
        },
        "description": "<p>Any description</p>",
        "duration": "Test Service",
        "emergencyContact": {
          "country_calling_code": "39",
          "number": "132342424",
        },
        "experienceCategory": [
          "BOAT_TRIPS",
        ],
        "experienceInterest": [
          "WALKING_TOUR",
        ],
        "externalReferenceCode": "test ref code",
        "features": "Test Service",
        "flowCode": "BASE",
        "highlights": {
          "custom": [
            {
              "code": "local-s1971laoi7",
              "name": "Any custom highlights",
              "visualization_order": 1,
            },
          ],
          "premade": [
            undefined,
          ],
        },
        "importantInformation": {
          "custom": [
            {
              "code": "local-c7sjz441zy",
              "name": "Any custom important information",
              "visualization_order": 1,
            },
          ],
          "premade": [
            undefined,
          ],
        },
        "included": {
          "custom": [
            {
              "code": "local-zkzj17qrxzo",
              "name": "Any custom included",
              "visualization_order": 1,
            },
          ],
          "premade": [
            undefined,
          ],
        },
        "infoVoucher": "<p>Any Voucher instructions</p>",
        "location": {
          "address": {
            "city": "DBV",
            "country": "Croatia",
            "direction": "Viareggio, Province of Lucca, Italy",
            "postal_code": "55049",
          },
          "latitude": "43.8657155",
          "longitude": "10.2500486",
        },
        "markets": [
          "bo-2b",
        ],
        "meetingPointDetails": "<p>Any Meeting point details</p>",
        "natGeoTourLevel": "Test Service",
        "nonIncluded": {
          "custom": [
            {
              "code": "local-xwoyn15szim",
              "name": "Any custom non-included",
              "visualization_order": 1,
            },
          ],
          "premade": [
            undefined,
          ],
        },
        "ownOffer": "Test Service",
        "productBrand": "Test Service",
        "productType": "NOVA",
        "promotionalOption": "Test Service",
        "refCode": "REF123",
        "revisionDate": "2024-07-30T09:18:53.147Z",
        "seoDescription": undefined,
        "seoTitle": undefined,
        "statusCode": "SENT_TO_REVIEW",
        "supplierName": "SUPPLIER123",
        "title": "1805906d-b861-4380-bf6e-e06d5c8a6657",
        "voucherType": "MOBILE",
      }
    `);
  });
});

describe("mapSnapshotValues", () => {
  test("should map curation snapshot values correctly", () => {
    const result = mapSnapshotValues("curation", "en", mockSnapshot, mockDistributionContent);

    expect(addServiceSpy).toHaveBeenCalledTimes(12);
    expect(masterDataStoreMock.getHighlightByCode).toHaveBeenCalledTimes(4);

    expect(result).toMatchInlineSnapshot(`
      {
        "additionalDescription": "<p>Any Additional description</p>",
        "description": "<p>Any description</p>",
        "duration": "Test Service",
        "emergencyContact": {
          "country_calling_code": "212",
          "number": "0699999999",
        },
        "experienceCategory": [
          "BOAT_TRIPS",
        ],
        "experienceInterest": [
          "WALKING_TOUR",
        ],
        "externalReferenceCode": undefined,
        "features": "Test Service",
        "flowCode": "CURATION",
        "highlights": {
          "custom": [
            {
              "automatic_translation": false,
              "code": "local-ldbww1hbnaa",
              "flow_code": "CURATION",
              "id": "839c572c-55b9-4099-ad14-f359aa506bfb",
              "name": "Any custom highlights",
              "status_code": "TO_BE_EDIT",
              "visualization_order": 1,
            },
          ],
          "premade": [],
        },
        "images": [
          {
            "id": "uuid-mock",
            "name": "thumb_4582441_cover.jpg",
            "preview_url": "https://tuigroup.fotoware.cloud/fotoweb/embed/2023/05/45dac52404b547ad8d416c917f53720c.jpg",
            "visualization_order": 1,
          },
        ],
        "importantInformation": {
          "custom": [
            {
              "automatic_translation": false,
              "code": "local-46jtkk3bzku",
              "flow_code": "CURATION",
              "id": "3f10a833-87f2-4bf4-aaba-4cf29f7dccb9",
              "name": "Any custom important information",
              "status_code": "TO_BE_EDIT",
              "visualization_order": 1,
            },
          ],
          "premade": [],
        },
        "included": {
          "custom": [
            {
              "automatic_translation": false,
              "code": "local-priegw62uff",
              "flow_code": "CURATION",
              "id": "eafd6938-02b0-4c07-9eb5-35f8fc2aa77f",
              "name": "Any custom included",
              "status_code": "TO_BE_EDIT",
              "visualization_order": 1,
            },
          ],
          "premade": [],
        },
        "infoVoucher": "<p>Any Voucher instructions</p>",
        "location": {
          "address": {
            "city": "DBV",
            "country": "Croatia",
            "direction": "Croatia, Brsečinska ulica, Dubrovnik, Croatia",
            "postal_code": "20000",
          },
          "creation_date": "2024-06-20T07:03:24.225Z",
          "experience_id": "182368a2-2879-4a43-b5f7-94fdc3e59641",
          "id": "4b4f1e50-9a09-4d0d-8161-7fc84e071ec5",
          "latitude": "42.651711",
          "longitude": "18.0858801",
          "updated_date": "2024-06-20T07:03:24.225Z",
        },
        "markets": [
          "bo-2b",
        ],
        "meetingPointDetails": "<p>Any Meeting point details</p>",
        "natGeoTourLevel": "Test Service",
        "nonIncluded": {
          "custom": [
            {
              "automatic_translation": false,
              "code": "local-5ix4q1bbx15",
              "flow_code": "CURATION",
              "id": "bc56a952-cb36-40b8-8e18-7f709925d370",
              "name": "Any custom non-included",
              "status_code": "TO_BE_EDIT",
              "visualization_order": 1,
            },
          ],
          "premade": [],
        },
        "ownOffer": "Test Service",
        "productBrand": "Test Service",
        "productType": "NOVA",
        "promotionalOption": "Test Service",
        "refCode": "REF123",
        "revisionDate": "2024-06-20T07:04:04.698Z",
        "seoDescription": "<p>Any description seo</p>",
        "seoTitle": "Seo meta title test",
        "statusCode": "READY",
        "supplierName": "SUPPLIER123",
        "title": "14f34aa5-5f26-4c4d-b628-d79fdbd29252",
        "voucherType": "MOBILE",
      }
    `);
  });

  test("it should map the language correctly", () => {
    const result = mapSnapshotValues("translation", "fr", mockSnapshot, mockDistributionContent);

    expect(result).toMatchInlineSnapshot(`
      {
        "additionalDescription": undefined,
        "description": undefined,
        "duration": "Test Service",
        "emergencyContact": {
          "country_calling_code": "212",
          "number": "0699999999",
        },
        "experienceCategory": [
          "BOAT_TRIPS",
        ],
        "experienceInterest": [
          "WALKING_TOUR",
        ],
        "externalReferenceCode": undefined,
        "features": "Test Service",
        "flowCode": "MANUAL_TRANSLATION",
        "highlights": {
          "custom": [
            {
              "automatic_translation": false,
              "code": "local-ldbww1hbnaa",
              "flow_code": "MANUAL_TRANSLATION",
              "id": "44d66b8e-085f-49bf-9d8e-dcb1a78ca324",
              "status_code": "TO_BE_EDIT",
              "visualization_order": 1,
            },
          ],
          "premade": [],
        },
        "images": [
          {
            "id": "uuid-mock",
            "name": "thumb_4582441_cover.jpg",
            "preview_url": "https://tuigroup.fotoware.cloud/fotoweb/embed/2023/05/45dac52404b547ad8d416c917f53720c.jpg",
            "visualization_order": 1,
          },
        ],
        "importantInformation": {
          "custom": [
            {
              "automatic_translation": false,
              "code": "local-46jtkk3bzku",
              "flow_code": "MANUAL_TRANSLATION",
              "id": "7b078f99-4e84-4890-8401-a0ccab5b5c20",
              "status_code": "TO_BE_EDIT",
              "visualization_order": 1,
            },
          ],
          "premade": [],
        },
        "included": {
          "custom": [
            {
              "automatic_translation": false,
              "code": "local-priegw62uff",
              "flow_code": "MANUAL_TRANSLATION",
              "id": "d2f449a3-a345-4238-9309-2a647078fc9e",
              "status_code": "TO_BE_EDIT",
              "visualization_order": 1,
            },
          ],
          "premade": [],
        },
        "infoVoucher": undefined,
        "location": {
          "address": {
            "city": "DBV",
            "country": "Croatia",
            "direction": "Croatia, Brsečinska ulica, Dubrovnik, Croatia",
            "postal_code": "20000",
          },
          "creation_date": "2024-06-20T07:03:24.225Z",
          "experience_id": "182368a2-2879-4a43-b5f7-94fdc3e59641",
          "id": "4b4f1e50-9a09-4d0d-8161-7fc84e071ec5",
          "latitude": "42.651711",
          "longitude": "18.0858801",
          "updated_date": "2024-06-20T07:03:24.225Z",
        },
        "markets": [
          "bo-2b",
        ],
        "meetingPointDetails": undefined,
        "natGeoTourLevel": "Test Service",
        "nonIncluded": {
          "custom": [
            {
              "automatic_translation": false,
              "code": "local-5ix4q1bbx15",
              "flow_code": "MANUAL_TRANSLATION",
              "id": "dfc073d2-3ca8-41e2-bf05-6aef9c6704c2",
              "status_code": "TO_BE_EDIT",
              "visualization_order": 1,
            },
          ],
          "premade": [],
        },
        "ownOffer": "Test Service",
        "productBrand": "Test Service",
        "productType": "NOVA",
        "promotionalOption": "Test Service",
        "refCode": "REF123",
        "revisionDate": "2024-06-20T07:04:04.698Z",
        "seoDescription": undefined,
        "seoTitle": undefined,
        "statusCode": "TO_BE_EDIT",
        "supplierName": "SUPPLIER123",
        "title": undefined,
        "voucherType": "MOBILE",
      }
    `);
  });

  describe("mapMediaSnapshotValues", () => {
    test("it should map the media correctly", () => {
      const result = mapMediaSnapshotValues(mockSnapshot);

      expect(result).toEqual({
        flowCode: "MEDIA",
        images: [
          {
            id: "uuid-mock",
            name: "thumb_4582441_cover.jpg",
            preview_url: "https://tuigroup.fotoware.cloud/fotoweb/embed/2023/05/45dac52404b547ad8d416c917f53720c.jpg",
            visualization_order: 1,
          },
        ],
        productType: undefined,
        refCode: "EXP0016118",
        revisionDate: "2024-06-20T07:04:04.698Z",
        statusCode: "TO_BE_EDIT",
      });
    });
  });
});
