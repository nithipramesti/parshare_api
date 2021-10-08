const express = require("express");
const routers = express.Router();
const { userControllers } = require("../controllers");
const { authToken } = require("../helper/authToken");

//Insert routers here
routers.post('/register', userControllers.registerUser)
routers.post("/login", userControllers.loginUser);
routers.post("/keep-login", authToken, userControllers.keepLogin);


module.exports = routers;
