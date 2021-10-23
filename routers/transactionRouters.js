const express = require("express");
const routers = express.Router();
const { transactionControllers } = require("../controllers");
const { authToken } = require("../helper/authToken");
const { auth } = require("../helper/authToken");

routers.post("/get-all", authToken, transactionControllers.getAll);
routers.patch("/confirmation", authToken, transactionControllers.confirmation);
routers.get("/income", auth, transactionControllers.incomeTransaction);

module.exports = routers;
