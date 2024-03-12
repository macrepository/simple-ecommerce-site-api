const paymentModel = require("../../../../resource/payment/model");
const request = require("supertest");

const paymentModelInstance = new paymentModel();

describe("/api/payment", () => {
  let server;
  let paymentData;

  beforeEach(() => {
    server = require("../../../../app");
    paymentData = {
      method: "cod",
      name: "Cash on delivery",
    };
  });

  afterEach(async () => {
    await server.close();
    await paymentModelInstance.create().delete();
  });

  describe("POST /", () => {
    const exec = () => {
      return request(server).post("/api/payment/").send(paymentData);
    };

    it("should return a 400 status if the payment request data is invalid", async () => {
      paymentData = {};

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

    it("should return a 409 status if no payment ID return after saving to the DB", async () => {
      const originalSaveFn = paymentModel.prototype.save;
      paymentModel.prototype.save = jest.fn().mockReturnValue();

      const res = await exec();

      paymentModel.prototype.save = originalSaveFn;

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: null,
      });
    });

    it("should return a 500 status if something goes wrong during the payment saving process", async () => {
      const originalFn = paymentModel.prototype.save;
      paymentModel.prototype.save = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen in payment save process")
        );

      const res = await exec();

      paymentModel.prototype.save = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status and the payment ID if the payment was successfully saved to the databases", async () => {
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
      return request(server).get(`/api/payment/${paymentId}`);
    };

    it("should return a 400 status if the payment ID is invalid", async () => {
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

    it("should reutrn a 404 status if the payment ID is not found", async () => {
      paymentId = 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should reutrn a 500 status if something goes wrong during getting the payment", async () => {
      paymentId = 1;
      const originalFn = paymentModel.prototype.findByID;
      paymentModel.prototype.findByID = jest
        .fn()
        .mockRejectedValue(new Error("something happen in findByID process"));

      const res = await exec();

      paymentModel.prototype.findByID = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status and payment details if payment ID is found", async () => {
      [paymentId] = await paymentModelInstance.save(paymentData);

      const res = await exec();

      expect(paymentId).toBeGreaterThan(0);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.objectContaining({
          id: expect.any(Number),
          method: expect.any(String),
          name: expect.any(String),
        }),
      });
    });
  });

  describe("PATCH /:id", () => {
    let paymentId;

    const exec = () => {
      return request(server)
        .patch(`/api/payment/${paymentId}`)
        .send(paymentData);
    };

    it("should return a 400 status if the payment ID is not greater than 0", async () => {
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

    it("should return a 400 status if the payment data is invalid", async () => {
      paymentId = 1;
      paymentData = {};
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

    it("should return a 404 status if the payment ID is not found", async () => {
      [paymentId] = await paymentModelInstance.save(paymentData);
      paymentId = paymentId + 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 status if something goes wrong during the update payment process", async () => {
      paymentId = 1;
      const originalFn = paymentModel.prototype.update;
      paymentModel.prototype.update = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen during update payment process")
        );

      const res = await exec();

      paymentModel.prototype.update = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if payment successfully updated", async () => {
      [paymentId] = await paymentModelInstance.save(paymentData);

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
      return request(server).delete(`/api/payment/${paymentId}`);
    };

    it("should return a 400 status if the payment ID is not greater than 0", async () => {
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

    it("should return a 404 status if the payment ID is not found", async () => {
      [paymentId] = await paymentModelInstance.save(paymentData);
      paymentId = paymentId + 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 status if something goes wrong during the payment deletion process", async () => {
      paymentId = 1;
      const originalFn = paymentModel.prototype.delete;
      paymentModel.prototype.delete = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen during payment deletion process")
        );

      const res = await exec();

      paymentModel.prototype.delete = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if payment was successfully deleted", async () => {
      [paymentId] = await paymentModelInstance.save(paymentData);

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
