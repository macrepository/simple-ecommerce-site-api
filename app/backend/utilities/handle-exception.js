const logger = require("./logger");
const { httpResponse } = require("../constant/data");
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
  return findColumnKey(sqlMessage, columns);
}

/**
 * Finding the Column key from the SQL Message
 * @param {string} sqlMessage
 * @param {Object} columns
 * @returns
 */
function findColumnKey(sqlMessage, columns) {
  for (const [columnKey, columnValue] of Object.entries(columns)) {
    // Check duplicate Entry Case or columnKey and columnValue found in the error message
    if (Array.isArray(columnValue)) {
      const nestedColumnKey = findColumnKey(sqlMessage, columnValue[0]);
      if (nestedColumnKey !== null) {
        return nestedColumnKey;
      }
    } else {
      if (isErrorForColumn(sqlMessage, columnKey)) {
        return columnKey;
      }
    }
  }

  return null;
}

/**
 * Check patterns for the SQL message if the column key exist
 * @param {string} sqlMessage
 * @param {string} columnKey
 * @returns
 */
function isErrorForColumn(sqlMessage, columnKey) {
  const patterns = [`Column '${columnKey}'`, columnKey];

  return patterns.some((pattern) => checkRegexIfFound(sqlMessage, pattern));
}

/**
 * The function `checkRegexIfFound` uses a regular expression to test if a pattern is found in a given
 * value.
 * @param {string} value
 * @param {string} pattern
 * @returns {boolean}
 */
function checkRegexIfFound(value, pattern) {
  const regex = new RegExp(pattern, "i");

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
    return formatConflictRequestMessage(key, exception.sqlMessage);
  }
  return formatInternalServerError(exception.sqlMessage);
}

/**
 * Creates a conflict request error format.
 * @param {string} field
 * @param {string} message
 * @returns {Object}
 */
function formatConflictRequestMessage(field, message) {
  return {
    conflictRequestMessage: [{ field, message }],
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

  if (error?.conflictRequestMessage)
    return response(
      ctx,
      httpResponse.conflict,
      httpResponse.conflict.message.genericFailed,
      error.conflictRequestMessage
    );

  logger.error("handleExceptionRoutes", exception);

  return response(
    ctx,
    httpResponse.internalServerError,
    httpResponse.internalServerError.message,
    error.internalServerErrorMessage
  );
}

module.exports = {
  exceptionErrorFormatter,
  handleExceptionRoutes,
};
