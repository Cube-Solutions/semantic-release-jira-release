
class ApiError extends Error {
  constructor(message, statusCode, response, request) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.response = response;
    this.request = request;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError