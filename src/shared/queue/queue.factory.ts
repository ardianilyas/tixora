import { Queue, Worker, type JobsOptions, type Processor, type QueueOptions, type WorkerOptions } from "bullmq";
import { createRedisClient, redis } from "@/shared/lib/redis";

export const defaultJobOptions: JobsOptions = {
  removeOnComplete: {
    age: 60 * 60 * 24 * 7, // 7 days
    count: 1000,
  },
  removeOnFail: {
    age: 60 * 60 * 24 * 30, // 30 days
    count: 5000,
  },
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
};

export function createQueue<TData = any, TResult = any>(
  name: string,
  options?: Partial<QueueOptions>
): Queue<TData, TResult> {
  return new Queue<TData, TResult>(name, {
    connection: redis,
    defaultJobOptions: {
      ...defaultJobOptions,
      ...options?.defaultJobOptions,
    },
    ...options,
  });
}

export function createWorker<TData = any, TResult = any>(
  name: string,
  processor: Processor<TData, TResult>,
  options?: Partial<WorkerOptions>
): Worker<TData, TResult> {
  const connection = createRedisClient();

  return new Worker<TData, TResult>(name, processor, {
    connection,
    concurrency: 5,
    ...options,
  });
}