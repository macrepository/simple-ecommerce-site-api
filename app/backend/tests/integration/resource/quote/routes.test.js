const moment = require("moment");
const QuoteItemModel = require("../../../../resource/quote/item/model");
const QuoteModel = require("../../../../resource/quote/model");
const CustomerModel = require("../../../../resource/customer/model");
const request = require("supertest");

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
      subtotal: "1500",
      grandtotal: "1500",
      items: [
        {
          name: "tshirt xl blue",
          price: "1000",
          quantity: "1",
          product_id: "1",
          row_total: "1000",
        },
        {
          name: "tshirt xs white",
          price: "500",
          quantity: "1",
          product_id: "2",
          row_total: "500",
        },
      ],
    };
  });

  afterEach(async () => {
    await server.close();
    await quoteItemModelInstance.create().delete();
    await quoteModelInstance.create().delete();
  });

  const longString = (length) => new Array(length + 1).join("a");

  const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");

  const invalidReqQouteValues = [
    ["customer_id", [null, "", NaN, 0, undefined]],
    ["is_active", [null, NaN, 1, "", undefined]],
    ["first_name", [longString(51), undefined]], // max length is 50
    ["last_name", [longString(51), undefined]], // max length is 50
    ["date_of_birth", ["a", moment().format("MM-DD-YYYY"), tomorrow]],
    ["gender", ["a"]],
    ["address", [longString(256), undefined]], // Max length is 255
    ["zip_code", [longString(21), undefined]], // Max length is 20
    ["email", [null, "a", "a@test", `${longString(42)}@test.com`, undefined]], //max length 50
    ["subtotal", [null, NaN, "", 0, -1, 10000000, undefined]],
    ["grandtotal", [null, NaN, "", 0, -1, 10000000, undefined]],
  ];

  const invalidReqQouteItemValues = [
    ["quote_id", [null, "", NaN, 0]],
    ["name", [longString(51), undefined]], // max length is 50
    ["price", [null, NaN, "", 0, -1, 10000000, undefined]],
    ["quantity", [null, NaN, "", 0, -1, 1000000, undefined]],
    ["product_id", [null, "", NaN, 0, undefined]],
    ["row_total", [null, NaN, "", 0, -1, 10000000, undefined]],
  ];

  describe("POST /", () => {
    const exec = (payload) => request(server).post("/api/quote/").send(payload);

    describe.each(invalidReqQouteValues)(
      "Validation tests for post request quote data",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `Should return 400 status if the request ${field} is %s`,
          async (invalidValue) => {
            const modifiedData = { ...quoteData, [field]: invalidValue };
            const res = await exec(modifiedData);

            expect(res.status).toBe(400);
            expect(res.body).toMatchObject({
              code: "bad_request",
              message: expect.any(String),
              body: expect.arrayContaining([
                expect.objectContaining({
                  field: field,
                  message: expect.any(String),
                }),
              ]),
            });
          }
        );
      }
    );

    describe.each(invalidReqQouteItemValues)(
      "Validation tests for request quote item data",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `Should return 400 status if the request ${field} is %s`,
          async (invalidValue) => {
            const modifiedData = {
              ...quoteData,
              items: [
                {
                  ...quoteData.items[0],
                  [field]: invalidValue,
                },
              ],
            };

            const res = await exec(modifiedData);

            expect(res.status).toBe(400);
            expect(res.body).toMatchObject({
              code: "bad_request",
              message: expect.any(String),
              body: expect.arrayContaining([
                expect.objectContaining({
                  field: "items",
                  message: expect.any(String),
                }),
              ]),
            });
          }
        );
      }
    );

    it("should return 409 status if the email is already exist to the database", async () => {
      await quoteModelInstance.save(quoteData);
      const res = await exec(quoteData);
      const quote = (
        await quoteModelInstance.findByEmail(quoteData.email)
      ).getData();

      expect(quote.email).toBe(quoteData.email);
      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });

    it("should return 409 status if no quote ID return after saving to the DB", async () => {
      const originalSaveFn = QuoteModel.prototype.save;
      QuoteModel.prototype.save = jest.fn(quoteData).mockReturnValue();
      const res = await exec(quoteData);
      QuoteModel.prototype.save = originalSaveFn;

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: null,
      });
    });

    it("Should return 500 if anything goes wrong in the process", async () => {
      const originalFn = QuoteModel.prototype.save;
      QuoteModel.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error("something happen in quote save process"));
      const res = await exec(quoteData);

      QuoteModel.prototype.save = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return 200 status if the quote was succesfully saved to the database", async () => {
      const res = await exec(quoteData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.any(Number),
      });
    });
  });

  describe("GET /", () => {
    let quoteId = 0;
    const exec = () => request(server).get(`/api/quote/${quoteId}`);

    it("Should return 400 if quote ID is invalid", async () => {
      quoteId = 0;
      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("Should return 404 if quote ID is not found", async () => {
      quoteId = 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("Should return 500 if something goes wrong in the process", async () => {
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

    it("Should return 200 if quote ID is valid and returned quote data", async () => {
      quoteId = await quoteModelInstance.save(quoteData);
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.objectContaining({
          id: expect.any(Number),
          items: expect.objectContaining({}),
        }),
      });
    });
  });

  describe("PATCH /", () => {
    let quoteId;
    const exec = (payload) =>
      request(server).patch(`/api/quote/${quoteId}`).send(payload);

    beforeEach(() => {
      quoteId = 1;
    });

    it("Should return 400 status if the quote ID is invalid", async () => {
      quoteId = 0;
      const res = await exec({});

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    describe.each(invalidReqQouteValues)(
      "Validation tests for patch request quote data",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `Should return 400 status if the request ${field} is %s`,
          async (invalidValue) => {
            const modifiedData = { ...quoteData, [field]: invalidValue };
            const res = await exec(modifiedData);

            expect(res.status).toBe(400);
            expect(res.body).toMatchObject({
              code: "bad_request",
              message: expect.any(String),
              body: expect.arrayContaining([
                expect.objectContaining({
                  field: field,
                  message: expect.any(String),
                }),
              ]),
            });
          }
        );
      }
    );

    describe.each(invalidReqQouteItemValues)(
      "Validation tests for request quote item data",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `Should return 400 status if the request ${field} is %s`,
          async (invalidValue) => {
            const modifiedData = {
              ...quoteData,
              items: [
                {
                  ...quoteData.items[0],
                  [field]: invalidValue,
                },
              ],
            };

            const res = await exec(modifiedData);

            expect(res.status).toBe(400);
            expect(res.body).toMatchObject({
              code: "bad_request",
              message: expect.any(String),
              body: expect.arrayContaining([
                expect.objectContaining({
                  field: "items",
                  message: expect.any(String),
                }),
              ]),
            });
          }
        );
      }
    );

    it("Should return 409 if the email is already exist in the database", async () => {
      const { items, ...purelyQuoteData } = quoteData;
      quoteId = await quoteModelInstance.save(purelyQuoteData);

      purelyQuoteData.email = "a@gmail.com";
      await quoteModelInstance.save(purelyQuoteData);

      const res = await exec(purelyQuoteData);

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("Should return 404 if the quote ID is not found in the database", async () => {
      quoteId = 1;
      quoteData.items[0].id = 1;
      quoteData.items[0].quote_id = quoteId;
      quoteData.items[1].id = 2;
      quoteData.items[1].quote_id = quoteId;

      const res = await exec(quoteData);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("Should return 500 if anything goes wrong in the process like no item_id property in the payload is passed", async () => {
      quoteId = await quoteModelInstance.save(quoteData);

      const res = await exec(quoteData);

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("Should return 200 if successfully saved to the database", async () => {
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

      const res = await exec({ ...quoteData, items });
      const editedQuoteData = await quoteModelInstance.findById(quoteId);
      const editedQuoteItems = await editedQuoteData.getItems();

      expect(editedQuoteData.data.first_name).toBe("mark");
      expect(editedQuoteItems.data[0].name).toBe("edited");
      expect(editedQuoteItems.data[1].name).toBe("edited");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });

  describe("DELETE /", () => {
    let quoteId;
    const exec = () => request(server).delete(`/api/quote/${quoteId}`);

    it("Should return 400 status if the quote ID is invalid ", async () => {
      quoteId = 0;

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("Should return 404 status if the quote ID is not in the database", async () => {
      quoteId = 1;

      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("Should return 500 status if something goes wrong during the process", async () => {
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

    it("Should return 200 status if deletion is successfull", async () => {
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
