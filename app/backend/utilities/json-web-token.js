const jwt = require("jsonwebtoken");

const jwtKey = process.env.JWT_PRIVATE_KEY;

/**
 * Generate json web token
 * @param {Object} data 
 * @returns {string}
 */
function generateToken(data) {
    return jwt.sign(data, jwtKey);
}

/**
 * Verify token
 * @param {string} token 
 * @returns {Object|null}
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, jwtKey);
    } catch (ex) {}

    return null;
}

module.exports = {
    generateToken,
    verifyToken
}