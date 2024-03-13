const { validateQuoteItem } = require("../../../../resource/quote/item/helper");
const _ = require("lodash");

describe("resource/quote/item/helper", () => {
  let quoteItemData;
  const longString = (length) => new Array(length + 1).join("a");

  const invalidReqQouteItemValues = [
    ["id", ["a", 0]],
    ["quote_id", [null, "", NaN, 0, undefined]],
    ["name", [longString(51), undefined]], // max length is 50
    ["price", [null, NaN, "", 0, -1, 10000000, undefined]],
    ["quantity", [null, NaN, "", 0, -1, 1000000, undefined]],
    ["product_id", [null, "", NaN, 0, undefined]],
    ["row_total", [null, NaN, "", 0, -1, 10000000, undefined]],
  ];

  beforeEach(() => {
    quoteItemData = {
      id: 1,
      quote_id: 1,
      name: "tshirt xl blue",
      price: "1000",
      quantity: "1",
      product_id: "1",
      row_total: "1000",
    };
  });

  describe("validateQuoteItem", () => {
    describe.each(invalidReqQouteItemValues)(
      "validate quote item request body",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `should return joi validation error if the ${field} value of %s is invalid`,
          async (invalidValue) => {
            const modifiedData = {
              ...quoteItemData,
              [field]: invalidValue,
            };

            const { error } = validateQuoteItem(modifiedData);

            expect(error.details[0]).toMatchObject({
              path: expect.arrayContaining([field]),
              message: expect.stringMatching(new RegExp(field, "i")),
            });
          }
        );
      }
    );

    it("should forced to validate only the present quote invalid data if isValidatePassedKeyOnly is set to true", () => {
      quoteItemData = {
        price: 0,
        quantity: 0,
      };

      const { error } = validateQuoteItem(quoteItemData, true);

      expect(error.details[0]).toMatchObject(
        {
          path: expect.arrayContaining(["price"]),
          message: expect.stringMatching(new RegExp("price")),
        },
        {
          path: expect.arrayContaining(["quantity"]),
          message: expect.stringMatching(new RegExp("quantity")),
        }
      );
    });

    it("should return a joi validation error if passed an empty object and isValidatePassedKeyOnly is set to true", () => {
      const { error } = validateQuoteItem({}, true);

      expect(error).toBeTruthy();
    });

    it("should return null if quote item data is valid", () => {
      const { error } = validateQuoteItem(quoteItemData);

      expect(error).toBeUndefined();
    });

    it("should return null if quote item data is valid and isValidatePassedKeyOnly is set to true", () => {
      quoteItemData = _.pick(quoteItemData, ["price", "quantity"]);
      const { error } = validateQuoteItem(quoteItemData, true);

      expect(error).toBeUndefined();
    });
  });
});
