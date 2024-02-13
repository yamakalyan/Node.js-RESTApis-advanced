const express = require("express");
const product = express.Router();

product.get("/", (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

product.post("/", (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

product.put("/", (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

product.delete("/", (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

module.exports = product;
