const _ = require("lodash");
const request = require("supertest");
const CustomerModel = require("../../../../resource/customer/model");

const customerModelInstance = new CustomerModel();

describe("api/customer", () => {
  let server;
  let customerData;

  beforeEach(() => {
    server = require("../../../../app");
    customerData = {
      first_name: "john",
      last_name: "doe",
      date_of_birth: "1967-09-24",
      gender: "male",
      address: "Cebu city, Phillipines",
      zip_code: "6000",
      email: "johndoe@gmail.com",
      password: "yyyyyy1",
      repeat_password: "yyyyyy1",
    };
  });

  afterEach(async () => {
    await server.close();
    await customerModelInstance.create().delete();
  });

  describe("POST /", () => {
    const exec = () => {
      return request(server).post("/api/customer").send(customerData);
    };

    it("should return a 400 status if the customer request data is invalid", async () => {
      customerData = {};
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

    it("should response a 400 status if the customer confirm password is not match ", async () => {
      const field = "repeat_password";
      customerData.repeat_password = "a";

      const res = await exec(customerData);

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
    });

    it("should response a 409 status if the customer email is already exist in the database", async () => {
      await customerModelInstance.save(
        _.omit(customerData, ["repeat_password"])
      );

      const res = await exec(customerData);

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });

    it("Should return a 409 status if the customer data is not saved.", async () => {
      const originalFn = CustomerModel.prototype.save;
      CustomerModel.prototype.save = jest.fn().mockReturnValue();
      const res = await exec(customerData);

      CustomerModel.prototype.save = originalFn;

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 500 status if the something goes wrong during the post customer process", async () => {
      const originalFn = CustomerModel.prototype.save;
      CustomerModel.prototype.save = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen in customer save process")
        );
      const res = await exec(customerData);

      CustomerModel.prototype.save = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return a 200 status if the customer data is successfully saved to the database", async () => {
      const res = await exec(customerData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });
  });

  describe("GET / OR /:id", () => {
    let customerId;
    const exec = () => {
      return request(server).get(`/api/customer/${customerId}`);
    };

    it("Should return a 400 status if the customer ID passed is not greater than 0", async () => {
      customerId = 0;
      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("Should return a 404 status if no customer data was returned", async () => {
      customerId = 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return a 200 status and one customer record if valid customer ID is passed", async () => {
      [customerId] = await customerModelInstance.save(
        _.omit(customerData, ["repeat_password"])
      );

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.any(Object),
      });
    });

    it("should return a 200 status and one or more customer record if no customer ID is passed", async () => {
      customerId = "";
      await customerModelInstance.save([
        { ..._.omit(customerData, ["repeat_password"]) },
        { ..._.omit(customerData, ["repeat_password"]), email: "a@gmail.com" },
      ]);

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });
  });

  describe("PATCH /:id", () => {
    let customerId;
    const exec = () => {
      return request(server)
        .patch(`/api/customer/${customerId}`)
        .send(customerData);
    };

    it("Should return a 400 status if the customer ID is invalid", async () => {
      customerId = "a";

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("Should return a 400 status if the customer data is invalid", async () => {
      customerId = 1;
      customerData = { ...customerData, email: "" };

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

    it("Should return a 404 status if the customer ID is not found in the database", async () => {
      customerId = 1;
      customerData = _.omit(customerData, ["repeat_password"]);

      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("Should return a 409 status if the customer email is already exist", async () => {
      [customerId] = await customerModelInstance.save(
        _.omit(customerData, ["repeat_password"])
      );

      customerData.email = "a@gmail.com";
      await customerModelInstance.save(
        _.omit(customerData, ["repeat_password"])
      );

      customerData = _.omit(customerData, ["repeat_password"]);

      const res = await exec();

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: "conflict",
        message: expect.any(String),
        body: expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            message: expect.any(String),
          }),
        ]),
      });
    });

    it("Should return a 500 status if something goes wrong in the update process", async () => {
      customerId = 1;
      customerData = _.omit(customerData, ["repeat_password"]);

      const originalFn = CustomerModel.prototype.update;
      CustomerModel.prototype.update = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen in customer update process")
        );

      const res = await exec();

      CustomerModel.prototype.update = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.any(String),
      });
    });

    it("Should return a 200 status if the customer data was successfully updated", async () => {
      [customerId] = await customerModelInstance.save(
        _.omit(customerData, ["repeat_password"])
      );

      customerData = _.omit(customerData, ["repeat_password"]);

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });

  describe("DELETE /:id", () => {
    let customerId;

    const exec = () => {
      return request(server).delete(`/api/customer/${customerId}`);
    };

    it("Should return a 400 status if the customer ID is not greater than 0", async () => {
      customerId = "0";

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        code: "bad_request",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("Should return a 404 status if the customer ID is not found in the database", async () => {
      customerId = "1";

      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("Should return a 500 status if something goes wrong in the delete process", async () => {
      customerId = "1";
      const originalFn = CustomerModel.prototype.delete;
      CustomerModel.prototype.delete = jest
        .fn()
        .mockRejectedValue(
          new Error("something happen during customer deletion process")
        );

      const res = await exec();

      CustomerModel.prototype.delete = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("Should return a 200 status if the customer record was succesfully deleted", async () => {
      [customerId] = await customerModelInstance.save(
        _.omit(customerData, ["repeat_password"])
      );

      const res = await exec();

      const customer = (
        await customerModelInstance.findById(customerId)
      ).getData();

      expect(customerId).toBeGreaterThan(0);
      expect(customer).toBeNull();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });
  });
});
