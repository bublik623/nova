import { isoDuration } from "@musement/iso-duration";
import { z } from "zod";

export const cancellationPoliciesSchema = z
  .array(
    z.object({
      id: z.string(),
      experience: z.string(),
      period: z.string(),
      refund_type_code: z.string(),
      value: z.number().min(1).max(100),
    })
  )
  .max(4)
  .superRefine((data, ctx) => {
    const periods = data.map((policy) => isoDuration(policy.period).humanize("en"));
    const duplicatePolicies = periods.filter((p, idx) => periods.indexOf(p) !== idx);

    if (duplicatePolicies.length > 0) {
      const duplicatesIdx = duplicatePolicies.reduce((res, p) => {
        data.forEach((policy, idx) => {
          if (isoDuration(policy.period).humanize("en") === p) {
            res.add(idx);
          }
        });
        return res;
      }, new Set<number>());

      duplicatesIdx.forEach((idx) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "You cannot have policies with the same period",
          path: [idx, "period"],
        });
      });

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You cannot have policies with the same period",
        path: ["policies"],
      });
    }
  });

export type CancellationPoliciesSchema = z.infer<typeof cancellationPoliciesSchema>;
