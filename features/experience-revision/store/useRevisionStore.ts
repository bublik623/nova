import { defineStore } from "pinia";
import { ExperienceRevision, RevisionOptions } from "../types/revision";
import { computeOptionsByFlow } from "@/features/experience-revision/lib/compute-options-by-flow";
import { fetchRevisionByFlow } from "@/features/experience-revision/lib/fetch-revision-by-flow";
import { ExperienceFlowCode, ExperienceStatusCode } from "@/types/DocumentStatuses";
import { getSidebarConfig } from "@/features/experience-revision/lib/get-sidebar-config";
import { allowedRevisionFlowSchema } from "../schema";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { getParentMasterLanguageSnapshot } from "@/features/experience-revision/lib/get-parent-master-language-snapshot";

export const useRevisionStore = defineStore("useRevisionStore", () => {
  const { logError } = useLogger();
  // Values use to render the flow layout
  const flowCode = ref<ExperienceFlowCode>();
  const statusCode = ref<ExperienceStatusCode>();
  const refCode = ref<string>("");
  const revisionDate = ref<string>("");
  const tabLabel = ref<string>("");

  // Sidebar config and next available section
  const sideBarConfig = ref<ReturnType<typeof getSidebarConfig>>({
    items: {},
    requiredFields: [],
  });

  // Values to render the forms
  const rawValues = ref<ExperienceRevision | null>(null);
  const rawOptions = ref<RevisionOptions | null>(null);

  const curationValues = ref<ExperienceRevision | null>(null);
  const curationOptions = ref<RevisionOptions | null>(null);

  const mediaValues = ref<ExperienceRevision | null>(null);
  const mediaOptions = ref<RevisionOptions | null>(null);

  const translationRevision = ref<ExperienceRevision | null>(null);
  const translationOptions = ref<RevisionOptions | null>(null);

  return {
    loadRevision,
    flowCode,
    statusCode,
    refCode,
    tabLabel,
    revisionDate,
    sideBarConfig,
    rawValues,
    rawOptions,
    curationValues,
    curationOptions,
    mediaValues,
    mediaOptions,
    translationRevision,
    translationOptions,
  };

  async function loadRevision(language: string, flow: string, experienceId: string, revisionId: string) {
    const safeFlow = allowedRevisionFlowSchema.parse(flow);

    try {
      switch (safeFlow) {
        case "raw": {
          const data = await getRawFlowStoreData(experienceId, revisionId);

          tabLabel.value = data.tabLabel;
          flowCode.value = data.flowCode;
          statusCode.value = data.statusCode;
          refCode.value = data.refCode;
          revisionDate.value = data.revisionDate;

          sideBarConfig.value = data.config;

          rawValues.value = data.rawValues;
          rawOptions.value = data.rawOptions;

          break;
        }
        case "curation": {
          const data = await getCurationFlowStoreData(experienceId, revisionId);

          tabLabel.value = data.tabLabel;
          flowCode.value = data.flowCode;
          statusCode.value = data.statusCode;
          refCode.value = data.refCode;
          revisionDate.value = data.revisionDate;

          sideBarConfig.value = data.config;

          curationValues.value = data.curValues;
          curationOptions.value = data.curOptions;

          break;
        }

        case "media": {
          const data = await getMediaFlowStoreData(experienceId, revisionId);

          tabLabel.value = data.tabLabel;
          flowCode.value = data.flowCode;
          statusCode.value = data.statusCode;
          refCode.value = data.refCode;
          revisionDate.value = data.revisionDate;

          sideBarConfig.value = data.config;

          mediaValues.value = data.curValues;
          mediaOptions.value = data.curOptions;

          break;
        }

        case "translation": {
          const data = await getTranslationFlowStoreData(language, experienceId, revisionId);

          tabLabel.value = data.tabLabel;
          flowCode.value = data.flowCode;
          statusCode.value = data.statusCode;
          refCode.value = data.refCode;
          revisionDate.value = data.revisionDate;

          sideBarConfig.value = data.config;

          curationValues.value = data.curValues;
          curationOptions.value = data.curOptions;

          translationRevision.value = data.transValues;
          translationOptions.value = data.transOptions;

          break;
        }

        default: {
          throw new Error(`Could not fetch revision for flow: ${flow}`);
        }
      }
    } catch (error) {
      logError("load-revision", `Error loading revision ${revisionId}`);
      throw error;
    }
  }
});

