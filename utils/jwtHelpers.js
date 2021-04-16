const JWT = require("jsonwebtoken");

exports.signAccessToken = user => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  const payload = { user };
  const options = { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN };

  const accessToken = JWT.sign(payload, secret, options);

  return accessToken;
};
