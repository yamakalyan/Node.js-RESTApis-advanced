const express = require("express");
const { GET_DETAILS_METHOD } = require("./GetMethods/GetMethods");
const admin = express.Router();

// admin.get("/profile", (req, res, next) => {
//   try {
//   } catch (error) {
//     next(error);
//   }
// });

admin.get("/list/:conditionTable", GET_DETAILS_METHOD, (req, res, next) => {
  try {
    req.role = "admin";
    res.status(200).json(req.results);
  } catch (error) {
    next(error);
  }
});

admin.get(
  "/unique/:conditionTable/:conditionId",
  GET_DETAILS_METHOD,
  (req, res, next) => {
    try {
      req.role = "admin";
      res.status(200).json(req.results);
    } catch (error) {
      next(error);
    }
  }
);

admin.post("/", (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

admin.put("/", (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

admin.delete("/", (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

module.exports = admin;
