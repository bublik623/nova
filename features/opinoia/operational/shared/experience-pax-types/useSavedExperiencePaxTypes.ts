import { useGetExperiencePaxesQuery } from "@/features/experience-raw/api/useExperiencePaxesQuery";
import { useGetPaxQuery } from "@/features/masterdata/api/useMasterdataQuery";
import { Pax } from "@/types/generated/ExperienceMasterDataApi";

export function useSavedExperiencePaxTypes(experienceId: Readonly<Ref<string>>) {
  const masterDataPaxTypesQuery = useGetPaxQuery(ref("PERSON"));
  const experiencePaxTypesQuery = useGetExperiencePaxesQuery(experienceId);

  return computed(() => {
    return (experiencePaxTypesQuery.data.value ?? []).map((experiencePaxType) => {
      const masterDataPaxTypes = masterDataPaxTypesQuery.data.value ?? [];
      const masterDataPaxType = masterDataPaxTypes.find(byName(experiencePaxType.pax_code));

      return {
        code: experiencePaxType.pax_code,
        name: masterDataPaxType?.description ?? "unknown",
      };
    });
  });
}

function byName(name: string) {
  return (masterDataPaxType: Pax) => masterDataPaxType.name === name;
}
