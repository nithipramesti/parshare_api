const express = require("express");
const routers = express.Router();
const { transactionControllers } = require("../controllers");
const { authToken } = require("../helper/authToken");
const { auth } = require("../helper/authToken");

routers.post("/get-all", authToken, transactionControllers.getAll);
routers.post("/parcel-list", authToken, transactionControllers.parcelList);
routers.patch("/confirmation", authToken, transactionControllers.confirmation);
routers.get("/income", auth, transactionControllers.incomeTransaction);
routers.get(
  "/getTransactions",
  auth,
  transactionControllers.getUserTransactions
);
routers.patch("/uploadpayment", auth, transactionControllers.uploadImgTrf);

module.exports = routers;
