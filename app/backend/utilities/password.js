const bcrypt = require("bcrypt");
const { password } = require("../config/data");

/**
 * The function `hashPassword` asynchronously generates a salt using bcrypt and then hashes the plain
 * password with the generated salt.
 * @param {string} plainPassword
 * @returns {string}
 */
async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(password.saltRounds);
  return await bcrypt.hash(plainPassword, salt);
}

/**
 * The function `comparePassword` uses bcrypt to compare a requested password with a current password
 * asynchronously.
 * @param {string} requestPassword
 * @param {string} currentPassword
 * @returns {Boolean}
 */
async function comparePassword(requestPassword, currentPassword) {
  return await bcrypt.compare(requestPassword, currentPassword);
}

module.exports = {
  hashPassword,
  comparePassword,
};
