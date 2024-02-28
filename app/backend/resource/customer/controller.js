const CustomerModel = require("./model");
const { httpResponse } = require("../../config/data");
const { validateCustomer } = require("./helper");
const { response } = require("../../utilities/http-response");
const { joiErrorFormatter } = require("../../utilities/joi-error-formatter");
const { hashPassword, comparePassword } = require("../../utilities/password");
const { handleExceptionRoutes } = require("../../utilities/handle-exception");
const { generateToken } = require("../../utilities/json-web-token");

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
    const result = await CustomerModel.save(customerReqData);

    if (!result) {
      return response(
        ctx,
        httpResponse.badRequest,
        "Failure on creating new customer record."
      );
    }

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
    const { error } = validateCustomer(customerReqData, true);

    if (error) {
      return response(
        ctx,
        httpResponse.badRequest,
        joiErrorFormatter(error.details)
      );
    }

    delete customerReqData.repeat_password;
    const result = await CustomerModel.update(customerId, customerReqData);

    if (!result) {
      response(
        ctx,
        httpResponse.internalServerError,
        "Failure on updating customer record."
      );
    }

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
      return response(ctx, httpResponse.badRequest, "Customer ID was not set");
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

async function loginCustomer(ctx) {
  const { email, password } = ctx.request.body;

  try {
    const { data: customer } = await CustomerModel.findByEmail(email);

    if (!customer) {
      return response(
        ctx,
        httpResponse.unauthorized,
        "Invalid username or password"
      );
    }

    const validPassword = await comparePassword(password, customer.password);

    if (!validPassword) {
      return response(
        ctx,
        httpResponse.unauthorized,
        "Invalid username or password"
      );
    }

    delete customer.password;
    const token = generateToken({ ...customer });
    ctx.set("x-auth-token", token);
    return response(ctx, httpResponse.success, customer);
  } catch (exception) {
    return handleExceptionRoutes(ctx, exception, ctx.request.body);
  }
}

async function customerAccount(ctx) {
  ctx.body = "access customer account";
  console.log(ctx.request.body.customer);
}

module.exports = {
  saveCustomer,
  getCustomer,
  patchCustomer,
  deleteCustomer,
  loginCustomer,
  customerAccount
};
