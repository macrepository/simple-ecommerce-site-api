const ProductModel = require("../../../../resource/product/model");
const CategoryModel = require("../../../../resource/category/model");
const request = require("supertest");

const categoryModelInstance = new CategoryModel();
const productModelInstance = new ProductModel();

describe("/api/product", () => {
  let server;
  let categoryData;
  let categoryId;
  let productData;

  beforeAll(async () => {
    categoryData = {
      name: "Shoes",
      thumbnail: "public/media/category/shoes.jpeg",
      is_active: true,
    };

    [categoryId] = await categoryModelInstance.save(categoryData);
  });

  afterAll(async () => {
    await categoryModelInstance.create().delete();
  });

  beforeEach(() => {
    server = require("../../../../app");
    productData = {
      category_id: categoryId,
      name: "tshirt xl blue",
      price: 1000,
      quantity: 1,
      description: "xl blue tshirt, nice quality",
      is_active: true,
      thumbnail: "public/media/product/1/tshirt_xl_blue.png",
      gallery: [
        "public/media/product/1/gallery/top_tshirt_xl_blue.png",
        "public/media/product/1/gallery/right_tshirt_xl_blue.png",
        "public/media/product/1/gallery/bottom_tshirt_xl_blue.png",
        "public/media/product/1/gallery/left_tshirt_xl_blue.png",
      ],
    };
  });

  afterEach(async () => {
    await server.close();
    await productModelInstance.create().delete();
  });

  describe("POST /", () => {
    const exec = () => {
      return request(server).post("/api/product/").send(productData);
    };

    it("should return a 400 status if the product request data is invalid", async () => {
      productData = {};

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

    it("should return a 409 status if no product ID return after saving to the DB", async () => {
      const originalSaveFn = ProductModel.prototype.save;
      ProductModel.prototype.save = jest.fn().mockReturnValue();

      const res = await exec();

      ProductModel.prototype.save = originalSaveFn;

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: null,
      });
    });

    it("should return a 409 status if the category ID reference does not exist", async () => {
      productData.category_id += 1;

      const res = await exec();

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });

    it("should return a 500 status if something goes wrong during the product saving process", async () => {
      const originalFn = ProductModel.prototype.save;
      ProductModel.prototype.save = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen in product save process")
        );

      const res = await exec();

      ProductModel.prototype.save = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status and the product ID if the product was successfully saved to the databases", async () => {
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
    let productId;
    const exec = () => {
      return request(server).get(`/api/product/${productId}`);
    };

    it("should return a 400 status if the product ID is invalid", async () => {
      productId = 0;
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

    it("should reutrn a 404 status if the product ID is not found", async () => {
      productId = 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should reutrn a 500 status if something goes wrong during getting the product", async () => {
      productId = 1;
      const originalFn = ProductModel.prototype.findByID;
      ProductModel.prototype.findByID = jest
        .fn()
        .mockRejectedValue(new Error("something happen in findByID process"));

      const res = await exec();

      ProductModel.prototype.findByID = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status and product details if product ID is found", async () => {
      [productId] = await productModelInstance.save(productData);

      const res = await exec();

      expect(productId).toBeGreaterThan(0);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.objectContaining({
          id: productId,
          ...productData,
          is_active: 1,
          gallery: expect.arrayContaining([]),
        }),
      });
    });
  });

  describe("PATCH /:id", () => {
    let productId;

    const exec = () => {
      return request(server)
        .patch(`/api/product/${productId}`)
        .send(productData);
    };

    it("should return a 400 status if the product ID is not greater than 0", async () => {
      productId = 0;
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

    it("should return a 400 status if the product data is invalid", async () => {
      productId = 1;
      productData = {};
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

    it("should return a 404 status if the product ID is not found", async () => {
      [productId] = await productModelInstance.save({ ...productData }); // used spread operator for productData inorder to not allow update by reference
      productId += 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 409 status if category ID reference is not found", async () => {
      [productId] = await productModelInstance.save({ ...productData });
      productData.category_id += 1;

      const res = await exec();

      expect(productId).toBeGreaterThan(0);
      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 500 status if something goes wrong during the update item process", async () => {
      productId = 1;
      const originalFn = ProductModel.prototype.update;
      ProductModel.prototype.update = jest
        .fn()
        .mockRejectedValue(new Error("something happen during update process"));

      const res = await exec();

      ProductModel.prototype.update = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if product successfully updated", async () => {
      [productId] = await productModelInstance.save({ ...productData });

      const res = await exec();

      expect(productId).toBeGreaterThan(0);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });

  describe("DELETE /:id", () => {
    let productId;
    const exec = () => {
      return request(server).delete(`/api/product/${productId}`);
    };

    it("should return a 400 status if the product ID is not greater than 0", async () => {
      productId = 0;
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

    it("should return a 404 status if the product ID is not found", async () => {
      [productId] = await productModelInstance.save(productData);
      productId = productId + 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 status if something goes wrong during the product deletion process", async () => {
      productId = 1;
      const originalFn = ProductModel.prototype.delete;
      ProductModel.prototype.delete = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen during product deletion process")
        );

      const res = await exec();

      ProductModel.prototype.delete = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if product was successfully deleted", async () => {
      [productId] = await productModelInstance.save(productData);

      const res = await exec();

      expect(productId).toBeGreaterThan(0);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });
});
