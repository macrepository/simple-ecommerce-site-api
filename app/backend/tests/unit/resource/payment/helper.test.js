const { validatePayment } = require("../../../../resource/payment/helper");
const _ = require("lodash");

describe("resource/payment/helper", () => {
  let paymentData;
  const longString = (length) => new Array(length + 1).join("a");

  const invalidReqPaymentValues = [
    ["id", ["a", 0]],
    ["is_active", [null, NaN, 1, "", undefined]],
    ["method", [longString(11), undefined]], // max length is 10
    ["name", [longString(51), undefined]], // max length is 50
  ];

  beforeEach(() => {
    paymentData = {
      id: 1,
      is_active: true,
      method: "cod",
      name: "Cash on delivery",
    };
  });

  describe("validatePayment", () => {
    describe.each(invalidReqPaymentValues)(
      "validate payment request body",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `should return joi validation error if the ${field} value of %s is invalid`,
          async (invalidValue) => {
            const modifiedData = {
              ...paymentData,
              [field]: invalidValue,
            };

            const { error } = validatePayment(modifiedData);

            expect(error.details[0]).toMatchObject({
              path: expect.arrayContaining([field]),
              message: expect.stringMatching(new RegExp(field, "i")),
            });
          }
        );
      }
    );

    it("should forced to validate only the present payment invalid data if isValidatePassedKeyOnly is set to true", () => {
      paymentData = {
        id: 0,
        method: longString(11),
      };

      const { error } = validatePayment(paymentData, true);

      expect(error.details[0]).toMatchObject(
        {
          path: expect.arrayContaining(["id"]),
          message: expect.stringMatching(new RegExp("id", "i")),
        },
        {
          path: expect.arrayContaining(["method"]),
          message: expect.stringMatching(new RegExp("method")),
        }
      );
    });

    it("should return a joi validation error if passed an empty payment object and isValidatePassedKeyOnly is set to true", () => {
      const { error } = validatePayment({}, true);

      expect(error).toBeTruthy();
    });

    it("should return null if the payment data is valid", () => {
      const { error } = validatePayment(paymentData);

      expect(error).toBeUndefined();
    });

    it("should return null if the payment data is valid and isValidatePassedKeyOnly is set to true", () => {
      paymentData = _.pick(paymentData, ["id"]);
      const { error } = validatePayment(paymentData, true);

      expect(error).toBeUndefined();
    });
  });
});
