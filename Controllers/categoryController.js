const express = require("express");
const category = express.Router();

category.get("/", (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

category.post("/", (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

category.put("/", (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

category.delete("/", (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

module.exports = category;
