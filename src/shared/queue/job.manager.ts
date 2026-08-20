import { Queue, Worker, type Job, type JobsOptions } from "bullmq";
import { createQueue, createWorker } from "./queue.factory";
import type { JobDefinition, JobHandler } from "./queue.types";

export class JobManager {
  private readonly jobDefinitions = new Map<string, JobDefinition>();
  private readonly queues = new Map<string, Queue>();
  private readonly workers = new Map<string, Worker>();
  private isRunning = false;

  /**
   * Register a single job definition
   */
  registerJob(job: JobDefinition): this {
    const key = this.getJobKey(job.queue, job.name);
    if (this.jobDefinitions.has(key)) {
      console.warn(`[JobManager] Overwriting existing job registration for: ${key}`);
    }
    this.jobDefinitions.set(key, job);
    return this;
  }

  /**
   * Register multiple job definitions
   */
  registerJobs(jobs: JobDefinition[]): this {
    for (const job of jobs) {
      this.registerJob(job);
    }
    return this;
  }

  /**
   * Retrieve or create a Queue instance by name
   */
  getQueue<TData = any, TResult = any>(queueName: string): Queue<TData, TResult> {
    let queue = this.queues.get(queueName);
    if (!queue) {
      queue = createQueue(queueName);
      this.queues.set(queueName, queue);
    }
    return queue as Queue<TData, TResult>;
  }

  /**
   * Dispatch an on-demand job to a queue
   */
  async dispatch<TData = any, TResult = any>(
    queueName: string,
    jobName: string,
    data?: TData,
    options?: JobsOptions
  ): Promise<Job<TData, TResult>> {
    const queue = this.getQueue<TData, TResult>(queueName);
    const jobDef = this.jobDefinitions.get(this.getJobKey(queueName, jobName));
    const mergedOpts = {
      ...jobDef?.defaultJobOptions,
      ...options,
    };

    return queue.add(jobName as any, (data ?? {}) as any, mergedOpts) as Promise<Job<TData, TResult>>;
  }

  /**
   * Initialize and start all registered queues, schedulers, and workers
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn("[JobManager] Already running.");
      return;
    }

    console.log(`[JobManager] Starting ${this.jobDefinitions.size} registered job(s)...`);

    // Group jobs by queue name
    const queueJobMap = new Map<string, JobDefinition[]>();
    for (const job of this.jobDefinitions.values()) {
      const existing = queueJobMap.get(job.queue) ?? [];
      existing.push(job);
      queueJobMap.set(job.queue, existing);
    }

    // Set up each queue and its worker
    for (const [queueName, jobs] of queueJobMap.entries()) {
      const queue = this.getQueue(queueName);

      // Register schedulers for recurring jobs
      for (const job of jobs) {
        if (job.schedule) {
          console.log(
            `[JobManager] Registering scheduler: [${queueName}] -> ${job.name} (${job.schedule.pattern})`
          );
          await queue.upsertJobScheduler(
            job.name,
            {
              pattern: job.schedule.pattern,
              tz: job.schedule.tz,
              startDate: job.schedule.startDate,
              endDate: job.schedule.endDate,
            },
            {
              name: job.name,
              data: job.defaultData ?? {},
              opts: job.defaultJobOptions,
            }
          );
        }
      }

      // Build handler lookup map for this queue
      const handlers = new Map<string, JobHandler>();
      for (const job of jobs) {
        handlers.set(job.name, job.handler);
      }

      // Create unified worker router for this queue
      const worker = createWorker(
        queueName,
        async (job: Job) => {
          const handler = handlers.get(job.name);
          if (!handler) {
            throw new Error(
              `[JobManager] No handler registered for job "${job.name}" on queue "${queueName}"`
            );
          }
          return handler(job);
        },
        jobs[0]?.workerOptions
      );

      worker.on("completed", (job: Job, result: any) => {
        const details = result ? ` | Result: ${JSON.stringify(result)}` : "";
        console.log(`[JobManager] [${queueName}:${job.name}] Completed (ID: ${job.id})${details}`);
      });

      worker.on("failed", (job: Job | undefined, err: Error) => {
        console.error(
          `[JobManager] [${queueName}:${job?.name ?? "unknown"}] Failed (ID: ${job?.id ?? "unknown"}):`,
          err.message
        );
      });

      worker.on("error", (err: Error) => {
        console.error(`[JobManager] Worker error on queue "${queueName}":`, err.message);
      });

      this.workers.set(queueName, worker);
    }

    this.isRunning = true;
    console.log("[JobManager] All background queues and workers are active.");
  }

  /**
   * Gracefully stop all active workers and close queue connections
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    console.log("[JobManager] Stopping workers and queues...");

    // Close all workers first (finishes in-flight jobs)
    for (const [queueName, worker] of this.workers.entries()) {
      try {
        await worker.close();
        console.log(`[JobManager] Closed worker for queue "${queueName}"`);
      } catch (err: any) {
        console.error(`[JobManager] Error closing worker "${queueName}":`, err.message);
      }
    }
    this.workers.clear();

    // Close all queues
    for (const [queueName, queue] of this.queues.entries()) {
      try {
        await queue.close();
        console.log(`[JobManager] Closed queue "${queueName}"`);
      } catch (err: any) {
        console.error(`[JobManager] Error closing queue "${queueName}":`, err.message);
      }
    }
    this.queues.clear();

    this.isRunning = false;
    console.log("[JobManager] All queues and workers stopped.");
  }

  private getJobKey(queue: string, name: string): string {
    return `${queue}::${name}`;
  }
}

export const jobManager = new JobManager();
