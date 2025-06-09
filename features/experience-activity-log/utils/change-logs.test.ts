import { Log } from "@/types/generated/ContentAnalyticsApi";
import { describe, test, expect, vi, it } from "vitest";
import {
  groupLogsByDate,
  sortLogsByDate,
  cleanLogFieldNames,
  filterLogsByFlow,
  mapStatusChangeToLabel,
  groupAdditionalServiceExtraInfo,
  aggregateLogsByField,
} from "./change-logs";
import { ExperienceFlowCode } from "@/types/DocumentStatuses";

const logs: Log[] = [
  {
    id: "2ba52f79-1419-496a-9e22-7edee022ddec",
    field: "/description",
    entity: "experienceTranslation",
    flow_code: "test-flow-1",
    action: "created",
    user: "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
    action_date: "2022-10-03T13:10:00Z",
    new_value: "new",
    old_value: "old",
  },
  {
    id: "2ba52f79-1419-496a-9e22-7edee022ddec",
    field: "/images/0/is_cover",
    entity: "experienceTranslation",
    flow_code: "test-flow-1",
    action: "updated",
    user: "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
    action_date: "2022-10-03T14:10:00Z",
    new_value: "new",
    old_value: "old",
  },
  {
    id: "2ba52f79-1419-496a-9e22-7edee022ddec",
    field: "/highlights",
    entity: "experienceMetadata",
    flow_code: "test-flow-2",
    action: "deleted",
    user: "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
    action_date: "2022-10-07T13:10:00Z",
    new_value: "new",
    old_value: "old",
  },
  {
    id: "2ba52f79-1419-496a-9e22-7edee022ddec",
    field: "/creation_date",
    entity: "experienceTranslation",
    action: "updated",
    user: "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
    action_date: "2022-10-03T13:10:00Z",
    new_value: "new",
    old_value: "old",
  },
  {
    id: "2ba52f79-1419-496a-9e22-7edee022ddec",
    field: "/updated_date",
    entity: "experienceTranslation",
    action: "updated",
    user: "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
    action_date: "2022-10-03T13:10:00Z",
    new_value: "new",
    old_value: "old",
  },
  {
    id: "2ba52f79-1419-496a-9e22-7edee022ddec",
    field: "/id",
    entity: "experienceTranslation",
    action: "updated",
    user: "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
    action_date: "2022-10-03T13:10:00Z",
    new_value: "new",
    old_value: "old",
  },
  {
    id: "2ba52f79-1419-496a-9e22-7edee022ddec",
    field: "/text2",
    entity: "experienceTranslation",
    action: "updated",
    user: "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
    action_date: "2021-10-15T13:10:00Z",
    new_value: "new",
    old_value: "old",
  },
  {
    id: "2ba52f79-1419-496a-9e22-7edee022ddec",
    field: "/status_code",
    entity: "experienceMedia",
    action: "updated",
    user: "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
    action_date: "2021-10-15T13:10:00Z",
    new_value: "READY",
    old_value: "REVIEW",
  },
  {
    id: "2ba52f79-1419-496a-9e22-7edee022ddec",
    field: "/status_code",
    entity: "experienceMedia",
    action: "updated",
    user: "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
    action_date: "2021-10-15T13:10:00Z",
    new_value: "REVIEW",
    old_value: "TO_BE_EDIT",
  },
];
const additionalServiceLogs: Partial<Log>[] = [
  {
    field: "/additional_service_extra_info/PROMOTIONAL_SELL_OUT/additional_service_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "PROMOTIONAL_SELL_OUT",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/PROMOTIONAL_SELL_OUT/additional_service_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "Likely to sell out",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/PROMOTIONAL_SELL_OUT/hierarchical_group_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "PROMOTIONAL_OPTIONS",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/PROMOTIONAL_SELL_OUT/hierarchical_group_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "Promotional Options",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/OWN_OFFER_TUI_DESIGNED_3P_OPERATED/additional_service_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "OWN_OFFER_TUI_DESIGNED_3P_OPERATED",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/OWN_OFFER_TUI_DESIGNED_3P_OPERATED/additional_service_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "TUI Designed & 3P Operated",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/OWN_OFFER_TUI_DESIGNED_3P_OPERATED/hierarchical_group_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "OWN_OFFER",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/OWN_OFFER_TUI_DESIGNED_3P_OPERATED/hierarchical_group_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "Own offer classification",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/PROMOTIONAL_SPECIAL/additional_service_code",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "PROMOTIONAL_SPECIAL",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/PROMOTIONAL_SPECIAL/additional_service_name",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "Special offer/promo",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/PROMOTIONAL_SPECIAL/hierarchical_group_code",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "PROMOTIONAL_OPTIONS",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/PROMOTIONAL_SPECIAL/hierarchical_group_name",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "Promotional Options",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/OWN_OFFER_3P_DESIGNED_OPERATED/additional_service_code",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "OWN_OFFER_3P_DESIGNED_OPERATED",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/OWN_OFFER_3P_DESIGNED_OPERATED/additional_service_name",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "3P Designed & 3P Operated",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/OWN_OFFER_3P_DESIGNED_OPERATED/hierarchical_group_code",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "OWN_OFFER",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/OWN_OFFER_3P_DESIGNED_OPERATED/hierarchical_group_name",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "Own offer classification",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:47:39.529Z",
  },
  {
    field: "/additional_service_extra_info/NAT_GEO_TOUR_LEVEL_PREMIUM/additional_service_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "NAT_GEO_TOUR_LEVEL_PREMIUM",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/NAT_GEO_TOUR_LEVEL_PREMIUM/additional_service_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "Premium level",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/NAT_GEO_TOUR_LEVEL_PREMIUM/hierarchical_group_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "NAT_GEO_TOUR_LEVELS",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/NAT_GEO_TOUR_LEVEL_PREMIUM/hierarchical_group_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "NAT GEO TOUR LEVELS",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/PROMOTIONAL_NONE/additional_service_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "PROMOTIONAL_NONE",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/PROMOTIONAL_NONE/additional_service_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "None",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/PROMOTIONAL_NONE/hierarchical_group_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "PROMOTIONAL_OPTIONS",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/PROMOTIONAL_NONE/hierarchical_group_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "Promotional Options",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/PROMOTIONAL_SELL_OUT/additional_service_code",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "PROMOTIONAL_SELL_OUT",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/PROMOTIONAL_SELL_OUT/additional_service_name",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "Likely to sell out",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/PROMOTIONAL_SELL_OUT/hierarchical_group_code",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "PROMOTIONAL_OPTIONS",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/PROMOTIONAL_SELL_OUT/hierarchical_group_name",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "Promotional Options",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/NAT_GEO_TOUR_LEVEL_MID/additional_service_code",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "NAT_GEO_TOUR_LEVEL_MID",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/NAT_GEO_TOUR_LEVEL_MID/additional_service_name",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "Mid level",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/NAT_GEO_TOUR_LEVEL_MID/hierarchical_group_code",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "NAT_GEO_TOUR_LEVELS",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/NAT_GEO_TOUR_LEVEL_MID/hierarchical_group_name",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "NAT GEO TOUR LEVELS",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:01.27Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_INSTANT_CONFIRMATION/additional_service_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "FEATURE_INSTANT_CONFIRMATION",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_INSTANT_CONFIRMATION/additional_service_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "Instant confirmation",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_INSTANT_CONFIRMATION/hierarchical_group_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "FEATURES",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_INSTANT_CONFIRMATION/hierarchical_group_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "Features",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_MEAL_INCLUDED/additional_service_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "FEATURE_MEAL_INCLUDED",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_MEAL_INCLUDED/additional_service_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "Meal included",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_MEAL_INCLUDED/hierarchical_group_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "FEATURES",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_MEAL_INCLUDED/hierarchical_group_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "Features",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_PRIVATE_TRANSFERS/additional_service_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "FEATURE_PRIVATE_TRANSFERS",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_PRIVATE_TRANSFERS/additional_service_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "Private transfers",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_PRIVATE_TRANSFERS/hierarchical_group_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "FEATURES",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_PRIVATE_TRANSFERS/hierarchical_group_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "Features",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_GLOBAL_ACCOUNT/additional_service_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "FEATURE_GLOBAL_ACCOUNT",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_GLOBAL_ACCOUNT/additional_service_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "Global account",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_GLOBAL_ACCOUNT/hierarchical_group_code",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "FEATURES",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_GLOBAL_ACCOUNT/hierarchical_group_name",
    entity: "extendedexperienceadditionalservices",
    action: "created",
    new_value: "Features",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/updated_date",
    entity: "extendedexperienceadditionalservices",
    action: "updated",
    old_value: "2024-05-16T13:48:01.10460538",
    new_value: "2024-05-16T13:48:20.666378415",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_FREE_CANCELLATION/additional_service_code",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "FEATURE_FREE_CANCELLATION",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_FREE_CANCELLATION/additional_service_name",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "Free cancellation",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_FREE_CANCELLATION/hierarchical_group_code",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "FEATURES",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_FREE_CANCELLATION/hierarchical_group_name",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "Features",
    user: "dario.castiglione",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_EVOUCHER/additional_service_code",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "FEATURE_EVOUCHER",
    user: "ernesto.basile",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_EVOUCHER/additional_service_name",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "E-voucher",
    user: "ernesto.basile",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_EVOUCHER/hierarchical_group_name",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "Features",
    user: "ernesto.basile",
    action_date: "2024-05-16T13:48:20.783Z",
  },
  {
    field: "/additional_service_extra_info/FEATURE_FREE_CANCELLATION/hierarchical_group_code",
    entity: "extendedexperienceadditionalservices",
    action: "deleted",
    old_value: "FEATURES",
    user: "ernesto.basile",
    action_date: "2024-05-16T13:48:20.783Z",
  },
];

