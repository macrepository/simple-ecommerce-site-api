const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const { password } = require("../../config/data");

/**
 * The function `validateCustomer` uses Joi schema to validate customer data
 * @param {Object} customer
 * @returns {Object}
 */
function validateCustomer(customer) {
  const customerSchema = Joi.object({
    first_name: Joi.string().max(50).required(),
    last_name: Joi.string().max(50).required(),
    date_of_birth: Joi.date().less("now"),
    gender: Joi.string().valid("male", "female", "others"),
    address: Joi.string().max(255),
    zip_code: Joi.string().max(20),
    email: Joi.string().max(50).email({ allowFullyQualified: true }).required(),
    password: passwordComplexity(password.ComplexityOptions).required(),
    repeat_password: Joi.string().valid(Joi.ref("password")).required(),
  });

  return customerSchema.validate(customer, { abortEarly: false });
}

module.exports = {
  validateCustomer,
};
