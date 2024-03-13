const _ = require("lodash");
const Joi = require("joi");

const productSchema = {
  id: Joi.number().greater(0).label("Product ID"),
  category_id: Joi.number().greater(0).required(),
  name: Joi.string().max(50).required(),
  price: Joi.number().greater(0).max(9999999).precision(2).required(),
  quantity: Joi.number().min(1).max(999999).required(),
  description: Joi.string(),
  is_active: Joi.boolean().required(),
  thumbnail: Joi.string().max(50),
  gallery: Joi.array(),
};

function validateProduct(productData, isValidatePassedKeyOnly = false) {
  let productObjectSchema = productSchema;
  if (isValidatePassedKeyOnly) {
    productObjectSchema = _.pick(productObjectSchema, Object.keys(productData));
  }
  const schema = Joi.object(productObjectSchema).min(1).required().messages({
    "object.min": "Payload is missing!",
  });

  return schema.validate(productData, { abortEarly: false });
}

module.exports = {
  validateProduct,
};
