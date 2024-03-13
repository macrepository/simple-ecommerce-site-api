const {
  validateQuotePayment,
} = require("../../../../resource/quote/payment/helper");
const _ = require("lodash");

describe("resource/quote/payment/helper", () => {
  let quotePaymentData;
  const longString = (length) => new Array(length + 1).join("a");

  const invalidReqQoutePaymentValues = [
    ["id", ["a", 0]],
    ["quote_id", [null, "", NaN, 0, undefined]],
    ["method", [longString(11), undefined]], // max length is 10
    ["name", [longString(51), undefined]], // max length is 50
    ["grandtotal", [null, NaN, "", 0, -1, 10000000, undefined]],
    ["status", ["a", undefined]],
  ];

  beforeEach(() => {
    quotePaymentData = {
      id: 1,
      quote_id: 1,
      method: "cod",
      name: "Cash on delivery",
      grandtotal: "1000",
      status: "pending",
    };
  });

  describe("validateQuotePayment", () => {
    describe.each(invalidReqQoutePaymentValues)(
      "validate quote payment request body",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `should return joi validation error if the ${field} value of %s is invalid`,
          async (invalidValue) => {
            const modifiedData = {
              ...quotePaymentData,
              [field]: invalidValue,
            };

            const { error } = validateQuotePayment(modifiedData);

            expect(error.details[0]).toMatchObject({
              path: expect.arrayContaining([field]),
              message: expect.stringMatching(new RegExp(field, "i")),
            });
          }
        );
      }
    );

    it("should forced to validate only the present quote payment invalid data if isValidatePassedKeyOnly is set to true", () => {
      quotePaymentData = {
        quote_id: 0,
        grandtotal: 0,
      };

      const { error } = validateQuotePayment(quotePaymentData, true);

      expect(error.details[0]).toMatchObject(
        {
          path: expect.arrayContaining(["quote_id"]),
          message: expect.stringMatching(new RegExp("quote_id")),
        },
        {
          path: expect.arrayContaining(["grandtotal"]),
          message: expect.stringMatching(new RegExp("grandtotal")),
        }
      );
    });

    it("should return a joi validation error if passed an empty quote payment object and isValidatePassedKeyOnly is set to true", () => {
      const { error } = validateQuotePayment({}, true);

      expect(error).toBeTruthy();
    });

    it("should return null if the quote payment data is valid", () => {
      const { error } = validateQuotePayment(quotePaymentData);

      expect(error).toBeUndefined();
    });

    it("should return null if the quote payment data is valid and isValidatePassedKeyOnly is set to true", () => {
      quotePaymentData = _.pick(quotePaymentData, ["method", "name"]);
      const { error } = validateQuotePayment(quotePaymentData, true);

      expect(error).toBeUndefined();
    });
  });
});
