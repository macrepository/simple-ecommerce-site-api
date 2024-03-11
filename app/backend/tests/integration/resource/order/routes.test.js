const OrderPaymentModel = require("../../../../resource/order/payment/model");
const OrderItemModel = require("../../../../resource/order/item/model");
const OrderModel = require("../../../../resource/order/model");
const request = require("supertest");
const _ = require("lodash");

const orderModelInstance = new OrderModel();
const orderItemModelInstance = new OrderItemModel();
const orderPaymentModelInstance = new OrderPaymentModel();

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
      payment: {
        method: "cod",
        name: "Cash on delivery",
        grandtotal: 1000,
        status: "pending",
      },
    };
  });

  afterEach(async () => {
    await server.close();
    await orderPaymentModelInstance.create().delete();
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

    it("should return a 409 status if the quote_id is already exist to the database", async () => {
      const savedOrderID = await orderModelInstance.save(orderData);

      const res = await exec();

      const order = (await orderModelInstance.findById(savedOrderID)).getData();

      expect(order.quote_id).toBe(orderData.quote_id);
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

      const order = await orderModelInstance.findById(res.body.body);
      const items = (await order.getItems()).getData();
      const payment = (await order.getPayment()).getData();

      expect(order.data).toMatchObject({
        id: expect.any(Number),
        date_of_birth: expect.anything(),
        ..._.omit(orderData, ["date_of_birth", "items", "payment"]),
      });

      expect(items).toMatchObject([
        expect.objectContaining(orderData.items[0]),
        expect.objectContaining(orderData.items[1]),
      ]);

      expect(payment).toMatchObject(orderData.payment);

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
          date_of_birth: expect.anything(),
          ..._.omit(orderData, ["date_of_birth", "items", "payment"]),
          items: expect.arrayContaining([
            expect.objectContaining(orderData.items[0]),
            expect.objectContaining(orderData.items[1]),
          ]),
          payment: expect.objectContaining(orderData.payment),
        }),
      });
    });
  });

  describe("PATCH /:id", () => {
    let orderId;
    const exec = () => {
      return request(server).patch(`/api/order/${orderId}`).send(orderData);
    };

    it("should return a 400 status if the order ID is invalid", async () => {
      orderId = 0;
      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 400 status if the order data is invalid", async () => {
      orderId = 1;
      orderData = {};

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

    it("should return a 409 status if the quote_id is already exist to the database", async () => {
      const { items, ...purelyOrderData } = orderData;
      orderId = await orderModelInstance.save(purelyOrderData);

      purelyOrderData.quote_id += 1;
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
      orderData.payment.id = 1;
      orderData.payment.order_id = orderId;

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

      const order = await orderModelInstance.findById(orderId);
      const items = (await order.getItems()).getData();
      const payment = (await order.getPayment()).getData();

      orderData.first_name = "mark";
      items.map((item) => {
        delete item.created_at;
        delete item.updated_at;
        item.name = "edited";
        return item;
      });
      orderData.payment = {
        id: payment.id,
        ...orderData.payment,
        status: "paid",
      };

      orderData = { ...orderData, items };
      const res = await exec();

      const editedOrder = await orderModelInstance.findById(orderId);
      const editedItems = (await order.getItems()).getData();
      const editedPayment = (await order.getPayment()).getData();

      expect(editedOrder.data.first_name).toBe("mark");
      expect(editedItems[0].name).toBe("edited");
      expect(editedItems[1].name).toBe("edited");
      expect(editedPayment.status).toBe("paid");

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
