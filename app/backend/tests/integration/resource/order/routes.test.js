const OrderItemModel = require("../../../../resource/order/item/model");
const OrderModel = require("../../../../resource/order/model");
const request = require("supertest");

const orderModelInstance = new OrderModel();
const orderItemModelInstance = new OrderItemModel();

describe("/api/order", () => {
  let server;
  let orderData;

  beforeEach(() => {
    server = require("../../../../app");
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
    await orderItemModelInstance.create().delete();
    await orderModelInstance.create().delete();
  });

  describe("POST /", () => {
    const exec = () => request(server).post("/api/order/").send(orderData);

    it("should return a 400 status if the order data is invalid", async () => {
      orderData = {};
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

    it("should return a 409 status if the email is already exist to the database", async () => {
      await orderModelInstance.save(orderData);
      const res = await exec();
      const order = (
        await orderModelInstance.findByEmail(orderData.email)
      ).getData();

      expect(order.email).toBe(orderData.email);
      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });

    it("should return a 409 status if no order ID return after saving to the DB", async () => {
      const originalSaveFn = OrderModel.prototype.save;
      OrderModel.prototype.save = jest.fn().mockReturnValue();
      const res = await exec();
      OrderModel.prototype.save = originalSaveFn;

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: null,
      });
    });

    it("should return a 500 if something goes wrong in the order saving process", async () => {
      const originalFn = OrderModel.prototype.save;
      OrderModel.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error("something happen in order save process"));
      const res = await exec();

      OrderModel.prototype.save = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if the order was succesfully saved to the database", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.any(Number),
      });
    });
  });

  describe("GET /:id", () => {
    let orderId = 0;
    const exec = () => request(server).get(`/api/order/${orderId}`);

    it("should return a 400 if the order ID is invalid", async () => {
      orderId = 0;
      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 404 if the order ID is not found", async () => {
      orderId = 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 if something goes wrong in the order getting process", async () => {
      orderId = 1;
      const originalFn = OrderModel.prototype.findById;
      OrderModel.prototype.findById = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen in getting order data process")
        );

      const res = await exec();

      OrderModel.prototype.findById = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 if the order ID is valid and returned a order data", async () => {
      orderId = await orderModelInstance.save(orderData);
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

  describe("PATCH /:id", () => {
    let orderId;
    const exec = () =>
      request(server).patch(`/api/order/${orderId}`).send(orderData);

    beforeEach(() => {
      orderId = 1;
    });

    it("should return a 400 status if the order ID is invalid", async () => {
      orderData = {};
      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 400 status if the order data is invalid", async () => {
      orderData = { ...orderData, email: "" };

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

    it("should return a 409 status if the order email is already exist in the database", async () => {
      const { items, ...purelyOrderData } = orderData;
      orderId = await orderModelInstance.save(purelyOrderData);

      purelyOrderData.email = "a@gmail.com";
      await orderModelInstance.save(purelyOrderData);

      orderData = purelyOrderData;
      const res = await exec();

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 404 if the order ID is not found in the database", async () => {
      orderId = 1;
      orderData.items[0].id = 1;
      orderData.items[0].order_id = orderId;
      orderData.items[1].id = 2;
      orderData.items[1].order_id = orderId;

      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 if anything goes wrong in the process like no item_id property in the payload is passed", async () => {
      orderId = await orderModelInstance.save(orderData);

      const res = await exec();

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 if successfully saved to the database", async () => {
      orderId = await orderModelInstance.save(orderData);

      orderData.first_name = "mark";
      const items = (
        await orderItemModelInstance.findByOrderID(orderId)
      ).getData();
      items.map((item) => {
        delete item.created_at;
        delete item.updated_at;
        item.name = "edited";
        return item;
      });

      orderData = { ...orderData, items };
      const res = await exec();
      const editedOrderData = await orderModelInstance.findById(orderId);
      const editedOrderItems = await editedOrderData.getItems();

      expect(editedOrderData.data.first_name).toBe("mark");
      expect(editedOrderItems.data[0].name).toBe("edited");
      expect(editedOrderItems.data[1].name).toBe("edited");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });

  describe("DELETE /:id", () => {
    let orderId;
    const exec = () => request(server).delete(`/api/order/${orderId}`);

    it("should return a 400 status if the order ID is invalid ", async () => {
      orderId = 0;

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 404 status if the order ID is not in the database", async () => {
      orderId = 1;

      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 status if something goes wrong during the process", async () => {
      orderId = 1;
      const originalDeleteMethod = OrderModel.prototype.delete;
      OrderModel.prototype.delete = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen in order deletion process")
        );

      const res = await exec();

      OrderModel.prototype.delete = originalDeleteMethod;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if deletion is successfull", async () => {
      orderId = await orderModelInstance.save(orderData);

      const res = await exec();

      const orderDataFromDb = (
        await orderModelInstance.findById(orderId)
      ).getData();

      expect(orderId).toBeGreaterThan(0);
      expect(orderDataFromDb).toBeNull();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });
});
