class ApiError {
  constructor(code, message) {
    this.message = message;
    this.code = code;
  }

  static badRequest(msg) {
    return new ApiError(400, msg);
  }

  static notFound(msg) {
    return new ApiError(404, msg);
  }

  static internal(msg) {
    return new ApiError(500, msg);
  }

  static unAuthorized(msg) {
    return new ApiError(401, msg);
  }

  static forbidden(msg) {
    return new ApiError(403, msg);
  }

  static conflict(msg) {
    return new ApiError(409, msg);
  }
}

module.exports = ApiError;
