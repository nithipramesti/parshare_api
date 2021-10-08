const express = require("express");
const routers = express.Router();
const { changePasswordControllers } = require("../controllers");

routers.post("/send-email", changePasswordControllers.sendEmail);

module.exports = routers;
