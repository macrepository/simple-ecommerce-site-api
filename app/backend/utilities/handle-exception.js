const logger = require("./logger");
const { httpResponse } = require("../config/data");
const { response } = require("./http-response");

/**
 * The function `getColumnKeyBySqlErrorMessage` is designed to extract the column key from a SQL error
 * message based on provided columns.
 * @param {Object} exception
 * @param {Object} columns
 * @returns {string|null}
 */
function getColumnKeyBySqlErrorMessage(exception, columns) {
  const { sqlMessage } = exception;
  for (const [key, value] of Object.entries(columns)) {
    // Check duplicate Entry Case or key and value found in the error message
    if (
      checkRegexIfFound(sqlMessage, key) &&
      checkRegexIfFound(sqlMessage, value)
    ) {
      return key;
    }

    // Check error message that has a pattern of "column 'key'"
    if (checkRegexIfFound(sqlMessage, `column '${key}'`)) {
      return key;
    }

    // Check key if found in error message
    if (checkRegexIfFound(sqlMessage, key)) {
      return key;
    }
  }

  return null;
}

/**
 * The function `checkRegexIfFound` uses a regular expression to test if a pattern is found in a given
 * value.
 * @param {string} value
 * @param {string} pattern
 * @returns {boolean}
 */
function checkRegexIfFound(value, pattern) {
  const regex = new RegExp(pattern);

  return regex.test(value);
}

/**
 * Formats exception errors for database-related issues and generic error.
 * @param {Object} exception
 * @param {Object|null} objectData
 * @returns {Object}
 */
function exceptionErrorFormatter(exception, objectData = null) {
  if (isDatabaseError(exception) && objectData) {
    return formatDatabaseError(exception, objectData);
  }

  return formatInternalServerError(exception.message);
}

/**
 * Checks if the provided exception is a database error.
 * @param {Object} exception
 * @returns {boolean}
 */
function isDatabaseError(exception) {
  return Boolean(exception?.sqlMessage);
}

/**
 * Formats database errors, focusing on constraint violations.
 * @param {Object} exception
 * @param {Object} objectData
 * @returns {Object}
 */
function formatDatabaseError(exception, objectData) {
  const key = getColumnKeyBySqlErrorMessage(exception, objectData);
  if (key) {
    return formatBadRequestMessage(key, exception.sqlMessage);
  }
  return formatInternalServerError(exception.sqlMessage);
}

/**
 * Creates a bad request error format.
 * @param {string} field
 * @param {string} message
 * @returns {Object}
 */
function formatBadRequestMessage(field, message) {
  return {
    badRequestMessage: [{ field, message }],
  };
}

/**
 * Generic internal server error format.
 * @param {Object} message
 * @returns {Object}
 */
function formatInternalServerError(message) {
  return {
    internalServerErrorMessage: message,
  };
}

/**
 * The function `handleExceptionRoutes` processes exceptions and returns appropriate responses based on
 * the error type.
 * @param {Object} ctx
 * @param {Object} exception
 * @param {Object|null} objectData
 * @returns {Object}
 */
function handleExceptionRoutes(ctx, exception, objectData = null) {
  const error = exceptionErrorFormatter(exception, objectData);

  if (error?.badRequestMessage)
    return response(ctx, httpResponse.badRequest, error.badRequestMessage);

  logger.error("handleExceptionRoutes", exception);

  return response(
    ctx,
    httpResponse.internalServerError,
    error.internalServerErrorMessage
  );
}

module.exports = {
  exceptionErrorFormatter,
  handleExceptionRoutes,
};
