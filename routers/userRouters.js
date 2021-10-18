const express = require("express");
const routers = express.Router();
const { userControllers } = require("../controllers");
const { authToken, auth } = require("../helper/authToken");

//Insert routers here
routers.post('/register', userControllers.registerUser)
routers.post("/login", userControllers.loginUser);
routers.post("/keep-login", authToken, userControllers.keepLogin);
routers.patch('/verified', auth, userControllers.verification)
routers.get('/getprofile/:id',userControllers.getUserProfile)
routers.patch('/updateprofile',userControllers.updateUserProfile)
routers.patch('/uploadprofile',userControllers.uploadProfilePict)

module.exports = routers;
