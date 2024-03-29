const { quoteItemSchema } = require("./item/helper");
const moment = require("moment");
const Joi = require("joi");
const _ = require("lodash");

const quoteSchema = {
  id: Joi.number().greater(0).label("Quote ID"),
  customer_id: Joi.number().greater(0).required(),
  is_active: Joi.boolean().required(),
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
  address: Joi.string().max(255).required(),
  zip_code: Joi.string().max(20).required(),
  email: Joi.string().max(50).email({ allowFullyQualified: true }).required(),
  subtotal: Joi.number().greater(0).max(9999999).precision(2).required(),
  grandtotal: Joi.number().greater(0).max(9999999).precision(2).required(),
  items: Joi.array().items({
    ...quoteItemSchema,
    quote_id: Joi.number().greater(0),
  }),
};

/**
 * Validate quote data
 * @param {Object} quoteData
 * @param {boolean} isValidatePassedKeyOnly
 * @returns {Object}
 */
function validateQuote(quoteData, isValidatePassedKeyOnly = false) {
  let quoteObjectSchema = quoteSchema;
  if (isValidatePassedKeyOnly) {
    quoteObjectSchema = _.pick(quoteObjectSchema, Object.keys(quoteData));
  }
  const schema = Joi.object(quoteObjectSchema).min(1).required().messages({
    "object.min": "Payload is missing!",
  });
  return schema.validate(quoteData, { abortEarly: false });
}

module.exports = {
  validateQuote,
};
