const expressAsyncHandler = require("express-async-handler");
const { verify } = require("jsonwebtoken");

// Check login
exports.verifyAccessToken = expressAsyncHandler(async (req, res, next) => {
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    const token = req.headers.authorization.split(" ")[1];
    verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid access token",
        });
      }

      // console.log(decode);
      req.user = decode;
      next();
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Required authentication!",
    });
  }
});
