const { validateProduct } = require("../../../../resource/product/helper");
const _ = require("lodash");

describe("resource/product/helper", () => {
  let productData;
  const longString = (length) => new Array(length + 1).join("a");

  const invalidReqProductValues = [
    ["id", ["a", 0]],
    ["category_id", [null, "", NaN, 0, undefined]],
    ["name", [longString(51), undefined]], // max length is 50
    ["price", [null, NaN, "", 0, -1, 10000000, undefined]],
    ["quantity", [null, NaN, "", 0, -1, 1000000, undefined]],
    ["is_active", [null, NaN, 1, "", undefined]],
    ["thumbnail", [longString(51)]], // max length is 50
    ["gallery", ["", {}, null, 0]],
  ];

  beforeEach(() => {
    productData = {
      id: 1,
      category_id: 1,
      name: "tshirt xl blue",
      price: 1000,
      quantity: 1,
      description: "xl blue tshirt, nice quality",
      is_active: true,
      thumbnail: "public/media/product/1/tshirt_xl_blue.png",
      gallery: [
        "public/media/product/1/gallery/top_tshirt_xl_blue.png",
        "public/media/product/1/gallery/right_tshirt_xl_blue.png",
        "public/media/product/1/gallery/bottom_tshirt_xl_blue.png",
        "public/media/product/1/gallery/left_tshirt_xl_blue.png",
      ],
    };
  });

  describe("validateProduct", () => {
    describe.each(invalidReqProductValues)(
      "validate product request body",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `should return joi validation error if the ${field} value of %s is invalid`,
          async (invalidValue) => {
            const modifiedData = {
              ...productData,
              [field]: invalidValue,
            };

            const { error } = validateProduct(modifiedData);

            expect(error.details[0]).toMatchObject({
              path: expect.arrayContaining([field]),
              message: expect.stringMatching(new RegExp(field, "i")),
            });
          }
        );
      }
    );

    it("should forced to validate only the present product invalid data if isValidatePassedKeyOnly is set to true", () => {
      productData = {
        price: 0,
        quantity: 0,
      };

      const { error } = validateProduct(productData, true);

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
      const { error } = validateProduct({}, true);

      expect(error).toBeTruthy();
    });

    it("should return null if product data is valid", () => {
      const { error } = validateProduct(productData);

      expect(error).toBeUndefined();
    });

    it("should return null if product data is valid and isValidatePassedKeyOnly is set to true", () => {
      productData = _.pick(productData, ["price", "quantity"]);
      const { error } = validateProduct(productData, true);

      expect(error).toBeUndefined();
    });
  });
});
