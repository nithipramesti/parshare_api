const express = require("express");
const routers = express.Router();
const { transactionControllers } = require("../controllers");
const { authToken } = require("../helper/authToken");

routers.post("/get-all", authToken, transactionControllers.getAll);
routers.patch("/confirmation", authToken, transactionControllers.confirmation);

module.exports = routers;
