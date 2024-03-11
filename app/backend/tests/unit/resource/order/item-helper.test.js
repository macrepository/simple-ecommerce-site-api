const { validateOrderItem } = require("../../../../resource/order/item/helper");
const _ = require("lodash");

describe("resource/order/item/helper", () => {
  let orderItemData;
  const longString = (length) => new Array(length + 1).join("a");

  const invalidReqOrderItemValues = [
    ["id", ["a", 0]],
    ["order_id", [null, "", NaN, 0, undefined]],
    ["name", [longString(51), undefined]], // max length is 50
    ["price", [null, NaN, "", 0, -1, 10000000, undefined]],
    ["quantity", [null, NaN, "", 0, -1, 1000000, undefined]],
    ["product_id", [null, "", NaN, 0, undefined]],
    ["row_total", [null, NaN, "", 0, -1, 10000000, undefined]],
  ];

  beforeEach(() => {
    orderItemData = {
      id: 1,
      order_id: 1,
      name: "tshirt xl blue",
      price: "1000",
      quantity: "1",
      product_id: "1",
      row_total: "1000",
    };
  });

  describe("validateOrderItem", () => {
    describe.each(invalidReqOrderItemValues)(
      "validate order item request body",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `should return joi validation error if the ${field} value of %s is invalid`,
          async (invalidValue) => {
            const modifiedData = {
              ...orderItemData,
              [field]: invalidValue,
            };

            const { error } = validateOrderItem(modifiedData);

            expect(error.details[0]).toMatchObject({
              path: expect.arrayContaining([field]),
              message: expect.stringMatching(new RegExp(field, "i")),
            });
          }
        );
      }
    );

    it("should forced to validate only the present order invalid data if isValidatePassedKeyOnly is set to true", () => {
      orderItemData = {
        price: 0,
        quantity: 0,
      };

      const { error } = validateOrderItem(orderItemData, true);

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
      const { error } = validateOrderItem({}, true);

      expect(error).toBeTruthy();
    });

    it("should return null if customer data is valid", () => {
      const { error } = validateOrderItem(orderItemData);

      expect(error).toBeUndefined();
    });

    it("should return null if customer data is valid and isValidatePassedKeyOnly is set to true", () => {
      orderItemData = _.pick(orderItemData, ["price", "quantity"]);
      const { error } = validateOrderItem(orderItemData, true);

      expect(error).toBeUndefined();
    });
  });
});
