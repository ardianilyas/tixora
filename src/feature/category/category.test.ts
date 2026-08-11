import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../server";
import { authenticate } from "../../../tests/helpers/auth.helper";
import { CATEGORY_NOT_FOUND_MESSAGE, CATEGORY_TEST_ROUTE } from "./category.constant";
import { seedCategory } from "../../shared/seeder/category.seeder";

describe("Categories feature tests", () => {
  const invalidId = "invalid-id";
  let categoryId: string;

  beforeEach(async() => {
    const category = await seedCategory();
    if (!category) throw new Error("Category not created");
    categoryId = category.id;
  })

  describe("GET /api/categories", () => {
    it("should return 401 when not authorized", async() => {
      const response = await request(app).get(CATEGORY_TEST_ROUTE.GET_CATEGORIES)
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 200 when user authorized", async() => {
      const auth = await authenticate();
      const response = await auth.agent.get(CATEGORY_TEST_ROUTE.GET_CATEGORIES);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.message).toBe("Categories fetched successfully");
    })
  });

  describe("GET /api/categories/:id", () => {
    it("should return 401 when not authorized", async() => {
      const response = await request(app).get(CATEGORY_TEST_ROUTE.GET_CATEGORY(invalidId));

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 403 when user is not admin", async() => {
      const auth = await authenticate();
      const response = await auth.agent.get(CATEGORY_TEST_ROUTE.GET_CATEGORY(invalidId));

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Forbidden");
    });

    it("should return 404 when category not found", async() => {
      const auth = await authenticate("admin");

      const response = await auth.agent.get(CATEGORY_TEST_ROUTE.GET_CATEGORY(invalidId));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(CATEGORY_NOT_FOUND_MESSAGE);
    });

    it("should return 200 when user is admin and category found", async() => {
      const auth = await authenticate("admin");

      const response = await auth.agent.get(CATEGORY_TEST_ROUTE.GET_CATEGORY(categoryId));

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.message).toBe("Category fetched successfully");
    });
  });

  describe("POST /api/categories", () => {
    it("should return 401 when not authorized", async() => {
      const response = await request(app).post(CATEGORY_TEST_ROUTE.CREATE_CATEGORY).send({});

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 403 when user is not admin", async() => {
      const auth = await authenticate();
      const response = await auth.agent.post(CATEGORY_TEST_ROUTE.CREATE_CATEGORY).send({});

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Forbidden");
    });

    it("should return 400 when data is invalid", async() => {
      const auth = await authenticate("admin");
      const response = await auth.agent.post(CATEGORY_TEST_ROUTE.CREATE_CATEGORY).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation Error");
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(response.body.errors[0].message).toBeDefined();
      expect(response.body.errors[0].field).toBeDefined();
      expect(response.body.errors[1].message).toBeDefined();
      expect(response.body.errors[1].field).toBeDefined();
    });

    it("should return 201 when user is admin and data is valid", async() => {
      const auth = await authenticate("admin");
      const data = {
        name: "Test Category",
        description: "Test Description"
      }
      const response = await auth.agent.post(CATEGORY_TEST_ROUTE.CREATE_CATEGORY).send(data);

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      expect(response.body.message).toBe("Category created successfully");
    });
  });

  describe("PATCH /api/categories/:id", () => {
    it("should return 401 when not authenticated", async() => {
      const response = await request(app).patch(CATEGORY_TEST_ROUTE.UPDATE_CATEGORY(categoryId)).send({});

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });
    
    it("should return 403 when user is not admin", async() => {
      const auth = await authenticate();
      const response = await auth.agent.patch(CATEGORY_TEST_ROUTE.UPDATE_CATEGORY(categoryId)).send({});

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Forbidden");
    });

    it("should return 404 when category not found", async() => {
      const auth = await authenticate("admin");
      const response = await auth.agent.patch(CATEGORY_TEST_ROUTE.UPDATE_CATEGORY(invalidId)).send({});

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(CATEGORY_NOT_FOUND_MESSAGE);
    });

    it("should return 200 when user is admin and data is valid", async() => {
      const auth = await authenticate("admin");
      const data = {
        name: "Test Category",
        description: "Test Description"
      }
      const response = await auth.agent.patch(CATEGORY_TEST_ROUTE.UPDATE_CATEGORY(categoryId)).send(data);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.message).toBe("Category updated successfully");
    });
  });

  describe("DELETE /api/categories/:id", () => {
    it("should return 401 when user not authenticated", async() => {
      const response = await request(app).delete(CATEGORY_TEST_ROUTE.DELETE_CATEGORY(categoryId));

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 403 when user is not admin", async() => {
      const auth = await authenticate();
      const response = await auth.agent.delete(CATEGORY_TEST_ROUTE.DELETE_CATEGORY(categoryId));

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Forbidden");
    });

    it("should return 404 when category not found", async() => {
      const auth = await authenticate("admin");
      const response = await auth.agent.delete(CATEGORY_TEST_ROUTE.DELETE_CATEGORY(invalidId));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(CATEGORY_NOT_FOUND_MESSAGE);
    });

    it("should return 204 when user is admin and category found", async() => {
      const auth = await authenticate("admin");
      const response = await auth.agent.delete(CATEGORY_TEST_ROUTE.DELETE_CATEGORY(categoryId));

      expect(response.status).toBe(204);
    });
  })
})