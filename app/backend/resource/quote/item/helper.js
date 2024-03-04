const Joi = require("joi");

const quoteItemSchema = {
  quote_id: Joi.number(),
  name: Joi.string().max(50).required(),
  price: Joi.number().max(999999999).precision(2).required(),
  quantity: Joi.number().max(999999).required(),
  product_id: Joi.number().required(),
  row_total: Joi.number().max(999999999).precision(2).required(),
};

function validateQuoteItem(quoteItemData) {
  const schema = Joi.object(quoteItemSchema);

  return schema.validate(quoteItemData, { abortEarly: false });
}

module.exports = {
  quoteItemSchema,
  validateQuoteItem
};
