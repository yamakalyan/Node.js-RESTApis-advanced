const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const headerKey = process.env.JWT_HEADER;
    const secureKey = process.env.JWT_SECURE;
    const header = req.header(headerKey);

    if (!header) {
      return res.status(400).json({
        success: false,
        message: "JWT must be provided",
      });
    }
    const verify = jwt.verify(header, secureKey);

    if (!verify) {
      return res.status(400).json({
        success: false,
        message: "InvalidToken",
      });
    }

    let tokenId = "";
    let role = "";

    if (verify.admin_id) {
      tokenId = verify.admin_id;
      role = verify.role;
    } else if (verify.user_id) {
      tokenId = verify.user_id;
      role = verify.role;
    }

    req.id = tokenId;
    req.role = role;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error,
    });
  }
};
