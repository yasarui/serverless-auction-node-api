exports.successResponse = (message, results, statusCode = 200) => {
    return {
      message,
      error: false,
      status: statusCode,
      data: results
    };
  };

exports.errorResponse = (message, statusCode) => {
   return {
     message,
     error: true,
     status: statusCode,
     data: null
   }
}

exports.validationResponse = (errors) => {
  return {
    message: "Validation errors",
    error: true,
    status: 422,
    errors
  };
};