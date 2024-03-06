const Joi = require("joi");

const quoteItemSchema = {
  id: Joi.number().greater(0).label("Quote Item ID"),
  quote_id: Joi.number().greater(0),
  name: Joi.string().max(50).required(),
  price: Joi.number().greater(0).max(9999999).precision(2).required(),
  quantity: Joi.number().min(1).max(999999).required(),
  product_id: Joi.number().greater(0).required(),
  row_total: Joi.number().greater(0).max(9999999).precision(2).required(),
};

function validateQuoteItem(quoteItemData) {
  const schema = Joi.object(quoteItemSchema);

  return schema.validate(quoteItemData, { abortEarly: false });
}

module.exports = {
  quoteItemSchema,
  validateQuoteItem,
};
