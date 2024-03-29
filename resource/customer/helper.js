const { password } = require("../../constant/data");
const passwordComplexity = require("joi-password-complexity");
const moment = require("moment");
const _ = require("lodash");
const Joi = require("joi");

const customerSchema = {
  id: Joi.number().greater(0).label("Customer ID"),
  first_name: Joi.string().max(50).required(),
  last_name: Joi.string().max(50).required(),
  date_of_birth: Joi.custom((value, helpers) => {
    if (!moment(value, "YYYY-MM-DD", true).isValid()) {
      return helpers.message("{{#label}} must be in YYYY-MM-DD format.");
    }

    if (moment(value).isAfter(moment().startOf("day"))) {
      return helpers.message("{{#label}} must be not in future.");
    }

    return value;
  }),
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
 * @param {boolean} isValidatePassedKeyOnly
 * @returns {Object}
 */
function validateCustomer(customer, isValidatePassedKeyOnly = false) {
  let customerObjectSchema = customerSchema;
  if (isValidatePassedKeyOnly) {
    customerObjectSchema = _.pick(customerObjectSchema, Object.keys(customer));
  }

  const schema = Joi.object(customerObjectSchema).min(1).required().messages({
    "object.min": "Payload is missing!",
  });
  return schema.validate(customer, { abortEarly: false });
}

module.exports = {
  validateCustomer,
};
