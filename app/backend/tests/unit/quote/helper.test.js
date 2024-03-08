const { validateQuote } = require("../../../resource/quote/helper");
const moment = require("moment");
const _ = require("lodash");

describe("resource/quote/helper", () => {
  let quoteData;
  const longString = (length) => new Array(length + 1).join("a");
  const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
  const invalidReqQouteValues = [
    ["id", ["a", 0]],
    ["customer_id", [null, "", NaN, 0, undefined]],
    ["is_active", [null, NaN, 1, "", undefined]],
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

  const invalidReqQouteItemValues = [
    ["id", ["a", 0]],
    ["quote_id", [null, "", NaN, 0]],
    ["name", [longString(51), undefined]], // max length is 50
    ["price", [null, NaN, "", 0, -1, 10000000, undefined]],
    ["quantity", [null, NaN, "", 0, -1, 1000000, undefined]],
    ["product_id", [null, "", NaN, 0, undefined]],
    ["row_total", [null, NaN, "", 0, -1, 10000000, undefined]],
  ];

  beforeEach(() => {
    quoteData = {
      customer_id: 1,
      is_active: true,
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

  describe("validateQuote", () => {
    describe.each(invalidReqQouteValues)(
      "validate quote request body",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `should return joi validation error if the ${field} value of %s is invalid`,
          async (invalidValue) => {
            const modifiedData = { ...quoteData, [field]: invalidValue };
            const { error } = validateQuote(modifiedData);

            expect(error.details[0]).toMatchObject({
              path: expect.arrayContaining([field]),
              message: expect.stringMatching(new RegExp(field, "i")),
            });
          }
        );
      }
    );

    describe.each(invalidReqQouteItemValues)(
      "validate quote item request body",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `should return joi validation error if the ${field} value of %s is invalid`,
          async (invalidValue) => {
            const modifiedData = {
              ...quoteData,
              items: [
                {
                  ...quoteData.items[0],
                  [field]: invalidValue,
                },
              ],
            };

            const { error } = validateQuote(modifiedData);

            expect(error.details[0]).toMatchObject({
              path: expect.arrayContaining([field]),
              message: expect.stringMatching(new RegExp(field, "i")),
            });
          }
        );
      }
    );

    it("should forced to validate only the present quote invalid data if isValidatePassedKeyOnly is set to true", () => {
      quoteData = {
        first_name: longString(51),
        email: "a",
      };

      const { error } = validateQuote(quoteData, true);

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

    it("should return null if customer data is valid", () => {
      const { error } = validateQuote(quoteData);

      expect(error).toBeUndefined();
    });

    it("should return null if customer data is valid and isValidatePassedKeyOnly is set to true", () => {
      quoteData = _.pick(quoteData, ["first_name", "email"]);
      const { error } = validateQuote(quoteData, true);

      expect(error).toBeUndefined();
    });
  });
});
