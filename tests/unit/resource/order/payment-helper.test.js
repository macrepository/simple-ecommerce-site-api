const {
  validateOrderPayment,
} = require("../../../../resource/order/payment/helper");
const _ = require("lodash");

describe("resource/order/payment/helper", () => {
  let orderPaymentData;
  const longString = (length) => new Array(length + 1).join("a");

  const invalidReqOrderPaymentValues = [
    ["id", ["a", 0]],
    ["order_id", [null, "", NaN, 0, undefined]],
    ["method", [longString(11), undefined]], // max length is 10
    ["name", [longString(51), undefined]], // max length is 50
    ["grandtotal", [null, NaN, "", 0, -1, 10000000, undefined]],
    ["status", ["a", undefined]],
  ];

  beforeEach(() => {
    orderPaymentData = {
      id: 1,
      order_id: 1,
      method: "cod",
      name: "Cash on delivery",
      grandtotal: "1000",
      status: "pending",
    };
  });

  describe("validateOrderPayment", () => {
    describe.each(invalidReqOrderPaymentValues)(
      "validate order payment request body",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `should return joi validation error if the ${field} value of %s is invalid`,
          async (invalidValue) => {
            const modifiedData = {
              ...orderPaymentData,
              [field]: invalidValue,
            };

            const { error } = validateOrderPayment(modifiedData);

            expect(error.details[0]).toMatchObject({
              path: expect.arrayContaining([field]),
              message: expect.stringMatching(new RegExp(field, "i")),
            });
          }
        );
      }
    );

    it("should forced to validate only the present order payment invalid data if isValidatePassedKeyOnly is set to true", () => {
      orderPaymentData = {
        order_id: 0,
        grandtotal: 0,
      };

      const { error } = validateOrderPayment(orderPaymentData, true);

      expect(error.details[0]).toMatchObject(
        {
          path: expect.arrayContaining(["order_id"]),
          message: expect.stringMatching(new RegExp("order_id")),
        },
        {
          path: expect.arrayContaining(["grandtotal"]),
          message: expect.stringMatching(new RegExp("grandtotal")),
        }
      );
    });

    it("should return a joi validation error if passed an empty order payment object and isValidatePassedKeyOnly is set to true", () => {
      const { error } = validateOrderPayment({}, true);

      expect(error).toBeTruthy();
    });

    it("should return null if the order payment data is valid", () => {
      const { error } = validateOrderPayment(orderPaymentData);

      expect(error).toBeUndefined();
    });

    it("should return null if the order payment data is valid and isValidatePassedKeyOnly is set to true", () => {
      orderPaymentData = _.pick(orderPaymentData, ["method", "name"]);
      const { error } = validateOrderPayment(orderPaymentData, true);

      expect(error).toBeUndefined();
    });
  });
});
