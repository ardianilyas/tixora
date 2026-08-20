import type { Job, JobsOptions, WorkerOptions } from "bullmq";

export const QueueName = {
  TICKET: "ticket",
  EMAIL: "email",
  NOTIFICATION: "notification",
} as const;

export type QueueName = (typeof QueueName)[keyof typeof QueueName];

export interface JobScheduleConfig {
  /**
   * Standard cron expression, e.g. "0 0 * * *" or "*\/5 * * * *"
   */
  pattern: string;
  /**
   * Timezone, e.g. "UTC" or "America/New_York"
   */
  tz?: string;
  /**
   * Optional start and end times
   */
  startDate?: Date | number;
  endDate?: Date | number;
}

export type JobHandler<TData = any, TResult = any> = (
  job: Job<TData, TResult>
) => Promise<TResult>;

export interface JobDefinition<TData = any, TResult = any> {
  /**
   * Unique name of the job
   */
  name: string;
  /**
   * Target queue name where this job runs
   */
  queue: QueueName | string;
  /**
   * Optional recurring schedule configuration (cron)
   */
  schedule?: JobScheduleConfig;
  /**
   * Default job data for recurring schedules
   */
  defaultData?: TData;
  /**
   * Default job options (retry, backoff, etc.)
   */
  defaultJobOptions?: JobsOptions;
  /**
   * Worker concurrency / options override for this queue
   */
  workerOptions?: Partial<WorkerOptions>;
  /**
   * Handler function executing the job logic
   */
  handler: JobHandler<TData, TResult>;
}
