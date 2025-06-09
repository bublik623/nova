import { SYSTEM_USER } from "@/features/experience-lock/constants";

export function removeSystemActivityLogs<T extends { user: string }>(logs: T[]) {
  return logs.filter((log) => log.user !== SYSTEM_USER);
}
