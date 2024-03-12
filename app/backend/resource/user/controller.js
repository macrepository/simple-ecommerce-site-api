const UserModel = require("./model");
const { httpResponse } = require("../../constant/data");
const { response } = require("../../utilities/http-response");
const { comparePassword } = require("../../utilities/password");
const { generateToken } = require("../../utilities/json-web-token");
const { __ } = require("../../utilities/string-formatter");

const userModelInstance = new UserModel();
/**
 * Save User details
 * @param {Object} ctx
 * @returns {Object}
 */
async function saveUser(ctx) {
  const userReqData = ctx.request.body;
  delete userReqData.repeat_password;

  const result = await userModelInstance.save(userReqData);

  if (!result) {
    return response(
      ctx,
      httpResponse.conflict,
      __(httpResponse.conflict.message.saveFailed, "user")
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
 * Get User Details
 * @param {Object} ctx
 * @returns {Object}
 */
async function getUser(ctx) {
  let user;
  const userId = ctx.params.id;

  if (userId) {
    user = (await userModelInstance.findById(userId)).getData();
  } else {
    user = (await userModelInstance.findAll()).getData();
  }

  if (!user) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    user
  );
}

/**
 * Update User Details
 * @param {Object} ctx
 * @returns {Object}
 */
async function patchUser(ctx) {
  const userId = ctx.params.id;
  const userReqData = ctx.request.body;

  const result = await userModelInstance.update(userId, userReqData);

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

/**
 * Delete user data
 * @param {Object} ctx
 * @returns {Object}
 */
async function deleteUser(ctx) {
  const userId = ctx.params.id;

  const result = await userModelInstance.delete(userId);

  if (!result) {
    return response(ctx, httpResponse.notFound, httpResponse.notFound.message);
  }

  return response(ctx, httpResponse.success, httpResponse.success.message);
}

/**
 * User Login Account
 * @param {*} ctx
 * @returns
 */
async function loginUser(ctx) {
  const { email, password } = ctx.request.body;

  const user = (await userModelInstance.findByEmail(email)).getData();

  if (!user) {
    return response(
      ctx,
      httpResponse.unauthorized,
      httpResponse.unauthorized.message.invalidLogin
    );
  }

  const validPassword = await comparePassword(password, user.password);

  if (!validPassword) {
    return response(
      ctx,
      httpResponse.unauthorized,
      httpResponse.unauthorized.message.invalidLogin
    );
  }

  delete user.password;
  const token = generateToken({ ...user });
  ctx.set("x-auth-token", token);

  return response(
    ctx,
    httpResponse.success,
    httpResponse.success.message,
    user
  );
}

async function userAccount(ctx) {
  ctx.body = "access user account";
  console.log(ctx.request.body.user);
}

module.exports = {
  saveUser,
  getUser,
  patchUser,
  deleteUser,
  loginUser,
  userAccount,
};
