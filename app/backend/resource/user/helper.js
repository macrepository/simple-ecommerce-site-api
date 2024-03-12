const { password } = require("../../constant/data");
const passwordComplexity = require("joi-password-complexity");
const _ = require("lodash");
const Joi = require("joi");

const userSchema = {
  id: Joi.number().greater(0).label("Customer ID"),
  first_name: Joi.string().max(50).required(),
  last_name: Joi.string().max(50).required(),
  email: Joi.string().max(50).email({ allowFullyQualified: true }).required(),
  username: Joi.string().max(20).required(),
  role: Joi.string()
    .valid("admin", "order_management", "product_management")
    .required(),
  password: passwordComplexity(password.ComplexityOptions).required(),
  repeat_password: Joi.string().valid(Joi.ref("password")).required(),
};

/**
 * Validate user details
 * @param {Object} user
 * @param {boolean} isValidatePassedKeyOnly
 * @returns {Object}
 */
function validateUser(user, isValidatePassedKeyOnly = false) {
  let userObjectSchema = userSchema;
  if (isValidatePassedKeyOnly) {
    userObjectSchema = _.pick(userObjectSchema, Object.keys(user));
  }

  const schema = Joi.object(userObjectSchema).min(1).required().messages({
    "object.min": "Payload is missing!",
  });
  return schema.validate(user, { abortEarly: false });
}

module.exports = {
  validateUser,
};
