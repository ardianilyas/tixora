import { ticketJobs } from "@/feature/ticket/jobs";
import { jobManager } from "./job.manager";
import type { JobDefinition } from "./queue.types";

export * from "./queue.types";
export * from "./queue.factory";
export * from "./job.manager";

/**
 * All registered job definitions across the application.
 * When adding a new feature with background jobs, import and add its jobs array here.
 */
export const allJobs: JobDefinition[] = [
  ...ticketJobs,
];

// Pre-register all application jobs into the central manager
jobManager.registerJobs(allJobs);

/**
 * Start the background jobs and workers
 */
export async function startJobs(): Promise<void> {
  await jobManager.start();
}

/**
 * Gracefully stop all background jobs and workers
 */
export async function stopJobs(): Promise<void> {
  await jobManager.stop();
}