describe("filterLogsByFlow", () => {
  test("it should filter logs based on their flow and handle additional services", () => {
    const testLogs: Log[] = [
      { ...logs[0], flow_code: "CURATION" }, // should be included
      { ...logs[1], flow_code: "SOME_OTHER_FLOW" },
      { ...logs[2], flow_code: "BASE" },
      { ...logs[3], entity: "extendedexperienceadditionalservices", flow_code: undefined }, // should be included
      { ...logs[4], flow_code: undefined },
    ];

    const allowedFlows: ExperienceFlowCode[] = ["CURATION"];
    const filteredLogs = filterLogsByFlow(testLogs, allowedFlows);

    expect(filteredLogs).toHaveLength(2);
    expect(filteredLogs).toContainEqual(testLogs[0]);
    expect(filteredLogs).toContainEqual(testLogs[3]);
  });

  // this is a workaround to include additional services logs without flow_code
  // because the API does not return it
  test("it should include extendedexperienceadditionalservices logs without flow_code", () => {
    const testLogs: Log[] = [
      { ...logs[0], flow_code: "CURATION" },
      { ...logs[1], flow_code: "SOME_OTHER_FLOW" },
      { ...logs[2], flow_code: "BASE" },
      { ...logs[3], entity: "extendedexperienceadditionalservices", flow_code: undefined },
      { ...logs[4], entity: "extendedexperienceadditionalservices", flow_code: "CURATION" },
      { ...logs[5], flow_code: undefined },
    ];

    const allowedFlows: ExperienceFlowCode[] = ["CURATION"];
    const filteredLogs = filterLogsByFlow(testLogs, allowedFlows);

    expect(filteredLogs).toHaveLength(3);
    expect(filteredLogs).toContainEqual(testLogs[0]);
    expect(filteredLogs).toContainEqual(testLogs[3]);
    expect(filteredLogs).toContainEqual(testLogs[4]);
  });
});

