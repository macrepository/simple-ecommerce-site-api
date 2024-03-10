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
});
