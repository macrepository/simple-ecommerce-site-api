const OrderItemModel = require("../../../../resource/order/item/model");
const OrderModel = require("../../../../resource/order/model");
const request = require("supertest");

const orderModelInstance = new OrderModel();
const orderItemModelInstance = new OrderItemModel();

describe("/api/order/item", () => {
  let server;
  let orderData;
  let orderId;
  let orderItemData;

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
    orderItemData = {
      order_id: orderId,
      name: "tshirt xl blue",
      price: "1000",
      quantity: "1",
      product_id: "1",
      row_total: "1000",
    };
  });

  afterEach(async () => {
    await server.close();
    await orderItemModelInstance.create().delete();
  });

  describe("POST /", () => {
    const exec = () => {
      return request(server).post("/api/order/item/").send(orderItemData);
    };

    it("should return a 400 status if the order item request data is invalid", async () => {
      orderItemData = {};

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

    it("should return a 409 status if no order item ID return after saving to the DB", async () => {
      const originalSaveFn = OrderItemModel.prototype.save;
      OrderItemModel.prototype.save = jest.fn().mockReturnValue();

      const res = await exec();

      OrderItemModel.prototype.save = originalSaveFn;

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: null,
      });
    });

    it("should return a 409 status if the order ID reference does not exist", async () => {
      orderItemData.order_id += 1;

      const res = await exec();

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });

    it("should return a 500 status if something goes wrong during the order item saving process", async () => {
      const originalFn = OrderItemModel.prototype.save;
      OrderItemModel.prototype.save = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen in order item save process")
        );

      const res = await exec();

      OrderItemModel.prototype.save = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status and the order item ID if the order item was successfully saved to the databases", async () => {
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
      return request(server).get(`/api/order/item/${itemId}`);
    };

    it("should return a 400 status if the order item ID is invalid", async () => {
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

    it("should reutrn a 404 status if the order item ID is not found", async () => {
      itemId = 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should reutrn a 500 status if something goes wrong during getting the order item", async () => {
      itemId = 1;
      const originalFn = OrderItemModel.prototype.findByID;
      OrderItemModel.prototype.findByID = jest
        .fn()
        .mockRejectedValue(new Error("something happen in findByID process"));

      const res = await exec();

      OrderItemModel.prototype.findByID = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status and order item details if order item ID is found", async () => {
      [itemId] = await orderItemModelInstance.save(orderItemData);

      const res = await exec();

      expect(itemId).toBeGreaterThan(0);
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
    let itemId;

    const exec = () => {
      return request(server)
        .patch(`/api/order/item/${itemId}`)
        .send(orderItemData);
    };

    it("should return a 400 status if the order item ID is not greater than 0", async () => {
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

    it("should return a 400 status if the order item data is invalid", async () => {
      itemId = 1;
      orderItemData = {};
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

    it("should return a 404 status if the order item ID is not found", async () => {
      [itemId] = await orderItemModelInstance.save(orderItemData);
      itemId = itemId + 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 409 status if order ID reference is not found", async () => {
      [itemId] = await orderItemModelInstance.save(orderItemData);
      orderItemData.order_id += 1;

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
      const originalFn = OrderItemModel.prototype.update;
      OrderItemModel.prototype.update = jest
        .fn()
        .mockRejectedValue(new Error("something happen during update process"));

      const res = await exec();

      OrderItemModel.prototype.update = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if order item successfully updated", async () => {
      [itemId] = await orderItemModelInstance.save(orderItemData);

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

  describe("DELETE /:id", () => {
    let itemId;
    const exec = () => {
      return request(server).delete(`/api/order/item/${itemId}`);
    };

    it("should return a 400 status if the order item ID is not greater than 0", async () => {
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

    it("should return a 404 status if the order item ID is not found", async () => {
      [itemId] = await orderItemModelInstance.save(orderItemData);
      itemId = itemId + 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 status if something goes wrong during the order item deletion process", async () => {
      itemId = 1;
      const originalFn = OrderItemModel.prototype.delete;
      OrderItemModel.prototype.delete = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen during order item deletion process")
        );

      const res = await exec();

      OrderItemModel.prototype.delete = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if order item was successfully deleted", async () => {
      [itemId] = await orderItemModelInstance.save(orderItemData);

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
