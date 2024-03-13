const categoryModel = require("../../../../resource/category/model");
const request = require("supertest");

const categoryModelInstance = new categoryModel();

describe("/api/category", () => {
  let server;
  let categoryData;

  beforeEach(() => {
    server = require("../../../../app");
    categoryData = {
      name: "Shoes",
      thumbnail: "public/media/category/shoes.jpeg",
      is_active: true,
    };
  });

  afterEach(async () => {
    await server.close();
    await categoryModelInstance.create().delete();
  });

  describe("POST /", () => {
    const exec = () => {
      return request(server).post("/api/category/").send(categoryData);
    };

    it("should return a 400 status if the category request data is invalid", async () => {
      categoryData = {};

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      });
    });

    it("should return a 409 status if no category ID return after saving to the DB", async () => {
      const originalSaveFn = categoryModel.prototype.save;
      categoryModel.prototype.save = jest.fn().mockReturnValue();

      const res = await exec();

      categoryModel.prototype.save = originalSaveFn;

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: null,
      });
    });

    it("should return a 500 status if something goes wrong during the category saving process", async () => {
      const originalFn = categoryModel.prototype.save;
      categoryModel.prototype.save = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen in category save process")
        );

      const res = await exec();

      categoryModel.prototype.save = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status and the category ID if the category was successfully saved to the databases", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });
  });

  describe("GET /:id", () => {
    let categoryId;
    const exec = () => {
      return request(server).get(`/api/category/${categoryId}`);
    };

    it("should return a 400 status if the category ID is invalid", async () => {
      categoryId = 0;
      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      });
    });

    it("should return a 404 status if the category ID is not found", async () => {
      categoryId = 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 status if something goes wrong during getting the category", async () => {
      categoryId = 1;
      const originalFn = categoryModel.prototype.findByID;
      categoryModel.prototype.findByID = jest
        .fn()
        .mockRejectedValue(new Error("something happen in findByID process"));

      const res = await exec();

      categoryModel.prototype.findByID = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status and category details if category ID is found", async () => {
      [categoryId] = await categoryModelInstance.save(categoryData);

      const res = await exec();

      expect(categoryId).toBeGreaterThan(0);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.objectContaining({
          id: expect.any(Number),
          ...categoryData,
          is_active: 1,
        }),
      });
    });
  });

  describe("PATCH /:id", () => {
    let categoryId;

    const exec = () => {
      return request(server)
        .patch(`/api/category/${categoryId}`)
        .send(categoryData);
    };

    it("should return a 400 status if the category ID is not greater than 0", async () => {
      categoryId = 0;
      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      });
    });

    it("should return a 400 status if the category data is invalid", async () => {
      categoryId = 1;
      categoryData = {};
      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      });
    });

    it("should return a 404 status if the category ID is not found", async () => {
      [categoryId] = await categoryModelInstance.save(categoryData);
      categoryId = categoryId + 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 status if something goes wrong during the update category process", async () => {
      categoryId = 1;
      const originalFn = categoryModel.prototype.update;
      categoryModel.prototype.update = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen during update category process")
        );

      const res = await exec();

      categoryModel.prototype.update = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if category successfully updated", async () => {
      [categoryId] = await categoryModelInstance.save(categoryData);

      const res = await exec();

      expect(categoryId).toBeGreaterThan(0);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });

  describe("DELETE /:id", () => {
    let categoryId;
    const exec = () => {
      return request(server).delete(`/api/category/${categoryId}`);
    };

    it("should return a 400 status if the category ID is not greater than 0", async () => {
      categoryId = 0;
      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      });
    });

    it("should return a 404 status if the category ID is not found", async () => {
      [categoryId] = await categoryModelInstance.save(categoryData);
      categoryId = categoryId + 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 status if something goes wrong during the category deletion process", async () => {
      categoryId = 1;
      const originalFn = categoryModel.prototype.delete;
      categoryModel.prototype.delete = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen during category deletion process")
        );

      const res = await exec();

      categoryModel.prototype.delete = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if category was successfully deleted", async () => {
      [categoryId] = await categoryModelInstance.save(categoryData);

      const res = await exec();

      expect(categoryId).toBeGreaterThan(0);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });
});