async function getRawFlowStoreData(experienceId: string, revisionId: string) {
  const rawValues = await fetchRevisionByFlow("en", "raw", revisionId, experienceId);
  const rawOptions = computeOptionsByFlow("raw", rawValues);

  const tabLabel = getRevisionLabel(rawValues);
  const flowCode = rawValues.flowCode;
  const statusCode = rawValues.statusCode;
  const refCode = rawValues.refCode ?? "";
  const revisionDate = rawValues.revisionDate ?? "";

  const config = getSidebarConfig("en", "raw", experienceId, revisionId, rawValues, rawOptions);

  return {
    rawValues,
    rawOptions,
    config,
    tabLabel,
    flowCode,
    statusCode,
    refCode,
    revisionDate,
  };
}

async function getMediaFlowStoreData(experienceId: string, revisionId: string) {
  const curValues = await fetchRevisionByFlow("en", "media", revisionId, experienceId);
  const curOptions = {};
  const tabLabel = getRevisionLabel(curValues);
  const flowCode = curValues.flowCode;
  const statusCode = curValues.statusCode;
  const refCode = curValues.refCode ?? "";
  const revisionDate = curValues.revisionDate ?? "";
  const config = getSidebarConfig("en", "media", experienceId, revisionId, curValues, curOptions);
  return {
    curValues,
    curOptions,
    config,
    tabLabel,
    flowCode,
    statusCode,
    refCode,
    revisionDate,
  };
}

async function getCurationFlowStoreData(experienceId: string, revisionId: string) {
  const curValues = await fetchRevisionByFlow("en", "curation", revisionId, experienceId);
  const curOptions = computeOptionsByFlow("curation", curValues);

  const tabLabel = getRevisionLabel(curValues);
  const flowCode = curValues.flowCode;
  const statusCode = curValues.statusCode;
  const refCode = curValues.refCode ?? "";
  const revisionDate = curValues.revisionDate ?? "";

  const config = getSidebarConfig("en", "curation", experienceId, revisionId, curValues, curOptions);

  return {
    curValues,
    curOptions,
    config,
    tabLabel,
    flowCode,
    statusCode,
    refCode,
    revisionDate,
  };
}

async function getTranslationFlowStoreData(language: string, experienceId: string, revisionId: string) {
  const parentMasterLanguageSnapshot = await getParentMasterLanguageSnapshot(experienceId, revisionId);
  if (!parentMasterLanguageSnapshot) {
    throw new Error(`can't find parent snapshot of snapshot '${revisionId}' for experience '${experienceId}'`);
  }

  const [transValues, curValues] = await Promise.all([
    fetchRevisionByFlow(language, "translation", revisionId, experienceId),
    fetchRevisionByFlow("en", "curation", parentMasterLanguageSnapshot.id!, experienceId),
  ]);

  const transOptions = computeOptionsByFlow("translation", transValues);
  const curOptions = computeOptionsByFlow("curation", curValues);

  const tabLabel = getRevisionLabel(transValues);
  const flowCode = transValues.flowCode;
  const statusCode = transValues.statusCode;
  const refCode = transValues.refCode ?? "";
  const revisionDate = transValues.revisionDate ?? "";

  const config = getSidebarConfig(language, "translation", experienceId, revisionId, transValues, transOptions);

  return {
    curValues,
    curOptions,
    transValues,
    transOptions,
    config,
    tabLabel,
    flowCode,
    statusCode,
    refCode,
    revisionDate,
  };
}

function getRevisionLabel(revision: ExperienceRevision) {
  const formatter = new Intl.DateTimeFormat("en-gb", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const formattedDate = formatter.format(new Date(revision.revisionDate || ""));

  return `[${formattedDate}] ${revision.title}`;
}
