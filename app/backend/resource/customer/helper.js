const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const { password } = require("../../config/data");
const _ = require("lodash");

let customerSchema = {
  first_name: Joi.string().max(50).required(),
  last_name: Joi.string().max(50).required(),
  date_of_birth: Joi.date().less("now"),
  gender: Joi.string().valid("male", "female", "others"),
  address: Joi.string().max(255),
  zip_code: Joi.string().max(20),
  email: Joi.string().max(50).email({ allowFullyQualified: true }).required(),
  password: passwordComplexity(password.ComplexityOptions).required(),
  repeat_password: Joi.string().valid(Joi.ref("password")).required(),
};

/**
 * Validate customer details
 * @param {Object} customer
 * @returns {Object}
 */
function validateCustomer(customer, isValidatePassedKeyOnly = false) {
  if (isValidatePassedKeyOnly) {
    customerSchema = _.pick(customerSchema, Object.keys(customer));
  }
  const schema = Joi.object(customerSchema);
  return schema.validate(customer, { abortEarly: false });
}

/**
 *
 * @param {string} email
 * @returns {Object}
 */
function validateEmail(email) {
  const schema = Joi.object({ email: customerSchema.email });
  return schema.validate(email);
}

module.exports = {
  validateCustomer,
  validateEmail,
};
