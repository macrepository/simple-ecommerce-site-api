const OrderPaymentModel = require("../../../../resource/order/payment/model");
const OrderModel = require("../../../../resource/order/model");
const request = require("supertest");

const orderModelInstance = new OrderModel();
const orderPaymentModelInstance = new OrderPaymentModel();

describe("/api/order/payment", () => {
  let server;
  let orderData;
  let orderId;
  let orderPaymentData;

  beforeAll(async () => {
    orderData = {
      customer_id: 1,
      quote_id: 1,
      status: "pending",
      first_name: "john",
      last_name: "doe",
      date_of_birth: "1967-09-24",
      gender: "male",
      address: "cebu city",
      zip_code: "6000",
      email: "johndoe@gmail.com",
      subtotal: "1000",
      grandtotal: "1000",
    };

    orderId = await orderModelInstance.save(orderData);
  });

  afterAll(async () => {
    await orderModelInstance.create().delete();
  });

  beforeEach(() => {
    server = require("../../../../app");
    orderPaymentData = {
      order_id: orderId,
      method: "cod",
      name: "Cash on delivery",
      grandtotal: "1000",
      status: "pending",
    };
  });

  afterEach(async () => {
    await server.close();
    await orderPaymentModelInstance.create().delete();
  });

  describe("POST /", () => {
    const exec = () => {
      return request(server).post("/api/order/payment/").send(orderPaymentData);
    };

    it("should return a 400 status if the order payment request data is invalid", async () => {
      orderPaymentData = {};

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

    it("should return a 409 status if no order payment ID return after saving to the DB", async () => {
      const originalSaveFn = OrderPaymentModel.prototype.save;
      OrderPaymentModel.prototype.save = jest.fn().mockReturnValue();

      const res = await exec();

      OrderPaymentModel.prototype.save = originalSaveFn;

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: null,
      });
    });

    it("should return a 409 status if the order ID reference is not exist", async () => {
      orderPaymentData.order_id += 1;

      const res = await exec();

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });

    it("should return a 500 status if something goes wrong during the order payment saving process", async () => {
      const originalFn = OrderPaymentModel.prototype.save;
      OrderPaymentModel.prototype.save = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen in order payment save process")
        );

      const res = await exec();

      OrderPaymentModel.prototype.save = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status and the order payment ID if the order payment was successfully saved to the databases", async () => {
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
      return request(server).get(`/api/order/payment/${paymentId}`);
    };

    it("should return a 400 status if the order payment ID is invalid", async () => {
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

    it("should reutrn a 404 status if the order payment ID is not found", async () => {
      paymentId = 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should reutrn a 500 status if something goes wrong during getting the order payment", async () => {
      paymentId = 1;
      const originalFn = OrderPaymentModel.prototype.findByID;
      OrderPaymentModel.prototype.findByID = jest
        .fn()
        .mockRejectedValue(new Error("something happen in findByID process"));

      const res = await exec();

      OrderPaymentModel.prototype.findByID = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status and order payment details if order payment ID is found", async () => {
      [paymentId] = await orderPaymentModelInstance.save(orderPaymentData);

      const res = await exec();

      expect(paymentId).toBeGreaterThan(0);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.objectContaining({
          id: expect.any(Number),
          order_id: expect.any(Number),
        }),
      });
    });
  });

  describe("PATCH /:id", () => {
    let paymentId;

    const exec = () => {
      return request(server)
        .patch(`/api/order/payment/${paymentId}`)
        .send(orderPaymentData);
    };

    it("should return a 400 status if the order payment ID is not greater than 0", async () => {
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

    it("should return a 400 status if the order payment data is invalid", async () => {
      paymentId = 1;
      orderPaymentData = {};
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

    it("should return a 404 status if the order payment ID is not found", async () => {
      [paymentId] = await orderPaymentModelInstance.save(orderPaymentData);
      paymentId = paymentId + 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 409 status if order ID reference is not found", async () => {
      [paymentId] = await orderPaymentModelInstance.save(orderPaymentData);
      orderPaymentData.order_id += 1;

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
      const originalFn = OrderPaymentModel.prototype.update;
      OrderPaymentModel.prototype.update = jest
        .fn()
        .mockRejectedValue(new Error("something happen during update process"));

      const res = await exec();

      OrderPaymentModel.prototype.update = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if order payment successfully updated", async () => {
      [paymentId] = await orderPaymentModelInstance.save(orderPaymentData);

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
      return request(server).delete(`/api/order/payment/${paymentId}`);
    };

    it("should return a 400 status if the order payment ID is not greater than 0", async () => {
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

    it("should return a 404 status if the order payment ID is not found", async () => {
      [paymentId] = await orderPaymentModelInstance.save(orderPaymentData);
      paymentId = paymentId + 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 status if something goes wrong during the order payment deletion process", async () => {
      paymentId = 1;
      const originalFn = OrderPaymentModel.prototype.delete;
      OrderPaymentModel.prototype.delete = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen during order payment deletion process")
        );

      const res = await exec();

      OrderPaymentModel.prototype.delete = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if order payment was successfully deleted", async () => {
      [paymentId] = await orderPaymentModelInstance.save(orderPaymentData);

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
