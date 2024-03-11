const QuoteItemModel = require("../../../../resource/quote/item/model");
const QuoteModel = require("../../../../resource/quote/model");
const CustomerModel = require("../../../../resource/customer/model");
const request = require("supertest");

const quoteModelInstance = new QuoteModel();
const quoteItemModelInstance = new QuoteItemModel();
const customerModelInstance = new CustomerModel();

describe("/api/quote/item", () => {
  let server;
  let customerData;
  let customerId;
  let quoteData;
  let quoteId;
  let quoteItemData;

  beforeAll(async () => {
    customerData = {
      first_name: "john",
      last_name: "doe",
      date_of_birth: "1967-09-24",
      gender: "male",
      address: "cebu city",
      zip_code: "6000",
      email: "johndoe@gmail.com",
    };
    [customerId] = await customerModelInstance.save({
      ...customerData,
      password: "aaaaa1",
    });

    quoteData = {
      customer_id: customerId,
      is_active: true,
      ...customerData,
      subtotal: "1000",
      grandtotal: "1000",
    };

    quoteId = await quoteModelInstance.save(quoteData);
  });

  afterAll(async () => {
    await customerModelInstance.create().delete();
    await quoteItemModelInstance.create().delete();
  });

  beforeEach(() => {
    server = require("../../../../app");
    quoteItemData = {
      quote_id: quoteId,
      name: "tshirt xl blue",
      price: "1000",
      quantity: "1",
      product_id: "1",
      row_total: "1000",
    };
  });

  afterEach(async () => {
    await server.close();
    await quoteItemModelInstance.create().delete();
  });

  describe("POST /", () => {
    const exec = () => {
      return request(server).post("/api/quote/item/").send(quoteItemData);
    };

    it("should return a 400 status if the quote item request data is invalid", async () => {
      quoteItemData = {};

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

    it("should return a 409 status if no quote item ID return after saving to the DB", async () => {
      const originalSaveFn = QuoteItemModel.prototype.save;
      QuoteItemModel.prototype.save = jest.fn().mockReturnValue();

      const res = await exec();

      QuoteItemModel.prototype.save = originalSaveFn;

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: null,
      });
    });

    it("should return a 409 status if the quote ID reference is not exist", async () => {
      quoteItemData.quote_id += 1;

      const res = await exec();

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });

    it("should return a 500 status if something goes wrong during the quote item saving process", async () => {
      const originalFn = QuoteItemModel.prototype.save;
      QuoteItemModel.prototype.save = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen in quote item save process")
        );

      const res = await exec();

      QuoteItemModel.prototype.save = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status and the quote item ID if the quote item was successfully saved to the databases", async () => {
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
    let itemId;
    const exec = () => {
      return request(server).get(`/api/quote/item/${itemId}`);
    };

    it("should return a 400 status if the quote item ID is invalid", async () => {
      itemId = 0;
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

    it("should reutrn a 404 status if the quote item ID is not found", async () => {
      itemId = 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should reutrn a 500 status if something goes wrong during getting the quote item", async () => {
      itemId = 1;
      const originalFn = QuoteItemModel.prototype.findByID;
      QuoteItemModel.prototype.findByID = jest
        .fn()
        .mockRejectedValue(new Error("something happen in findByID process"));

      const res = await exec();

      QuoteItemModel.prototype.findByID = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status and quote item details if quote item ID is found", async () => {
      [itemId] = await quoteItemModelInstance.save(quoteItemData);

      const res = await exec();

      expect(itemId).toBeGreaterThan(0);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.objectContaining({
          id: expect.any(Number),
          quote_id: expect.any(Number),
        }),
      });
    });
  });

  describe("PATCH /:id", () => {
    let itemId;

    const exec = () => {
      return request(server)
        .patch(`/api/quote/item/${itemId}`)
        .send(quoteItemData);
    };

    it("should return a 400 status if the quote item ID is not greater than 0", async () => {
      itemId = 0;
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

    it("should return a 400 status if the quote item data is invalid", async () => {
      itemId = 1;
      quoteItemData = {};
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

    it("should return a 404 status if the quote item ID is not found", async () => {
      [itemId] = await quoteItemModelInstance.save(quoteItemData);
      itemId = itemId + 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 409 status if quote ID reference is not found", async () => {
      [itemId] = await quoteItemModelInstance.save(quoteItemData);
      quoteItemData.quote_id += 1;

      const res = await exec();

      expect(itemId).toBeGreaterThan(0);
      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 500 status if something goes wrong during the update item process", async () => {
      itemId = 1;
      const originalFn = QuoteItemModel.prototype.update;
      QuoteItemModel.prototype.update = jest
        .fn()
        .mockRejectedValue(new Error("something happen during update process"));

      const res = await exec();

      QuoteItemModel.prototype.update = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if quote item successfully updated", async () => {
      [itemId] = await quoteItemModelInstance.save(quoteItemData);

      const res = await exec();

      expect(itemId).toBeGreaterThan(0);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });
});
