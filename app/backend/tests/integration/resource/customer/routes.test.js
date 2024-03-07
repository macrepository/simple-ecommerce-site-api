const _ = require("lodash");
const moment = require("moment");
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

  const longString = (length) => new Array(length + 1).join("a");

  const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");

  const invalidCustomerValues = [
    ["first_name", [longString(51), undefined]], // max length is 50
    ["last_name", [longString(51), undefined]], // max length is 50
    ["date_of_birth", ["a", moment().format("MM-DD-YYYY"), tomorrow]],
    ["gender", ["a"]],
    ["address", [longString(256)]], // Max length is 255
    ["zip_code", [longString(21)]], // Max length is 20
    ["email", [null, "a", "a@test", `${longString(42)}@test.com`, undefined]], //max length 50
    [
      "password",
      [
        null,
        "",
        longString(5),
        longString(6),
        longString(256),
        `${longString(5)}A`,
        undefined,
      ],
    ],
  ];

  describe("POST /", () => {
    const exec = (payload) => {
      return request(server).post("/api/customer").send(payload);
    };

    describe.each(invalidCustomerValues)(
      "Validation tests for post request customer data",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `Should return 400 status if the request ${field} is %s`,
          async (invalidValue) => {
            const modifiedData = { ...customerData, [field]: invalidValue };
            modifiedData.repeat_password = modifiedData.password;

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

    it("should response 400 status if confirm password is not match ", async () => {
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

    it("should response 409 status on email that is already exist in the database", async () => {
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

    it("Should return 409 if customer data is not saved.", async () => {
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

    it("should return 500 status if something goes wrong on the process", async () => {
      const originalFn = CustomerModel.prototype.save;
      CustomerModel.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error("something happen"));
      const res = await exec(customerData);

      CustomerModel.prototype.save = originalFn;

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        code: "internal_server_error",
        message: expect.any(String),
        body: expect.anything(),
      });
    });

    it("should return 200 status if customer is successfully saved to the database", async () => {
      const res = await exec(customerData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: "success",
        message: expect.any(String),
        body: expect.any(Array),
      });
    });
  });

  describe("GET /", () => {
    let customerId;
    const exec = () => {
      return request(server).get(`/api/customer/${customerId}`);
    };

    it("Should return 400 status if the customer ID passed is not greater than 0", async () => {
      const testValues = ["a", 0];

      for (const value of testValues) {
        customerId = value;
        const res = await exec();

        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
          code: "bad_request",
          message: expect.any(String),
          body: expect.anything(),
        });
      }
    });

    it("Should return 404 status if no customer data was returned", async () => {
      customerId = 1;
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: "not_found",
        message: expect.any(String),
      });
      expect(res.body).toHaveProperty("body");
    });

    it("should return 200 status and one customer record if valid customer ID is passed", async () => {
      customerId = await customerModelInstance.save(
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

    it("should return 200 status and one or more customer record if no customer ID is passed", async () => {
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
});
