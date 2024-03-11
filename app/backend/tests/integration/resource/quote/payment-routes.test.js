const QuotePaymentModel = require("../../../../resource/quote/payment/model");
const QuoteModel = require("../../../../resource/quote/model");
const CustomerModel = require("../../../../resource/customer/model");
const request = require("supertest");

const quoteModelInstance = new QuoteModel();
const quotePaymentModelInstance = new QuotePaymentModel();
const customerModelInstance = new CustomerModel();

describe("/api/quote/payment", () => {
  let server;
  let customerData;
  let customerId;
  let quoteData;
  let quoteId;
  let quotePaymentData;

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
    await quotePaymentModelInstance.create().delete();
  });

  beforeEach(() => {
    server = require("../../../../app");
    quotePaymentData = {
      quote_id: quoteId,
      method: "cod",
      name: "Cash on delivery",
      grandtotal: "1000",
      status: "pending",
    };
  });

  afterEach(async () => {
    await server.close();
    await quotePaymentModelInstance.create().delete();
  });

  describe("POST /", () => {
    const exec = () => {
      return request(server).post("/api/quote/payment/").send(quotePaymentData);
    };

    it("should return a 400 status if the quote payment request data is invalid", async () => {
      quotePaymentData = {};

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

    it("should return a 409 status if no quote payment ID return after saving to the DB", async () => {
      const originalSaveFn = QuotePaymentModel.prototype.save;
      QuotePaymentModel.prototype.save = jest.fn().mockReturnValue();

      const res = await exec();

      QuotePaymentModel.prototype.save = originalSaveFn;

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: null,
      });
    });

    it("should return a 409 status if the quote ID reference is not exist", async () => {
      quotePaymentData.quote_id += 1;

      const res = await exec();

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });

    it("should return a 500 status if something goes wrong during the quote payment saving process", async () => {
      const originalFn = QuotePaymentModel.prototype.save;
      QuotePaymentModel.prototype.save = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen in quote payment save process")
        );

      const res = await exec();

      QuotePaymentModel.prototype.save = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status and the quote payment ID if the quote payment was successfully saved to the databases", async () => {
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
    let paymentId;
    const exec = () => {
      return request(server).get(`/api/quote/payment/${paymentId}`);
    };

    it("should return a 400 status if the quote payment ID is invalid", async () => {
      paymentId = 0;
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

    it("should reutrn a 404 status if the quote payment ID is not found", async () => {
      paymentId = 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should reutrn a 500 status if something goes wrong during getting the quote payment", async () => {
      paymentId = 1;
      const originalFn = QuotePaymentModel.prototype.findByID;
      QuotePaymentModel.prototype.findByID = jest
        .fn()
        .mockRejectedValue(new Error("something happen in findByID process"));

      const res = await exec();

      QuotePaymentModel.prototype.findByID = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status and quote payment details if quote payment ID is found", async () => {
      [paymentId] = await quotePaymentModelInstance.save(quotePaymentData);

      const res = await exec();

      expect(paymentId).toBeGreaterThan(0);
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
    let paymentId;

    const exec = () => {
      return request(server)
        .patch(`/api/quote/payment/${paymentId}`)
        .send(quotePaymentData);
    };

    it("should return a 400 status if the quote payment ID is not greater than 0", async () => {
      paymentId = 0;
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

    it("should return a 400 status if the quote payment data is invalid", async () => {
      paymentId = 1;
      quotePaymentData = {};
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

    it("should return a 404 status if the quote payment ID is not found", async () => {
      [paymentId] = await quotePaymentModelInstance.save(quotePaymentData);
      paymentId = paymentId + 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 409 status if quote ID reference is not found", async () => {
      [paymentId] = await quotePaymentModelInstance.save(quotePaymentData);
      quotePaymentData.quote_id += 1;

      const res = await exec();

      expect(paymentId).toBeGreaterThan(0);
      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 500 status if something goes wrong during the update payment process", async () => {
      paymentId = 1;
      const originalFn = QuotePaymentModel.prototype.update;
      QuotePaymentModel.prototype.update = jest
        .fn()
        .mockRejectedValue(new Error("something happen during update process"));

      const res = await exec();

      QuotePaymentModel.prototype.update = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if quote payment successfully updated", async () => {
      [paymentId] = await quotePaymentModelInstance.save(quotePaymentData);

      const res = await exec();

      expect(paymentId).toBeGreaterThan(0);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });

  describe("DELETE /:id", () => {
    let paymentId;
    const exec = () => {
      return request(server).delete(`/api/quote/payment/${paymentId}`);
    };

    it("should return a 400 status if the quote payment ID is not greater than 0", async () => {
      paymentId = 0;
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

    it("should return a 404 status if the quote payment ID is not found", async () => {
      [paymentId] = await quotePaymentModelInstance.save(quotePaymentData);
      paymentId = paymentId + 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 status if something goes wrong during the quote payment deletion process", async () => {
      paymentId = 1;
      const originalFn = QuotePaymentModel.prototype.delete;
      QuotePaymentModel.prototype.delete = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen during quote payment deletion process")
        );

      const res = await exec();

      QuotePaymentModel.prototype.delete = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if quote payment was successfully deleted", async () => {
      [paymentId] = await quotePaymentModelInstance.save(quotePaymentData);

      const res = await exec();

      expect(paymentId).toBeGreaterThan(0);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });
});
