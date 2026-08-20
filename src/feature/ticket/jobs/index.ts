import { closeExpiredTicketsJob } from "./close-expired-tickets.job";
import type { JobDefinition } from "@/shared/queue/queue.types";

export * from "./close-expired-tickets.job";

export const ticketJobs: JobDefinition[] = [
  closeExpiredTicketsJob,
];
