const express = require("express");
const routers = express.Router();
const { productControllers } = require("../controllers");
const { auth } = require("../helper/authToken");

routers.delete('/delete', auth, productControllers.deleteProduct)

module.exports = routers;
