const express = require("express");
const routers = express.Router();
const { transactionControllers } = require("../controllers");
const { auth } = require("../helper/authToken");

routers.get("/income", auth, transactionControllers.incomeTransaction);

module.exports = routers;
