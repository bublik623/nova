export function getRevisionUrl(experienceId: string, revisionId: string, flow: string, language?: string) {
  if (flow === "media") {
    return `/experience/${experienceId}/revision/${revisionId}/${flow}/visuals`;
  }

  if (language) {
    return `/experience/${experienceId}/revision/${revisionId}/${flow}/${language}/settings`;
  }

  return `/experience/${experienceId}/revision/${revisionId}/${flow}/settings`;
}
