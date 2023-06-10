const { sign } = require("jsonwebtoken");

exports.generateAccessToken = (uid, role) => {
  return sign({ _id: uid, role }, process.env.JWT_SECRET, { expiresIn: "2d" });
};
exports.generateRefreshToken = (uid, role) => {
  return sign({ _id: uid }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
