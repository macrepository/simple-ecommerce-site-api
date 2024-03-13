const { joiErrorFormatter } = require("../../../utilities/joi-error-formatter");
const Joi = require("joi");

describe("joiErrorFormatter", () => {
  it("should return the formatted response from Joi error details property", () => {
    const schema = Joi.object({
      name: Joi.string().min(5).required(),
      email: Joi.string()
        .max(50)
        .email({ allowFullyQualified: true })
        .required(),
    });

    const { error } = schema.validate(
      { name: "a", email: "test" },
      { abortEarly: false }
    );

    const result = joiErrorFormatter(error.details);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "name",
          message: expect.anything(),
        }),
        expect.objectContaining({
          field: "email",
          message: expect.anything(),
        }),
      ])
    );
  });
});
