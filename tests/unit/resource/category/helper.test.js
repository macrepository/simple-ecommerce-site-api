const { validateCategory } = require("../../../../resource/category/helper");
const _ = require("lodash");

describe("resource/category/helper", () => {
  let categoryData;
  const longString = (length) => new Array(length + 1).join("a");

  const invalidReqCategoryValues = [
    ["id", ["a", 0]],
    ["name", [longString(51), undefined]], // max length is 50
    ["thumbnail", [longString(51), undefined]], // max length is 50
    ["is_active", [null, NaN, 1, "", undefined]],
  ];

  beforeEach(() => {
    categoryData = {
      id: 1,
      name: "Shoes",
      thumbnail: "public/media/category/shoes.jpeg",
      is_active: true,
    };
  });

  describe("validateCategory", () => {
    describe.each(invalidReqCategoryValues)(
      "validate category request body",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `should return joi validation error if the ${field} value of %s is invalid`,
          async (invalidValue) => {
            const modifiedData = {
              ...categoryData,
              [field]: invalidValue,
            };

            const { error } = validateCategory(modifiedData);

            expect(error.details[0]).toMatchObject({
              path: expect.arrayContaining([field]),
              message: expect.stringMatching(new RegExp(field, "i")),
            });
          }
        );
      }
    );

    it("should forced to validate only the present category invalid data if isValidatePassedKeyOnly is set to true", () => {
      categoryData = {
        id: 0,
        name: longString(51),
      };

      const { error } = validateCategory(categoryData, true);

      expect(error.details[0]).toMatchObject(
        {
          path: expect.arrayContaining(["id"]),
          message: expect.stringMatching(new RegExp("id", "i")),
        },
        {
          path: expect.arrayContaining(["name"]),
          message: expect.stringMatching(new RegExp("name")),
        }
      );
    });

    it("should return a joi validation error if passed an empty category object and isValidatePassedKeyOnly is set to true", () => {
      const { error } = validateCategory({}, true);

      expect(error).toBeTruthy();
    });

    it("should return null if the category data is valid", () => {
      const { error } = validateCategory(categoryData);

      expect(error).toBeUndefined();
    });

    it("should return null if the category data is valid and isValidatePassedKeyOnly is set to true", () => {
      categoryData = _.pick(categoryData, ["id"]);
      const { error } = validateCategory(categoryData, true);

      expect(error).toBeUndefined();
    });
  });
});
