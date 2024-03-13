const QuoteItemModel = require("../../../../resource/quote/item/model");
const QuoteModel = require("../../../../resource/quote/model");
const CustomerModel = require("../../../../resource/customer/model");
const request = require("supertest");
const _ = require("lodash");

const quoteModelInstance = new QuoteModel();
const quoteItemModelInstance = new QuoteItemModel();
const customerModelInstance = new CustomerModel();

describe("/api/quote", () => {
  let server;
  let quoteData;
  let customerData;
  let customerId;

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
  });

  afterAll(async () => {
    await customerModelInstance.create().delete();
  });

  beforeEach(() => {
    server = require("../../../../app");
    quoteData = {
      customer_id: customerId,
      is_active: true,
      ...customerData,
      subtotal: 1500,
      grandtotal: 1500,
      items: [
        {
          name: "tshirt xl blue",
          price: 1000,
          quantity: 1,
          product_id: 1,
          row_total: 1000,
        },
        {
          name: "tshirt xs white",
          price: 500,
          quantity: 1,
          product_id: 2,
          row_total: 500,
        },
      ],
    };
  });

  afterEach(async () => {
    await server.close();
    await quoteItemModelInstance.create().delete();
    await quoteModelInstance.create().delete();
  });

  describe("POST /", () => {
    const exec = () => request(server).post("/api/quote/").send(quoteData);

    it("should return a 400 status if the quote data is invalid", async () => {
      quoteData = {};
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

    it("should return a 409 status if the customer_id is not found to the customer table reference", async () => {
      quoteData.customer_id += 1;
      const res = await exec();

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });

    it("should return a 409 status if no quote ID return after saving to the DB", async () => {
      const originalSaveFn = QuoteModel.prototype.save;
      QuoteModel.prototype.save = jest.fn().mockReturnValue();
      const res = await exec();
      QuoteModel.prototype.save = originalSaveFn;

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: null,
      });
    });

    it("should return a 500 if something goes wrong in the quote saving process", async () => {
      const originalFn = QuoteModel.prototype.save;
      QuoteModel.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error("something happen in quote save process"));
      const res = await exec();

      QuoteModel.prototype.save = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if the quote was succesfully saved to the database", async () => {
      const res = await exec();

      const quote = await quoteModelInstance.findById(res.body.body);
      const items = (await quote.getItems()).getData();

      expect(quote.getData()).toMatchObject({
        id: expect.any(Number),
        is_active: 1,
        date_of_birth: expect.anything(),
        ..._.omit(quoteData, ["is_active", "date_of_birth", "items"]),
      });

      expect(items).toMatchObject([
        expect.objectContaining(quoteData.items[0]),
        expect.objectContaining(quoteData.items[1]),
      ]);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.any(Number),
      });
    });
  });

  describe("GET /:id", () => {
    let quoteId = 0;
    const exec = () => request(server).get(`/api/quote/${quoteId}`);

    it("should return a 400 if the quote ID is invalid", async () => {
      quoteId = 0;
      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 404 if the quote ID is not found", async () => {
      quoteId = 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 if something goes wrong in the quote getting process", async () => {
      quoteId = 1;
      const originalFn = QuoteModel.prototype.findById;
      QuoteModel.prototype.findById = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen in getting quote data process")
        );

      const res = await exec();

      QuoteModel.prototype.findById = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 if the quote ID is valid and returned a quote data", async () => {
      quoteId = await quoteModelInstance.save(quoteData);
      const res = await exec();

      console.log("res.body", res.body);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.objectContaining({
          id: expect.any(Number),
          is_active: 1,
          date_of_birth: expect.anything(),
          ..._.omit(quoteData, ["is_active", "date_of_birth", "items"]),
          items: expect.arrayContaining([
            expect.objectContaining(quoteData.items[0]),
            expect.objectContaining(quoteData.items[1]),
          ]),
        }),
      });
    });
  });

  describe("PATCH /:id", () => {
    let quoteId;
    const exec = () => {
      return request(server).patch(`/api/quote/${quoteId}`).send(quoteData);
    };

    it("should return a 400 status if the quote ID is invalid", async () => {
      quoteId = 0;
      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 400 status if the quote data is invalid", async () => {
      quoteId = 1;
      quoteData = {};

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            message: expect.any(String),
          }),
        ]),
      });
    });

    it("should return a 409 status if the customer_id is not found to the customer table reference", async () => {
      const { items, ...purelyQuoteData } = quoteData;
      quoteId = await quoteModelInstance.save(purelyQuoteData);

      quoteData.customer_id += 1;

      const res = await exec();

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 404 if the quote ID is not found in the database", async () => {
      quoteId = 1;
      quoteData.items[0].id = 1;
      quoteData.items[0].quote_id = quoteId;
      quoteData.items[1].id = 2;
      quoteData.items[1].quote_id = quoteId;

      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 if anything goes wrong in the process like no item_id property in the payload is passed", async () => {
      quoteId = await quoteModelInstance.save(quoteData);

      const res = await exec();

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 if successfully saved to the database", async () => {
      quoteId = await quoteModelInstance.save(quoteData);

      quoteData.first_name = "mark";
      const items = (
        await quoteItemModelInstance.findByQuoteID(quoteId)
      ).getData();
      items.map((item) => {
        delete item.created_at;
        delete item.updated_at;
        item.name = "edited";
        return item;
      });

      quoteData = { ...quoteData, items };
      const res = await exec();
      const editedQuoteData = await quoteModelInstance.findById(quoteId);
      const editedQuoteItems = (await editedQuoteData.getItems()).getData();

      expect(editedQuoteData.getData().first_name).toBe("mark");
      expect(editedQuoteItems[0].name).toBe("edited");
      expect(editedQuoteItems[1].name).toBe("edited");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });

  describe("DELETE /:id", () => {
    let quoteId;
    const exec = () => request(server).delete(`/api/quote/${quoteId}`);

    it("should return a 400 status if the quote ID is invalid ", async () => {
      quoteId = 0;

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 404 status if the quote ID is not in the database", async () => {
      quoteId = 1;

      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 status if something goes wrong during the process", async () => {
      quoteId = 1;
      const originalDeleteMethod = QuoteModel.prototype.delete;
      QuoteModel.prototype.delete = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen in quote deletion process")
        );

      const res = await exec();

      QuoteModel.prototype.delete = originalDeleteMethod;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if deletion is successfull", async () => {
      quoteId = await quoteModelInstance.save(quoteData);

      const res = await exec();

      const quoteDataFromDb = (
        await quoteModelInstance.findById(quoteId)
      ).getData();

      expect(quoteId).toBeGreaterThan(0);
      expect(quoteDataFromDb).toBeNull();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });
});
