const jwt = require("jsonwebtoken");
const ApiError = require("../error/api-error");

function verifyAdminOrOwner(req, res, next) {
  try {
    if (req.user.id !== req.params.id && !req.user.isAdmin)
      throw ApiError.forbidden("unuthorized");

    next();
  } catch (error) {
    next(error);
  }
}
module.exports = verifyAdminOrOwner;
