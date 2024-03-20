const CustomerModel = require("./model");
const { httpResponse } = require("../../constant/data");
const { response } = require("../../utilities/http-response");
const { comparePassword } = require("../../utilities/password");
const { generateToken } = require("../../utilities/json-web-token");
const { __ } = require("../../utilities/string-formatter");

const customerModelInstance = new CustomerModel();
/**
 * Save Customer details
 * @param {Object} ctx
 * @returns {Object}
 */
async function saveCustomer(ctx) {
  const customerReqData = ctx.request.body;
  delete customerReqData.repeat_password;

  const result = await customerModelInstance.save(customerReqData);

  if (!result) {
    return response(
      ctx,
      httpResponse.conflict,
      __(httpResponse.conflict.message.saveFailed, "customer")
    );
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    result
  );
}

/**
 * Get Customer Details
 * @param {Object} ctx
 * @returns {Object}
 */
async function getCustomer(ctx) {
  let customer;
  const customerId = ctx.params.id;

  if (customerId) {
    customer = (await customerModelInstance.findById(customerId)).getData();
  } else {
    customer = (await customerModelInstance.findAll()).getData();
  }

  if (!customer) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    customer
  );
}

/**
 * Update Customer Details
 * @param {Object} ctx
 * @returns {Object}
 */
async function patchCustomer(ctx) {
  const customerId = ctx.params.id;
  const customerReqData = ctx.request.body;

  const result = await customerModelInstance.update(
    customerId,
    customerReqData
  );

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

/**
 * Delete customer data
 * @param {Object} ctx
 * @returns {Object}
 */
async function deleteCustomer(ctx) {
  const customerId = ctx.params.id;

  const result = await customerModelInstance.delete(customerId);

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

/**
 * Customer Login Account
 * @param {*} ctx
 * @returns
 */
async function loginCustomer(ctx) {
  const { email, password } = ctx.request.body;

  const customer = (await customerModelInstance.findByEmail(email)).getData();

  if (!customer) {
    return response(
      ctx,
      httpResponse.unauthorized,
      httpResponse.unauthorized.message.invalidLogin
    );
  }

  const validPassword = await comparePassword(password, customer.password);

  if (!validPassword) {
    return response(
      ctx,
      httpResponse.unauthorized,
      httpResponse.unauthorized.message.invalidLogin
    );
  }

  delete customer.password;
  const token = generateToken({ ...customer });
  ctx.set("x-auth-token", token);
  ctx.set("Access-Control-Expose-Headers", "x-auth-token");

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    customer
  );
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
  customerAccount,
};
