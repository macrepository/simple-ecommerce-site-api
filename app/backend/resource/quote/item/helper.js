const _ = require("lodash");
const Joi = require("joi");

const quoteItemSchema = {
  id: Joi.number().greater(0).label("Quote Item ID"),
  quote_id: Joi.number().greater(0).required(),
  name: Joi.string().max(50).required(),
  price: Joi.number().greater(0).max(9999999).precision(2).required(),
  quantity: Joi.number().min(1).max(999999).required(),
  product_id: Joi.number().greater(0).required(),
  row_total: Joi.number().greater(0).max(9999999).precision(2).required(),
};

/**
 *
 * @param {Object} quoteItemData
 * @param {boolean} isValidatePassedKeyOnly
 * @returns {Object}
 */
function validateQuoteItem(quoteItemData, isValidatePassedKeyOnly = false) {
  let quoteItemObjectSchema = quoteItemSchema;
  if (isValidatePassedKeyOnly) {
    quoteItemObjectSchema = _.pick(
      quoteItemObjectSchema,
      Object.keys(quoteItemData)
    );
  }
  const schema = Joi.object(quoteItemObjectSchema).min(1).required().messages({
    "object.min": "Payload is missing!",
  });

  return schema.validate(quoteItemData, { abortEarly: false });
}

module.exports = {
  quoteItemSchema,
  validateQuoteItem,
};
