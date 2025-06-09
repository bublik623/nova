import { RefinementCtx, z, ZodError, ZodIssueCode } from "zod";
import { Option } from "./types";

export const ValidationErrors = {
  DUPLICATE_CODE: "ERR_DUPLICATE_CODE",
  DUPLICATE_TITLE: "ERR_DUPLICATE_TITLE",
} as const;

export const optionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  code: z.string().min(1),
  duration: z.number().int().min(1),
  subchannels: z.array(z.string().min(1)).min(1).or(z.literal("all")),
  paxTypes: z.array(z.string().min(1)).min(1).or(z.literal("all")),
});

export const optionArraySchema = z
  .array(optionSchema)
  .min(1, { message: "At least one option must be provided." })
  .superRefine((options, ctx) => {
    addCodeUniquenessIssues(options, ctx);
    addTitleUniquenessIssues(options, ctx);
  });

function addCodeUniquenessIssues(options: readonly Option[], ctx: RefinementCtx) {
  const codeMap = new Map<string, number[]>();
  options.forEach((option, index) => {
    const indices = codeMap.get(option.code) || [];
    indices.push(index);
    codeMap.set(option.code, indices);
  });
  codeMap.forEach((indices, code) => {
    if (indices.length > 1) {
      indices.forEach((index) => {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: `Code must be unique. Duplicate value: ${code}`,
          path: [index, "code"],
          params: { errorCode: ValidationErrors.DUPLICATE_CODE },
        });
      });
    }
  });
}

function addTitleUniquenessIssues(options: readonly Option[], ctx: RefinementCtx) {
  const titleMap = new Map<string, number[]>();
  options.forEach((option, index) => {
    const indices = titleMap.get(option.title) || [];
    indices.push(index);
    titleMap.set(option.title, indices);
  });
  titleMap.forEach((indices, title) => {
    if (indices.length > 1) {
      indices.forEach((index) => {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: `Title must be unique. Duplicate value: ${title}`,
          path: [index, "title"],
          params: { errorCode: ValidationErrors.DUPLICATE_TITLE },
        });
      });
    }
  });
}

/**
 * Extracts the unique IDs of Options that have associated validation errors.
 * Root-level errors (like array minimum length) are ignored.
 * @param zodError - The ZodError object containing the validation issues.
 * @param options - The original array of options that was validated.
 * @returns An array of unique string Option IDs.
 */
export function extractOptionIdsWithIssues(
  zodError: ZodError<Option[]>, // Type hint for clarity
  options: Readonly<Option[]>
): string[] {
  // Return type is now string[]

  // Use flatMap: Iterate issues, find the optionId, return [optionId] if found, else []
  // This effectively maps and filters out nulls in one go.
  const allOptionIdsWithIssues = zodError.issues.flatMap((issue): string[] => {
    let optionId: string | null = null;

    // Check if the path indicates an issue within a specific array element (index 0)
    if (issue.path.length > 0 && typeof issue.path[0] === "number") {
      const index = issue.path[0];
      // Ensure the index is valid for the options array
      if (index >= 0 && index < options.length) {
        optionId = options[index].id;
      }
    }
    // If path is empty [] (root error) or index invalid, optionId remains null.

    // Return an array containing the id if it exists, otherwise an empty array
    return optionId ? [optionId] : [];
  });

  // Use Set to get only unique IDs and spread back into an array
  const uniqueOptionIds = [...new Set(allOptionIdsWithIssues)];

  return uniqueOptionIds;
}
