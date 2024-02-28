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
        message: "Success."
    },
    badRequest: {
        code: "bad_request",
        status: 400,
        message: "Invalid request."
    },
    unauthorized: {
        code: "unauthorized",
        status: 401,
        message: "Unauthorized."
    },
    forbidden: {
        code: "forbidden",
        status: 403,
        message: "Forbidden."
    },
    notFound: {
        code: "not_found",
        status: 404,
        message: "Not found."
    },
    internalServerError: {
        code: "internal_server_error",
        status: 500,
        message: "Server error."
    }
}