describe("sortLogsByDate", () => {
  test("it should sort the list of logs based on the date", () => {
    const sortedLogs = sortLogsByDate(logs);
    expect(sortedLogs[0]).toStrictEqual(logs[2]);
    expect(sortedLogs[1]).toStrictEqual(logs[1]);
    expect(sortedLogs[2]).toStrictEqual(logs[0]);
    expect(sortedLogs[3]).toStrictEqual(logs[3]);
    expect(sortedLogs[4]).toStrictEqual(logs[4]);
    expect(sortedLogs[5]).toStrictEqual(logs[5]);
  });
});

describe("cleanLogFieldNames", () => {
  test("it should format the field name correctly", () => {
    const cleanedLogs = cleanLogFieldNames(logs);
    expect(cleanedLogs[0].field).toStrictEqual("description");
    expect(cleanedLogs[1].field).toStrictEqual("images.is_cover");
    expect(cleanedLogs[2].field).toStrictEqual("highlights");
    expect(cleanedLogs[6].field).toStrictEqual("text2");
  });
});

describe("groupLogsByDate", () => {
  test("it should group the logs based on the date", () => {
    const logsWithMsg = logs.map((l) => ({ ...l, message: "test" }));
    expect(groupLogsByDate(logsWithMsg)).toStrictEqual({
      "1634256000000": [logsWithMsg[6], logsWithMsg[7], logsWithMsg[8]],
      "1664755200000": [logsWithMsg[0], logsWithMsg[1], logsWithMsg[3], logsWithMsg[4], logsWithMsg[5]],
      "1665100800000": [logsWithMsg[2]],
    });
  });
});

