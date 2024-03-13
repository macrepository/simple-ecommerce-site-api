const { validateCustomer } = require("../../../../resource/customer/helper");
const moment = require("moment");
const _ = require("lodash");

describe("resource/customer/helper", () => {
  let customerData;
  const longString = (length) => new Array(length + 1).join("a");
  const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
  const invalidCustomerValues = [
    ["id", ["a", 0]],
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

  beforeEach(() => {
    customerData = {
      id: 1,
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

  describe("validateCustomer", () => {
    describe.each(invalidCustomerValues)(
      "validate customer request body",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `should return joi validation error if the ${field} value of %s is invalid`,
          async (invalidValue) => {
            const modifiedData = { ...customerData, [field]: invalidValue };
            modifiedData.repeat_password = modifiedData.password;

            const { error } = validateCustomer(modifiedData);

            expect(error.details[0]).toMatchObject({
              path: expect.arrayContaining([field]),
              message: expect.stringMatching(new RegExp(field, "i")),
            });
          }
        );
      }
    );

    it("should return joi validation error if confirm password is not match  ", () => {
      const field = "repeat_password";
      customerData.repeat_password = "a";

      const { error } = validateCustomer(customerData);

      expect(error.details[0]).toMatchObject({
        path: expect.arrayContaining([field]),
        message: expect.stringMatching(new RegExp(field)),
      });
    });

    it("should forced to validate only the present customer invalid data if isValidatePassedKeyOnly is set to true", () => {
      customerData = {
        first_name: longString(51),
        email: "a",
      };

      const { error } = validateCustomer(customerData);

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
      const { error } = validateCustomer({}, true);

      expect(error).toBeTruthy();
    });

    it("should return null if customer data is valid", () => {
      const { error } = validateCustomer(customerData);

      expect(error).toBeUndefined();
    });

    it("should return null if customer data is valid and isValidatePassedKeyOnly is set to true", () => {
      customerData = _.pick(customerData, ["first_name", "email"]);
      const { error } = validateCustomer(customerData, true);

      expect(error).toBeUndefined();
    });
  });
});
