import { CapacityType } from "@/types/Options";
import { z } from "zod";

const dateRegex = /^(19|20)\d{2}[- /.](0[1-9]|1[0-2])[- /.](0[1-9]|[12]\d|3[01])$/gm;
const timeRegex = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/gm;

const nullOrUndefined = z.null().or(z.undefined());

const baseAvailabilitySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  option: z.string(),
});

export function getTicketSchema(capacityType: CapacityType, multilanguage: boolean, timed = false) {
  return z.object({
    pricings: z
      .array(
        z.object({
          pricing: z.string(),
          capacity: capacityType === CapacityType.PAX ? z.number().min(1) : nullOrUndefined,
        })
      )
      .min(1),
    languages: multilanguage
      ? z
          .array(
            z.object({
              language: z.string(),
              capacity: capacityType === CapacityType.LANGUAGE ? z.number().min(1) : nullOrUndefined,
            })
          )
          .min(1)
      : z.array(z.any()).length(0),
    capacity: capacityType === CapacityType.SHARED ? z.number().min(1) : nullOrUndefined,
    time: timed ? z.string().regex(timeRegex) : z.undefined(),
  });
}

export function getDateTimeTicketSchema(capacityType: CapacityType, multilanguage: boolean) {
  return baseAvailabilitySchema
    .merge(
      z.object({
        date_range: z.object({
          from: z.string().regex(dateRegex),
          to: z.string().regex(dateRegex),
        }),
      })
    )
    .merge(
      z.object({
        days: z.record(
          z.array(getTicketSchema(capacityType, multilanguage, true)).superRefine((data, ctx) => {
            const times = data.map((slot) => slot.time);
            const duplicateTimes = times.filter((t, idx) => times.indexOf(t) !== idx);

            if (duplicateTimes.length > 0) {
              const duplicatesIdx = duplicateTimes.reduce((res, time) => {
                data.forEach((slot, idx) => {
                  if (slot.time === time) {
                    res.add(idx);
                  }
                });
                return res;
              }, new Set<number>());

              duplicatesIdx.forEach((idx) => {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "You cannot have slots with the same time",
                  path: [idx, "time"],
                });
              });

              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "You cannot have slots with the same time",
                path: ["timeslots"],
              });
            }
          })
        ),
      })
    );
}

export function getDateTicketSchema(capacityType: CapacityType, multilanguage: boolean) {
  return baseAvailabilitySchema
    .merge(
      z.object({
        date_range: z.object({
          from: z.string().regex(dateRegex),
          to: z.string().regex(dateRegex),
        }),
      })
    )
    .merge(
      z.object({
        days: z.record(getTicketSchema(capacityType, multilanguage, false)),
      })
    );
}

export function getFixedEndTicketSchema(capacityType: CapacityType, multilanguage: boolean) {
  return baseAvailabilitySchema.merge(
    getTicketSchema(capacityType, multilanguage).extend({
      expiration_date: z.string().regex(dateRegex),
    })
  );
}

export function getFixedValidityTicketSchema(capacityType: CapacityType, multilanguage: boolean) {
  return baseAvailabilitySchema.merge(
    getTicketSchema(capacityType, multilanguage).extend({
      expiration_days: z.number().min(1),
    })
  );
}

export type TicketSchema = z.infer<ReturnType<typeof getTicketSchema>>;
export type DateTicketSchema = z.infer<ReturnType<typeof getDateTicketSchema>>;
export type FixedEndTicketSchema = ReturnType<typeof getFixedEndTicketSchema>;
export type FixedValidityTicketSchema = ReturnType<typeof getFixedValidityTicketSchema>;
