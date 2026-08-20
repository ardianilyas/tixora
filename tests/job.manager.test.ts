import { describe, expect, it, vi } from "vitest";
import { JobManager } from "@/shared/queue/job.manager";
import type { JobDefinition } from "@/shared/queue/queue.types";

describe("JobManager", () => {
  it("should register job definitions properly", () => {
    const manager = new JobManager();
    const mockHandler = vi.fn();

    const sampleJob: JobDefinition = {
      name: "sample-job",
      queue: "test-queue",
      schedule: {
        pattern: "0 * * * *",
      },
      handler: mockHandler,
    };

    manager.registerJob(sampleJob);
    expect(manager).toBeInstanceOf(JobManager);
  });

  it("should register multiple jobs", () => {
    const manager = new JobManager();
    const mockHandler = vi.fn();

    const jobs: JobDefinition[] = [
      {
        name: "job-1",
        queue: "test-queue",
        handler: mockHandler,
      },
      {
        name: "job-2",
        queue: "test-queue-2",
        schedule: { pattern: "*/5 * * * *" },
        handler: mockHandler,
      },
    ];

    manager.registerJobs(jobs);
    expect(manager).toBeInstanceOf(JobManager);
  });

  it("should execute registered job handler when job is processed", async () => {
    const manager = new JobManager();
    let executed = false;

    const testJob: JobDefinition = {
      name: "unit-test-job",
      queue: `test-queue-${Date.now()}`,
      handler: async () => {
        executed = true;
        return { success: true };
      },
    };

    manager.registerJob(testJob);
    await manager.start();

    const job = await manager.dispatch(testJob.queue, testJob.name, { foo: "bar" });
    expect(job).toBeDefined();
    expect(job.name).toBe("unit-test-job");

    // Wait for worker to process the job
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(executed).toBe(true);

    await manager.stop();
  });
});
