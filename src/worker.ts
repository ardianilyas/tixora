import { startJobs, stopJobs } from "@/shared/queue";

console.log("[Worker Process] Initializing standalone background workers and schedulers...");

await startJobs();

console.log("[Worker Process] Background workers are running. Press Ctrl+C to terminate.");

const handleShutdown = async (signal: string) => {
  console.log(`\n[Worker Process] Received ${signal}. Shutting down gracefully...`);
  await stopJobs();
  process.exit(0);
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
