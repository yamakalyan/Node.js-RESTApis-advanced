const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const user = require("./Controllers/userController");
const admin = require("./Controllers/adminController");
const product = require("./Controllers/productController");
const category = require("./Controllers/categoryController");
const Auth = require("./Controllers/Authorizers/Auth");

require("dotenv").config();

app.use(bodyParser.json({ limit: "5mb" }));

app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

app.listen(3200, (err, res) => {
  if (err) {
    console.log("Server connections failed");
  } else {
    console.log("Server listening at 3210");
  }
});

app.get("/api/", (req, res) => {
  const returnIs = {
    success: true,
    message: "Working properly.",
    developer: [
      {
        name: "Kalyan yama",
        designation: "Full-Stack Developer",
      },
    ],
  };
  res.json(returnIs);
});

app.use(express.json());

const corsOpts = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "header_key"],
};

app.use(cors(corsOpts));

app.use(async (error, req, res, next) => {
  error.message = (await error.message) || "Something went wrong";
  error.name = (await error.name) || "";
  res.status(error.status || 500).json({
    success: false,
    error,
  });
});
app.use("/api/authentication", Auth)
app.use("/api/admin", admin);
app.use("/api/user", user);
app.use("/api/product", product);
app.use("/api/category", category);
