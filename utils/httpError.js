const createError = require("http-errors");

const badRequest = (err, res) => {
  const error = createError.BadRequest(err);
  return res.status(error.statusCode).json({
    success: false,
    msg: error.message,
  });
};

const unauthorized = (err, res, isExpired) => {
  const error = createError.Unauthorized(err);
  return res.status(error.statusCode).json({
    err: isExpired ? 2 : 1,
    msg: error.message,
  });
};

const forbidden = (err, res) => {
  const error = createError.Forbidden(err);
  return res.status(error.statusCode).json({
    success: false,
    msg: error.message,
  });
};

module.exports = {
  badRequest,
  unauthorized,
  forbidden,
};
