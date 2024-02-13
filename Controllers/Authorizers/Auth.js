const express = require("express");
const Auth = express.Router();
const database = require("../../Config/database");
const jwtVerify = require("../../Helpers/JwtVerify");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { tableNameParser } = require("../../Helpers/Helpers");

// AUTHENTICATION
Auth.get("/verify", jwtVerify, (req, res, next) => {
  try {
    const { role } = req;
    const tableName = tableNameParser(role);
    const idKey = tableName.key + "_id";
    const condition = [{ [idKey]: id }, { ifdeleted: 0 }];
    const checkSql = `SELECT * FROM ${tableName.value} WHERE ? AND ?`;
    database.query(checkSql, condition, (err, results) => {
      if (err) {
        res.status(400).json({
          success: false,
          message: "HavingIssues",
          err,
        });
      } else {
        if (results.length == 0) {
          res.status(404).json({
            success: false,
            message: "notFound",
          });
        } else {
          res.status(200).json({
            success: true,
            message: "successAuthentication",
          });
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// LOGIN BASED ON ROLE
Auth.post("/login", async (req, res, next) => {
  try {
    const { role } = req.body;
    const tableName = tableNameParser(role);
    const idKey = tableName?.key + "_id";
    const mailKey = tableName?.key + "_email";
    const mobileKey = tableName?.key + "_mobile";
    const passwordKey = tableName?.key + "_password";
    const condition = [
      { [mailKey]: req.body.username },
      { [mobileKey]: req.body.username },
      { ifdeleted: 0 },
    ];
    const checkSql = `SELECT * FROM ${tableName?.value} WHERE ? OR ? AND ?`;
    database.query(checkSql, condition, async (err, results) => {
      if (err) {
        res.status(400).json({
          success: false,
          message: "HavingIssues",
          err,
        });
      } else {
        if (results.length == 0) {
          res.status(404).json({
            success: false,
            message: "notFound",
          });
        } else {
          const checkIFpasswordTrue = await bcrypt.compare(
            req.body.password?.toString(),
            results[0][passwordKey]
          );
          if (checkIFpasswordTrue) {
            const details = {
              id: results[0][idKey],
              role: role,
            };
            const token = jwt.sign(details, process.env.JWT_SECURE, {
              expiresIn: process.env.JWT_EXPIREIN,
            });

            res.status(200).json({
              success: true,
              message: "successLogin",
              token,
              role,
            });
          } else {
            res.status(400).json({
              success: false,
              message: "incorrectPassword",
            });
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = Auth;
