const express = require("express");
const routers = express.Router();
const { userControllers } = require("../controllers");

//Insert routers here
routers.post('/register', userControllers.registerUser)


module.exports = routers;
