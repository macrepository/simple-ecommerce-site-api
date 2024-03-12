const _ = require("lodash");
const Joi = require("joi");

const categorySchema = {
  id: Joi.number().greater(0).label("Category ID"),
  name: Joi.string().max(50).required(),
  thumbnail: Joi.string().max(50).required(),
  is_active: Joi.boolean().required(),
};

function validateCategory(categoryData, isValidatePassedKeyOnly = false) {
  let categoryObjectSchema = categorySchema;
  if (isValidatePassedKeyOnly) {
    categoryObjectSchema = _.pick(
      categoryObjectSchema,
      Object.keys(categoryData)
    );
  }
  const schema = Joi.object(categoryObjectSchema).min(1).required().messages({
    "object.min": "Payload is missing!",
  });

  return schema.validate(categoryData, { abortEarly: false });
}

module.exports = {
  validateCategory,
};
