exports.password = {
    ComplexityOptions: {
        min: 6,
        max: 255,
        lowerCase: 1,
        upperCase: 0,
        numeric: 1,
        symbol: 0,
        requirementCount: 2
    },
    saltRounds: 10
};

exports.httpResponse = {
    success: {
      code: "success",
      status: 200,
      message: "Request processed successfully."
    },
    badRequest: {
      code: "bad_request",
      status: 400,
      message: {
        invalidRequest: "Invalid request.",
        notSetKey: "Required parameter '%1' is missing.",
      }
    },
    unauthorized: {
      code: "unauthorized",
      status: 401,
      message: {
        invalidLogin: "Invalid login credentials",
        noToken: "Access denied. No token provided."
      }
    },
    forbidden: {
      code: "forbidden",
      status: 403,
      message: "Forbidden."
    },
    notFound: {
      code: "not_found",
      status: 404,
      message: "Resource not found."
    },
    conflict: {
      code: "conflict",
      status: 409,
      message: {
        saveFailed: "Failed to create a new %1 record.",
        updateFailed: "Failed to update %1 record.",
        deleteFailed: "Failed to delete %1 record."
      }
    },
    internalServerError: {
      code: "internal_server_error",
      status: 500,
      message: "Server error. Please try again later."
    }
  };
  