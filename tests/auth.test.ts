import { describe, it, expect } from "vitest";
import app from "@/server";
import { authenticate } from "./helpers/auth.helper";

describe("Auth Integration Tests (Prisma)", () => {
  it("should authenticate a user and set role", async () => {
    const { user, agent } = await authenticate("admin");

    const sessionRes = await agent.get("/api/auth/get-session");
    expect(sessionRes.status).toBe(200);
    expect(sessionRes.body.user).toBeDefined();
    expect(sessionRes.body.user.email).toBe(user.email);
    expect(sessionRes.body.user.role).toBe("admin");
  });
});
