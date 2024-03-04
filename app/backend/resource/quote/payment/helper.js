const Joi = require("joi");

const quotePaymentSchema = {
  quote_id: Joi.number(),
  method: Joi.string().max(10).required(),
  name: Joi.string().max(50).required(),
  grandtotal: Joi.number().max(999999999).precision(2).required(),
  status: Joi.string().valid("paid", "declined", "system_error").required(),
};

function validateQuotePayment(quotePaymentData) {
  const schema = Joi.object(quotePaymentSchema);

  return schema.validate(quotePaymentData, { abortEarly: false });
}

module.exports = {
  quotePaymentSchema,
  validateQuotePayment,
};
