const { validateOrder } = require("../../../../resource/order/helper");
const moment = require("moment");
const _ = require("lodash");

describe("resource/order/helper", () => {
  let orderData;
  const longString = (length) => new Array(length + 1).join("a");
  const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
  const invalidReqOrderValues = [
    ["id", ["a", 0]],
    ["customer_id", [null, "", NaN, 0, undefined]],
    ["quote_id", [null, "", NaN, 0, undefined]],
    ["status", ["a", undefined]],
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

  const invalidReqOrderItemValues = [
    ["id", ["a", 0]],
    ["order_id", [null, "", NaN, 0]],
    ["name", [longString(51), undefined]], // max length is 50
    ["price", [null, NaN, "", 0, -1, 10000000, undefined]],
    ["quantity", [null, NaN, "", 0, -1, 1000000, undefined]],
    ["product_id", [null, "", NaN, 0, undefined]],
    ["row_total", [null, NaN, "", 0, -1, 10000000, undefined]],
  ];

  const invalidReqOrderPaymentValues = [
    ["id", ["a", 0]],
    ["order_id", [null, "", NaN, 0]],
    ["method", [longString(11), undefined]], // max length is 10
    ["name", [longString(51), undefined]], // max length is 50
    ["grandtotal", [null, NaN, "", 0, -1, 10000000, undefined]],
    ["status", ["a", undefined]],
  ];

  beforeEach(() => {
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
      payment: {
        method: "cod",
        name: "Cash on delivery",
        grandtotal: "1000",
        status: "pending",
      },
    };
  });

  describe("validateOrder", () => {
    describe.each(invalidReqOrderValues)(
      "validate order request body",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `should return joi validation error if the ${field} value of %s is invalid`,
          async (invalidValue) => {
            const modifiedData = { ...orderData, [field]: invalidValue };
            const { error } = validateOrder(modifiedData);

            expect(error.details[0]).toMatchObject({
              path: expect.arrayContaining([field]),
              message: expect.stringMatching(new RegExp(field, "i")),
            });
          }
        );
      }
    );

    describe.each(invalidReqOrderItemValues)(
      "validate order item request body",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `should return joi validation error if the ${field} value of %s is invalid`,
          async (invalidValue) => {
            const modifiedData = {
              ...orderData,
              items: [
                {
                  ...orderData.items[0],
                  [field]: invalidValue,
                },
              ],
            };

            const { error } = validateOrder(modifiedData);

            expect(error.details[0]).toMatchObject({
              path: expect.arrayContaining([field]),
              message: expect.stringMatching(new RegExp(field, "i")),
            });
          }
        );
      }
    );

    describe.each(invalidReqOrderPaymentValues)(
      "validate order payment request body",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `should return joi validation error if the ${field} value of %s is invalid`,
          async (invalidValue) => {
            const modifiedData = {
              ...orderData,
              payment: {
                ...orderData.payment,
                [field]: invalidValue,
              },
            };

            const { error } = validateOrder(modifiedData);

            expect(error.details[0]).toMatchObject({
              path: expect.arrayContaining([field]),
              message: expect.stringMatching(new RegExp(field, "i")),
            });
          }
        );
      }
    );

    it("should forced to validate only the present order invalid data if isValidatePassedKeyOnly is set to true", () => {
      orderData = {
        first_name: longString(51),
        email: "a",
      };

      const { error } = validateOrder(orderData, true);

      expect(error.details[0]).toMatchObject(
        {
          path: expect.arrayContaining(["first_name"]),
          message: expect.stringMatching(new RegExp("first_name")),
        },
        {
          path: expect.arrayContaining(["email"]),
          message: expect.stringMatching(new RegExp("email")),
        }
      );
    });

    it("should return a joi validation error if passed an empty object and isValidatePassedKeyOnly is set to true", () => {
      const { error } = validateOrder({}, true);

      expect(error).toBeTruthy();
    });

    it("should return null if order data is valid", () => {
      const { error } = validateOrder(orderData);

      expect(error).toBeUndefined();
    });

    it("should return null if order data is valid and isValidatePassedKeyOnly is set to true", () => {
      orderData = _.pick(orderData, ["first_name", "email"]);
      const { error } = validateOrder(orderData, true);

      expect(error).toBeUndefined();
    });
  });
});
