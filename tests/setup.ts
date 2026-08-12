import { afterAll, afterEach, beforeAll } from "vitest";
import { clearDb } from "./helpers/clear-db";

beforeAll(async () => {
  await clearDb();
});

afterEach(async () => {
  await clearDb();
});

afterAll(async () => {
  await clearDb();
});
