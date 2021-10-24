const express = require("express");
const routers = express.Router();
const { transactionControllers } = require("../controllers");
const { auth, authToken } = require("../helper/authToken");

routers.get("/income", auth, transactionControllers.incomeTransaction);
routers.post("/get-all", authToken, transactionControllers.getAll);
routers.get("/getTransactions", auth, transactionControllers.getUserTransactions);
routers.patch("/uploadpayment", auth, transactionControllers.uploadImgTrf);

module.exports = routers;
