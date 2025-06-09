import { Option } from "../types";
import { PostOptionMutationPayload } from "../mutations/usePostOptionMutation";
import { PutOptionMutationPayload } from "../mutations/usePutOptionMutation";
import { PutOptionPaxesMutationPayload } from "../mutations/usePutOptionPaxesMutation";
import { convertHoursToDuration } from "@/utils/convert-duration";

type BaseOptionResource = PostOptionMutationPayload & Omit<PutOptionMutationPayload, "id">;

export function mapToNewOptionApiPayload(experienceId: string, newOption: Option): PostOptionMutationPayload {
  return toBaseOptionPayload(experienceId, newOption);
}

export function mapToExistingOptionApiPayload(experienceId: string, editedOption: Option): PutOptionMutationPayload {
  const baseResource = toBaseOptionPayload(experienceId, editedOption);
  return { ...baseResource, id: editedOption.id };
}

export function mapToOptionPaxesApiPayload(option: Option): PutOptionPaxesMutationPayload {
  return {
    option_id: option.id,
    pax_list: option.paxTypes === "all" ? [] : option.paxTypes.map((paxTypeCode) => ({ pax_code: paxTypeCode })),
  };
}

function toBaseOptionPayload(experienceId: string, option: Option): BaseOptionResource {
  const baseResource: BaseOptionResource = {
    experience: experienceId,
    code: option.code,
    name: option.title,
    // TODO: confirm if this is correct
    capacity_type: "shared",
    // TODO: confirm if this is correct
    multilanguage: false,
    // This is needed, otherwise the PUT will break
    // see https://tui-musement.datadoghq.eu/logs?query=service%3Aoffer-experience-offer-service&agg_m=count&agg_m_source=base&agg_t=count&cols=host%2Cservice&event=AwAAAZZolI5r9KWDhAAAABhBWlpvbEpzSkFBQlBOR3UxQ1Mxc0J3QUEAAAAkMDE5NjY4OTQtYzE5MC00ODdlLWIwZTgtOTRmODBjM2JjYmIzAAAAPQ&fromUser=true&messageDisplay=inline&refresh_mode=sliding&storage=hot&stream_sort=desc&viz=stream&from_ts=1745508588648&to_ts=1745509488648&live=true
    pricing_type_allowed: "person",
    duration: option.duration ? convertHoursToDuration(option.duration) : undefined,
  };

  enforceProperCodeHandling(baseResource);

  return baseResource;
}

/**
 * Ensure the code field of the option paload is handled correctly before sending the request.
 * @param optionPayload the base option payload
 */
function enforceProperCodeHandling(optionResource: BaseOptionResource) {
  // If there is more than one option with a BLANK code for the same experience
  // the backend is going to reply with 409.
  // Since the backend does not accept `undefined` value (it reply with 400)
  // we are going to remove the property from the payload.
  if (!optionResource.code || optionResource.code.length === 0) {
    delete optionResource.code;
  }
}
