import { z } from "zod";
import { ROLE_KEYS } from "../types/permissions.types";

export const validRoles = z.enum(ROLE_KEYS);
