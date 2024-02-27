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

module.exports = {
  hashPassword,
};
