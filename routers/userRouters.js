const express = require("express");
const routers = express.Router();
const { userControllers } = require("../controllers");
const { authToken } = require("../helper/authToken");

routers.post("/login", userControllers.loginUser);
routers.post("/keep-login", authToken, userControllers.keepLogin);

module.exports = routers;
