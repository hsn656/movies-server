const jwt = require("jsonwebtoken");
const ApiError = require("../error/api-error");

function verifyAdmin(req, res, next) {
  try {
    if (!req.user.isAdmin) throw ApiError.forbidden("unuthorized");

    next();
  } catch (error) {
    next(error);
  }
}
module.exports = verifyAdmin;
