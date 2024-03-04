const { quoteItemSchema } = require("./item/helper");
const { quotePaymentSchema } = require("./payment/helper");
const Joi = require("joi");

const quoteSchema = {
  customer_id: Joi.number().required(),
  is_active: Joi.boolean().required(),
  first_name: Joi.string().max(50).required(),
  last_name: Joi.string().max(50).required(),
  date_of_birth: Joi.date().less("now"),
  gender: Joi.string().valid("male", "female", "others"),
  address: Joi.string().max(255).required(),
  zip_code: Joi.string().max(20).required(),
  email: Joi.string().max(50).email({ allowFullyQualified: true }).required(),
  subtotal: Joi.number().max(999999999).precision(2).required(),
  grandtotal: Joi.number().max(999999999).precision(2).required(),
  items: Joi.array().items(quoteItemSchema),
  paytment: Joi.object(quotePaymentSchema)
};

function validateQuote(quoteData) {
  const schema = Joi.object(quoteSchema);

  return schema.validate(quoteData, { abortEarly: false });
}

module.exports = {
  validateQuote,
};
