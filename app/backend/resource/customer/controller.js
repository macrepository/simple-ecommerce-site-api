const CustomerModel = require("./model");
const { httpResponse } = require("../../config/data");
const { validateCustomer } = require("./helper");
const { response } = require("../../utilities/http-response");
const { joiErrorFormatter } = require("../../utilities/joi-error-formatter");
const { hashPassword } = require("../../utilities/password");
const {
  exceptionErrorFormatter,
  handleExceptionRoutes
} = require("../../utilities/handle-exception");

/**
 * Save Customer details
 * @param {Object} ctx
 * @returns {Object}
 */
async function saveCustomer(ctx) {
  const customerReqData = ctx.request.body;

  try {
    const { error } = validateCustomer(customerReqData);

    if (error) {
      return response(
        ctx,
        httpResponse.badRequest,
        joiErrorFormatter(error.details)
      );
    }

    delete customerReqData.repeat_password;
    customerReqData.password = await hashPassword(customerReqData.password);
    await CustomerModel.save(customerReqData);

    return response(ctx, httpResponse.success);
  } catch (exception) {
    return handleExceptionRoutes(ctx, exception, customerReqData);
  }
}

/**
 * Get Customer Details
 * @param {Object} ctx 
 * @returns {Object}
 */
async function getCustomer(ctx) {
  let customer;
  const customerId = ctx.params.id;

  try {
    if (customerId) {
      customer = await CustomerModel.findById(customerId);
    } else {
      customer = await CustomerModel.findAll();
    }

    return response(ctx, httpResponse.success, customer?.data);
  } catch (exception) {
    return handleExceptionRoutes(ctx, exception, { id: customerId });
  }
}

/**
 * Update Customer Details
 * @param {Object} ctx 
 * @returns {Object}
 */
async function patchCustomer(ctx) {
  const customerId = ctx.params.id;
  const customerReqData = ctx.request.body;

  try {
    const { error } = validateCustomer(customerReqData);

    if (error) {
      return response(
        ctx,
        httpResponse.badRequest,
        joiErrorFormatter(error.details)
      );
    }

    delete customerReqData.repeat_password;
    await CustomerModel.update(customerId, customerReqData);

    return response(ctx, httpResponse.success);
  } catch (exception) {
    return handleExceptionRoutes(ctx, exception, customerReqData);
  }
}

/**
 * Delete customer data
 * @param {Object} ctx 
 * @returns {Object}
 */
async function deleteCustomer(ctx) {
  const customerId = ctx.params.id;

  try {
    if (!customerId) {
      return response(
        ctx,
        httpResponse.badRequest,
        "Customer ID was not set"
      );
    } 

    const result = await CustomerModel.delete(customerId);

    if (!result) {
      return response(
        ctx,
        httpResponse.badRequest,
        `Cannot delete customer with the given customer ID of ${customerId}`
      );
    }

    return response(ctx, httpResponse.success);
  } catch (exception) {
    return handleExceptionRoutes(ctx, exception, { id: customerId });
  }
}

module.exports = {
  saveCustomer,
  getCustomer,
  patchCustomer,
  deleteCustomer,
};
