// in the matches for the advanced search we must skip all the fields ending with .keyword since are duplicated
export const FIELDS_TO_SKIP_RAW = [/commercial.title/, /\.keyword$/];
export const FIELDS_TO_SKIP_EDITORIAL = [/experience_content.experience_translation.title/, /\.keyword$/];
export const STRING_TO_REMOVE = /<p>|<\/p>/g;
