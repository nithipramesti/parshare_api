const express = require("express");
const routers = express.Router();
const { transactionControllers } = require("../controllers");

routers.get("/getAll", transactionControllers.getAll);

module.exports = routers;
