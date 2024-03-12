const { validateUser } = require("../../../../resource/user/helper");
const _ = require("lodash");

describe("resource/user/helper", () => {
  let userData;
  const longString = (length) => new Array(length + 1).join("a");
  const invalidUserValues = [
    ["id", ["a", 0]],
    ["first_name", [longString(51), undefined]], // max length is 50
    ["last_name", [longString(51), undefined]], // max length is 50
    ["email", [null, "a", "a@test", `${longString(42)}@test.com`, undefined]], //max length 50
    ["username", [longString(21), undefined]], // max length is 20
    ["role", ["a", undefined]],

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
    userData = {
      id: 1,
      first_name: "john",
      last_name: "doe",
      email: "johndoe@gmail.com",
      username: "john24",
      role: "admin",
      password: "yyyyyy1",
      repeat_password: "yyyyyy1",
    };
  });

  describe("validateUser", () => {
    describe.each(invalidUserValues)(
      "validate user request body",
      (field, invalidValues) => {
        test.each(invalidValues)(
          `should return joi validation error if the ${field} value of %s is invalid`,
          async (invalidValue) => {
            const modifiedData = { ...userData, [field]: invalidValue };
            modifiedData.repeat_password = modifiedData.password;

            const { error } = validateUser(modifiedData);

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
      userData.repeat_password = "a";

      const { error } = validateUser(userData);

      expect(error.details[0]).toMatchObject({
        path: expect.arrayContaining([field]),
        message: expect.stringMatching(new RegExp(field)),
      });
    });

    it("should forced to validate only the present user invalid data if isValidatePassedKeyOnly is set to true", () => {
      userData = {
        first_name: longString(51),
        email: "a",
      };

      const { error } = validateUser(userData);

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
      const { error } = validateUser({}, true);

      expect(error).toBeTruthy();
    });

    it("should return null if user data is valid", () => {
      const { error } = validateUser(userData);

      expect(error).toBeUndefined();
    });

    it("should return null if user data is valid and isValidatePassedKeyOnly is set to true", () => {
      userData = _.pick(userData, ["first_name", "email"]);
      const { error } = validateUser(userData, true);

      expect(error).toBeUndefined();
    });
  });
});
