import { describe, expect, it } from "vitest";
import { paginate } from "@/shared/utils/paginate";
import type { Request } from "express";

describe("Reusable Cursor Pagination (paginate)", () => {
  const mockData = Array.from({ length: 25 }, (_, i) => ({
    id: `id-${i + 1}`,
    title: `Item ${i + 1}`,
  }));

  const createMockModel = (data = mockData) => ({
    findMany: async (args: any) => {
      let result = [...data];
      const cursor = args.cursor?.id;
      const take = args.take;
      const skip = args.skip || 0;

      let startIndex = 0;
      if (cursor) {
        const foundIndex = result.findIndex((item) => item.id === cursor);
        if (foundIndex !== -1) {
          startIndex = foundIndex + (skip ? 1 : 0);
        }
      }

      if (take < 0) {
        const count = Math.abs(take);
        const end = cursor ? result.findIndex((item) => item.id === cursor) : result.length;
        const start = Math.max(0, end - count);
        return result.slice(start, end);
      } else {
        return result.slice(startIndex, startIndex + take);
      }
    },
  });

  const mockReq = {
    protocol: "http",
    get: (header: string) => (header === "host" ? "localhost:3000" : null),
    originalUrl: "/api/tickets?limit=10",
    baseUrl: "/api/tickets",
    path: "",
    query: { limit: "10" },
  } as unknown as Request;

  it("should paginate first page and generate nextUrl when more items exist", async () => {
    const model = createMockModel();
    const result = await paginate(model, {
      limit: 10,
      req: mockReq,
    });

    expect(result.data).toHaveLength(10);
    expect(result.data[0]!.id).toBe("id-1");
    expect(result.data[9]!.id).toBe("id-10");

    expect(result.pagination.nextCursor).toBe("id-10");
    expect(result.pagination.previousCursor).toBeNull();
    expect(result.pagination.nextUrl).toContain("cursor=id-10");
    expect(result.pagination.nextUrl).toContain("direction=forward");
    expect(result.pagination.previousUrl).toBeNull();
  });

  it("should navigate forward using cursor", async () => {
    const model = createMockModel();
    const result = await paginate(model, {
      cursor: "id-10",
      limit: 10,
      req: { ...mockReq, originalUrl: "/api/tickets?limit=10&cursor=id-10" } as unknown as Request,
    });

    expect(result.data).toHaveLength(10);
    expect(result.data[0]!.id).toBe("id-11");
    expect(result.data[9]!.id).toBe("id-20");

    expect(result.pagination.nextCursor).toBe("id-20");
    expect(result.pagination.previousCursor).toBe("id-11");
    expect(result.pagination.nextUrl).toContain("cursor=id-20");
    expect(result.pagination.previousUrl).toContain("cursor=id-11");
    expect(result.pagination.previousUrl).toContain("direction=backward");
  });

  it("should handle last page correctly without nextUrl", async () => {
    const model = createMockModel();
    const result = await paginate(model, {
      cursor: "id-20",
      limit: 10,
      req: { ...mockReq, originalUrl: "/api/tickets?limit=10&cursor=id-20" } as unknown as Request,
    });

    expect(result.data).toHaveLength(5);
    expect(result.data[0]!.id).toBe("id-21");
    expect(result.data[4]!.id).toBe("id-25");

    expect(result.pagination.nextCursor).toBeNull();
    expect(result.pagination.nextUrl).toBeNull();
    expect(result.pagination.previousCursor).toBe("id-21");
    expect(result.pagination.previousUrl).not.toBeNull();
  });
});