describe("mapStatusChangeToLabel", () => {
  test("it should map the status to the correct label", () => {
    const experienceStatusChange: Log = {
      id: "2ba52f79-1419-496a-9e22-7edee022ddec",
      field: "/status_code",
      entity: "experienceTranslation",
      flow_code: "CURATION",
      action: "updated",
      user: "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
      action_date: "2022-10-03T13:10:00Z",
      new_value: "READY",
      old_value: "REVIEW",
    };
    expect(mapStatusChangeToLabel([experienceStatusChange])).toStrictEqual([
      { ...experienceStatusChange, field: "/status_code_published" },
    ]);
  });

  test("it should not map the status if its custom highlights", () => {
    const highlightsStatusChange: Log = {
      id: "2ba52f79-1419-496a-9e22-7edee022ddec",
      field: "/status_code",
      entity: "customincluded",
      flow_code: "test-flow-1",
      action: "updated",
      user: "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
      action_date: "2022-10-03T13:10:00Z",
      new_value: "READY",
      old_value: "REVIEW",
    };

    expect(mapStatusChangeToLabel([highlightsStatusChange])).toStrictEqual([highlightsStatusChange]);
  });
});

describe("groupAdditionalServiceExtraInfo", () => {
  it("should return the same logs if no additional services logs are found", () => {
    const result = groupAdditionalServiceExtraInfo(logs);
    expect(result).toEqual(logs);
  });

  it("should group logs correctly based on hierarchical_group_code timestamp and user", () => {
    const result = groupAdditionalServiceExtraInfo([...logs, ...(additionalServiceLogs as Log[])]);

    const expectedLogs: Partial<Log>[] = [
      ...logs,
      {
        field: "/updated_date",
        entity: "extendedexperienceadditionalservices",
        action: "updated",
        old_value: "2024-05-16T13:48:01.10460538",
        new_value: "2024-05-16T13:48:20.666378415",
        user: "dario.castiglione",
        action_date: "2024-05-16T13:48:20.783Z",
      },
      {
        field: "PROMOTIONAL_OPTIONS",
        entity: "extendedexperienceadditionalservices",
        action: "updated",
        new_value: "PROMOTIONAL_OPTIONS",
        user: "dario.castiglione",
        action_date: "2024-05-16T13:47:39.529Z",
      },
      {
        field: "OWN_OFFER",
        entity: "extendedexperienceadditionalservices",
        action: "updated",
        new_value: "OWN_OFFER",
        user: "dario.castiglione",
        action_date: "2024-05-16T13:47:39.529Z",
      },
      {
        field: "NAT_GEO_TOUR_LEVELS",
        entity: "extendedexperienceadditionalservices",
        action: "updated",
        new_value: "NAT_GEO_TOUR_LEVELS",
        user: "dario.castiglione",
        action_date: "2024-05-16T13:48:01.27Z",
      },
      {
        field: "PROMOTIONAL_OPTIONS",
        entity: "extendedexperienceadditionalservices",
        action: "updated",
        new_value: "PROMOTIONAL_OPTIONS",
        user: "dario.castiglione",
        action_date: "2024-05-16T13:48:01.27Z",
      },
      {
        field: "FEATURES",
        entity: "extendedexperienceadditionalservices",
        action: "updated",
        new_value: "FEATURES",
        user: "dario.castiglione",
        action_date: "2024-05-16T13:48:20.783Z",
      },
      {
        field: "FEATURES",
        entity: "extendedexperienceadditionalservices",
        action: "updated",
        action_date: "2024-05-16T13:48:20.783Z",
        old_value: "FEATURES",
        user: "ernesto.basile",
      },
    ];

    expect(result).toEqual(expectedLogs);
  });

  it("should filter out logs with additional_service_extra_info", () => {
    const logs: Log[] = [
      {
        id: "1",
        action: "created",
        action_date: "2023-05-01T12:00:00Z",
        entity: "testEntity",
        field: "/additional_service_extra_info/test/hierarchical_group_code",
        user: "user1",
        new_value: "PROMOTIONAL_OPTIONS",
        old_value: "",
      },
      {
        id: "2",
        action: "updated",
        action_date: "2023-05-01T12:00:00Z",
        entity: "testEntity",
        field: "/additional_service_extra_info/test/hierarchical_group_code",
        user: "user1",
        new_value: "PROMOTIONAL_OPTIONS",
        old_value: "PROMOTIONAL_OPTIONS",
      },
      {
        id: "3",
        action: "updated",
        action_date: "2023-05-01T12:00:00Z",
        entity: "testEntity",
        field: "/additional_service_extra_info/test/other_field",
        user: "user1",
        new_value: "other",
        old_value: "value",
      },
    ];

    const result = groupAdditionalServiceExtraInfo(logs);

    const expectedLogs: Log[] = [
      {
        id: "1",
        action: "updated",
        action_date: "2023-05-01T12:00:00Z",
        entity: "testEntity",
        field: "PROMOTIONAL_OPTIONS",
        user: "user1",
        new_value: "PROMOTIONAL_OPTIONS",
        old_value: "",
      },
    ];

    expect(result).toEqual(expectedLogs);
  });

  it("should log a warning for invalid FunctionalGroupCode", () => {
    console.warn = vi.fn();

    const logs: Log[] = [
      {
        id: "1",
        action: "created",
        action_date: "2023-05-01T12:00:00Z",
        entity: "testEntity",
        field: "/additional_service_extra_info/test/hierarchical_group_code",
        user: "user1",
        new_value: "InvalidCode",
        old_value: "",
      },
    ];

    groupAdditionalServiceExtraInfo(logs);

    expect(console.warn).toHaveBeenCalledWith(
      "the hierarchical_group_code 'InvalidCode' is not used for any field in nova"
    );
  });

  describe("aggregateLogsByField", () => {
    it("should return the original logs if no logs match the field pattern", () => {
      const logs: Log[] = [
        {
          id: "1",
          entity: "entity1",
          action_date: "2024-06-30T10:00:00Z",
          user: "user1",
          field: "field1",
          action: "created",
          new_value: "value1",
          old_value: "",
        },
        {
          id: "2",
          entity: "entity2",
          action_date: "2024-06-30T11:00:00Z",
          user: "user2",
          field: "field2",
          action: "updated",
          new_value: "value2",
          old_value: "value1",
        },
      ];
      const fieldPattern = /non_matching_field/;

      const result = aggregateLogsByField(logs, fieldPattern);

      expect(result).toEqual(logs);
    });

    it("should aggregate logs matching the field pattern", () => {
      const logs: Log[] = [
        {
          id: "1",
          entity: "entity1",
          action_date: "2024-06-30T10:00:00Z",
          user: "user1",
          field: "matching_field",
          action: "created",
          new_value: "value1",
          old_value: "",
        },
        {
          id: "2",
          entity: "entity1",
          action_date: "2024-06-30T10:00:00Z",
          user: "user1",
          field: "matching_field",
          action: "updated",
          new_value: "value2",
          old_value: "value1",
        },
        {
          id: "3",
          entity: "entity2",
          action_date: "2024-06-30T11:00:00Z",
          user: "user2",
          field: "field2",
          action: "updated",
          new_value: "value2",
          old_value: "value1",
        },
      ];
      const fieldPattern = /matching_field/;

      const result = aggregateLogsByField(logs, fieldPattern);

      expect(result).toEqual([
        {
          id: "3",
          entity: "entity2",
          action_date: "2024-06-30T11:00:00Z",
          user: "user2",
          field: "field2",
          action: "updated",
          new_value: "value2",
          old_value: "value1",
        },
        {
          id: "1",
          entity: "entity1",
          action_date: "2024-06-30T10:00:00Z",
          user: "user1",
          field: "matching_field",
          action: "updated",
          new_value: "value1",
          old_value: "",
        },
      ]);
    });

    it("should not group logs with different action dates, users, and entities even if they have the same field", () => {
      const logs: Log[] = [
        {
          id: "1",
          entity: "entity1",
          action_date: "2024-06-30T10:00:00Z",
          user: "user1",
          field: "matching_field",
          action: "created",
          new_value: "value1",
          old_value: "",
        },
        {
          id: "2",
          entity: "entity1",
          action_date: "2024-06-30T10:00:00Z",
          user: "user2",
          field: "matching_field",
          action: "updated",
          new_value: "value2",
          old_value: "value1",
        },
        {
          id: "3",
          entity: "entity2",
          action_date: "2024-06-30T11:00:00Z",
          user: "user1",
          field: "matching_field",
          action: "updated",
          new_value: "value3",
          old_value: "value2",
        },
      ];
      const fieldPattern = /matching_field/;

      const result = aggregateLogsByField(logs, fieldPattern);

      expect(result).toEqual([
        {
          id: "1",
          entity: "entity1",
          action_date: "2024-06-30T10:00:00Z",
          user: "user1",
          field: "matching_field",
          action: "updated",
          new_value: "value1",
          old_value: "",
        },
        {
          id: "2",
          entity: "entity1",
          action_date: "2024-06-30T10:00:00Z",
          user: "user2",
          field: "matching_field",
          action: "updated",
          new_value: "value2",
          old_value: "value1",
        },
        {
          id: "3",
          entity: "entity2",
          action_date: "2024-06-30T11:00:00Z",
          user: "user1",
          field: "matching_field",
          action: "updated",
          new_value: "value3",
          old_value: "value2",
        },
      ]);
    });
  });
});
