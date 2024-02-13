const express = require("express");
const { PROFILE_GET_METHOD } = require("./GetMethods/GetMethods");
const user = express.Router();

user.get("/profile", PROFILE_GET_METHOD, (req, res, next) => {
  try {
    res.status(200).json(req.results);
  } catch (error) {
    next(error);
  }
});

user.post("/create", (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

user.put("/update", (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

user.delete("/delete", (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

module.exports = user;
